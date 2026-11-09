import argparse
import datetime as dt
import json
from pathlib import Path

from collector.common import KST
from collector.geocode import Geocoder
from collector.sources import WEB_COLLECTORS
from collector.webdata import is_seoul, merge_corrections, to_web

OUT = Path("data/notices.json")


def add_geo(items, geo):
    for n in items:
        for u in n["units"]:
            if u.get("lat") is None and u.get("addr"):
                hit = geo.locate(u["addr"], n.get("station_hint", ""))
                if hit:
                    u["lat"], u["lng"], u["geo"] = hit
            if u.get("lat") is not None:
                u["station"], u["station_m"] = geo.nearest_station(u["lat"], u["lng"])
        if n.get("lat") is None:
            src = n.get("address") or ""
            hit = geo.locate(src, n.get("station_hint", "")) if src or n.get("station_hint") else None
            if not hit and n["units"]:
                u0 = next((u for u in n["units"] if u.get("lat") is not None), None)
                hit = (u0["lat"], u0["lng"], u0["geo"]) if u0 else None
            if hit:
                n["lat"], n["lng"], n["geo"] = hit
        if n.get("lat") is not None:
            n["station"], n["station_m"] = geo.nearest_station(n["lat"], n["lng"])


def write_ics(items, path=Path("data/schedule.ics")):
    def esc(t):
        return str(t).replace("\\", "\\\\").replace(";", "\\;").replace(",", "\\,").replace("\n", "\\n")

    stamp = dt.datetime.now(dt.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//for-my-friendshome//KO",
        "CALSCALE:GREGORIAN",
        "X-WR-CALNAME:서울 임대공고 접수 일정",
        "X-WR-TIMEZONE:Asia/Seoul",
    ]
    for n in items:
        s, e = n.get("start") or n.get("end"), n.get("end") or n.get("start")
        if not s or n.get("kind") not in ("모집", "정정"):
            continue
        try:
            d0 = dt.date.fromisoformat(s)
            d1 = dt.date.fromisoformat(e) + dt.timedelta(days=1)
        except ValueError:
            continue
        lines += [
            "BEGIN:VEVENT",
            f"UID:{esc(n['key'])}@for-my-friendshome",
            f"DTSTAMP:{stamp}",
            f"DTSTART;VALUE=DATE:{d0:%Y%m%d}",
            f"DTEND;VALUE=DATE:{d1:%Y%m%d}",
            f"SUMMARY:{esc('[접수] ' + n['title'])}",
            f"URL:{esc(n['url'])}",
            f"DESCRIPTION:{esc(n.get('sector', '') + '임대, ' + n.get('htype', '') + ', ' + n['url'])}",
            "END:VEVENT",
        ]
    lines.append("END:VCALENDAR")
    path.write_text("\r\n".join(lines) + "\r\n", encoding="utf-8")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", nargs="*", help="수집할 기관 (LH SH 청년안심 HUG)")
    ap.add_argument("--geo-budget", type=int, default=900, help="이번 실행에서 새로 조회할 주소 수 상한")
    a = ap.parse_args()

    prev = {}
    if OUT.exists():
        try:
            prev = json.loads(OUT.read_text(encoding="utf-8"))
        except ValueError:
            prev = {}
    prev_items = prev.get("notices", [])
    prev_health = prev.get("health", {})

    items, health = [], {}
    now = dt.datetime.now(KST).isoformat(timespec="minutes")
    for name, fn in WEB_COLLECTORS.items():
        if a.only and name not in a.only:
            items += [x for x in prev_items if x["source"] == name]
            if name in prev_health:
                health[name] = prev_health[name]
            continue
        try:
            got = merge_corrections([to_web(n) for n in fn() if is_seoul(n)])
            items += got
            health[name] = dict(ok=True, at=now, count=len(got))
            print(f"[{name}] 서울 관련 {len(got)}건, 호실 {sum(len(x['units']) for x in got)}개")
        except Exception as ex:
            keep = [dict(x, stale=True) for x in prev_items if x["source"] == name]
            items += keep
            last = prev_health.get(name, {})
            health[name] = dict(
                ok=False,
                at=now,
                error=f"{type(ex).__name__}: {str(ex)[:160]}",
                last_ok=last.get("at") if last.get("ok") else last.get("last_ok"),
                count=len(keep),
            )
            print(f"[{name}] 수집 실패 → 이전 데이터 {len(keep)}건 유지 ({health[name]['error']})")

    geo = Geocoder(budget=a.geo_budget)
    add_geo(items, geo)
    geo.save()
    located = sum(1 for n in items for u in n["units"] if u.get("lat") is not None)
    total = sum(len(n["units"]) for n in items)
    print(
        f"좌표: 호실 {located}/{total}, 새 조회 {geo.asked}회 ({ {'kakao': '카카오', 'naver': '네이버'}.get(geo.provider, 'Nominatim') })"
    )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        json.dumps(
            dict(generated_at=now, health=health, geo_provider=geo.provider, notices=items),
            ensure_ascii=False,
            separators=(",", ":"),
        ),
        encoding="utf-8",
    )
    write_ics(items)
    print(f"→ {OUT} ({len(items)}건), data/schedule.ics")


if __name__ == "__main__":
    main()
