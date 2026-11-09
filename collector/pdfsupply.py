import re

TYPE_RE = re.compile(
    r"(?P<m2>\d{2}(?:\.\d{1,2})?)\s*(?:㎡|m2|m²|ｍ²)\s*(?:형)?\s*(?:\((?P<t1>[^)]{1,12})\))?"
    r"|(?<![\d.,])(?P<t2>\d{2}[A-Z]?\s*(?:형|TYPE|타입)|\d{2}[A-Z])(?![\d가-힣a-z])"
)
HO_RE = re.compile(r"\((\d{3,4})호\)|(?<!\d)(\d{3,4})호")
NUM_RE = re.compile(r"(?<![\d.])\d{1,3}(?:,\d{3})+(?![\d.])|(?<![\d.,])\d{1,9}(?:\.\d{1,2})?(?![\d.,%])")


def _amounts(seg, unit):
    vals = [float(x.replace(",", "")) for x in NUM_RE.findall(seg)]
    pairs, i = [], 0
    if unit == "원":
        dep_ok = lambda v: v >= 1_000_000
        rent_ok = lambda v: 10_000 <= v < 3_000_000
        scale = 1
    elif unit == "천원":
        dep_ok = lambda v: v >= 10_000
        rent_ok = lambda v: 10 <= v < 4_000
        scale = 1_000
    else:
        dep_ok = lambda v: v >= 1_000
        rent_ok = lambda v: 1 <= v < 400
        scale = 10_000
    while i < len(vals) - 1:
        d, r = vals[i], vals[i + 1]
        if dep_ok(d) and rent_ok(r) and d > r * 20:
            pairs.append((round(d * scale), round(r * scale)))
            i += 2
        else:
            i += 1
    return pairs


def parse_supply(text):
    i = text.find("공급현황")
    if i < 0:
        return []
    j = text.find("신청자격", i)
    sec = text[i : j if j > 0 else i + 3000]
    unit = "천원" if re.search(r"천\s*원", sec[:200]) else "원" if re.search(r"단위\s*[:：]\s*원", sec) else "만원"
    marks = list(TYPE_RE.finditer(sec))
    out = []
    for k, m in enumerate(marks):
        end = marks[k + 1].start() if k + 1 < len(marks) else len(sec)
        seg = sec[m.end() : end]
        seg = re.split(r"소\s*계|합\s*계", seg)[0]
        pre = re.search(r"(\d{3,4})호\s*\(?\s*$", sec[max(0, m.start() - 10) : m.start()])
        ho = pre or HO_RE.search(sec[m.start() : end])
        seg_nums = HO_RE.sub(" ", seg)
        pairs = _amounts(seg_nums, unit)
        if not pairs:
            continue
        m2 = float(m.group("m2")) if m.group("m2") else None
        typ = (m.group("t1") or m.group("t2") or "").replace(" ", "")
        hv = next((g for g in ho.groups() if g), "") if ho else ""
        out.append(
            dict(
                m2=m2,
                type=typ,
                ho=hv,
                deposit=pairs[0][0],
                rent=pairs[0][1],
                prices=[
                    dict(label=f"보증금 비율 옵션 {n + 1}" if len(pairs) > 1 else "기준 임대조건", deposit=d, rent=r)
                    for n, (d, r) in enumerate(pairs)
                ],
            )
        )
    return out
