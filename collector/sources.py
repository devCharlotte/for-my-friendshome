import json
import re
from urllib.parse import urljoin

from bs4 import BeautifulSoup

from .common import (
    bullet_facts,
    clean_title,
    decode,
    get,
    notice_kind,
    parse_date,
    parse_period,
    post,
    scope_reason,
    sha256,
    today_kst,
)
from . import units as U

MAX_PDF = 25 * 1024 * 1024


def base(source, nid, title, url, **kw):
    n = dict(
        source=source,
        id=str(nid),
        key=f"{source}:{nid}",
        title=clean_title(title),
        url=url,
        category="",
        private=False,
        region="서울특별시",
        posted="",
        start="",
        end="",
        facts={},
        address="",
        attachments=[],
        units=[],
        note="",
        seoul=True,
    )
    n.update(kw)
    n["kind"] = notice_kind(n["title"])
    return n


def apply_facts(n, facts):
    n["facts"] = facts
    for k in ("접수기간", "청약신청", "신청기간", "청약접수", "모집기간", "접수일정"):
        if k in facts:
            s, e = parse_period(facts[k])
            if s:
                n["start"], n["end"] = str(s), str(e or s)
                break
    for k in ("주택위치", "소재지", "위치", "주소", "단지위치"):
        if k in facts:
            n["address"] = facts[k]
            break
    n["scope_out"] = scope_reason(n["title"], facts)


AREA_RE = re.compile(r"(\d{2}\.\d{1,2})\s*(?:㎡|m2|m²)")


def pdf_text(b, pages=12):
    try:
        import io
        from pypdf import PdfReader

        return "\n".join((p.extract_text() or "") for p in PdfReader(io.BytesIO(b)).pages[:pages])
    except Exception:
        return ""


def pdf_areas(b, text=None):
    text = pdf_text(b) if text is None else text
    vals = {float(v) for v in AREA_RE.findall(text) if 14 <= float(v) <= 100}
    return sorted(vals)


def add_pdf_facts(n, text):
    try:
        from .pdffacts import extract

        got = extract(text)
    except Exception:
        return
    pf = n.setdefault("pdf_facts", {})
    for k, v in got.items():
        pf.setdefault(k, v)


def read_pdf_attachment(n, att):
    try:
        b = get(att["url"], timeout=60).content
        if b[:4] == b"%PDF" and len(b) <= MAX_PDF:
            add_pdf_facts(n, pdf_text(b, pages=30))
            att["parsed"] = att.get("parsed") or "공고문 내용 읽음"
    except Exception as e:
        att["parsed"] = f"PDF 읽기 실패: {type(e).__name__}"


TABLE_EXT = re.compile(r"\.(xlsx|xlsm|xls|csv)$", re.I)


def read_table_attachment(n, att, data=None):
    try:
        b = data if data is not None else get(att["url"], timeout=60).content
        att["fp"], att["sha12"] = f"sha256:{sha256(b)}", sha256(b)[:12]
        parsed = U.parse_table_file(b, name=att["name"], source_name=att["name"])
    except Exception as e:
        att["parsed"] = f"표 읽기 실패: {type(e).__name__}"
        return 0
    got = parsed["units"]
    n["units"].extend(got)
    if parsed["notes"]:
        n["note"] = (n["note"] + " " + " ".join(parsed["notes"])).strip()
    att["parsed"] = f"호실 {len(got)}개 읽음" if got else "주소와 면적 열이 있는 표 없음"
    return len(got)


def download_fp(url, n=None):
    b = get(url, timeout=60).content
    if len(b) > MAX_PDF:
        return f"size:{len(b)}", ""
    h = sha256(b)
    if n is not None and b[:4] == b"%PDF":
        text = pdf_text(b, pages=30)
        add_pdf_facts(n, text)
        n.setdefault("pdf_areas", [])
        n["pdf_areas"] = sorted(set(n["pdf_areas"]) | set(pdf_areas(b, text)))
        try:
            from .pdfsupply import parse_supply

            n.setdefault("pdf_supply", []).extend(parse_supply(text))
        except Exception:
            pass
    return f"sha256:{h}", h[:12]


LH_LIST = "https://apply.lh.or.kr/lhapply/apply/wt/wrtanc/selectWrtancList.do?mi=1026"
LH_INFO = "https://apply.lh.or.kr/lhapply/apply/wt/wrtanc/selectWrtancInfo.do"
LH_FILE = "https://apply.lh.or.kr/lhapply/lhFile.do?fileid={}"
LH_VIEW = (
    "https://apply.lh.or.kr/lhapply/apply/wt/wrtanc/selectWrtancView.do?"
    "panId={0}&ccrCnntSysDsCd={1}&uppAisTpCd={2}&aisTpCd={3}&mi=1026"
)


