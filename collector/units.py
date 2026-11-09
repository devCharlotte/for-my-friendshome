import io
import re

from . import filters as F

COLS = {
    "addr": ("주소", "소재지"),
    "area": ("전용",),
    "rooms": ("방수", "방개수", "침실", "방 수"),
    "floor": ("층수", "층"),
    "dong": ("동번호", "동"),
    "ho": ("호수", "호"),
    "type": ("주택형", "타입", "형별"),
    "gender": ("성별", "입주대상", "공급대상"),
    "elevator": ("승강기", "엘리베이터", "E/V", "EV"),
    "deposit": ("보증금",),
    "rent": ("월임대료", "월 임대료", "임대료"),
    "kind": ("주택유형", "주택군", "지자체명"),
}


def _num(v):
    if v is None:
        return None
    m = re.search(r"-?\d+(?:\.\d+)?", str(v).replace(",", ""))
    return float(m.group()) if m else None


def _pick(header, keys, used):
    for i, h in enumerate(header):
        if i in used:
            continue
        hh = h.replace(" ", "")
        if any(k.replace(" ", "") in hh for k in keys):
            return i
    return None


def _map_columns(header):
    idx, used = {}, set()

    for key in [
        "addr",
        "area",
        "rooms",
        "elevator",
        "gender",
        "type",
        "kind",
        "floor",
        "dong",
        "ho",
        "deposit",
        "rent",
    ]:
        i = _pick(header, COLS[key], used)
        if i is not None and not (key == "area" and "공용" in header[i]):
            idx[key] = i
            used.add(i)
    return idx


def unit_from_row(row, source_name=""):
    header = list(row.keys())
    idx = _map_columns(header)
    val = lambda k: (str(row[header[idx[k]]]).strip() if k in idx and row[header[idx[k]]] is not None else "")
    addr = val("addr")
    district, dong = F.parse_addr(addr)
    u = dict(
        address=addr,
        district=district,
        dong=dong,
        exclusive_m2=_num(val("area")),
        bedrooms=int(_num(val("rooms"))) if "rooms" in idx and _num(val("rooms")) is not None else None,
        floor=val("floor"),
        dong_no=val("dong"),
        ho=val("ho"),
        type=val("type"),
        kind=val("kind"),
        gender=F.gender_label(val("gender")) if "gender" in idx else "성별 제한 미확인",
        elevator=val("elevator") or "미공개",
        deposit=val("deposit"),
        rent=val("rent"),
        source=source_name,
    )
    return u


def _sheets_xlsx(data):
    import openpyxl

    wb = openpyxl.load_workbook(io.BytesIO(data), data_only=True)
    for ws in wb.worksheets:
        grid = [[c for c in r] for r in ws.iter_rows(values_only=True)]
        for rng in ws.merged_cells.ranges:
            v = grid[rng.min_row - 1][rng.min_col - 1] if rng.min_row - 1 < len(grid) else None
            for r in range(rng.min_row - 1, min(rng.max_row, len(grid))):
                for c in range(rng.min_col - 1, min(rng.max_col, len(grid[r]))):
                    grid[r][c] = v
        yield ws.title, ws.sheet_state != "visible", grid


def _sheets_xls(data):
    import xlrd

    wb = xlrd.open_workbook(file_contents=data, formatting_info=False)
    for sh in wb.sheets():
        grid = [
            [sh.cell_value(r, c) if sh.cell_type(r, c) != 0 else None for c in range(sh.ncols)] for r in range(sh.nrows)
        ]
        for r0, r1, c0, c1 in sh.merged_cells:
            v = grid[r0][c0]
            for r in range(r0, r1):
                for c in range(c0, c1):
                    grid[r][c] = v

        grid = [[int(v) if isinstance(v, float) and v.is_integer() else v for v in row] for row in grid]
        yield sh.name, sh.visibility != 0, grid


def _sheets_csv(data):
    import csv

    for enc in ("utf-8-sig", "cp949"):
        try:
            text = data.decode(enc)
            break
        except UnicodeDecodeError:
            continue
    else:
        return
    yield "csv", False, [row for row in csv.reader(io.StringIO(text))]


