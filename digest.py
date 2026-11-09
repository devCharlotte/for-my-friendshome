import argparse
from urllib.parse import quote
import hashlib
import json
import math
import os
import re
from pathlib import Path

DATA = Path("data/notices.json")
STATIONS = Path("data/stations.json")
STATE = Path("state/digest_state.json")


DEF_EXCL_GU = ["강동구", "구로구", "금천구", "도봉구", "중랑구"]
DEF_TARGET_OFF = ["신혼/신생아", "고령자", "장애인/수급", "철거민", "다자녀"]
DEF_HTYPE_OFF = ["공공기숙사", "영구임대", "재개발임대", "협동조합주택"]


def money(s):
    s = s.replace(",", "").replace(" ", "")
    m = re.match(r"(?:(\d+(?:\.\d+)?)억)?(?:(\d+)천)?(?:(\d+)만)?(\d+)?원?$", s)
    if not m or not any(m.groups()):
        return None
    eok, cheon, man, raw = m.groups()
    v = (
        float(eok or 0) * 1e8
        + int(cheon or 0) * 1e7
        + int(man or 0) * 1e4
        + (int(raw) if raw and not (eok or cheon or man) else 0)
    )
    return v or None


def parse_subscribers(raw):
    subs = []
    lines = [
        l.strip() for l in (raw or "").replace("\r", "").split("\n") if l.strip() and not l.strip().startswith("#")
    ]
    for line in lines:
        addr_part, _, opt = line.partition("|")
        for addr in [a.strip() for a in addr_part.split(",") if a.strip()]:
            if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", addr):
                print(f"[구독자] 주소 형식이 아니라 건너뜀: {addr[:3]}***")
                continue
            subs.append(dict(email=addr, opts=parse_opts(opt)))
    return subs


def parse_opts(s):
    o = dict(
        all=False,
        gus=None,
        excl=None,
        lines=None,
        htypes=None,
        targets=None,
        max_rent=None,
        max_dep=None,
        min_m2=None,
        min_rooms=None,
        women=False,
        name="",
        inc=None,
        asset=None,
        car="",
        home="",
    )
    for part in [p.strip() for p in re.split(r"[;\n]", s or "") if p.strip()]:
        if part in ("전체", "all"):
            o["all"] = True
            continue
        m = re.match(r"(이름|자동차|세대)\s*=\s*(.+)$", part)
        if m:
            v = m.group(2).strip()
            if m.group(1) == "이름":
                o["name"] = v[:20]
            elif m.group(1) == "자동차":
                o["car"] = {"없음": "none", "이하": "low", "초과": "high", "넘음": "high"}.get(v, "")
            else:
                o["home"] = {"혼자": "alone", "가족무주택": "fam0", "부모님집": "fam1"}.get(v.replace(" ", ""), "")
            continue
        m = re.match(r"(소득|자산)\s*(<=|=<)\s*(.+)$", part)
        if m:
            o["inc" if m.group(1) == "소득" else "asset"] = money(m.group(3))
            continue
        m = re.match(r"(구|제외구|노선|유형|대상|여성전용)\s*=\s*(.+)$", part)
        if m:
            vals = [v.strip() for v in m.group(2).split(",") if v.strip()]
            key = {"구": "gus", "제외구": "excl", "노선": "lines", "유형": "htypes", "대상": "targets"}.get(m.group(1))
            if key:
                o[key] = vals
            else:
                o["women"] = "포함" in m.group(2)
            continue
        m = re.match(r"(월세|보증금|면적|방)\s*(<=|>=|=<|=>)\s*(.+)$", part)
        if m:
            k, v = m.group(1), m.group(3)
            if k == "월세":
                o["max_rent"] = money(v)
            elif k == "보증금":
                o["max_dep"] = money(v)
            elif k == "면적":
                o["min_m2"] = float(re.sub(r"[^\d.]", "", v) or 0)
            elif k == "방":
                o["min_rooms"] = int(re.sub(r"\D", "", v) or 0)
    return o


