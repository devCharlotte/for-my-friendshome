import re

DAY = r"\d{1,2}\s*\.\s*\d{1,2}\s*\.?\s*(?:\(\s*[월화수목금토일]\s*\))?"
YDAY = r"(?:(?:20\d{2}|[‘'’]\s*\d{2})\s*\.\s*)?" + DAY
TIME = r"(?:\s*\d{1,2}\s*[:시]\s*\d{0,2}\s*분?)?"
RANGE = YDAY + TIME + r"(?:\s*[~∼-]\s*(?:" + YDAY + r")?" + TIME + r")?"


def _clean(s, n=90):
    s = re.sub(r"\s+", " ", s or "").strip(" ·•-:：")
    return s[:n] + ("…" if len(s) > n else "")


def _first(pattern, text, group=1, flags=0):
    m = re.search(pattern, text, flags)
    return _clean(m.group(group)) if m else ""


def _uniq(vals):
    out = []
    for v in vals:
        v = _clean(v, 40)
        if v and v not in out:
            out.append(v)
    return out


SCHEDULE = [
    ("청약 신청", r"(?:청약\s*신청|신청\s*접수|인터넷\s*청약|청약\s*접수|접수\s*기간)"),
    ("서류심사 대상자 발표", r"서류(?:심사|제출)\s*대상자\s*(?:명단\s*)?발표"),
    ("서류 제출", r"(?:대상자\s*)?서류\s*제출(?:\s*기간)?(?!\s*대상자)"),
    ("당첨자, 예비자 발표", r"(?:당첨자|예비\s*입주자(?:\s*순번)?|입주\s*대상자|예비자)\s*발표"),
    ("계약", r"(?:계약\s*체결|임대차\s*계약|계약\s*기간|계약\s*일)"),
    ("입주", r"입주\s*(?:예정|지정)?\s*(?:기간|일|시기)"),
]


def _valid(s):
    m = re.search(r"(?:(?:20\d{2}|[‘'’]\s*\d{2})\s*\.\s*)?(\d{1,2})\s*\.\s*(\d{1,2})", s or "")
    return bool(m) and 1 <= int(m.group(1)) <= 12 and 1 <= int(m.group(2)) <= 31


def schedule(text):
    out = {}
    flat = re.sub(r"\s+", " ", text)
    for label, kw in SCHEDULE:
        m = re.search(kw + r"\s*[:：)\]]?\s*(?:\(?(?:온라인|PC|모바일|이메일)[^)]{0,10}\)?\s*)?(" + RANGE + ")", flat)
        if m and _valid(m.group(1)):
            out[label] = _clean(m.group(1), 60)

    kept, last = {}, None
    for label, _ in SCHEDULE:
        if label not in out:
            continue
        k = _key(out[label])
        if last is not None and k is not None and _before(k, last):
            continue
        kept[label] = out[label]
        last = k if k is not None else last
    return kept


def _key(s):
    m = re.search(r"(?:(20\d{2}|[‘'’]\s*\d{2})\s*\.\s*)?(\d{1,2})\s*\.\s*(\d{1,2})", s or "")
    if not m:
        return None
    y = int(re.sub(r"\D", "", m.group(1))) if m.group(1) else 0
    y = y + 2000 if 0 < y < 100 else y
    return (y, int(m.group(2)) * 100 + int(m.group(3)))


def _before(a, b):
    if a[0] and b[0]:
        return a < b
    return a[1] < b[1] and not (a[0] and b[0])


