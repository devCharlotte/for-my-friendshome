import json
import math
import os
import re
import time
from pathlib import Path

import requests

CACHE = Path("data/geocache.json")
STATIONS = Path("data/stations.json")
GU_MAP = Path("data/seoul-gu.json")
UA = {"User-Agent": "for-my-friendshome/1.0 (GitHub Pages)"}

ROAD_RE = re.compile(r"서울(?:특별)?시\s+(\S+구)\s+([가-힣0-9]+(?:로|길)(?:\s?\d+(?:가)?길)?)\s*(\d+(?:-\d+)?)")
JIBUN_RE = re.compile(r"서울(?:특별)?시\s+(\S+구)\s+([가-힣]+\d*(?:동|가)\d*가?)\s*(\d+(?:-\d+)?)")
DONG_RE = re.compile(r"\(([가-힣]+\d*(?:동|가))[,)]")


def candidates(addr):
    a = re.sub(r"\s+", " ", addr or "").strip()
    out = []
    m = ROAD_RE.search(a)
    if m:
        out.append((f"서울특별시 {m.group(1)} {m.group(2)} {m.group(3)}", "exact"))
        out.append((f"서울특별시 {m.group(1)} {m.group(2)}", "road"))
    m2 = JIBUN_RE.search(a)
    if m2:
        out.append((f"서울특별시 {m2.group(1)} {m2.group(2)} {m2.group(3)}", "exact"))
    gu = (
        (m or m2).group(1)
        if (m or m2)
        else (re.search(r"(\S+구)", a).group(1) if re.search(r"서울\S*\s+(\S+구)", a) else "")
    )
    d = DONG_RE.search(a)
    dong = d.group(1) if d else (m2.group(2) if m2 else "")
    if gu and dong:
        out.append((f"서울특별시 {gu} {dong}", "dong"))
    return out, gu


class Geocoder:
    def __init__(self, budget=900):
        self.cache = {}
        if CACHE.exists():
            try:
                self.cache = json.loads(CACHE.read_text(encoding="utf-8"))
            except ValueError:
                self.cache = {}
        self.key = os.environ.get("KAKAO_REST_KEY", "").strip()

        self.naver = (os.environ.get("NAVER_CLIENT_ID", "").strip(), os.environ.get("NAVER_CLIENT_SECRET", "").strip())
        self.provider = "kakao" if self.key else "naver" if all(self.naver) else "osm"
        self.key_limit = int(os.environ.get("API_DAILY_LIMIT", "300") or 300)
        self.key_asked = 0
        self.key_off = False
        self.budget = budget
        self.asked = 0
        self._last = 0.0
        self.gu_center = {}
        if GU_MAP.exists():
            m = json.loads(GU_MAP.read_text(encoding="utf-8"))
            self.gu_center = {g: o.get("ll") for g, o in m["gu"].items() if o.get("ll")}
        self.stations = json.loads(STATIONS.read_text(encoding="utf-8"))["stations"] if STATIONS.exists() else {}

    def save(self):
        CACHE.parent.mkdir(parents=True, exist_ok=True)
        CACHE.write_text(json.dumps(self.cache, ensure_ascii=False, sort_keys=True, indent=0), encoding="utf-8")

    def _naver(self, q):
        r = requests.get(
            "https://maps.apigw.ntruss.com/map-geocode/v2/geocode",
            params={"query": q},
            headers={
                "x-ncp-apigw-api-key-id": self.naver[0],
                "x-ncp-apigw-api-key": self.naver[1],
                "Accept": "application/json",
            },
            timeout=15,
        )
        r.raise_for_status()
        a = r.json().get("addresses", [])
        return (float(a[0]["y"]), float(a[0]["x"]), "exact") if a else None

    def _kakao(self, q):
        r = requests.get(
            "https://dapi.kakao.com/v2/local/search/address.json",
            params={"query": q},
            headers={"Authorization": f"KakaoAK {self.key}"},
            timeout=15,
        )
        r.raise_for_status()
        docs = r.json().get("documents", [])
        return (float(docs[0]["y"]), float(docs[0]["x"]), "exact") if docs else None

    def _nominatim(self, q):
        wait = 1.1 - (time.time() - self._last)
        if wait > 0:
            time.sleep(wait)
        self._last = time.time()
        r = requests.get(
            "https://nominatim.openstreetmap.org/search",
            params={"q": q, "format": "jsonv2", "limit": 1, "countrycodes": "kr"},
            headers=UA,
            timeout=20,
        )
        r.raise_for_status()
        j = r.json()
        if not j:
            return None
        t = j[0].get("addresstype", "")
        prec = (
            "exact"
            if t in ("building", "house", "amenity", "place")
            else "road" if t in ("road", "residential", "primary", "secondary", "tertiary") else "dong"
        )
        return float(j[0]["lat"]), float(j[0]["lon"]), prec

    def lookup(self, q, want):
        use_key = (
            self.provider in ("kakao", "naver")
            and want == "exact"
            and not self.key_off
            and self.key_asked < self.key_limit
        )
        if self.provider in ("kakao", "naver") and want == "exact":
            ck = self.provider + ":" + q
            if ck in self.cache:
                return self.cache[ck]
        if use_key:
            self.key_asked += 1
            try:
                hit = self._kakao(q) if self.provider == "kakao" else self._naver(q)
            except requests.HTTPError as e:
                if e.response is not None and e.response.status_code in (401, 403, 429):
                    self.key_off = True
                hit = "ERR"
            except Exception:
                hit = "ERR"
            if hit != "ERR":
                return self._store(self.provider + ":" + q, hit, want)

        if q in self.cache:
            return self.cache[q]
        if self.asked >= self.budget:
            return "SKIP"
        self.asked += 1
        try:
            hit = self._nominatim(q)
        except Exception:
            return "SKIP"
        return self._store(q, hit, want)

    def _store(self, ck, hit, want):
        if hit:
            lat, lng, prec = hit
            if want == "dong":
                prec = "dong"
            elif want == "road" and prec == "exact":
                prec = "road"
            hit = [round(lat, 6), round(lng, 6), prec]
        self.cache[ck] = hit
        return hit

    def locate(self, addr, station_hint=""):
        cands, gu = candidates(addr)
        st = self.stations.get(station_hint)
        for q, want in cands:
            hit = self.lookup(q, want)
            if hit and hit != "SKIP":

                if 37.40 < hit[0] < 37.72 and 126.75 < hit[1] < 127.20:

                    if hit[2] == "dong" and st:
                        return st[0], st[1], "station"
                    return tuple(hit)
        if st:
            return st[0], st[1], "station"
        if gu in self.gu_center:
            lat, lng = self.gu_center[gu]
            return lat, lng, "gu"
        return None

    def nearest_station(self, lat, lng):
        best = None
        for name, (a, b) in self.stations.items():
            d = haversine(lat, lng, a, b)
            if best is None or d < best[1]:
                best = (name, d)
        return (best[0], round(best[1])) if best else ("", None)


def haversine(a1, o1, a2, o2):
    r = 6371000
    p1, p2 = math.radians(a1), math.radians(a2)
    dp, dl = p2 - p1, math.radians(o2 - o1)
    h = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(h))
