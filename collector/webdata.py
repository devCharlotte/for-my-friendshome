import re

from . import filters as F
from .common import notice_kind

SEOUL_GU = [
    "강남구",
    "강동구",
    "강북구",
    "강서구",
    "관악구",
    "광진구",
    "구로구",
    "금천구",
    "노원구",
    "도봉구",
    "동대문구",
    "동작구",
    "마포구",
    "서대문구",
    "서초구",
    "성동구",
    "성북구",
    "송파구",
    "양천구",
    "영등포구",
    "용산구",
    "은평구",
    "종로구",
    "중구",
    "중랑구",
]

GU_RE = re.compile(r"(?<![가-힣])(" + "|".join(sorted(SEOUL_GU, key=len, reverse=True)) + r")")
DONG_RE = re.compile(r"(?:" + "|".join(SEOUL_GU) + r")\s+([가-힣]+?\d*(?:동|가))(?:\d*가)?(?=[\s\d(,]|$)")


HTYPES = [
    ("청년안심주택", r"청년안심|역세권청년"),
    ("공공기숙사", r"기숙사|희망하우징"),
    ("사회주택", r"사회주택"),
    ("행복주택", r"행복주택"),
    ("장기전세", r"장기전세|미리내집"),
    ("든든전세", r"든든전세"),
    ("매입임대", r"매입임대|매입주택|도전숙|수요자맞춤|신혼부부.*주택"),
    ("전세임대", r"전세임대|전세형"),
    ("국민임대", r"국민임대"),
    ("영구임대", r"영구임대"),
    ("통합공공임대", r"통합공공"),
    ("공공임대(분양전환)", r"10년|5년|분양전환"),
    ("재개발임대", r"재개발|주거환경"),
    ("장기안심", r"장기안심"),
    ("협동조합주택", r"협동조합"),
]

TARGETS = [
    ("청년", r"청년|대학생|사회초년|희망하우징|기숙사"),
    ("신혼/신생아", r"신혼|신생아|한부모|예비부부"),
    ("고령자", r"고령|65세|어르신"),
    ("다자녀", r"다자녀"),
    ("예술인/창업", r"예술인|창업|창조기업|도전숙"),
    ("장애인/수급", r"장애인|수급|차상위|주거약자"),
    ("철거민", r"철거민"),
]


def districts(text):
    seen = []
    for g in GU_RE.findall(text or ""):
        if g not in seen:
            seen.append(g)
    return seen


def dongs(text):
    out = []
    for m in DONG_RE.finditer(text or ""):
        gu = GU_RE.search(text[max(0, m.start()) : m.end()]).group(1)
        d = re.sub(r"^(\D+?)\d+동$", r"\1동", m.group(1))
        if [gu, d] not in out:
            out.append([gu, d])
    return out


def htype(n):
    t = n["title"] + " " + n.get("category", "")
    if n["source"] == "청년안심":
        return "청년안심주택"
    for name, rx in HTYPES:
        if re.search(rx, t):
            return name
    return "기타"


def sector(n, ht):
    if n["source"] == "청년안심":
        if n.get("private"):
            return "민간", "공공지원민간임대 (민간 사업자가 운영, 시세 대비 75~85% 수준)"
        return "공공", "청년안심주택 공공임대 (SH 등이 공급, 시세 대비 30~50% 수준)"
    if ht == "사회주택":
        return "민간", "사회주택 (사회적기업, 협동조합 등 민간이 운영하고 공공이 토지와 자금을 지원)"
    agency = {"LH": "LH 한국토지주택공사", "SH": "SH 서울주택도시공사", "HUG": "HUG 주택도시보증공사"}
    return "공공", f"{agency.get(n['source'], n['source'])} 공급 공공임대"


def targets(n):
    t = n["title"] + " " + " ".join(f"{k} {v}" for k, v in n.get("facts", {}).items() if "자격" in k)
    if n["source"] == "청년안심":
        return ["청년"]
    out = [name for name, rx in TARGETS if re.search(rx, t)]
    return out or ["일반/기타"]


def _money(v):
    if v in (None, ""):
        return None
    m = re.search(r"\d+(?:\.\d+)?", str(v).replace(",", ""))
    return round(float(m.group())) if m else None


def _unit(u):
    prices = [
        dict(label=p.get("label", ""), deposit=_money(p.get("deposit")), rent=_money(p.get("rent")))
        for p in u.get("prices", [])
        if _money(p.get("deposit")) is not None
    ]
    dep, rent = _money(u.get("deposit")), _money(u.get("rent"))
    return dict(
        addr=u.get("address", ""),
        gu=u.get("district", ""),
        dong=u.get("dong", ""),
        m2=u.get("exclusive_m2"),
        rooms=u.get("bedrooms"),
        floor=u.get("floor", ""),
        bldg=u.get("dong_no", ""),
        ho=u.get("ho", ""),
        type=u.get("type", ""),
        name=u.get("kind", ""),
        gender=u.get("gender", ""),
        ev=u.get("elevator", ""),
        deposit=dep,
        rent=rent,
        lease="전세" if dep and not rent else "월세" if rent else "",
        prices=prices,
        src=u.get("source", ""),
        est=False,
    )