def extract(text):
    if not text or len(text) < 200:
        return {}
    flat = re.sub(r"\s+", " ", text)
    f = {}
    v = _first(
        r"(?:모집\s*호수|공급\s*(?:대상\s*)?(?:주택|호수|세대)(?:\s*수)?)\s*\)?\s*[:：]?\s*(총\s*[\d,]+\s*(?:호|세대)[^.■□※•]{0,40})",
        flat,
    )
    if v:
        f["모집 규모"] = v
    v = _first(r"임대\s*기간\s*[•·:：]\s*([^■□※•]{0,50}?최장\s*\d+\s*년[^)■□]{0,15}\)?)", flat) or _first(
        r"(\d+\s*년\s*,?\s*재계약\s*\d+\s*회[^■□※•]{0,40}?최장\s*\d+\s*년[^)■□]{0,15}\)?)", flat
    )
    if v:
        f["임대기간"] = v
    m = re.search(
        r"시(?:중\s*)?(?:세|가)\s*(?:대비\s*|의\s*)?(\d{2}\s*[~∼-]\s*\d{2}|\d{2})\s*%\s*(?:수준|이하|내외)?", flat
    )
    if m:
        f["임대료 수준"] = f"시세의 {m.group(1).replace(' ', '')}%"
    m = re.search(r"(?:만\s*)?(\d{2})\s*세\s*이상\s*(?:~\s*)?(?:만\s*)?(\d{2})\s*세\s*이하", flat)
    if m:
        f["나이"] = f"만 {m.group(1)}~{m.group(2)}세"
    pct = _uniq(re.findall(r"월\s*평균\s*소득(?:액)?[^.%\d]{0,40}?(?<![\d.])(\d{2,3})\s*%\s*이하", flat))
    if pct:
        f["소득 기준"] = "도시근로자 월평균소득 " + " / ".join(p + "%" for p in pct[:4]) + " 이하 (순위, 유형별)"
    one = _first(r"\(\s*1인\s*\)\s*([\d,]{7,})\s*원", flat)
    if one:
        f["1인 가구 월소득 기준"] = one + "원 (공고문 첫 기준)"
    assets = _uniq(re.findall(r"총\s*자산(?:가액)?\s*(?:기준\s*)?[:：]?\s*([\d,]{3,})\s*만\s*원\s*이하", flat))
    if assets:
        f["총자산 기준"] = " / ".join(a + "만원" for a in assets[:3]) + " 이하"
    cars = _uniq(re.findall(r"자동차(?:\s*가액)?\s*(?:기준\s*)?[:：]?\s*([\d,]{3,})\s*만\s*원\s*(?:이하|이내)", flat))
    if cars:
        f["자동차 기준"] = " / ".join(c + "만원" for c in cars[:2]) + " 이하"
    if re.search(r"무주택", flat):
        f["무주택"] = "필요 (공고문 기준 세대 범위 확인)"
    for k, val in schedule(text).items():
        f["일정: " + k] = val
    if re.search(r"보증보험\s*(?:에\s*)?가입\s*(?:완료|되어|함|하였)|전\s*세대\s*전액\s*보증보험", flat):
        f["보증금 보증보험"] = "가입 완료로 안내됨"
    elif re.search(r"임대보증금\s*보증보험", flat):
        f["보증금 보증보험"] = "가입 의무 안내 있음 (가입 여부는 계약 전 확인)"
    m = re.search(r"반려\s*동물[^.]{0,40}?(가능|불가|금지|허용)", flat)
    if m:
        f["반려동물"] = {"허용": "가능", "금지": "불가"}.get(m.group(1), m.group(1)) + " (공고문 문구 기준)"
    v = _first(r"관리비\s*[:：]?\s*(?:월\s*)?(?:약\s*)?([\d,]{4,}\s*원[^.]{0,20})", flat)
    if v:
        f["관리비"] = v
    if re.search(r"입주\s*\(?\s*예정\s*\)?\s*자\s*안내", flat):
        f["민간임대 입주 안내문"] = "있음 (계약, 입주 주의사항)"
    v = _first(r"소액\s*임차인\s*기준\s*금액[^:：]{0,12}[:：]\s*([\d억,\s]+만\s*원)\s*이하", flat)
    if v:
        f["소액임차인 기준(서울)"] = v.replace(" ", "") + " 이하"
    v = _first(r"최우선\s*변제\s*금액[^:：]{0,12}[:：]\s*([\d억,\s]+만\s*원)\s*이하", flat)
    if v:
        f["최우선변제금액(서울)"] = v.replace(" ", "") + " 이하"
    tel = _uniq(re.findall(r"(?:☎|문의|상담|센터)[^\d]{0,12}((?:0\d{1,2}|1\d{3})-\d{3,4}(?:-\d{4})?)", flat))
    if tel:
        f["문의 전화"] = ", ".join(tel[:2])
    return f