LH_LIST_URL = LH_LIST.split("?")[0]


def lh_collect_seoul(days=120, with_units=True):
    import datetime as dt

    end = today_kst()
    params = dict(
        mi="1026",
        srchY="Y",
        cnpCd="11",
        panSs="",
        schTy="0",
        listCo="100",
        currPage="1",
        startDt=str(end - dt.timedelta(days=days)),
        endDt=str(end),
        srchUppAisTpCd="061339",
        uppAisTpCd="06",
        mvinQf="0",
    )
    soup = BeautifulSoup(get(LH_LIST_URL, params=params).text, "html.parser")
    out = []
    for tr in soup.select("table tbody tr"):
        a = tr.select_one("a.wrtancInfoBtn")
        td = [t.get_text(" ", strip=True) for t in tr.select("td")]
        if not a or len(td) < 8:
            continue
        ids = [a.get(f"data-id{i}") for i in range(1, 5)]
        title = clean_title(td[2])
        n = base(
            "LH",
            ids[0],
            title,
            LH_VIEW.format(*ids),
            category=td[1],
            region=td[3],
            posted=str(parse_date(td[5]) or ""),
            end=str(parse_date(td[6]) or ""),
            lh_status=td[7],
            seoul=True,
        )
        n["scope_out"] = scope_reason(title, {})
        try:
            lh_detail(n, ids, with_units)
        except Exception as e:
            n["note"] = f"상세/첨부 확인 실패: {e}"
        out.append(n)
    if not out:
        raise RuntimeError("LH 서울 목록 0건 (사이트 구조 변경 가능성)")
    return out


def lh_detail(n, ids, with_units):
    data = dict(panId=ids[0], ccrCnntSysDsCd=ids[1], uppAisTpCd=ids[2], aisTpCd=ids[3], mi="1026")
    soup = BeautifulSoup(post(LH_INFO, data=data).text, "html.parser")
    text = soup.get_text("\n", strip=True)
    facts = {}
    for k in ("접수기간", "당첨자발표일", "계약기간", "임대기간", "입주예정월"):
        m = re.search(k + r"\s*:?\s*\n?\s*([^\n]{4,60})", text)
        if m and not m.group(1).endswith(":"):
            facts[k] = m.group(1).strip()
    m = re.search(r"■\s*신청자격[^\n]*\n?([^\n]{0,150})", text)
    if m:
        facts["신청자격"] = m.group(1).strip()
    apply_facts(n, facts)
    if not n["end"]:
        n["end"] = n.get("end") or ""
    for a in soup.select('a[href*="fileDownLoad("]'):
        m = re.search(r"\('(\d+)'", a["href"])
        name = a.get_text(" ", strip=True)
        if not m or not name:
            continue
        att = dict(name=name, fp=f"fileid:{m.group(1)}", url=LH_FILE.format(m.group(1)), sha12="")
        if with_units and TABLE_EXT.search(name):
            read_table_attachment(n, att)
        elif with_units and name.lower().endswith(".pdf") and "pdf_facts" not in n and re.search(r"공고|모집", name):
            read_pdf_attachment(n, att)
            if n["units"] and not n["address"]:
                n["address"] = f"{n['units'][0]['district'] or ''} 외 (호실표 참고)".strip()
        n["attachments"].append(att)


SH_LIST = "https://www.i-sh.co.kr/main/lay2/program/S1T294C297/www/brd/m_247/list.do"
SH_VIEW = "https://www.i-sh.co.kr/main/lay2/program/S1T294C297/www/brd/m_247/view.do?seq={}"
SH_SKIP = re.compile(r"시스템.*중단|청렴|생활백서|등기사항|카드뉴스|입주안내문")


def sh_collect(pages=2):
    out = []
    for page in range(1, pages + 1):
        soup = BeautifulSoup(get(SH_LIST, params={"multi_itm_seq": 2, "page": page}).text, "html.parser")
        for tr in soup.select("table tbody tr"):
            a = tr.select_one("a[onclick*=getDetailView]")
            if not a:
                continue
            seq = re.search(r"'(\d+)'", a["onclick"]).group(1)
            td = [t.get_text(" ", strip=True) for t in tr.select("td")]
            title = clean_title(td[1])
            if SH_SKIP.search(title):
                continue
            n = base(
                "SH",
                seq,
                title,
                SH_VIEW.format(seq),
                category=td[2] if len(td) > 2 else "",
                posted=str(parse_date(td[3]) or "") if len(td) > 3 else "",
                private=("사회주택" in title),
            )
            try:
                html = get(n["url"]).text
                body = BeautifulSoup(html, "html.parser").select_one("td.cont")
                apply_facts(n, bullet_facts(body.get_text("\n", strip=True) if body else ""))
                m = re.search(r"initParam\.downList\s*=\s*(\[.*?\]);", html, re.S)
                for f in json.loads(m.group(1)) if m else []:
                    nm = f.get("oriFileNm", "")
                    n["attachments"].append(
                        dict(
                            name=nm,
                            sha12="",
                            fp=f"seq{f.get('fileSeq')}:size{f.get('fileSize')}",
                            parsed=(
                                "SH 전용 다운로드 프로그램을 거쳐야 해서 내용은 못 읽음 — 공식 페이지에서 열기"
                                if TABLE_EXT.search(nm)
                                else ""
                            ),
                        )
                    )
            except Exception as e:
                n["note"] = f"상세/첨부 확인 실패: {e}"
                n["scope_out"] = scope_reason(title, {})
            out.append(n)
    if not out:
        raise RuntimeError("SH 목록 0건 (사이트 구조 변경 가능성)")
    return out