def hav(a1, o1, a2, o2):
    r = 6371000
    p1, p2 = math.radians(a1), math.radians(a2)
    h = math.sin((p2 - p1) / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(math.radians(o2 - o1) / 2) ** 2
    return 2 * r * math.asin(math.sqrt(h))


def near_lines(lat, lng, st, radius=1000):
    if lat is None:
        return set()
    out = set()
    for name, (a, b) in st["stations"].items():
        if hav(lat, lng, a, b) <= radius:
            out.update(st.get("lines", {}).get(name, []))
    return out


def gender_ok(g, women):
    t = (g or "").replace(" ", "")
    return women or not ("여성" in t and "남" not in t)


def _won(t):
    m = re.search(r"(\d+(?:\.\d+)?)\s*(만원|원|억)", str(t or "").replace(",", ""))
    return float(m.group(1)) * {"만원": 1e4, "원": 1, "억": 1e8}[m.group(2)] if m else None


def elig(n):
    t, title, pf = n.get("htype"), n.get("title", ""), n.get("pdf_facts") or {}
    U = "?"
    e = dict(inc=U, asset=U, car=U, home="")
    if n.get("source") == "청년안심" or t == "청년안심주택" or t == "행복주택" or (t == "매입임대" and "청년" in title):
        e = dict(inc=4576036, asset=251e6, car=4542e4, home="본인")
    elif t == "통합공공임대":
        e = dict(inc=4359205, asset=345e6, car=4542e4, home="본인")
    elif t == "든든전세" and n.get("source") == "LH":
        e = dict(inc=None, asset=None, car=None, home="세대")
    i1 = _won(pf.get("1인 가구 월소득 기준"))
    if i1:
        e["inc"] = i1
    if pf.get("총자산 기준"):
        e["asset"] = max(float(x) * 1e4 for x in re.findall(r"\d+", pf["총자산 기준"].replace(",", "")))
    c = _won(pf.get("자동차 기준"))
    if c:
        e["car"] = c
    return e


def money_fail(n, o):
    e, f = elig(n), []
    if o["inc"] and e["inc"] not in ("?", None) and o["inc"] > e["inc"]:
        f.append("소득")
    if o["asset"] and e["asset"] not in ("?", None) and o["asset"] > e["asset"]:
        f.append("자산")
    if o["car"] in ("low", "high") and e["car"] not in ("?", None) and (e["car"] == 0 or o["car"] == "high"):
        f.append("자동차")
    if o["home"] == "fam1" and e["home"] == "세대":
        f.append("무주택")
    return f


INC_STD = {
    2564238: "기준중위소득 1인 100%",
    3813363: "도시근로자 1인 100%",
    4194699: "도시근로자 1인 110%",
    4359205: "기준중위소득 1인 170%",
    4576036: "도시근로자 1인 120%",
}
ASSET_STD = {108000000: "행복주택 대학생 기준", 251000000: "청년 자산 기준", 345000000: "국민임대 자산 기준"}


def elig_text(n):
    e = elig(n)
    if e["inc"] == "?" and e["asset"] == "?":
        return ""
    p = []
    if e["inc"] != "?":
        p.append(
            "소득 기준 없음"
            if e["inc"] is None
            else f"본인 소득 {INC_STD.get(round(e['inc']), '')} (월 {won(e['inc'])}, 연 {won(e['inc'] * 12)}) 이하".replace(
                "  ", " "
            )
        )
    if e["asset"] != "?":
        p.append(
            "자산 기준 없음"
            if e["asset"] is None
            else f"총자산 {ASSET_STD.get(round(e['asset']), '')} ({won(e['asset'])}) 이하".replace("  ", " ")
        )
    if e["car"] not in ("?", None):
        p.append(f"자동차가액 기준 ({won(e['car'])}) 이하")
    if e["home"]:
        p.append("무주택은 본인만" if e["home"] == "본인" else "같은 세대 전원 무주택")
    return "자격 기준(2026 공고): " + ", ".join(p)


def pick(n, o, st):
    if n.get("kind") not in ("모집", "정정"):
        return None
    if not o["all"]:
        excl = o["excl"] if o["excl"] is not None else DEF_EXCL_GU
        if o["htypes"]:
            if n["htype"] not in o["htypes"]:
                return None
        elif n["htype"] in DEF_HTYPE_OFF:
            return None
        if o["targets"]:
            if not any(t in o["targets"] for t in n["targets"]):
                return None
        elif all(t in DEF_TARGET_OFF for t in n["targets"]):
            return None
        if n.get("women_only") and not o["women"]:
            return None
        if money_fail(n, o):
            return None
    else:
        excl = []
    gus = o["gus"]

    def unit_ok(u):
        if gus and u.get("gu") not in gus:
            return False
        if u.get("gu") in excl:
            return False
        if not gender_ok(u.get("gender"), o["women"] or o["all"]):
            return False
        if o["max_rent"] is not None and (u.get("rent") or 0) > o["max_rent"]:
            return False
        if o["max_dep"] is not None and (u.get("deposit") is None or u["deposit"] > o["max_dep"]):
            return False
        if o["min_m2"] and (u.get("m2") is None or u["m2"] < o["min_m2"]):
            return False
        if o["min_rooms"] and (u.get("rooms") is None or u["rooms"] < o["min_rooms"]):
            return False
        if o["lines"] and not (near_lines(u.get("lat"), u.get("lng"), st) & set(o["lines"])):
            return False
        return True

    if n["units"]:
        keep = [u for u in n["units"] if unit_ok(u)]
        return keep or None

    if any(o[k] for k in ("max_rent", "max_dep", "min_m2", "min_rooms", "lines")):
        return None
    if gus and n["gus"] and not any(g in gus for g in n["gus"]):
        return None
    if excl and n["gus"] and all(g in excl for g in n["gus"]):
        return None
    return [None]


def ukey(u):
    return f"{u.get('addr', '')}|{u.get('bldg', '')}|{u.get('ho', '')}|{u.get('type', '')}"


def nfp(n):
    return hashlib.sha1(f"{n['title']}|{n.get('start')}|{n.get('end')}".encode()).hexdigest()[:12]


def changes(prev, notices):
    out = {}
    for n in notices:
        p = prev.get(n["key"])
        uk = {ukey(u) for u in n["units"]}
        if p is None:
            out[n["key"]] = dict(kind="새 공고", new_units=uk)
            continue
        new_u = uk - set(p.get("units", []))
        if p.get("fp") != nfp(n):
            out[n["key"]] = dict(kind="일정이나 제목 변경", new_units=new_u)
        elif new_u:
            out[n["key"]] = dict(kind="새 호실", new_units=new_u)
    return out


def snapshot(notices):
    return {n["key"]: dict(fp=nfp(n), units=sorted(ukey(u) for u in n["units"])) for n in notices}


def won(v):
    if v is None:
        return "-"
    if v >= 1e8:
        e, m = int(v // 1e8), round((v % 1e8) / 1e4)
        return f"{e}억" + (f" {m:,}만" if m else "")
    return f"{round(v / 1e4):,}만"


def vlist(vals, mx=6):
    u = sorted({round(v / 1e4) * 1e4 for v in vals})
    out = ", ".join(won(v) for v in u[:mx])
    return out + (f" 외 {len(u) - mx}개" if len(u) > mx else "")


def esc(s):
    return (str(s or "")).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def period(n):
    s, e = n.get("start") or "", n.get("end") or ""
    if not s and not e:
        return "일정은 공고문 확인"
    return f"접수 {s[5:].replace('-', '.') or '?'} ~ {e[5:].replace('-', '.') or '?'}"


def issue_url():
    repo = os.getenv("GITHUB_REPOSITORY", "").strip()
    return f"{os.getenv('GITHUB_SERVER_URL', 'https://github.com')}/{repo}/issues/new" if repo else ""


def build(items, site_url, today, name=""):
    rows = []
    for n, units, ch in items:
        real = [u for u in units if u]
        deps = [u["deposit"] for u in real if u.get("deposit") is not None]
        rents = [u["rent"] for u in real if u.get("rent")]
        price = ""
        if deps:
            pairs = sorted(
                {
                    (round(u["deposit"] / 1e4) * 1e4, round((u.get("rent") or 0) / 1e4) * 1e4)
                    for u in real
                    if u.get("deposit") is not None
                }
            )
            shown = ", ".join(won(d) + (f"/{won(m)}" if m else "") for d, m in pairs[:6])
            price = (
                ("보증금/월세 " if rents else "전세 보증금 ")
                + shown
                + (f" 외 {len(pairs) - 6}가지" if len(pairs) > 6 else "")
            )
        gus = sorted({u["gu"] for u in real if u.get("gu")}) or n.get("gus") or []
        newu = len([u for u in real if ukey(u) in ch["new_units"]])
        pf = n.get("pdf_facts") or {}
        extra = ", ".join(
            x
            for x in [pf.get("임대료 수준", ""), (re.search(r"최장\s*\d+\s*년", pf.get("임대기간", "")) or [""])[0]]
            if x
        )
        et = elig_text(n)
        if et:
            extra = (extra + " | " if extra else "") + et
        color = "#2552c4" if n["sector"] == "공공" else "#b4500d"
        q = re.sub(r"^\[[^\]]*\]\s*", "", n["title"])[:30]
        site_link = f"{site_url}?view=notice&q={quote(q)}" if site_url else ""
        rows.append(f"""
<tr><td style="padding:12px 0;border-bottom:1px solid #e3e8ee">
  <div style="font-size:12px;color:#5a6877"><b style="color:{color}">{n['sector']}임대</b>, {esc(n['htype'])}, {esc({'청년안심': '서울시 청년안심', 'HUG': 'HUG 든든전세'}.get(n['source'], n['source']))}
    | <b style="color:#0e6b68">{esc(ch['kind'])}</b>{f', 새 호실 {newu}개' if newu and ch['kind'] != '새 공고' else ''}</div>
  <div style="font-size:16px;font-weight:700;margin:3px 0"><a href="{esc(n['url'])}" style="color:#16202a;text-decoration:none">{esc(n['title'])}</a></div>
  <div style="font-size:13px;color:#16202a">{esc(period(n))}{' | ' + esc(', '.join(gus[:4])) + (' 외' if len(gus) > 4 else '') if gus else ''}{f' | 호실 {len(real)}개' if real else ''}</div>
  {f'<div style="font-size:13px;color:#16202a;margin-top:2px">{esc(price)}</div>' if price else ''}
  {f'<div style="font-size:12px;color:#5a6877;margin-top:2px">{esc(extra)}</div>' if extra else ''}
  <div style="font-size:13px;margin-top:6px">{f'<a href="{esc(site_link)}" style="color:#0e6b68;font-weight:700">사이트에서 호실과 지도 보기 →</a> &nbsp;|&nbsp; ' if site_link else ''}<a href="{esc(n['url'])}" style="color:#5a6877">공식 공고</a></div>
</td></tr>""")
    head = f"새로 올라오거나 바뀐 공고 {len(items)}건"
    hello = f"{esc(name)}님, " if name else ""
    html = f"""<html><body style="margin:0;background:#eef1f4;font-family:'IBM Plex Sans KR','Apple SD Gothic Neo','Malgun Gothic','Noto Sans KR',sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:20px 12px">
<table width="100%" style="max-width:620px;background:#fff;border-radius:10px;padding:20px" cellpadding="0" cellspacing="0">
<tr><td><div style="font-size:20px;font-weight:700">JH Home Curation ({today})</div>
<div style="font-size:13px;color:#5a6877;margin:4px 0 10px">{hello}{head}이 있어요. 고른 조건에 맞는 것만 모았어요. 자격과 일정은 꼭 공식 공고문에서 확인하세요.</div>
{f'<a href="{esc(site_url)}" style="display:inline-block;background:#0e6b68;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:9px 16px;border-radius:8px;margin-bottom:6px">JH Home Curation 열기</a>' if site_url else ''}</td></tr>
{''.join(rows)}
<tr><td style="padding-top:16px;font-size:13px">{f'<a href="{esc(site_url)}" style="color:#0e6b68;font-weight:700">사이트에서 전체 공고와 집 보기 →</a><div style="font-size:12px;color:#5a6877;margin-top:2px">{esc(site_url)}</div>' if site_url else ''}
<div style="font-size:11px;color:#9aa8b6;margin-top:10px">발신 전용 메일이라 회신해도 확인하지 못해요. 구독 취소나 조건 변경은 {f'<a href="{esc(issue_url())}" style="color:#9aa8b6">GitHub 이슈</a>' if issue_url() else 'GitHub 이슈'}를 남기거나 운영자에게 개별적으로 연락해 주세요.</div></td></tr>
</table></td></tr></table></body></html>"""
    text = (
        head
        + "\n\n"
        + "\n".join(f"- [{ch['kind']}] {n['title']} ({period(n)}) {n['url']}" for n, _, ch in items)
        + (f"\n\n사이트: {site_url}" if site_url else "")
        + "\n\n발신 전용 메일이에요. 구독 취소나 조건 변경은 GitHub 이슈를 남기거나 운영자에게 개별적으로 연락해 주세요."
        + (f"\n{issue_url()}" if issue_url() else "")
    )
    return head, html, text


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--send-baseline", action="store_true")
    a = ap.parse_args()

    data = json.loads(DATA.read_text(encoding="utf-8"))
    st = json.loads(STATIONS.read_text(encoding="utf-8")) if STATIONS.exists() else {"stations": {}}
    notices = [n for n in data["notices"] if not n.get("stale")]
    prev = json.loads(STATE.read_text(encoding="utf-8")) if STATE.exists() else None
    today = (data.get("generated_at") or "")[:10]
    site = os.environ.get("SITE_URL", "").strip()

    if prev is None and not a.send_baseline:
        if not a.dry_run:
            STATE.write_text(json.dumps(snapshot(notices), ensure_ascii=False), encoding="utf-8")
        print(f"첫 실행: 기준 {len(notices)}건 저장, 메일 안 보냄")
        return

    ch = changes(prev or {}, notices)
    subs = parse_subscribers(os.environ.get("MAIL_SUBSCRIBERS", ""))
    print(f"바뀐 공고 {len(ch)}건, 구독자 {len(subs)}명")
    failed = 0
    if ch:
        from collector import mailer

        for i, s in enumerate(subs):
            items = []
            for n in notices:
                if n["key"] not in ch:
                    continue
                units = pick(n, s["opts"], st)
                if not units:
                    continue
                c = ch[n["key"]]

                if c["kind"] == "새 호실" and not any(u and ukey(u) in c["new_units"] for u in units):
                    continue
                items.append((n, units, c))
            if not items:
                continue
            items.sort(key=lambda x: (x[2]["kind"] != "새 공고", x[0].get("end") or "9999"))
            head, html, text = build(items, site, today, s["opts"].get("name", ""))
            subj = f"[JH Home] {today} {head}"
            if a.dry_run:
                Path("out").mkdir(exist_ok=True)
                Path(f"out/digest_{i + 1}.html").write_text(html, encoding="utf-8")
                print(f"[DRY-RUN] 구독자 {i + 1}: {len(items)}건 → out/digest_{i + 1}.html")
                continue
            try:
                mailer.send(subj, text, html, to=s["email"])
            except Exception as e:
                failed += 1
                print(f"[메일 실패] {mailer.mask(s['email'])}: {type(e).__name__}")
    if not a.dry_run and not failed:
        STATE.write_text(json.dumps(snapshot(notices), ensure_ascii=False), encoding="utf-8")
    elif failed:
        print("일부 발송 실패 → 상태를 저장하지 않아 다음 업데이트 때 다시 보냄")


if __name__ == "__main__":
    main()
