import re


def gender_label(text):
    t = (text or "").replace(" ", "")
    if not t:
        return "성별 제한 미확인"
    if t == "제한없음":
        return "제한 없음(원문 확인)"
    if "여성" in t and "남" not in t:
        return "여성전용"
    if "남성" in t and "여" not in t:
        return "남성전용"
    if "공용" in t or ("남" in t and "여" in t):
        return "남녀공용"
    return t


def parse_addr(addr):
    addr = addr or ""
    m = re.search(r"서울특별시\s+(\S+구)", addr)
    district = m.group(1) if m else ""
    m = re.search(r"\(([^,)]+?(?:동|\d가))[,)]", addr)
    dong = m.group(1) if m else ""
    if not dong:
        m = re.search(r"\s(\S+동\d*가?)\s+\d+(-\d+)?\s*$", addr.strip())
        dong = m.group(1) if m else ""
    return district, dong