SOCO_JSON = "https://soco.seoul.go.kr/youth/pgm/home/yohome/bbsListJson.json"
SOCO_VIEW = "https://soco.seoul.go.kr/youth/bbs/BMSR00015/view.do?boardId={}&menuNo=400008"
SOCO_FILE = "https://soco.seoul.go.kr/youth/bbs/BMSR00015/"


def soco_collect(pages=2, open_days=45):
    out, today = [], today_kst()
    for page in range(1, pages + 1):
        d = post(SOCO_JSON, data={"bbsId": "BMSR00015", "pageIndex": page}).json()
        for r in d.get("resultList", []):
            title = r.get("nttSj", "")
            n = base(
                "청년안심",
                r["boardId"],
                title,
                SOCO_VIEW.format(r["boardId"]),
                category=("공공임대" if r.get("optn2") == "1" else "민간임대")
                + (" (추가모집)" if r.get("optn5") == "2" else " (최초모집)"),
                private=(r.get("optn2") == "2"),
                posted=r.get("optn1", ""),
                operator=r.get("optn3", ""),
            )
            text = BeautifulSoup(r.get("content") or "", "html.parser").get_text("\n", strip=True)
            apply_facts(n, bullet_facts(text))
            if not n["start"] and r.get("optn4"):
                n["start"] = n["end"] = r["optn4"]
            recent = parse_date(n["posted"]) and (today - parse_date(n["posted"])).days <= open_days
            if recent:
                try:
                    soup = BeautifulSoup(get(n["url"]).text, "html.parser")
                    for a in soup.select('a[href*="fileDown"]'):
                        name = a.get_text(" ", strip=True) or "첨부"
                        url = urljoin("https://soco.seoul.go.kr/", a["href"])
                        if TABLE_EXT.search(name):
                            att = dict(name=name, fp="", url=url, sha12="")
                            read_table_attachment(n, att)
                            n["attachments"].append(att)
                            continue
                        fp, s12 = download_fp(url, n)
                        n["attachments"].append(dict(name=name, fp=fp, url=url, sha12=s12))
                except Exception as e:
                    n["note"] = f"첨부 확인 실패: {e}"
            out.append(n)
    if not out:
        raise RuntimeError("청년안심 목록 0건 (사이트 구조 변경 가능성)")
    return out


HUG_MOJIP = "https://www.khug.or.kr/jeonse/web/s07/s070102.jsp"
HUG_BOARD = "https://www.khug.or.kr/jeonse/web/s07/s070301.jsp"


