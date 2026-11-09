import datetime as dt
import hashlib
import re
from zoneinfo import ZoneInfo

import requests

KST = ZoneInfo("Asia/Seoul")
UA = {"User-Agent": "Mozilla/5.0 (for-my-friendshome)"}
SESSION = requests.Session()
SESSION.headers.update(UA)


def today_kst():
    return dt.datetime.now(KST).date()


def sha256(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()


def get(url, **kw):
    kw.setdefault("timeout", 30)
    r = SESSION.get(url, **kw)
    r.raise_for_status()
    return r


def post(url, **kw):
    kw.setdefault("timeout", 30)
    r = SESSION.post(url, **kw)
    r.raise_for_status()
    return r


def decode(r):
    for enc in ("utf-8", "cp949"):
        try:
            return r.content.decode(enc)
        except UnicodeDecodeError:
            pass
    return r.content.decode("utf-8", "ignore")


def parse_date(s):
    m = re.search(r"(20\d{2})[.\-/년\s]+(\d{1,2})[.\-/월\s]+(\d{1,2})", s or "")
    if not m:
        return None
    try:
        return dt.date(*map(int, m.groups()))
    except ValueError:
        return None


def clean_title(t):
    t = re.sub(r"\s+", " ", t or "").strip()
    t = re.sub(r"^NEW\s+", "", t)
    t = re.sub(r"^\[(민간|공공)임대\]\s*", "", t)
    t = re.sub(r"^\[(민간임대|공공임대)\]\s*", "", t)
    t = re.sub(r"\s*\d+일전$", "", t)
    return t


def notice_kind(title):
    t = title.replace(" ", "")
    if re.search(r"희망돌보미|채용|기간제|사무지원|운영기관모집|운영기관선정|위탁운영|사업자모집", t) and not re.search(
        r"입주자모집", t
    ):
        return "안내"
    if re.search(r"정정|변경|수정", t) and re.search(r"모집|공고|공급", t):
        return "정정"
    if re.search(r"안내$|안내문|오류|연장", t) and not re.search(r"모집공고$", t):
        return "안내"
    if re.search(r"발표|당첨|결과|경쟁률|서류심사|대상자|게시", t):
        return "발표/결과"
    if re.search(r"모집|공급|청약|입주자", t):
        return "모집"
    return "안내"


DATE_RE = re.compile(r"(?:(20\d{2}|[‘'’]\s*\d{2}|\b\d{2})\s*[.\-/년]\s*)?(\d{1,2})\s*[.\-/월]\s*(\d{1,2})(?!\d)")


def _mk(y, m, d):
    try:
        return dt.date(y, m, d)
    except ValueError:
        return None


def parse_period(s, ref=None):
    ref = ref or today_kst()
    found = []
    for m in DATE_RE.finditer(s or ""):
        y, mo, d = m.groups()
        if y:
            y = int(re.sub(r"\D", "", y))
            y = y + 2000 if y < 100 else y
        mo, d = int(mo), int(d)
        if not (1 <= mo <= 12 and 1 <= d <= 31):
            continue
        found.append((y, mo, d))
    if not found:
        return None, None
    y0 = found[0][0] or ref.year
    start = _mk(y0, found[0][1], found[0][2])
    end = start
    if len(found) > 1:
        y1 = found[1][0] or y0
        end = _mk(y1, found[1][1], found[1][2])
        if end and start and end < start:
            end = _mk(y1 + 1, found[1][1], found[1][2])
    return start, end


def bullet_facts(text):
    facts, key = {}, None
    for line in (text or "").splitlines():
        line = line.strip()
        if not line:
            continue
        m = re.match(r"^[■□▶◎●]\s*([^:：]{1,20}?)\s*[:：]\s*(.*)$", line)
        if m:
            key = m.group(1).strip()
            facts[key] = m.group(2).strip()
        elif line.startswith("[") or line.startswith("■"):
            key = None
        elif key and len(facts[key]) < 200:
            facts[key] = (facts[key] + " " + line).strip()
    return facts


SCOPE_OUT = re.compile(
    r"신혼|신생아|고령|65세|어르신|장애인|수급|차상위|한부모|철거민|예술인|창업|창조기업|다자녀|군인|대학생 전용"
)


def scope_reason(title, facts):
    t = title + " " + facts.get("신청자격", "") + " " + facts.get("입주자격", "")
    m = SCOPE_OUT.search(t)
    return f"{m.group()} 대상 한정" if m else ""