def _pdf_units(n, gu, dong):
    name = re.sub(r"\s*(입주자\s*)?(추가)?모집공고.*$", "", n["title"]).strip()
    out = []
    for r in n.get("pdf_supply", []):
        out.append(
            dict(
                addr=n.get("address", ""),
                gu=gu,
                dong=dong,
                m2=r.get("m2"),
                rooms=None,
                floor="",
                bldg="",
                ho=r.get("ho", ""),
                type=r.get("type", ""),
                name=name,
                gender="성별 제한 미확인",
                ev="",
                deposit=r.get("deposit"),
                rent=r.get("rent"),
                lease="월세" if r.get("rent") else "전세",
                prices=r.get("prices", []),
                src="공고문 PDF [공급현황] 표에서 추출 (확인 필요)",
                est=True,
            )
        )
    return out


FACT_ORDER = (
    "공급호수",
    "신청자격",
    "입주자격",
    "접수기간",
    "청약신청",
    "청약신청 페이지",
    "서류심사 대상자 발표",
    "서류심사대상자 발표",
    "당첨자발표",
    "당첨자발표일",
    "계약체결 및 원본서류제출",
    "계약기간",
    "임대기간",
    "입주예정월",
    "주택위치",
    "단지명",
    "사업주체",
    "문의전화",
)


def to_web(n):
    ht = htype(n)
    sec, sec_note = sector(n, ht)
    units = [_unit(u) for u in n.get("units", [])]
    if not units and n.get("pdf_supply"):
        g0 = districts(n.get("address", ""))
        d0 = dongs(n.get("address", ""))
        units = _pdf_units(n, g0[0] if g0 else "", d0[0][1] if d0 else "")
    blob = " ".join(
        [n["title"], n.get("address", ""), n.get("region", ""), " ".join(str(v) for v in n.get("facts", {}).values())]
    )
    gus = districts(blob)
    for u in units:
        if u["gu"] and u["gu"] not in gus:
            gus.append(u["gu"])
    dl = dongs(n.get("address", "") or blob)
    for u in units:
        if u["gu"] and u["dong"]:
            d = re.sub(r"^(\D+?)\d+동$", r"\1동", u["dong"])
            if [u["gu"], d] not in dl:
                dl.append([u["gu"], d])
    facts = n.get("facts", {})
    ordered = {k: facts[k] for k in FACT_ORDER if k in facts}
    ordered.update({k: v for k, v in facts.items() if k not in ordered})
    women = bool(re.search(r"여성\s*전용|여성용|여성\)", n["title"])) or (
        bool(units) and all(u["gender"] == "여성전용" for u in units)
    )
    return dict(
        key=n["key"],
        source=n["source"],
        title=n["title"],
        url=n["url"],
        kind=n.get("kind", ""),
        category=n.get("category", ""),
        operator=n.get("operator", ""),
        sector=sec,
        sector_note=sec_note,
        htype=ht,
        targets=targets(n),
        scope_out=n.get("scope_out", ""),
        dorm=bool(re.search(r"기숙사|희망하우징", n["title"])),
        women_only=women,
        posted=n.get("posted", ""),
        start=n.get("start", ""),
        end=n.get("end", ""),
        lh_status=n.get("lh_status", ""),
        address=n.get("address", ""),
        gus=gus,
        dongs=dl,
        pdf_m2=n.get("pdf_areas", []) or [],
        pdf_facts=n.get("pdf_facts", {}) or {},
        units=units,
        facts=ordered,
        attachments=[
            dict(name=a.get("name", ""), url=a.get("url", ""), parsed=a.get("parsed", ""))
            for a in n.get("attachments", [])
        ],
        note=n.get("note", ""),
        station_hint=(re.match(r"^(\S+?)역\s", n["title"]) or [None, ""])[1] if n["source"] == "청년안심" else "",
    )


def is_seoul(n):
    if not n.get("seoul"):
        return False
    if n["source"] == "LH":
        return "서울" in (n.get("region", "") + n["title"])
    return True


def norm_title(t):
    t = re.sub(r"\[정정공고\]\s*", "", t)
    return re.sub(r"\s+", "", t)


def merge_corrections(items):
    groups = {}
    for x in items:
        groups.setdefault((x["source"], norm_title(x["title"])), []).append(x)
    out = []
    for (_, _), g in groups.items():
        if len(g) == 1:
            out.append(g[0])
            continue
        g.sort(
            key=lambda x: (("정정" in x["title"]) or ("정정" in x.get("lh_status", "")), x.get("posted", "")),
            reverse=True,
        )
        keep = dict(g[0])
        keep["corrected"] = True
        keep["title"] = re.sub(r"^(\[정정공고\]\s*)+", "", keep["title"])
        keep["kind"] = notice_kind(keep["title"])
        keep["versions"] = [dict(title=x["title"], url=x["url"], posted=x.get("posted", "")) for x in g[1:]]
        if not keep["units"]:
            keep["units"] = next((x["units"] for x in g if x["units"]), [])
        out.append(keep)
    return out