def hug_collect():
    out = []
    soup = BeautifulSoup(decode(get(HUG_MOJIP)), "html.parser")
    pdf = next(
        (a["href"] for a in soup.select("a[href]") if "공고문" in a.get_text() and a["href"].lower().endswith(".pdf")),
        None,
    )
    rows = U.parse_html_table(soup, required=("주소", "전용"))
    if pdf:
        pid = pdf.rsplit("/", 1)[-1]
        fp, s12 = download_fp(pdf)
        n = base(
            "HUG",
            pid,
            f"HUG 든든전세주택 입주자 모집공고문 ({pid})",
            HUG_MOJIP,
            category="든든전세",
            region="수도권 등",
            attachments=[dict(name=pid, fp=fp, url=pdf, sha12=s12)],
        )
        n["scope_out"] = ""
        seoul_rows = [x for x in rows if "서울" in (x.get("시도", "") + x.get("주소", ""))]
        n["units"] = [U.unit_from_row(x, source_name="HUG 주택 리스트") for x in seoul_rows]
        if rows:
            per = [parse_period(x.get("청약 접수기간", "")) for x in rows]
            st = [p[0] for p in per if p[0]]
            en = [p[1] for p in per if p[1]]
            n["start"], n["end"] = (str(min(st)) if st else ""), (str(max(en)) if en else "")
            n["facts"] = {"공급호수": f"전체 {len(rows)}호 중 서울 {len(seoul_rows)}호"}
        else:
            n["note"] = "현재 모집 중인 주택 리스트 없음 (모집 기간 외)"
            n["kind"] = "안내"
        out.append(n)
    soup = BeautifulSoup(decode(get(HUG_BOARD)), "html.parser")
    seen = set()
    for a in soup.select('a[href*="articleId="]'):
        m = re.search(r"articleId=(\d+)", a["href"])
        title = clean_title(a.get_text(" ", strip=True))
        if not m or m.group(1) in seen or not title:
            continue
        seen.add(m.group(1))
        if not re.search(r"모집|공급|추가|예비|정정", title):
            continue
        tr = a.find_parent("tr")
        posted = parse_date(tr.get_text(" ", strip=True)) if tr else None
        n = base(
            "HUG",
            m.group(1),
            title,
            f"{HUG_BOARD}?mode=S&articleId={m.group(1)}",
            category="든든전세 공지",
            region="수도권 등",
            posted=str(posted or ""),
        )
        n["scope_out"] = ""
        out.append(n)
    if not out:
        raise RuntimeError("HUG 수집 0건 (사이트 구조 변경 가능성)")
    return out


def _hug_bullets(text):
    facts = {}
    for part in re.split(r"[ㅁ■□]\s*", text or "")[1:]:
        m = re.match(r"([^:：]{1,15}?)\s*[:：]\s*(.+)", part.strip())
        if m:
            facts[m.group(1).strip()] = re.split(r"※|목록\s|이전글", m.group(2))[0].strip()[:200]
    return facts


def hug_collect_web():
    out = hug_collect()
    for n in out:
        if n["category"] == "든든전세":
            for att in n["attachments"]:
                if att.get("url", "").lower().endswith(".pdf"):
                    read_pdf_attachment(n, att)
        if n["category"] == "든든전세" and not n["units"]:
            try:
                soup = BeautifulSoup(
                    decode(
                        post(
                            HUG_MOJIP,
                            data=dict(
                                view_Count="N", CMB_SIDO="01", sbGugun="ALL", BJAMT="ALL", BJAREA="ALL", BJORDER="ALL"
                            ),
                        )
                    ),
                    "html.parser",
                )
                rows = U.parse_html_table(soup, required=("주소", "전용"))
                n["units"] = [U.unit_from_row(x, source_name="HUG 주택 리스트(서울)") for x in rows]
                if rows:
                    per = [parse_period(x.get("청약 접수기간", "")) for x in rows]
                    st = [p[0] for p in per if p[0]]
                    en = [p[1] for p in per if p[1]]
                    n["start"], n["end"] = (str(min(st)) if st else ""), (str(max(en)) if en else "")
                    n["facts"] = {"공급호수": f"서울 {len(rows)}호"}
                    n["kind"] = "모집"
                    n["note"] = ""
            except Exception as e:
                n["note"] = (n["note"] + f" 서울 주택 리스트 조회 실패: {e}").strip()
        elif n["category"] == "든든전세 공지":
            try:
                psoup = BeautifulSoup(decode(get(n["url"])), "html.parser")
                for a in psoup.select("a[href]"):
                    nm = a.get_text(" ", strip=True)
                    if not re.search(r"\.(pdf|xlsx|xlsm|xls|csv|hwp|hwpx)$", nm, re.I):
                        continue
                    att = dict(name=nm, fp="", url=urljoin(HUG_BOARD, a["href"]), sha12="")
                    if TABLE_EXT.search(nm):
                        read_table_attachment(n, att)
                        n["units"] = [u for u in n["units"] if "서울" in u.get("address", "")]
                    n["attachments"].append(att)
                text = psoup.get_text(" ", strip=True)
                facts = _hug_bullets(text[text.find("<") :] if "<" in text else text)
                if facts:
                    apply_facts(n, facts)
                    for k in ("공고일정", "접수기간", "청약기간"):
                        if k in facts:
                            s, e = parse_period(facts[k], ref=parse_date(n["posted"]) or None)
                            if s:
                                n["start"], n["end"] = str(s), str(e or s)
                                break
                    m = re.search(r"서울\s*(\d+)\s*호", facts.get("공고호수", "") + facts.get("공급호수", ""))
                    if m:
                        n["facts"]["서울 공급"] = f"{m.group(1)}호"
            except Exception as e:
                n["note"] = f"공지 본문 확인 실패: {e}"
    return out


WEB_COLLECTORS = {"LH": lh_collect_seoul, "SH": sh_collect, "청년안심": soco_collect, "HUG": hug_collect_web}