def parse_table_file(data: bytes, name="", source_name=""):
    nm = (name or "").lower()
    if data[:2] == b"PK":
        sheets = _sheets_xlsx(data)
    elif data[:4] == bytes.fromhex("D0CF11E0"):
        sheets = _sheets_xls(data)
    elif nm.endswith(".csv"):
        sheets = _sheets_csv(data)
    else:
        return dict(units=[], notes=[f"[{name}] 표 파일 형식이 아님"])
    return _parse_sheets(sheets, source_name or name)


def _parse_sheets(sheets, source_name=""):
    notes, units = [], []
    for title, hidden, grid in sheets:
        if hidden:
            notes.append(f"[{source_name}] 숨김 시트 '{title}' 포함 확인")
        grid = [list(r) for r in grid if r is not None]
        if not grid:
            continue
        width = max(len(r) for r in grid)
        grid = [r + [None] * (width - len(r)) for r in grid]

        hr = next(
            (
                i
                for i, r in enumerate(grid[:30])
                if any("주소" in str(c or "") or "소재지" in str(c or "") for c in r)
                and any(("면적" in str(c or "")) or ("전용" in str(c or "")) for c in r)
            ),
            None,
        )
        if hr is None:
            continue
        top = [str(c or "").replace("\n", "") for c in grid[hr]]
        sub = [str(c or "").replace("\n", "") for c in grid[hr + 1]] if hr + 1 < len(grid) else [""] * len(top)
        two_row = any(s and s != t for s, t in zip(sub, top)) and not any(_num(s) for s in sub[:3] if s)
        header = [f"{t}/{s}" if two_row and s and s != t else t for t, s in zip(top, sub)]
        start = hr + (2 if two_row else 1)

        seen = {}
        for i, h in enumerate(header):
            if h in seen:
                seen[h] += 1
                header[i] = f"{h}#{seen[h]}"
            else:
                seen[h] = 0
        price_cols = _price_columns(grid, hr, header)
        for ri, r in enumerate(grid[start:], start=start + 1):
            if not r or all(c in (None, "") for c in r):
                continue
            row = dict(zip(header, r))
            if not any("구" in str(v or "") or "시" in str(v or "") for v in r):
                continue
            u = unit_from_row(row, source_name=f"{source_name} / {title} {ri}행")

            u["prices"] = [
                dict(
                    label=lab,
                    deposit=_num(r[di]) if di < len(r) else None,
                    rent=_num(r[mi]) if mi is not None and mi < len(r) else None,
                )
                for lab, di, mi in price_cols
            ]
            units.append(u)
    return dict(units=units, notes=notes)


def _price_columns(grid, hr, header):
    top = next((i for i in range(max(0, hr - 3), hr + 1) if any(str(c or "").strip() == "순번" for c in grid[i])), hr)

    def group(i):
        parts = []
        for rr in range(top, hr):
            v = re.sub(r"\s+", " ", str(grid[rr][i] or "")).strip()
            if v and v not in parts and v not in ("순번", "주택정보", "지자체", "공급주택", "담당부서"):
                parts.append(v)
        return ", ".join(parts)

    out = []
    for i, h in enumerate(header):
        if "보증금" in h.replace(" ", ""):
            mi = i + 1 if i + 1 < len(header) and "임대료" in header[i + 1] else None
            out.append((group(i) or "임대조건", i, mi))
    return out


def parse_html_table(soup, required=("주소",)):
    for t in soup.select("table"):
        ths = [th.get_text("", strip=True) for th in t.select("thead th")] or [
            th.get_text("", strip=True) for th in t.select("tr th")
        ]
        if not all(any(r in h for h in ths) for r in required):
            continue
        out = []
        for tr in t.select("tbody tr"):
            tds = [td.get_text(" ", strip=True) for td in tr.select("td")]
            if len(tds) == len(ths):
                out.append(dict(zip(ths, tds)))
        return out
    return []
