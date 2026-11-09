(() => {
  "use strict";
  const REC_GU = ["강동구", "구로구", "금천구", "도봉구", "중랑구"];
  const LINES = [
    "1호선",
    "2호선",
    "3호선",
    "4호선",
    "5호선",
    "6호선",
    "7호선",
    "8호선",
    "9호선",
    "수인분당선",
    "경의중앙선",
    "신분당선",
    "공항철도",
    "우이신설선",
    "신림선",
    "경춘선",
    "서해선",
  ];
  const LINE_COLOR = {
    "1호선": "#0052A4",
    "2호선": "#00A84D",
    "3호선": "#EF7C1C",
    "4호선": "#00A5DE",
    "5호선": "#996CAC",
    "6호선": "#CD7C2F",
    "7호선": "#747F00",
    "8호선": "#E6186C",
    "9호선": "#BDB092",
    "수인분당선": "#F5A200",
    "경의중앙선": "#77C4A3",
    "신분당선": "#D4003B",
    "공항철도": "#0090D2",
    "우이신설선": "#B0CE18",
    "신림선": "#6789CA",
    "경춘선": "#0C8E72",
    "서해선": "#8FC31F",
  };
  const ALL_GU = [
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
  ];
  const GENDERS = ["남녀공용", "성별 표기 없음", "여성전용"];
  const GENDER_OFF = ["여성전용"];
  function genderCat(g) {
    const t = (g || "").replace(/\s/g, "");
    if (/여성/.test(t) && !/남/.test(t)) return "여성전용";
    if (/남성/.test(t) && !/여/.test(t)) return "성별 표기 없음";
    if (/공용|제한없음/.test(t) || (/남/.test(t) && /여/.test(t))) return "남녀공용";
    return "성별 표기 없음";
  }
  const TARGET_ALL = ["청년", "일반/기타", "신혼/신생아", "고령자", "예술인/창업", "장애인/수급", "철거민", "다자녀"];
  const TARGET_OFF = ["신혼/신생아", "고령자", "장애인/수급", "철거민", "다자녀"];
  const UNI = {
    "관악구": "서울대",
    "광진구": "건국 세종",
    "노원구": "광운 서울과기 서울여",
    "도봉구": "덕성",
    "동대문구": "경희 외대 시립",
    "동작구": "중앙 숭실",
    "마포구": "홍익 서강",
    "서대문구": "연세 이화 명지",
    "서초구": "서울교대",
    "성동구": "한양",
    "성북구": "고려 성신 국민 동덕 한성",
    "송파구": "한체대",
    "용산구": "숙명",
    "종로구": "성균관 상명",
    "중구": "동국",
    "구로구": "성공회",
  };
  const HTYPE_ALL = [
    "청년안심주택",
    "행복주택",
    "매입임대",
    "든든전세",
    "전세임대",
    "장기전세",
    "장기안심",
    "국민임대",
    "통합공공임대",
    "공공임대(분양전환)",
    "사회주택",
    "공공기숙사",
    "영구임대",
    "재개발임대",
    "협동조합주택",
    "기타",
  ];
  const HTYPE_OFF = ["공공기숙사", "영구임대", "재개발임대", "협동조합주택"];
  const HTYPE_INFO = {
    "사회주택": "사회적기업이나 협동조합 등이 운영하고 서울시가 토지와 자금을 지원해요. 시세 80% 이하, 최장 10년",
    "공공기숙사": "대학생과 청년용 기숙사형 (방을 함께 쓰는 경우가 많음)",
    "영구임대": "수급자와 저소득층 위주",
    "재개발임대": "재개발 철거 세입자 위주",
    "협동조합주택": "예술인 등 특정 직군 협동조합",
    "장기안심": "SH가 전세보증금 일부를 무이자 지원",
    "장기전세": "SH 시프트와 미리내집. 시세 80% 이하 전세",
    "든든전세": "LH, HUG가 매입한 주택. 시세 90% 이하 전세로 최장 8년",
  };
  const SUPPORT = [
    {
      id: "soco-dep",
      area: "주거",
      kind: "금전",
      aud: ["전체"],
      status: "상시",
      short: "보증금 무이자(청년안심)",
      name: "청년안심주택 임대보증금 무이자 지원",
      who: "서울시와 SH",
      what: "민간임대 청년안심주택 보증금의 30~50%(1억 이하 50%, 초과 30%)를 무이자로 대신 내 줘요. 청년은 최대 약 4,500만원이에요.",
      elig: "무주택 청년, 도시근로자 1인 100% 이하(월 381만, 연 4,576만). 총자산 기준이 있고 매년 바뀌어요.",
      how: "임대차계약 후 청년안심주택 종합지원센터(02-793-0780)에 신청해요 (입주 3주 전까지).",
      url: "https://soco.seoul.go.kr/youth/main/main.do",
      match: (n, u) => n.source === "청년안심" && n.sector === "민간",
    },
    {
      id: "seoul-int",
      area: "주거",
      kind: "금전",
      aud: ["직장인", "취준생", "대학생", "대학원생"],
      status: "상시",
      short: "보증금 대출 이자지원(서울시)",
      name: "서울시 청년 임차보증금 이자지원",
      who: "서울시(하나은행 대출)",
      what: "보증금 대출 최대 2억원(보증금의 90% 이내)의 이자를 연 2.0%(한부모, 자립준비청년은 3.0%) 지원해요. 최장 8년이에요.",
      elig: "만 19~39세 무주택 세대주(예정자). 연소득 미혼 5,000만원, 기혼 합산 6,000만원 이하(2026년 6월부터). 소득 심사는 은행에서 하고 근로자와 취준생 구분이 없어졌어요.",
      how: "서울주거포털에서 추천서를 받고 하나은행에서 상담과 대출을 받아요.",
      url: "https://housing.seoul.go.kr/site/main/content/sh01_040901",
      src: [["2026.5.19 서울시 발표", "https://mediahub.seoul.go.kr/archives/2018213"]],
      match: (n, u) => n.sector === "민간" && u && u.deposit != null && u.deposit <= 3e8 && (u.rent || 0) <= 9e5,
    },
    {
      id: "molit-rent",
      area: "주거",
      kind: "금전",
      aud: ["직장인", "취준생", "대학생", "대학원생", "1인가구"],
      status: "상시",
      short: "청년월세(국토부)",
      name: "청년월세 지원 (국토부)",
      who: "국토교통부(복지로)",
      what: "월세를 월 최대 20만원씩 최대 24개월(최대 480만원) 지원해요. 2026년부터 상시 사업이에요.",
      elig: "만 19~34세, 부모와 따로 사는 무주택 청년. 청년가구 기준중위소득 60% 이하, 원가구 100% 이하. 재산 기준이 있고 공공임대 거주자는 제외예요.",
      how: "복지로 온라인이나 주민센터에서 신청해요.",
      url: "https://www.bokjiro.go.kr",
      match: (n, u) => n.sector === "민간" && u && u.rent > 0,
    },
    {
      id: "seoul-rent",
      area: "주거",
      kind: "금전",
      aud: ["직장인", "취준생", "대학생", "대학원생", "1인가구"],
      status: "마감",
      short: "청년월세(서울시)",
      name: "서울시 청년월세지원",
      who: "서울시",
      what: "월 최대 20만원씩 12개월(240만원), 생애 1회예요. 2026년부터 1인가구 말고도 전세피해자, 한부모, 무자녀 신혼, 청년안심주택(민간임대) 입주자로 대상이 넓어졌어요.",
      elig: "만 19~39세 서울 무주택 청년, 보증금 8,000만원 이하, 월세 60만원 이하, 기준중위소득 48% 초과 150% 이하.",
      how: "2026년은 5월 6일~19일에 받았어요. 다음 모집은 서울주거포털 공고를 봐요.",
      url: "https://housing.seoul.go.kr",
      src: [["2026.5.4 서울시 발표", "https://mediahub.seoul.go.kr/archives/2018004"]],
      match: (n, u) => n.sector === "민간" && u && u.rent > 0 && u.rent <= 6e5 && (u.deposit || 0) <= 8e7,
    },
    {
      id: "sh-long",
      area: "주거",
      kind: "금전",
      aud: ["전체"],
      status: "마감",
      short: "장기안심주택",
      name: "보증금지원형 장기안심주택",
      who: "서울시와 SH",
      what: "내가 고른 전월세 집 보증금의 일부를 최대 7,000만원까지 무이자로 지원해요(무이자 비율 40%). 버팀목 대출과 같이 쓸 수 있어요.",
      elig: "무주택, 청년은 도시근로자 100% 이하. 자산과 자동차 기준, 보증금 상한이 있어요.",
      how: "SH 모집공고 때 신청해요. 2026년은 5월 11일~13일에 받았어요.",
      url: "https://www.i-sh.co.kr",
      src: [["2026.4.27 서울시 발표", "https://mediahub.seoul.go.kr/archives/2017963"]],
      match: () => false,
    },
    {
      id: "buttress",
      area: "주거",
      kind: "금전",
      aud: ["전체"],
      status: "상시",
      short: "버팀목 전세대출",
      name: "버팀목 전세자금대출 (청년)",
      who: "주택도시기금",
      what: "전세 보증금을 시중보다 낮은 금리로 빌려 주는 정부 대출이에요. LH나 HUG 든든전세처럼 보증금이 큰 집에 같이 쓰는 경우가 많아요.",
      elig: "나이, 소득, 자산, 보증금 기준은 기금 누리집에서 확인해요.",
      how: "주택도시기금 누리집이나 수탁은행에서 신청해요.",
      url: "https://nhuf.molit.go.kr",
      match: (n, u) => u && u.lease === "전세",
    },
    {
      id: "seoul-move",
      area: "주거",
      kind: "금전",
      aud: ["전체"],
      status: "마감",
      short: "중개보수와 이사비(서울시)",
      name: "서울시 청년 부동산 중개보수 및 이사비 지원",
      who: "서울시",
      what: "중개보수와 이사비 실비를 합쳐 최대 40만원, 생애 1회예요. 둘 중 하나만 신청해도 되고, 공공임대(중개보수 없음)도 이사비는 신청할 수 있어요.",
      elig: "서울로 전입했거나 서울 안에서 이사해 전입신고한 만 19~39세 무주택 청년. 기준중위소득 150% 이하, 거래금액(보증금+월세×100) 2억원 이하. 부모 소유 집에 살거나 주거급여 수급자면 제외예요.",
      how: "상반기와 하반기 2번 모집해요(2026년은 4월, 8월). 청년몽땅정보통에서만 신청하고, 문의는 1877-9358이에요.",
      url: "https://youth.seoul.go.kr",
      src: [["2026.8.18 서울시 발표", "https://mediahub.seoul.go.kr/archives/2019098"]],
      match: (n, u) => u && (u.deposit || 0) + (u.rent || 0) * 100 <= 2e8,
    },
    {
      id: "guar-fee",
      area: "주거",
      kind: "금전",
      aud: ["전체"],
      status: "상시",
      short: "반환보증 보증료 지원",
      name: "전세보증금 반환보증 보증료 지원",
      who: "국토교통부, 자치구",
      what: "전세보증금 반환보증에 가입하고 낸 보증료를 최대 40만원까지 돌려줘요.",
      elig: "무주택 청년, 연소득 6,000만원 이하.",
      how: "정부24나 구청에서 신청해요. 예산이 떨어지면 일찍 끝나요.",
      url: "https://www.gov.kr",
      match: (n, u) => u && u.lease === "전세",
    },
    {
      id: "split-benefit",
      area: "주거",
      kind: "금전",
      aud: ["대학생", "취준생", "1인가구"],
      status: "상시",
      short: "주거급여 분리지급",
      name: "청년 주거급여 분리지급",
      who: "국토교통부, 주민센터",
      what: "부모와 따로 사는 청년에게 임차급여를 따로 줘요. 서울 1인 임차급여 상한은 월 369,000원이에요(2026).",
      elig: "만 19~29세 미혼, 부모가 주거급여 수급가구(기준중위소득 48% 이하)이고 주소가 부모와 달라야 해요.",
      how: "복지로나 주민센터에서 상시 신청해요.",
      url: "https://housing.seoul.go.kr/site/main/content/sh01_061021",
      match: () => false,
    },
    {
      id: "dream-acct",
      area: "자산",
      kind: "금전",
      aud: ["직장인", "전체"],
      status: "상시",
      short: "청년 주택드림 청약통장",
      name: "청년 주택드림 청약통장",
      who: "국토교통부(주택도시기금)",
      what: "2년 이상 유지하면 최고 연 4.5% 금리를 받고, 청약에 당첨되면 낮은 금리의 청년 주택드림 디딤돌 대출로 이어져요.",
      elig: "만 19~34세, 연소득 5,000만원 이하, 무주택.",
      how: "은행에서 상시 가입해요.",
      url: "https://nhuf.molit.go.kr",
      match: () => false,
    },
    {
      id: "housing-center",
      area: "주거",
      kind: "서비스",
      aud: ["1인가구", "전체"],
      status: "상시",
      short: "주거안심종합센터",
      name: "주거안심종합센터 주거상담과 긴급주거비",
      who: "서울시, 자치구",
      what: "구마다 있는 주거상담소에서 주거 상담을 받고 공공임대와 금융 지원으로 연결해 줘요. 위기 가구는 긴급 보증금(300만원 이내)이나 월세(월 35만원 이내, 최대 4개월)를 받을 수 있어요.",
      elig: "상담은 누구나. 긴급 지원은 기준중위소득 80% 이하이고 실직이나 질병 같은 위기가 있어야 해요.",
      how: "구별 주거상담소에 문의해요.",
      url: "https://housing.seoul.go.kr",
      match: () => false,
    },
    {
      id: "safe-contract",
      area: "주거",
      kind: "서비스",
      aud: ["1인가구"],
      status: "상시",
      short: "집보기 동행",
      name: "1인가구 전월세 안심계약 도움서비스",
      who: "서울시",
      what: "공인중개사 자격이 있는 주거안심매니저가 집 보러 같이 가고, 계약 상담과 지원 정책 안내도 해 줘요. 무료예요.",
      elig: "서울에 살거나 살 예정인 1인가구.",
      how: "1인가구 포털에서 희망일 2~3일 전에 신청해요.",
      url: "https://1in.seoul.go.kr",
      src: [["2026.3.11 서울시 발표", "https://mediahub.seoul.go.kr/archives/2017406"]],
      match: () => false,
    },
    {
      id: "together",
      area: "생활",
      kind: "서비스",
      aud: ["1인가구"],
      status: "상시",
      short: "1인가구 동행서비스",
      name: "1인가구 동행서비스 (이사동행, 건강동행)",
      who: "서울시",
      what: "이사동행은 이사 당일 최대 6시간 같이 있으며 집 상태 확인과 전입신고를 도와줘요(무료). 건강동행은 병원 진료부터 귀가까지 같이 가 줘요(시간당 6,000원, 기준중위소득 100% 이하는 연 48회 무료).",
      elig: "서울에 사는 1인가구.",
      how: "일인친구 콜센터 1533-1179나 1인가구 포털에서 신청해요.",
      url: "https://1in.seoul.go.kr",
      src: [["2026.4.13 서울시 발표", "https://mediahub.seoul.go.kr/archives/2017809"]],
      match: () => false,
    },
    {
      id: "home-care",
      area: "생활",
      kind: "서비스",
      aud: ["1인가구"],
      status: "상시",
      short: "1인가구 주택관리",
      name: "1인가구 주택관리 서비스",
      who: "서울시, 자치구",
      what: "형광등 교체나 도어락 수리 같은 작은 집수리와 생활 불편을 도와줘요.",
      elig: "기준중위소득 120% 이하 1인 임차가구.",
      how: "구 주거안심종합센터에 신청해요.",
      url: "https://housing.seoul.go.kr",
      match: () => false,
    },
    {
      id: "safe-set",
      area: "생활",
      kind: "서비스",
      aud: ["1인가구"],
      status: "마감",
      short: "안심홈세트",
      name: "1인가구 안심홈세트 (구별 사업)",
      who: "자치구",
      what: "현관문 안전장치와 스마트초인종, 가정용 CCTV 같은 안심 장비를 줘요. 구마다 내용과 자격이 달라요.",
      elig: "구별 공고를 확인해요.",
      how: "보통 봄에 구청 1인가구지원센터에서 모집해요. 2026년은 대부분 끝났어요.",
      url: "https://1in.seoul.go.kr",
      match: () => false,
    },
    {
      id: "allowance",
      area: "일자리",
      kind: "금전",
      aud: ["취준생"],
      status: "마감",
      short: "서울 청년수당",
      name: "서울 청년수당",
      who: "서울시",
      what: "구직 활동비로 월 50만원씩 최대 6개월 받아요. 생애 1회예요.",
      elig: "서울 거주 만 19~34세 미취업자, 기준중위소득 150% 이하. 재학생과 휴학생은 안 돼요. 주 30시간 미만이나 3개월 이하 단기 근로는 괜찮아요.",
      how: "2026년은 3월 6일~13일에 받았어요. 다음 모집은 청년몽땅정보통을 봐요.",
      url: "https://youth.seoul.go.kr",
      src: [["2026.3.5 서울시 발표", "https://mediahub.seoul.go.kr/archives/2017342"]],
      match: () => false,
    },
    {
      id: "kua",
      area: "일자리",
      kind: "금전",
      aud: ["취준생"],
      status: "상시",
      short: "국민취업지원제도",
      name: "국민취업지원제도",
      who: "고용노동부",
      what: "Ⅰ유형은 구직촉진수당 월 60만원씩 6개월과 취업 지원을 받아요. Ⅱ유형은 취업 지원 서비스와 참여수당을 받아요. 서울 청년수당과 동시에 받을 수는 없어요.",
      elig: "Ⅰ유형 청년은 만 18~34세, 기준중위소득 120% 이하, 재산 5억원 이하. Ⅱ유형 청년은 소득과 상관없어요.",
      how: "고용24에서 상시 신청해요.",
      url: "https://www.work24.go.kr",
      match: () => false,
    },
    {
      id: "future-jobs",
      area: "일자리",
      kind: "금전",
      aud: ["취준생"],
      status: "마감",
      short: "서울 미래 청년 일자리",
      name: "서울 미래 청년 일자리",
      who: "서울시",
      what: "신산업 분야 기업에서 최대 6개월 일하며 4대보험이 되는 급여를 받아요.",
      elig: "서울 거주 만 19~39세 미취업자.",
      how: "2026년은 5월 18일~31일에 받았어요. 다음 모집은 청년몽땅정보통을 봐요.",
      url: "https://youth.seoul.go.kr",
      src: [["2026.5.15 서울시 발표", "https://mediahub.seoul.go.kr/archives/2018163"]],
      match: () => false,
    },
    {
      id: "suit",
      area: "일자리",
      kind: "서비스",
      aud: ["취준생", "대학생"],
      status: "상시",
      short: "취업날개 정장 대여",
      name: "취업날개 (면접 정장 무료 대여)",
      who: "서울시",
      what: "면접용 정장과 넥타이, 구두를 무료로 빌려줘요. 1년에 10회까지예요.",
      elig: "서울 거주 구직자, 고교 졸업예정자부터 만 39세까지.",
      how: "서울일자리포털에서 예약하고 매장에 방문해요.",
      url: "https://news.seoul.go.kr/economy/jobplan/freesuits",
      match: () => false,
    },
    {
      id: "naeil",
      area: "교육",
      kind: "금전",
      aud: ["직장인", "취준생"],
      status: "상시",
      short: "국민내일배움카드",
      name: "국민내일배움카드",
      who: "고용노동부",
      what: "직업훈련 비용을 카드로 지원해요. 금액과 자기부담 비율은 과정마다 달라요.",
      elig: "대부분의 국민이 받을 수 있어요. 재학생 조건은 고용24에서 확인해요.",
      how: "고용24에서 상시 신청해요.",
      url: "https://www.work24.go.kr",
      match: () => false,
    },
    {
      id: "labor",
      area: "생활",
      kind: "서비스",
      aud: ["직장인", "취준생", "대학생"],
      status: "상시",
      short: "무료 노동상담",
      name: "서울노동권익센터 무료 노동상담",
      who: "서울시",
      what: "임금체불, 부당해고, 직장 내 괴롭힘, 프리랜서 대금 문제를 공인노무사가 무료로 상담하고 필요하면 진정이나 소송 지원으로 연결해 줘요. 아르바이트도 돼요.",
      elig: "일하는 사람 누구나.",
      how: "☎1661-2020이나 누리집에서 신청해요.",
      url: "https://www.labors.or.kr",
      src: [["2026.3.4 서울시 발표", "https://mediahub.seoul.go.kr/archives/2017330"]],
      match: () => false,
    },
    {
      id: "hope-double",
      area: "자산",
      kind: "금전",
      aud: ["직장인"],
      status: "마감",
      short: "희망두배 청년통장",
      name: "서울 희망두배 청년통장",
      who: "서울시",
      what: "월 15만원을 저축하면 서울시가 같은 금액을 더 넣어 줘요. 2년이면 약 720만원, 3년이면 약 1,080만원에 이자가 붙어요.",
      elig: "서울 거주 만 18~34세, 최근 1년 안에 3개월 이상 일했고 본인 월소득 세전 255만원 이하. 부양의무자 소득과 재산 기준이 있어요.",
      how: "2026년은 6월 8일~19일에 받았어요. 다음 모집은 서울시 자산형성지원 누리집을 봐요.",
      url: "https://youth.seoul.go.kr",
      src: [["2026.6.5 서울시 발표", "https://mediahub.seoul.go.kr/archives/2018375"]],
      match: () => false,
    },
    {
      id: "future-savings",
      area: "자산",
      kind: "금전",
      aud: ["직장인"],
      status: "예정",
      short: "청년미래적금",
      name: "청년미래적금 (청년도약계좌 후속)",
      who: "금융위원회, 은행",
      what: "월 최대 50만원을 3년 동안 넣으면 정부가 기여금을 더해 줘요(일반형 6%, 중소기업 재직 등 우대형 12%). 청년도약계좌는 2025년 말에 신규 가입이 끝났어요.",
      elig: "만 19~34세, 일반형은 총급여 6,000만원 이하. 우대형은 중소기업 재직자로 총급여 3,600만원 이하 등.",
      how: "1차는 2026년 6월 22일~7월 3일에 받았어요. 다음 모집 일정은 은행과 금융위 공지를 봐요.",
      url: "https://www.fsc.go.kr",
      match: () => false,
    },
    {
      id: "youngtech",
      area: "자산",
      kind: "서비스",
      aud: ["전체"],
      status: "상시",
      short: "서울 영테크",
      name: "서울 영테크 (무료 재무상담)",
      who: "서울시",
      what: "재무 전문가에게 1:1 무료 재무상담을 최대 4회 받고, 재무 교육도 들을 수 있어요.",
      elig: "서울 거주 만 19~39세.",
      how: "청년몽땅정보통에서 신청해요.",
      url: "https://youth.seoul.go.kr",
      src: [["2026.4.9 서울시 발표", "https://mediahub.seoul.go.kr/archives/2017753"]],
      match: () => false,
    },
    {
      id: "kpass",
      area: "교통",
      kind: "금전",
      aud: ["전체"],
      status: "상시",
      short: "K-패스",
      name: "K-패스 (모두의 카드)",
      who: "국토교통부",
      what: "대중교통비 일부를 돌려받아요. 청년(만 19~34세)은 30%예요. 2026년에 생긴 '모두의 카드'는 한 달 기준 금액을 넘게 쓰면 넘은 만큼을 돌려줘요.",
      elig: "누구나. 청년 환급률은 만 19~34세.",
      how: "카드사에서 K-패스 카드를 만들고 앱에 등록해요.",
      url: "https://korea-pass.kr",
      src: [["2026.1.19 정책브리핑", "https://www.korea.kr/news/policyNewsView.do?newsId=148957978"]],
      match: () => false,
    },
    {
      id: "climate",
      area: "교통",
      kind: "금전",
      aud: ["전체"],
      status: "상시",
      short: "기후동행카드 청년권",
      name: "기후동행카드 청년권",
      who: "서울시",
      what: "서울 대중교통 무제한 정기권을 청년은 더 싸게 써요(30일권 55,000원, 따릉이 포함 58,000원).",
      elig: "만 19~39세. 앱에서 연령 인증을 하면 돼요.",
      how: "모바일티머니 앱이나 편의점에서 사요.",
      url: "https://news.seoul.go.kr/traffic/?p=517662",
      match: () => false,
    },
    {
      id: "mind",
      area: "생활",
      kind: "서비스",
      aud: ["전체"],
      status: "마감",
      short: "청년 마음건강",
      name: "서울 청년 마음건강 지원사업",
      who: "서울시",
      what: "검사 후 1:1 심리상담을 최대 6회 무료로 받고, 필요하면 의료기관으로 연결해 줘요.",
      elig: "서울 거주 만 19~39세.",
      how: "1년에 여러 차례 모집해요(2026년 1차 1월, 2차 3~4월). 다음 모집은 청년몽땅정보통을 봐요.",
      url: "https://youth.seoul.go.kr",
      src: [["2026.3.30 서울시 발표", "https://mediahub.seoul.go.kr/archives/2017622"]],
      match: () => false,
    },
    {
      id: "culture",
      area: "생활",
      kind: "금전",
      aud: ["대학생", "전체"],
      status: "상시",
      short: "서울청년문화패스",
      name: "서울청년문화패스",
      who: "서울시",
      what: "공연과 전시 관람비를 최대 20만원 지원해요(2027년 3월 말까지 사용).",
      elig: "서울 거주 만 21~23세(2003~2005년생), 기준중위소득 150% 이하, 생애 1회.",
      how: "청년몽땅정보통에서 신청하면 한 달에 두 번 선정해요.",
      url: "https://youth.seoul.go.kr",
      src: [["2025.12.15 서울시 발표", "https://mediahub.seoul.go.kr/archives/2016502"]],
      match: () => false,
    },
    {
      id: "scholarship",
      area: "교육",
      kind: "금전",
      aud: ["대학생", "대학원생"],
      status: "예정",
      short: "국가장학금과 학자금대출",
      name: "국가장학금과 학자금대출",
      who: "한국장학재단",
      what: "국가장학금은 소득 구간별로 연 100만~600만원(기초, 차상위는 등록금 전액)이에요. 학자금대출은 대학원생도 받을 수 있고 2026년 2학기 금리는 연 1.70%예요.",
      elig: "국가장학금은 대학생, 학자금대출은 대학생과 대학원생. 소득 구간 기준이 있어요.",
      how: "한국장학재단 누리집에서 학기마다 신청해요. 2027학년도 1학기 1차 신청은 보통 11~12월이에요.",
      url: "https://www.kosaf.go.kr",
      match: () => false,
    },
    {
      id: "stipend",
      area: "교육",
      kind: "금전",
      aud: ["대학원생"],
      status: "상시",
      short: "연구생활장려금",
      name: "이공계 연구생활장려금 (스타이펜드)",
      who: "과학기술정보통신부, 참여 대학",
      what: "참여 대학 이공계 대학원생에게 매달 석사 최소 80만원, 박사 최소 110만원을 보장해요.",
      elig: "참여 대학(43곳)의 이공계 대학원생.",
      how: "학생이 직접 신청하지 않고 소속 대학을 통해 받아요.",
      url: "https://www.nrf.re.kr",
      match: () => false,
    },
  ];
  const guLabel = (g) => (UNI[g] ? `${g}(${UNI[g]})` : g);
  const UPDATE_TIMES = ["05:00"];
  const DEP_OPTS = [
    [0, "무관"],
    [1e7, "1천만"],
    [5e7, "5천만"],
    [1e8, "1억"],
    [2e8, "2억"],
    [3e8, "3억"],
  ];
  const RENT_OPTS = [
    [0, "무관"],
    [2e5, "20만"],
    [3e5, "30만"],
    [4e5, "40만"],
    [5e5, "50만"],
    [7e5, "70만"],
  ];
  const M2_OPTS = [
    [0, "전체"],
    [20, "20㎡+ (6평)"],
    [30, "30㎡+ (9평)"],
    [35, "35㎡+"],
    [40, "40㎡+ (12평)"],
  ];
  const ROOM_OPTS = [
    [0, "전체"],
    [1, "1개"],
    [2, "2개+"],
    [3, "3개+"],
  ];
  const ST_OPTS = [
    [0, "무관"],
    [500, "500m"],
    [1000, "1km"],
  ];
  const STATUS = ["접수중", "접수예정", "일정 확인", "마감"];
  const KINDS = ["모집", "정정", "발표/결과", "안내"];
  const SOURCES = { "LH": "LH", "SH": "SH", "청년안심": "서울시 청년안심", "HUG": "HUG 든든전세" };
  const SECTOR_INFO = {
    "공공": "LH, SH, HUG가 직접 공급해요. 시세보다 저렴하고 소득과 자산 기준이 있어요",
    "민간": "청년안심주택 민간분과 사회주택. 민간이 운영하고 공공이 지원해요",
  };
  const GEO_TXT = {
    exact: "건물 위치",
    road: "도로 기준 근사 위치",
    dong: "동 중심 근사 위치",
    station: "역 기준 근사 위치",
    gu: "구 중심(위치 미확인)",
  };
  const PAGE = 40;
  const DEFAULTS = () => ({
    view: "house",
    lines: [...LINES],
    sector: ["공공", "민간"],
    source: Object.keys(SOURCES),
    htype: HTYPE_ALL.filter((t) => !HTYPE_OFF.includes(t)),
    target: TARGET_ALL.filter((t) => !TARGET_OFF.includes(t)),
    gus: ALL_GU.filter((g) => !REC_GU.includes(g)),
    status: ["접수중", "접수예정", "일정 확인"],
    kind: ["모집", "정정"],
    q: "",
    sort: { notice: "deadline", house: "deadline", cal: "" },
    sup: "",
    me: { inc: 0, asset: 0, car: "", home: "", show: false },
    stations: [],
    h: {
      lease: ["전세", "월세"],
      maxDep: 0,
      maxRent: 0,
      minM2: 0,
      rooms: 0,
      stMax: 0,
      ev: "",
      badge: false,
      star: false,
      unknown: true,
      ref: "",
    },
    gender: GENDERS.filter((g) => !GENDER_OFF.includes(g)),
  });
  const STORE = "for-my-friendshome:v1";
  const $ = (s) => document.querySelector(s);
  const esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
    );
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
  const dnum = (s) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || "");
    return m ? Date.UTC(+m[1], m[2] - 1, +m[3]) / 864e5 : null;
  };
  const T = dnum(today);
  const dstr = (d) => new Date(d * 864e5).toISOString().slice(0, 10);
  const fmtD = (s) => (s ? s.slice(5).replace("-", ".") : "");
  const pyeong = (m2) => (m2 / 3.3058).toFixed(1);
  function won(v) {
    if (v == null) return "-";
    if (v >= 1e8) {
      const e = Math.floor(v / 1e8),
        m = Math.round((v % 1e8) / 1e4);
      return `${e}억${m ? " " + m.toLocaleString() + "만" : ""}`;
    }
    if (v >= 1e4) return `${Math.round(v / 1e4).toLocaleString()}만`;
    return `${v.toLocaleString()}원`;
  }
  const walk = (m) => (m == null ? "" : m < 1000 ? `${Math.round(m / 10) * 10}m` : `${(m / 1000).toFixed(1)}km`);
  const walkMin = (m) => (m == null ? "" : `도보 약 ${Math.max(1, Math.round((m * 1.3) / 67))}분`);
  function hav(a1, o1, a2, o2) {
    const r = 6371000,
      p1 = (a1 * Math.PI) / 180,
      p2 = (a2 * Math.PI) / 180,
      dp = p2 - p1,
      dl = ((o2 - o1) * Math.PI) / 180;
    const h = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
    return 2 * r * Math.asin(Math.sqrt(h));
  }
  function badgeOf(m2, rooms) {
    const two = rooms != null && rooms >= 2;
    if (m2 != null && m2 >= 40 && two) return ["40㎡+ 방2", 0];
    if (m2 != null && m2 >= 35 && two) return ["35㎡+ 방2", 1];
    if (m2 != null && m2 >= 40) return ["40㎡+", 2];
    if (two) return ["방 2개+", 2];
    if (m2 != null && m2 >= 35 && m2 < 40) return ["35㎡대", 3];
    return ["", 4];
  }
  const badgeHtml = (b) => (b ? `<span class="szb">${esc(b)}</span>` : "");
  function statusOf(n) {
    const s = dnum(n.start),
      e = dnum(n.end);
    if (s == null && e == null) return "일정 확인";
    if (e != null && T > e) return "마감";
    if (s != null && T < s) return "접수예정";
    if (s == null && n.lh_status && !/접수중/.test(n.lh_status)) return "접수예정";
    return "접수중";
  }
  function ddayText(n, st) {
    if (st === "접수중" && n.end) {
      const d = dnum(n.end) - T;
      return d === 0 ? "오늘 마감" : `마감 D-${d}`;
    }
    if (st === "접수예정" && n.start) {
      const d = dnum(n.start) - T;
      return d === 0 ? "오늘 시작" : `시작 D-${d}`;
    }
    if (st === "마감" && n.end) return `${T - dnum(n.end)}일 전 마감`;
    return "";
  }
  function kdate(s, ref) {
    const m = /(?:(20\d{2}|[‘'’]\s*\d{2})\s*[.\-/년]\s*)?(\d{1,2})\s*[.\-/월]\s*(\d{1,2})(?!\d)/.exec(s || "");
    if (!m) return null;
    let y = m[1] ? +m[1].replace(/\D/g, "") : +(ref || today).slice(0, 4);
    if (y < 100) y += 2000;
    const mo = +m[2],
      d = +m[3];
    if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
    return `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }
  let S = DEFAULTS();
  try {
    const v = JSON.parse(localStorage.getItem(STORE) || "null");
    if (v) {
      const d = DEFAULTS();
      S = {
        ...d,
        ...v,
        sort: { ...d.sort, ...(v.sort || {}) },
        h: { ...d.h, ...(v.h || {}) },
        my: { ...d.my, ...(v.my || {}) },
        me: { ...d.me, ...(v.me || {}) },
      };
      const VOC = {
        "신혼\u00b7신생아": "신혼/신생아",
        "예술인\u00b7창업": "예술인/창업",
        "장애인\u00b7수급": "장애인/수급",
        "일반\u00b7기타": "일반/기타",
        "발표\u00b7결과": "발표/결과",
      };
      ["target", "kind"].forEach((k) => (S[k] = (S[k] || []).map((x) => VOC[x] || x)));
      if (S.view === "mail") S.view = "house";
      if (S.me && S.me.inc === 2500000) S.me.inc = 2564238;
    }
  } catch (e) {}
  let STARS = new Set();
  try {
    STARS = new Set(JSON.parse(localStorage.getItem(STORE + ":stars") || "[]"));
  } catch (e) {}
  const save = () => {
    try {
      localStorage.setItem(STORE, JSON.stringify(S));
      localStorage.setItem(STORE + ":stars", JSON.stringify([...STARS]));
    } catch (e) {}
  };
  let DATA = { notices: [], health: {} },
    MAP = null,
    STATIONS = {},
    STLINES = {},
    HOUSES = [],
    PLACES = [];
  let selPin = null,
    zoomGu = null,
    shown = PAGE,
    VIEW = null;
  function prep(n) {
    n._status = statusOf(n);
    n._text = [
      n.title,
      n.address,
      n.htype,
      n.category,
      n.operator,
      n.gus.join(" "),
      n.dongs.map((d) => d[1]).join(" "),
      n.station || "",
      Object.values(n.facts).join(" "),
    ]
      .join(" ")
      .toLowerCase();
    n.units.forEach((u, i) => {
      u._n = n;
      u._i = i;
    });
  }
  function computeLines() {
    const cache = new Map();
    const get = (o) => {
      if (o.lat == null) return null;
      const k = o.lat + "," + o.lng + "," + o.geo;
      if (!cache.has(k)) cache.set(k, nearLines(o.lat, o.lng, o.geo));
      return cache.get(k);
    };
    for (const n of DATA.notices) {
      n._lines = get(n);
      n.units.forEach((u) => (u._lines = get(u)));
    }
    LINE_R_DONE = LINE_R();
  }
  let LINE_R_DONE = 0;
  function buildHouses() {
    const map = new Map();
    for (const n of DATA.notices) {
      for (const u of n.units) {
        const key = n.key + "|" + (u.name || (u.addr || "").replace(/\s*\(.*$/, ""));
        let h = map.get(key);
        if (!h) {
          h = {
            id: key,
            n,
            units: [],
            name: u.name || "",
            addr: u.addr,
            gu: u.gu,
            dong: u.dong,
            lat: u.lat,
            lng: u.lng,
            geo: u.geo,
            station: u.station,
            station_m: u.station_m,
          };
          map.set(key, h);
        }
        h.units.push(u);
        if (h.lat == null && u.lat != null)
          Object.assign(h, { lat: u.lat, lng: u.lng, geo: u.geo, station: u.station, station_m: u.station_m });
      }
    }
    HOUSES = [...map.values()];
    HOUSES.forEach((h) => {
      h.title = h.name
        ? h.name.replace(/^[가-힣]+?(동|구)\(/, "").replace(/\)$/, "")
        : (h.addr || "").replace(/^서울특별시\s*/, "");
      h._text = [h.name, h.addr, h.gu, h.dong, h.station, h.n.title].join(" ").toLowerCase();
    });
  }
  const guOk = (g) => !g || (zoomGu ? g === zoomGu : S.gus.includes(g));
  const linesOn = () => S.lines.length < LINES.length;
  function lineOk(ls, lenient) {
    if (!linesOn()) return true;
    if (!ls) return !!lenient;
    return ls.some((l) => S.lines.includes(l));
  }
  const LINE_R = () => S.h.stMax || 1000;
  function nearSel(o) {
    if (o.lat == null || o.geo === "gu") return false;
    return S.stations.some((st) => STATIONS[st] && hav(o.lat, o.lng, STATIONS[st][0], STATIONS[st][1]) <= LINE_R());
  }
  function nearLines(lat, lng, geo) {
    if (lat == null || geo === "gu") return null;
    const out = new Set(),
      near = [];
    for (const [name, [a, b]] of Object.entries(STATIONS)) {
      const d = hav(lat, lng, a, b);
      if (d <= LINE_R()) {
        (STLINES[name] || []).forEach((l) => out.add(l));
        near.push([name, d]);
      }
    }
    return [...out];
  }
  const houseFilterOn = () => {
    const h = S.h;
    return !!(
      h.lease.length < 2 ||
      S.stations.length ||
      h.maxDep ||
      h.maxRent ||
      h.minM2 ||
      h.rooms ||
      h.stMax ||
      h.ev ||
      h.badge ||
      S.sup
    );
  };
  const placeOf = (nm) => PLACES.find((p) => p.short === nm || p.name === nm);
  const refPt = () => {
    if (!S.h.ref) return null;
    const p = placeOf(S.h.ref);
    if (p) return [p.lat, p.lng];
    return STATIONS[S.h.ref] || null;
  };
  const refLabel = () => (placeOf(S.h.ref) ? S.h.ref : `${S.h.ref}역`);
  function noticeMine(n) {
    if (!n.units.length && !S.gender.includes(n.women_only ? "여성전용" : "성별 표기 없음")) return false;
    return true;
  }
  function unitPass(u) {
    const h = S.h;
    if (!lineOk(u._lines)) return false;
    if (S.stations.length && !nearSel(u)) return false;
    if (!S.gender.includes(genderCat(u.gender))) return false;
    if (h.lease.length < 2 && !h.lease.includes(u.lease)) return false;
    if (h.maxDep && !(u.deposit != null && u.deposit <= h.maxDep)) return false;
    if (h.maxRent && !(u.rent == null ? u.lease === "전세" : u.rent <= h.maxRent)) return false;
    if (h.minM2 && !(u.m2 != null && u.m2 >= h.minM2)) return false;
    if (h.rooms && !(u.rooms != null && (h.rooms === 1 ? u.rooms === 1 : u.rooms >= h.rooms))) return false;
    if (h.stMax && !(u.station_m != null && u.station_m <= h.stMax && u.geo !== "gu" && u.geo !== "dong")) return false;
    if (h.ev === "Y" && !/^(y|있|유|o)/i.test(u.ev || "")) return false;
    if (h.ev === "N" && !/^(n|없|무|x)/i.test(u.ev || "")) return false;
    if (h.badge && !badgeOf(u.m2, u.rooms)[0]) return false;
    if (S.sup) {
      const sp = SUPPORT.find((x) => x.id === S.sup);
      if (sp && !sp.match(u._n, u)) return false;
    }
    return true;
  }
  function passCats(n, skip) {
    const has = (k, v) => !S[k].length || (Array.isArray(v) ? v.some((x) => S[k].includes(x)) : S[k].includes(v));
    if (skip !== "sector" && !has("sector", n.sector)) return false;
    if (skip !== "source" && !has("source", n.source)) return false;
    if (skip !== "htype" && !has("htype", n.htype)) return false;
    if (skip !== "target" && !has("target", n.targets)) return false;
    if (skip !== "status" && !has("status", n._status)) return false;
    if (skip !== "kind" && !has("kind", n.kind)) return false;
    return true;
  }
  const textOk = (t) =>
    !S.q ||
    S.q
      .toLowerCase()
      .split(/\s+/)
      .every((w) => t.includes(w));
  function noticeRows(skip) {
    const out = [],
      hf = houseFilterOn();
    for (const n of DATA.notices) {
      if (!passCats(n, skip) || !noticeMine(n) || !textOk(n._text)) continue;
      if (S.h.star && !STARS.has(n.key) && !n.units.some((u) => STARS.has(houseKeyOf(u)))) continue;
      if (skip !== "me" && meOn() && !S.me.show && meCheck(n).fail.length) continue;
      let units = n.units.filter(unitPass);
      if (n.units.length) {
        if (!units.length) continue;
      } else if (hf && !S.h.unknown) continue;
      if (skip !== "gus") {
        if (n.units.length) {
          units = units.filter((u) => guOk(u.gu));
          if (!units.length) continue;
        } else if (n.gus.length && !n.gus.some(guOk)) continue;
      }
      if (!n.units.length && !lineOk(n._lines, true)) continue;
      if (!n.units.length && S.stations.length && !nearSel(n)) continue;
      const best = units.map((u) => badgeOf(u.m2, u.rooms)).sort((a, b) => a[1] - b[1])[0] || ["", 4];
      out.push({ n, units, best });
    }
    return out;
  }
  const houseKeyOf = (u) => u._n.key + "|" + (u.name || (u.addr || "").replace(/\s*\(.*$/, ""));
  function houseRows(skip) {
    const ok = new Set(noticeRows("gus").map((r) => r.n.key));
    const out = [];
    for (const h of HOUSES) {
      if (!ok.has(h.n.key)) continue;
      if (!textOk(h._text + " " + h.n._text)) continue;
      if (S.h.star && !STARS.has(h.id)) continue;
      if (skip !== "gus" && !guOk(h.gu)) continue;
      const units = h.units.filter(unitPass);
      if (!units.length) continue;
      out.push({ h, units });
    }
    return out;
  }
  const INC100 = 3813363;
  const ME_OPTS = {
    inc: [
      [0, "안 정함"],
      [2564238, "기준중위소득 100% 이하 (월 256만, 연 3,077만)"],
      [3813363, "도시근로자 100% 이하 (월 381만, 연 4,576만)"],
      [4359205, "기준중위소득 170% 이하 (월 436만, 연 5,231만)"],
      [4576036, "도시근로자 120% 이하 (월 458만, 연 5,491만)"],
      [9e9, "도시근로자 120% 초과 (월 458만, 연 5,491만)"],
    ],
    asset: [
      [0, "안 정함"],
      [108e6, "행복주택 대학생 기준 이하 (1.08억)"],
      [251e6, "청년 자산 기준 이하 (2.51억)"],
      [345e6, "국민임대 자산 기준 이하 (3.45억)"],
      [9e12, "국민임대 기준 초과 (3.45억)"],
    ],
    car: [
      ["", "안 정함"],
      ["none", "없음"],
      ["low", "자동차가액 기준 이하 (4,542만원)"],
      ["high", "자동차가액 기준 초과 (4,542만원)"],
    ],
    home: [
      ["", "안 정함"],
      ["alone", "혼자 (세대 분리)"],
      ["fam0", "가족과 함께 (가족 모두 무주택)"],
      ["fam1", "가족과 함께 (부모님 집 있음)"],
    ],
  };
  const INC_STD = {
    2564238: "기준중위소득 1인 100%",
    3813363: "도시근로자 1인 100%",
    4194699: "도시근로자 1인 110%",
    4359205: "기준중위소득 1인 170% (150% + 1인 가구 20%p)",
    4576036: "도시근로자 1인 120%",
  };
  const ASSET_STD = { 108e6: "행복주택 대학생 기준", 251e6: "청년 자산 기준", 345e6: "국민임대 자산 기준" };
  const manW = (v) => Math.round(v / 1e4).toLocaleString() + "만";
  const incTxt = (v) => `${INC_STD[v] ? INC_STD[v] + " " : ""}(월 ${manW(v)}, 연 ${manW(v * 12)})`;
  const assetTxt = (v) => `${ASSET_STD[v] ? ASSET_STD[v] + " " : ""}(${wonM(v)})`;
  const numWon = (t) => {
    if (!t) return null;
    const m = String(t)
      .replace(/,/g, "")
      .match(/(\d+(?:\.\d+)?)\s*(만원|원|억)/);
    if (!m) return null;
    return +m[1] * { "만원": 1e4, "원": 1, "억": 1e8 }[m[2]];
  };
  function eligOf(n) {
    const pf = n.pdf_facts || {},
      t = n.htype,
      title = n.title || "";
    let e = null;
    if (n.source === "청년안심" || t === "청년안심주택")
      e = {
        inc: 4576036,
        asset: 251e6,
        car: 4542e4,
        home: "본인",
        note: "소득 순위: 1순위 도시근로자 100%(월 381만, 연 4,576만), 2순위 110%(월 419만, 연 5,034만), 3순위 120%(월 458만, 연 5,491만). 청년 자산 기준(2.51억), 자동차가액 기준(4,542만원) 이하면 차 있어도 돼요 (세대당 1대 등록)",
        src: "청년안심주택 2026.10 공고",
      };
    else if (t === "행복주택")
      e = {
        inc: 4576036,
        asset: 251e6,
        car: 4542e4,
        home: "본인",
        note: "청년 계층: 도시근로자 1인 120%(월 458만, 연 5,491만) 이하, 청년 자산 기준(2.51억), 자동차가액 기준(4,542만원) 이하. 미혼이어야 하고 입주 전까지 청약통장에 가입해야 해요. 대학생 계층은 부모 소득을 합산하고, 자산 1.08억 이하에 차가 없어야 해요.",
        src: "LH 서울번동3 행복주택 2026.8.19 공고",
      };
    else if (t === "매입임대" && /청년/.test(title))
      e = {
        inc: 4576036,
        asset: 251e6,
        car: 4542e4,
        home: "본인",
        note: "3순위: 본인 소득 도시근로자 1인 100% + 1인 가구 20%p 가산 = 120%(월 458만, 연 5,491만), 청년 자산 기준(2.51억). 2순위: 본인+부모 소득 합산 가구원수별 100%, 국민임대 자산 기준(3.45억). 미혼이어야 하고, 부모님 집이 있어도 신청할 수 있어요.",
        src: "LH 청년 매입임대 2026.9.17 공고",
      };
    else if (t === "통합공공임대")
      e = {
        inc: 4359205,
        asset: 345e6,
        car: 4542e4,
        home: "본인",
        note: "기준중위소득 150% + 1인 가구 20%p = 170%(월 436만, 연 5,231만), 자산 3.45억, 자동차가액 기준(4,542만원) 이하. 소득 구간별로 임대료가 달라요.",
        src: "LH 통합공공임대 2026.9.17 공고",
      };
    else if (t === "든든전세" && n.source === "LH")
      e = {
        inc: null,
        asset: null,
        car: null,
        home: "세대",
        note: "소득과 자산 기준은 없지만 무주택세대구성원이어야 해요. 주민등록상 같은 세대(부모님 등) 중 누구라도 집이 있으면 신청할 수 없어요",
        src: "LH 든든전세 2026.10.1 공고",
      };
    if (!e) e = { inc: undefined, asset: undefined, car: undefined, home: "", note: "", src: "" };
    e = { ...e };
    const i1 = numWon(pf["1인 가구 월소득 기준"]);
    if (i1) e.inc = i1;
    const as = pf["총자산 기준"]
      ? Math.max(
          ...String(pf["총자산 기준"])
            .replace(/,/g, "")
            .match(/\d+/g)
            .map((x) => +x * 1e4),
        )
      : null;
    if (as) e.asset = as;
    const cr = numWon(pf["자동차 기준"]);
    if (cr) e.car = cr;
    if (/세대/.test(pf["무주택"] || "") && !e.home) e.home = "공고 확인";
    return e;
  }
  const meOn = () => !!(S.me.inc || S.me.asset || S.me.car || S.me.home);
  function meCheck(n) {
    const e = eligOf(n),
      m = S.me,
      fail = [],
      unk = [];
    if (m.inc) {
      if (e.inc === undefined) unk.push("소득");
      else if (e.inc !== null && m.inc > e.inc) fail.push("소득");
    }
    if (m.asset) {
      if (e.asset === undefined) unk.push("자산");
      else if (e.asset !== null && m.asset > e.asset) fail.push("자산");
    }
    if (m.car === "low" || m.car === "high") {
      if (e.car === undefined) unk.push("자동차");
      else if (e.car === 0 || (e.car !== null && m.car === "high")) fail.push("자동차");
    }
    if (m.home === "fam1") {
      if (e.home === "세대") fail.push("무주택(세대)");
      else if (!e.home || e.home === "공고 확인") unk.push("무주택 범위");
    }
    return { fail, unk, e };
  }
  const wonM = (v) =>
    v >= 1e8 ? (v / 1e8).toFixed(2).replace(/\.?0+$/, "") + "억" : Math.round(v / 1e4).toLocaleString() + "만원";
  function eligLine(n) {
    const e = eligOf(n);
    if (e.inc === undefined && e.asset === undefined && !e.note)
      return meOn()
        ? `<div class="subhead">경제 조건 (자격 기준)</div><div class="elig ext">이 공고는 소득과 자산 기준을 자동으로 읽지 못했어요. 공고문의 '신청자격'을 확인하세요.</div>`
        : "";
    const parts = [];
    if (e.inc !== undefined) parts.push(e.inc === null ? "소득 기준 없음" : `본인 소득 <b>${incTxt(e.inc)} 이하</b>`);
    if (e.asset !== undefined)
      parts.push(e.asset === null ? "자산 기준 없음" : `총자산 <b>${assetTxt(e.asset)} 이하</b>`);
    if (e.car !== undefined)
      parts.push(
        e.car === null
          ? "자동차 기준 없음"
          : e.car === 0
            ? "자동차 <b>없어야 함</b>"
            : `자동차 <b>${e.car === 4542e4 ? "공공주택 자동차가액 기준 " : ""}(${wonM(e.car)}) 이하</b>`,
      );
    if (e.home)
      parts.push(
        e.home === "본인"
          ? "무주택: <b>본인만</b> 봐요"
          : e.home === "세대"
            ? "무주택: <b>같은 세대 전원</b>"
            : "무주택 범위: 공고 확인",
      );
    const mc = meOn() ? meCheck(n) : null;
    return `<div class="subhead">경제 조건 (자격 기준)</div><div class="elig">${parts.join(", ")}${e.note ? `<br><span class="ext">${esc(e.note)}${e.src ? ` (${esc(e.src)})` : ""}</span>` : ""}<br><a href="${esc(n.url)}" target="_blank" rel="noopener">자세한 자격은 이 공고문에서 확인 ↗</a>
    ${mc ? `<br>${mc.fail.length ? `<span class="pill flag">내 조건: ${mc.fail.join(", ")} 기준 초과</span>` : mc.unk.length ? `<span class="pill soft">내 조건: ${mc.unk.join(", ")}은 공고에서 확인</span>` : `<span class="pill info">내 조건으로 기준 안쪽</span>`}` : ""}</div>`;
  }
  function mePill(n) {
    if (!meOn()) return "";
    const mc = meCheck(n);
    return mc.fail.length
      ? `<span class="pill flag" title="내 경제 조건이 이 공고 기준을 초과해요">${mc.fail.join(", ")} 기준 초과</span>`
      : "";
  }
  function renderMe() {
    const segM = (id, key, opts) => {
      $(id).innerHTML = opts
        .map(([v, t]) => {
          const m = t.match(/^(.*?) \((.*)\)$/);
          return `<button class="chip" data-me="${key}" data-mev="${v}" aria-pressed="${String(S.me[key]) === String(v)}">${esc(m ? m[1] : t)}${m ? `<span class="c">${esc(m[2])}</span>` : ""}</button>`;
        })
        .join("");
    };
    segM("#seg-inc", "inc", ME_OPTS.inc);
    segM("#seg-asset", "asset", ME_OPTS.asset);
    segM("#seg-car", "car", ME_OPTS.car);
    segM("#seg-home", "home", ME_OPTS.home);
    $("#meNote").innerHTML = meOn()
      ? '기준은 2026년 서울 공고문 기준이에요. 공고마다 순위와 가산이 달라서 \'기준 안쪽\'이어도 공고문을 꼭 확인하세요. <button class="link" data-view="guide" data-goto="g-money">조건 설명 보기</button>'
      : '연봉은 세전 월평균 소득 × 12로 계산한 대략값이에요. 도시근로자는 통계청 도시근로자 가구 월평균소득, 기준중위소득은 보건복지부 고시 기준이에요(2026년 공고 기준). <button class="link" data-view="guide" data-goto="g-money">무슨 뜻인지 보기</button>';
  }
  function chipGroup(el, key, values, counts, labels = {}) {
    el.innerHTML = values
      .map(
        (v) =>
          `<button class="chip${counts[v] ? "" : " zero"}" data-k="${key}" data-v="${esc(v)}" aria-pressed="${S[key].includes(v)}">${esc(labels[v] || v)}<span class="c">${counts[v] || 0}</span></button>`,
      )
      .join("");
  }
  function countCat(key, values, getter) {
    const c = {};
    values.forEach((v) => (c[v] = 0));
    noticeRows(key).forEach(({ n }) => {
      const v = getter(n);
      (Array.isArray(v) ? v : [v]).forEach((x) => {
        if (x in c) c[x]++;
      });
    });
    return c;
  }
  function seg(el, key, opts) {
    el.innerHTML = opts
      .map(([v, t]) => `<button data-h="${key}" data-val="${v}" aria-pressed="${S.h[key] === v}">${t}</button>`)
      .join("");
  }
  function renderPanels() {
    const c = countCat("sector", ["공공", "민간"], (n) => n.sector);
    $("#sector").innerHTML = ["공공", "민간"]
      .map(
        (v) =>
          `<button data-k="sector" data-v="${v}" aria-pressed="${S.sector.includes(v)}"><b><span>${v}임대</span><span class="num">${c[v]}</span></b><small>${SECTOR_INFO[v]}</small></button>`,
      )
      .join("");
    chipGroup(
      $("#g-status"),
      "status",
      STATUS,
      countCat("status", STATUS, (n) => n._status),
    );
    chipGroup(
      $("#g-kind"),
      "kind",
      KINDS,
      countCat("kind", KINDS, (n) => n.kind),
    );
    const ht = [...HTYPE_ALL, ...new Set(DATA.notices.map((n) => n.htype).filter((t) => !HTYPE_ALL.includes(t)))];
    const hc = countCat("htype", ht, (n) => n.htype);
    $("#g-htype").innerHTML = ht
      .map(
        (v) =>
          `<button class="chip${hc[v] ? "" : " zero"}" data-k="htype" data-v="${esc(v)}" aria-pressed="${S.htype.includes(v)}" title="${esc(HTYPE_INFO[v] || "")}">${esc(v)}<span class="c">${hc[v] || 0}</span></button>`,
      )
      .join("");
    const tc = countCat("target", TARGET_ALL, (n) => n.targets);
    $("#g-target").innerHTML = TARGET_ALL.map(
      (v) =>
        `<button class="chip${tc[v] ? "" : " zero"}" data-k="target" data-v="${esc(v)}" aria-pressed="${S.target.includes(v)}">${esc(v)}<span class="c">${tc[v] || 0}</span></button>`,
    ).join("");
    chipGroup(
      $("#g-source"),
      "source",
      Object.keys(SOURCES),
      countCat("source", Object.keys(SOURCES), (n) => n.source),
      SOURCES,
    );
    $("#g-lease").innerHTML = ["전세", "월세"]
      .map((v) => `<button class="chip" data-hl="${v}" aria-pressed="${S.h.lease.includes(v)}">${v}</button>`)
      .join("");
    seg(
      $("#seg-dep"),
      "maxDep",
      DEP_OPTS.map(([v, t]) => [v, v ? t + " 이하" : t]),
    );
    seg(
      $("#seg-rent"),
      "maxRent",
      RENT_OPTS.map(([v, t]) => [v, v ? t + " 이하" : t]),
    );
    seg($("#seg-m2"), "minM2", M2_OPTS);
    seg($("#seg-rooms"), "rooms", ROOM_OPTS);
    seg(
      $("#seg-st"),
      "stMax",
      ST_OPTS.map(([v, t]) => [v, v ? t + " 이내" : t]),
    );
    if (typeof S.h.ev !== "string") S.h.ev = "";
    $("#seg-ev").innerHTML = [
      ["", "전체"],
      ["Y", "있음"],
      ["N", "없음"],
    ]
      .map(([v, t]) => `<button data-ev="${v}" aria-pressed="${S.h.ev === v}">${t}</button>`)
      .join("");
    $("#h-badge").checked = S.h.badge;
    $("#h-star").checked = S.h.star;
    $("#h-unknown").checked = S.h.unknown;
    const gc = {};
    (S.view === "house" ? houseRows("gus") : noticeRows("gus")).forEach((r) => {
      if (r.h) gc[r.h.gu] = (gc[r.h.gu] || 0) + 1;
      else
        (r.n.units.length ? [...new Set(r.units.map((u) => u.gu))] : r.n.gus).forEach(
          (g) => (gc[g] = (gc[g] || 0) + 1),
        );
    });
    $("#g-gu").innerHTML = ALL_GU.map(
      (g) =>
        `<button class="chip${gc[g] ? "" : " zero"}" data-k="gus" data-v="${g}" aria-pressed="${S.gus.includes(g)}">${esc(guLabel(g))}${REC_GU.includes(g) ? ' <span class="rec">제외 권장</span>' : ""}<span class="c">${gc[g] || 0}</span></button>`,
    ).join("");
    $("#g-line").innerHTML = LINES.map(
      (l) =>
        `<button class="chip" data-k="lines" data-v="${l}" aria-pressed="${S.lines.includes(l)}"><i style="width:9px;height:9px;border-radius:50%;background:${LINE_COLOR[l]};display:inline-block"></i>${l}</button>`,
    ).join("");
    $("#lineRadius").textContent = walk(LINE_R());
    $("#g-stsel").innerHTML = S.stations
      .map(
        (st) =>
          `<button class="chip" data-stoff="${esc(st)}" aria-pressed="true">${esc(st)}역${lineDots(st)} ✕</button>`,
      )
      .join("");
    const gcnt = {};
    HOUSES.forEach((h) =>
      h.units.forEach((u) => {
        const c = genderCat(u.gender);
        gcnt[c] = (gcnt[c] || 0) + 1;
      }),
    );
    $("#g-gender").innerHTML = GENDERS.map(
      (g) =>
        `<button class="chip${gcnt[g] ? "" : " zero"}" data-k="gender" data-v="${g}" aria-pressed="${S.gender.includes(g)}">${g}<span class="c">${gcnt[g] || 0}호실</span></button>`,
    ).join("");
    const nOn = ALL_GU.length - S.gus.length + (LINES.length - S.lines.length) + (houseFilterOn() ? 1 : 0);
    fdots();
    const r = refPt();
    $("#refInfo").textContent = S.h.ref
      ? r
        ? `${refLabel()} 기준으로 거리를 계산해요. (지도의 ◆를 눌러도 바꿀 수 있어요)`
        : `'${S.h.ref}'을(를) 찾지 못했어요. 목록에서 골라 주세요.`
      : "친구 학교와 직장이나 역을 고르면 집마다 거리를 보여주고 가까운 순으로 정렬할 수 있어요. 지도의 ◆를 눌러도 돼요.";
  }
  const proj = (lat, lng) => [(lng * MAP.proj.k - MAP.proj.minx) * MAP.proj.s, (MAP.proj.maxy - lat) * MAP.proj.s];
  function renderMap() {
    if (!MAP) return;
    const houseView = S.view === "house";
    const rows = houseView ? houseRows("gus") : noticeRows("gus");
    const cnt = {};
    if (houseView) rows.forEach(({ h, units }) => (cnt[h.gu] = (cnt[h.gu] || 0) + units.length));
    else
      rows.forEach(({ n, units }) =>
        (n.units.length ? [...new Set(units.map((u) => u.gu))] : n.gus).forEach((g) => (cnt[g] = (cnt[g] || 0) + 1)),
      );
    const max = Math.max(1, ...Object.values(cnt));
    const lvl = (v) => (!v ? 0 : Math.min(4, 1 + Math.floor((v / max) * 3.999)));
    const [W, H] = MAP.viewBox.split(" ").slice(2).map(Number);
    const vb = VIEW ? VIEW.slice() : [0, 0, W, H];
    const z = W / vb[2],
      det = z >= 2,
      stName = z >= 2.4;
    const paths = Object.entries(MAP.gu)
      .map(([g, o]) => {
        const cls = ["gu", zoomGu === g ? "sel" : "", !S.gus.includes(g) ? "excl" : ""].join(" ");
        return `<path d="${o.d}" data-gu="${g}" class="${cls}" style="fill:var(--map-${lvl(cnt[g])})" tabindex="0" role="button" aria-label="${g} ${cnt[g] || 0}건"><title>${esc(guLabel(g))}: ${cnt[g] || 0}${houseView ? "호실" : "건"}</title></path>`;
      })
      .join("");
    const pu = vb[2] / (($("#map") && $("#map").clientWidth) || 380);
    const TW = (t, fs) => [...String(t)].reduce((a, ch) => a + (/[\x00-\x7f]/.test(ch) ? 0.6 : 1), 0) * fs;
    const showUni = z >= 1.8,
      gfs = (det ? 11 : 9.5) * pu,
      ufs = 8.5 * pu;
    const soft = [],
      hard = [];
    const labels = Object.entries(MAP.gu)
      .map(([g, o]) => {
        const nm = g.replace(/구$/, ""),
          uni = showUni && UNI[g],
          cy = o.c[1] - (uni ? gfs * 0.45 : -gfs * 0.35);
        soft.push([o.c[0] - TW(nm, gfs) / 2, cy - gfs * 0.9, o.c[0] + TW(nm, gfs) / 2, cy + gfs * 0.2]);
        if (uni)
          soft.push([
            o.c[0] - TW(UNI[g], ufs) / 2,
            cy + gfs * 0.2,
            o.c[0] + TW(UNI[g], ufs) / 2,
            cy + gfs * 0.3 + ufs * 1.1,
          ]);
        return `<text x="${o.c[0]}" y="${cy.toFixed(2)}" style="font-size:${gfs.toFixed(2)}px">${nm}${uni ? `<tspan class="uni" x="${o.c[0]}" dy="${(ufs * 1.15).toFixed(2)}" style="font-size:${ufs.toFixed(2)}px">${esc(UNI[g])}</tspan>` : ""}</text>`;
      })
      .join("");
    const pins = new Map();
    const pinRows = houseView ? houseRows() : noticeRows();
    const items = houseView
      ? pinRows.map(({ h, units }) => ({
          lat: h.lat,
          lng: h.lng,
          geo: h.geo,
          sector: h.n.sector,
          n: units.length,
          id: h.id,
        }))
      : pinRows
          .filter(({ n }) => n.lat != null)
          .map(({ n, units }) => ({
            lat: n.lat,
            lng: n.lng,
            geo: n.geo,
            sector: n.sector,
            n: units.length || 1,
            id: n.key,
          }));
    for (const it of items) {
      if (it.lat == null) continue;
      const k = it.lat.toFixed(4) + "," + it.lng.toFixed(4);
      const p = pins.get(k) || { ...it, n: 0, ids: [] };
      p.n += it.n;
      p.ids.push(it.id);
      if (it.sector === "민간") p.sector = "민간";
      pins.set(k, p);
    }
    const pinSvg = [...pins.values()]
      .sort((a, b) => b.n - a.n)
      .map((p) => {
        const [x, y] = proj(p.lat, p.lng);
        const r = (3 + Math.min(7, Math.sqrt(p.n) * 1.3)) / z;
        const on = selPin && p.ids.includes(selPin.ids[0]) ? " on" : "";
        return `<circle class="pin ${p.sector === "민간" ? "pri" : "pub"}${p.geo === "gu" || p.geo === "dong" ? " approx" : ""}${on}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" data-pin="${esc(p.ids.join("\u0001"))}"><title>${p.n}${houseView ? "호실" : "건"}${GEO_TXT[p.geo] ? ` (${GEO_TXT[p.geo]})` : ""}</title></circle>`;
      })
      .join("");
    const showSt = S.mapStations !== false;
    const selSt = S.stations
      .filter((st) => STATIONS[st])
      .map((st) => {
        const [x, y] = proj(STATIONS[st][0], STATIONS[st][1]);
        const r = (LINE_R() / 111000) * MAP.proj.s;
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" style="fill:var(--accent);fill-opacity:.12;stroke:var(--accent);stroke-width:1.5px;vector-effect:non-scaling-stroke"><title>${esc(st)}역 반경 ${walk(LINE_R())}</title></circle>`;
      })
      .join("");
    const ROUTES = window.__routes || {};
    const routeSvg = showSt
      ? Object.entries(ROUTES)
          .map(([ln, segs]) => {
            const on = !linesOn() || S.lines.includes(ln);
            if (linesOn() && !on) return "";
            return segs
              .map(
                (seg) =>
                  `<polyline class="route" points="${seg
                    .map((nm) =>
                      STATIONS[nm]
                        ? proj(STATIONS[nm][0], STATIONS[nm][1])
                            .map((v) => v.toFixed(1))
                            .join(",")
                        : "",
                    )
                    .filter(Boolean)
                    .join(
                      " ",
                    )}" style="stroke:${LINE_COLOR[ln]};stroke-width:${det ? 3.2 : 2}px;opacity:${linesOn() ? 0.95 : 0.6}"><title>${esc(ln)}</title></polyline>`,
              )
              .join("");
          })
          .join("")
      : "";
    const stVis = [];
    const stSvg = showSt
      ? Object.entries(STATIONS)
          .filter(([name]) => !linesOn() || (STLINES[name] || []).some((l) => S.lines.includes(l)))
          .map(([name, [la, ln]]) => {
            const [x, y] = proj(la, ln);
            if (x < vb[0] - 5 || y < vb[1] - 5 || x > vb[0] + vb[2] + 5 || y > vb[1] + vb[3] + 5) return "";
            const r = (det ? 2.6 : 1.3) / z;
            if (stName) stVis.push([name, x, y, r]);
            return `<rect class="st${S.h.ref === name ? " ref-st" : ""}" x="${(x - r).toFixed(2)}" y="${(y - r).toFixed(2)}" width="${(2 * r).toFixed(2)}" height="${(2 * r).toFixed(2)}" rx="${(r * 0.5).toFixed(2)}"><title>${esc(name)}역</title></rect>`;
          })
          .join("")
      : "";
    const plVis =
      S.mapPlaces !== false
        ? PLACES.filter((p) => !(S.hidePlaces || []).includes(p.short))
            .map((p) => {
              const [x, y] = proj(p.lat, p.lng);
              return { p, x, y };
            })
            .filter(({ x, y }) => x > vb[0] - 2 && y > vb[1] - 2 && x < vb[0] + vb[2] + 2 && y < vb[1] + vb[3] + 2)
        : [];
    const mr = (det ? 6 : 5) * pu,
      pfs = (det ? 12.5 : 11) * pu,
      sfs = 10.5 * pu;
    hard.push([vb[0] + vb[2] - 46 * pu, vb[1], vb[0] + vb[2], vb[1] + 150 * pu]);
    plVis.forEach(({ x, y }) => hard.push([x - mr * 1.3, y - mr * 1.3, x + mr * 1.3, y + mr * 1.3]));
    const ovl = (b, list) =>
      list.reduce(
        (a, o) =>
          a +
          Math.max(0, Math.min(b[2], o[2]) - Math.max(b[0], o[0])) *
            Math.max(0, Math.min(b[3], o[3]) - Math.max(b[1], o[1])),
        0,
      );
    const outv = (b) => (b[0] < vb[0] || b[1] < vb[1] || b[2] > vb[0] + vb[2] || b[3] > vb[1] + vb[3] ? 1 : 0);
    const DIRS = [
      [1, 0],
      [-1, 0],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 1],
      [-1, -1],
      [-1, 1],
    ];
    function placeLabel(x, y, r, w, h, rings) {
      const gap = 2.5 * pu;
      let best = null;
      for (let k = 0; k < rings; k++)
        for (const [dx, dy] of DIRS) {
          const d = r + gap + k * 10 * pu;
          const ax = x + dx * d,
            ay = y + dy * (k ? d : r + gap);
          const x0 = dx > 0 ? ax : dx < 0 ? ax - w : ax - w / 2;
          const y0 = dy > 0 ? ay : dy < 0 ? ay - h : ay - h / 2;
          const b = [x0, y0, x0 + w, y0 + h],
            area = w * h;
          const sc =
            (ovl(b, hard) / area) * 100 + (ovl(b, soft) / area) * 1.2 + outv(b) * 40 + k * 5 + (dx === 0 ? 0.2 : 0);
          if (!best || sc < best.sc) best = { sc, b, k };
          if (sc < 0.5 && k === 0) return best;
        }
      return best;
    }
    const groups = [];
    plVis.forEach((it) => {
      const g = groups.find((g) => g.some((o) => Math.hypot(o.x - it.x, o.y - it.y) < 22 * pu));
      g ? g.push(it) : groups.push([it]);
    });
    for (let a = 0; a < groups.length; a++)
      for (let b2 = groups.length - 1; b2 > a; b2--)
        if (groups[a].some((o) => groups[b2].some((q) => Math.hypot(o.x - q.x, o.y - q.y) < 22 * pu))) {
          groups[a].push(...groups[b2]);
          groups.splice(b2, 1);
        }
    let leaders = "";
    const lh = pfs * 1.3;
    const placeLbl = groups
      .sort((a, b) => b.length - a.length)
      .map((g) => {
        g.sort((a, b) => a.y - b.y || a.x - b.x);
        const cx = g.reduce((a, o) => a + o.x, 0) / g.length,
          cy = g.reduce((a, o) => a + o.y, 0) / g.length;
        const rr = Math.max(...g.map((o) => Math.hypot(o.x - cx, o.y - cy))) + mr;
        const w = Math.max(...g.map((o) => TW(o.p.short, pfs))),
          h = lh * g.length + pfs * 0.05;
        const L = placeLabel(cx, cy, rr, w, h, 4),
          b = L.b;
        hard.push(b);
        if (L.k || g.length > 1) {
          const ex = Math.max(b[0], Math.min(cx, b[2])),
            ey = Math.max(b[1], Math.min(cy, b[3]));
          if (Math.hypot(ex - cx, ey - cy) > rr * 0.9)
            leaders += `<line class="leader" x1="${cx.toFixed(2)}" y1="${cy.toFixed(2)}" x2="${ex.toFixed(2)}" y2="${ey.toFixed(2)}"></line>`;
        }
        const right = b[0] >= cx - 1,
          ax = right ? b[0] : b[2];
        return (
          `<text class="pl-l" text-anchor="${right ? "start" : "end"}" style="font-size:${pfs.toFixed(2)}px;stroke-width:${(3.5 * pu).toFixed(2)}px;text-anchor:${right ? "start" : "end"}">` +
          g
            .map(
              (o, i) =>
                `<tspan class="${o.p.kind === "학교" ? "school" : "work"}" data-place="${esc(o.p.short)}" x="${ax.toFixed(2)}" y="${(b[1] + lh * (i + 1) - pfs * 0.36).toFixed(2)}">${esc(o.p.short)}</tspan>`,
            )
            .join("") +
          `</text>`
        );
      })
      .join("");
    const placeSvg = plVis
      .map(({ p, x, y }) => {
        const on = S.h.ref === p.short,
          sc = p.kind === "학교";
        const shape = sc
          ? `<rect x="${(x - mr * 0.85).toFixed(2)}" y="${(y - mr * 0.85).toFixed(2)}" width="${(mr * 1.7).toFixed(2)}" height="${(mr * 1.7).toFixed(2)}" rx="${(mr * 0.2).toFixed(2)}" transform="rotate(45 ${x.toFixed(2)} ${y.toFixed(2)})"></rect>`
          : `<rect x="${(x - mr * 0.8).toFixed(2)}" y="${(y - mr * 0.8).toFixed(2)}" width="${(mr * 1.6).toFixed(2)}" height="${(mr * 1.6).toFixed(2)}" rx="${(mr * 0.2).toFixed(2)}"></rect>`;
        return `<g class="place ${sc ? "school" : "work"}${on ? " on" : ""}" data-place="${esc(p.short)}">${shape}<title>${esc(p.kind)}: ${esc(p.name)} (누르면 기준 위치로)</title></g>`;
      })
      .join("");
    const stPri = (n) => (S.h.ref === n || S.stations.includes(n) ? 0 : 1);
    const stLbl = stVis
      .sort((a, b) => stPri(a[0]) - stPri(b[0]))
      .map(([name, x, y, r]) => {
        const w = TW(name, sfs),
          h = sfs * 1.32;
        for (const right of [true, false]) {
          const x0 = right ? x + r + 2 * pu : x - r - 2 * pu - w,
            bx = [x0, y - h / 2, x0 + w, y + h / 2];
          if (ovl(bx, hard) === 0) {
            hard.push(bx);
            return `<text class="stl" x="${x0.toFixed(2)}" y="${(y + sfs * 0.35).toFixed(2)}" style="font-size:${sfs.toFixed(2)}px;stroke-width:${(3 * pu).toFixed(2)}px">${esc(name)}</text>`;
          }
        }
        return "";
      })
      .join("");
    const rp = refPt();
    const ref = rp
      ? (() => {
          const [x, y] = proj(rp[0], rp[1]);
          const s = 6 / z;
          return `<path class="ref" d="M${x},${y - s * 1.6} L${x + s * 0.5},${y - s * 0.5} L${x + s * 1.5},${y - s * 0.5} L${x + s * 0.7},${y + s * 0.2} L${x + s},${y + s * 1.3} L${x},${y + s * 0.6} L${x - s},${y + s * 1.3} L${x - s * 0.7},${y + s * 0.2} L${x - s * 1.5},${y - s * 0.5} L${x - s * 0.5},${y - s * 0.5}Z"><title>기준 위치 ${esc(refLabel())}</title></path>`;
        })()
      : "";
    $("#map").innerHTML = `<svg viewBox="${vb.map((v) => v.toFixed(1)).join(" ")}" role="group" aria-label="서울 지도">
    <defs><pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect class="hatch-bg" width="6" height="6"></rect><line class="hatch-line" x1="0" y1="0" x2="0" y2="6"></line></pattern></defs>
    ${paths}${labels}${selSt}${routeSvg}${stSvg}${pinSvg}${placeSvg}${leaders}${stLbl}${placeLbl}${ref}</svg>`;
    $("#zoomOut").hidden = !zoomGu && !VIEW;
    mapCtl(z);
    $("#placeBox").hidden = !PLACES.length || S.mapPlaces === false;
    $("#g-place").innerHTML = ["학교", "직장", "집"]
      .map((kind) => PLACES.filter((p) => (p.kind || "기타") === kind))
      .filter((g) => g.length)
      .map(
        (g) =>
          `<div class="chips"><span class="ext" style="align-self:center;min-width:40px;white-space:nowrap"><i class="kmark ${g[0].kind === "학교" ? "school" : "work"}"></i>${esc(g[0].kind)}</span>` +
          g
            .map(
              (p) =>
                `<button class="chip" data-placet="${esc(p.short)}" aria-pressed="${!(S.hidePlaces || []).includes(p.short)}" title="${esc(p.name)}">${esc(p.short)}</button>`,
            )
            .join("") +
          `</div>`,
      )
      .join("");
    $("#mapHint").textContent = zoomGu
      ? `${zoomGu}만 보는 중`
      : VIEW
        ? "끌어서 옮길 수 있어요"
        : "구를 누르면 그 구만 봐요";
    const approx = items.filter((i) => i.geo === "gu" || i.geo === "dong").length;
    $("#legend").innerHTML =
      `<span><i style="background:var(--public)"></i>공공</span><span><i style="background:var(--private)"></i>민간</span>
    <span>점 크기 = 호실 수</span>${approx ? `<span>흐린 점 = 대략 위치</span>` : ""}${S.gus.length < ALL_GU.length ? `<span><i style="background:var(--bad-soft);border:1px solid var(--bad);border-radius:2px"></i>조회 제외 선택 지역</span>` : ""}
    ${rp ? `<span><i style="background:var(--star)"></i>기준 위치</span>` : ""}
    <label style="display:inline-flex;gap:4px;align-items:center;cursor:pointer"><input type="checkbox" id="mapSt" ${S.mapStations !== false ? "checked" : ""} style="accent-color:var(--accent)">지하철 노선과 역${stName ? "" : " (확대하면 역 이름)"}</label>
    ${PLACES.length ? `<label style="display:inline-flex;gap:4px;align-items:center;cursor:pointer"><input type="checkbox" id="mapPl" ${S.mapPlaces !== false ? "checked" : ""} style="accent-color:var(--accent)">친구의 <i class="kmark school" style="margin-left:2px"></i>학교와 <i class="kmark work"></i>직장</label>` : ""}`;
    $("#gusel").innerHTML = zoomGu
      ? `<button class="chip" id="zoomOut2" aria-pressed="true">${esc(guLabel(zoomGu))}만 보는 중 ✕</button>`
      : "";
  }
  const MAP_MAXZ = 16;
  function mapWH() {
    return MAP.viewBox.split(" ").slice(2).map(Number);
  }
  function guView(g) {
    const [W, H] = mapWH(),
      [x0, y0, x1, y1] = MAP.gu[g].bb,
      pad = 14,
      w = x1 - x0 + pad * 2,
      h = y1 - y0 + pad * 2,
      sz = Math.max(w, (h * W) / H);
    return [x0 - pad - (sz - w) / 2, y0 - pad - ((sz * H) / W - h) / 2, sz, (sz * H) / W];
  }
  function clampView(v) {
    const [W, H] = mapWH();
    let w = Math.min(W, Math.max(W / MAP_MAXZ, v[2]));
    const h = (w * H) / W;
    if (w >= W - 0.01) return null;
    const cx = v[0] + v[2] / 2,
      cy = v[1] + v[3] / 2;
    let x = cx - w / 2,
      y = cy - h / 2;
    x = Math.min(W - w * 0.3, Math.max(-w * 0.7, x));
    y = Math.min(H - h * 0.3, Math.max(-h * 0.7, y));
    return [x, y, w, h];
  }
  let mapTimer = 0;
  function setView(v, now) {
    VIEW = v ? clampView(v) : null;
    const svg = $("#map svg"),
      [W, H] = mapWH();
    if (svg) svg.setAttribute("viewBox", (VIEW || [0, 0, W, H]).map((n) => n.toFixed(1)).join(" "));
    mapCtl(W / (VIEW ? VIEW[2] : W));
    clearTimeout(mapTimer);
    if (now) renderMap();
    else mapTimer = setTimeout(renderMap, 140);
  }
  function zoomAt(fx, fy, f) {
    const [W, H] = mapWH(),
      v = VIEW || [0, 0, W, H];
    const w = Math.min(W, Math.max(W / MAP_MAXZ, v[2] / f)),
      k = w / v[2];
    setView([fx - (fx - v[0]) * k, fy - (fy - v[1]) * k, w, (w * H) / W]);
  }
  function zoomCenter(f) {
    const [W, H] = mapWH(),
      v = VIEW || [0, 0, W, H];
    zoomAt(v[0] + v[2] / 2, v[1] + v[3] / 2, f);
  }
  function mapCtl(z) {
    if (!$("#zLvl")) return;
    $("#zLvl").textContent = z < 1.05 ? "1×" : (z < 10 ? z.toFixed(1) : Math.round(z)) + "×";
    $("#zIn").disabled = z >= MAP_MAXZ - 0.01;
    $("#zOutBtn").disabled = z <= 1.01;
    $("#zFit").disabled = z <= 1.01;
    $("#mapwrap").classList.toggle("zoomed", z > 1.01);
  }
  function svgPt(cx, cy) {
    const svg = $("#map svg");
    if (!svg) return null;
    const r = svg.getBoundingClientRect(),
      [W, H] = mapWH(),
      v = VIEW || [0, 0, W, H];
    return [v[0] + ((cx - r.left) / r.width) * v[2], v[1] + ((cy - r.top) / r.height) * v[3]];
  }
  let mapDragMoved = false;
  (function bindMapGestures() {
    const el = document.getElementById("map");
    if (!el) return;
    el.addEventListener(
      "wheel",
      (e) => {
        const p = svgPt(e.clientX, e.clientY);
        if (!p) return;
        e.preventDefault();
        const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
        zoomAt(p[0], p[1], Math.exp(-Math.max(-120, Math.min(120, dy)) * 0.0045));
      },
      { passive: false },
    );
    el.addEventListener("dblclick", (e) => {
      const p = svgPt(e.clientX, e.clientY);
      if (p) {
        e.preventDefault();
        zoomAt(p[0], p[1], 2);
      }
    });
    const pts = new Map();
    let start = null;
    const snap = () => {
      const a = [...pts.values()];
      const [W, H] = mapWH();
      start = {
        v: (VIEW || [0, 0, W, H]).slice(),
        a: a.map((q) => q.slice()),
        r: el.querySelector("svg").getBoundingClientRect(),
      };
    };
    el.addEventListener("pointerdown", (e) => {
      if (e.button && e.button !== 0) return;
      pts.set(e.pointerId, [e.clientX, e.clientY]);
      mapDragMoved = false;
      snap();
    });
    el.addEventListener("pointermove", (e) => {
      if (!pts.has(e.pointerId) || !start) return;
      pts.set(e.pointerId, [e.clientX, e.clientY]);
      const a = [...pts.values()],
        { v, r } = start,
        [W, H] = mapWH(),
        u = v[2] / r.width;
      if (a.length >= 2 && start.a.length >= 2) {
        const d0 = Math.hypot(start.a[0][0] - start.a[1][0], start.a[0][1] - start.a[1][1]) || 1;
        const d1 = Math.hypot(a[0][0] - a[1][0], a[0][1] - a[1][1]) || 1;
        const m0 = [(start.a[0][0] + start.a[1][0]) / 2, (start.a[0][1] + start.a[1][1]) / 2],
          m1 = [(a[0][0] + a[1][0]) / 2, (a[0][1] + a[1][1]) / 2];
        const w = Math.min(W, Math.max(W / MAP_MAXZ, (v[2] * d0) / d1)),
          k = w / v[2];
        const fx = v[0] + (m0[0] - r.left) * u,
          fy = v[1] + (m0[1] - r.top) * u;
        const nx = fx - (fx - v[0]) * k - (m1[0] - m0[0]) * u * k,
          ny = fy - (fy - v[1]) * k - (m1[1] - m0[1]) * u * k;
        mapDragMoved = true;
        e.preventDefault();
        setView([nx, ny, w, (w * H) / W]);
        return;
      }
      if (!VIEW) return;
      const dx = e.clientX - start.a[0][0],
        dy = e.clientY - start.a[0][1];
      if (!mapDragMoved && Math.hypot(dx, dy) < 5) return;
      if (!mapDragMoved) {
        mapDragMoved = true;
        try {
          el.setPointerCapture(e.pointerId);
        } catch (_) {}
      }
      $("#mapwrap").classList.add("drag");
      setView([v[0] - dx * u, v[1] - dy * u, v[2], v[3]]);
    });
    const end = (e) => {
      pts.delete(e.pointerId);
      $("#mapwrap").classList.remove("drag");
      if (pts.size) snap();
      else start = null;
    };
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
    el.addEventListener(
      "click",
      (e) => {
        if (mapDragMoved) {
          e.stopPropagation();
          e.preventDefault();
          mapDragMoved = false;
        }
      },
      true,
    );
  })();
  function statusPill(n) {
    const st = n._status,
      dd = ddayText(n, st);
    const c = { "접수중": "st-open", "접수예정": "st-soon", "마감": "", "일정 확인": "st-unk" }[st];
    const todays = Object.entries(n.facts)
      .filter(([k, v]) => /발표|당첨|계약/.test(k) && kdate(v, n.posted || today) === today)
      .map(([k]) => (k.includes("계약") ? "오늘 계약" : "오늘 발표"));
    return `<span class="pill ${c}">${st}${dd ? ` <span class="dday">${dd}</span>` : ""}</span>${[...new Set(todays)].map((t) => `<span class="pill flag">${t}</span>`).join("")}`;
  }
  function gcalLink(n) {
    if (!n.start && !n.end) return "";
    const s = (n.start || n.end).replace(/-/g, ""),
      e = dstr(dnum(n.end || n.start) + 1).replace(/-/g, "");
    const u = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("[접수] " + n.title)}&dates=${s}/${e}&details=${encodeURIComponent(n.url)}`;
    return `<a href="${esc(u)}" target="_blank" rel="noopener">구글 캘린더에 접수 일정 추가 ↗</a>`;
  }
  function mapLinks(o) {
    const q = encodeURIComponent((o.addr || o.address || "").replace(/\s*\(.*$/, "") || o.title || "");
    const l = [
      `<a href="https://map.naver.com/p/search/${q}" target="_blank" rel="noopener">네이버 지도 ↗</a>`,
      `<a href="https://map.kakao.com/link/search/${q}" target="_blank" rel="noopener">카카오맵 ↗</a>`,
    ];
    if (o.lat != null && (o.geo === "exact" || o.geo === "road"))
      l.push(
        `<a href="https://map.kakao.com/link/roadview/${o.lat},${o.lng}" target="_blank" rel="noopener">로드뷰 ↗</a>`,
      );
    return l.join("");
  }
  function noticeFlags(n) {
    const f = [];
    if (n.corrected) f.push(`<span class="pill info" title="원공고와 정정공고를 합쳐서 보여줘요">정정공고 반영</span>`);
    if (n.women_only) f.push(`<span class="pill flag">여성전용</span>`);
    if (n.scope_out) f.push(`<span class="pill soft">${esc(n.scope_out)}</span>`);
    if (n.dorm) f.push(`<span class="pill soft">기숙사형</span>`);
    if (n.stale) f.push(`<span class="pill soft">이전 수집본</span>`);
    return f.join("");
  }
  const starBtn = (key) =>
    `<button class="star" data-star="${esc(key)}" aria-pressed="${STARS.has(key)}" aria-label="찜하기" title="찜하기">★</button>`;
  function priceTiers(u) {
    if (!u.prices || u.prices.length < 2) return "";
    return u.prices.map((p) => `${esc(p.label)}: ${won(p.deposit)}${p.rent ? " / " + won(p.rent) : ""}`).join("<br>");
  }
  function unitTable(units, keep) {
    const list = [...units].sort((a, b) => keep.has(b) - keep.has(a));
    const rowArr = list.map((u) => {
      const [b] = badgeOf(u.m2, u.rooms);
      const flags = [
        !S.gus.includes(u.gu) ? "조회 제외 선택 지역" : "",
        u.gu === "강동구" ? "강동구" : "",
        u.gender === "여성전용" ? "여성전용" : "",
      ]
        .filter(Boolean)
        .join(", ");
      return `<tr class="${keep.has(u) ? "" : "dim"}"><td>${badgeHtml(b)}</td><td>${esc(u.gu)} ${esc(u.dong)}</td><td>${esc([u.bldg, u.ho].filter(Boolean).join("-") || "-")} ${esc(u.type)}</td>
      <td class="r">${u.m2 != null ? u.m2.toFixed(2) : "-"}<br><span class="ext">${u.m2 != null ? pyeong(u.m2) + "평" : ""}</span></td><td class="r">${u.rooms ?? "미표기"}</td><td>${esc(u.floor)}</td><td>${esc(u.ev || "-")}</td><td>${esc(u.gender)}</td>
      <td class="r">${won(u.deposit)}</td><td class="r">${u.rent ? won(u.rent) : u.lease === "전세" ? "전세" : "-"}</td><td class="tiers">${priceTiers(u)}</td><td>${esc(flags)}</td></tr>`;
    });
    const LIMIT = 30,
      thead = `<thead><tr><th></th><th>위치</th><th>동호수/타입</th><th>전용㎡</th><th>방</th><th>층</th><th>승강기</th><th>성별</th><th>보증금</th><th>월임대료</th><th>조건별 임대료</th><th>비고</th></tr></thead>`;
    const rest = rowArr.slice(LIMIT);
    return `<div class="units"><table>${thead}<tbody>${rowArr.slice(0, LIMIT).join("")}</tbody></table></div>
    ${rest.length ? `<details class="more"><summary>나머지 호실 ${rest.length}개 더 보기</summary><div class="units"><table>${thead}<tbody>${rest.join("")}</tbody></table></div></details>` : ""}
    ${keep.size !== units.length ? `<p class="note">흐린 줄은 지금 조건에 맞지 않는 호실이에요.</p>` : ""}`;
  }
  function attList(n) {
    if (!n.attachments.length) return "";
    return `<div class="atts">${n.attachments
      .map((a) => {
        const ok = /호실 \d+개/.test(a.parsed || "");
        const tag = a.parsed ? `<em>${esc(a.parsed)}</em>` : "";
        return a.url
          ? `<a href="${esc(a.url)}" target="_blank" rel="noopener" class="${ok ? "ok" : ""}">${esc(a.name)}${tag}</a>`
          : `<span>${esc(a.name)}${tag}</span>`;
      })
      .join("")}</div>`;
  }
  const FACT_GROUPS = [
    [
      "모집",
      [
        ["모집 규모", /^(공급호수|공고호수|모집 규모|모집호수)$/],
        ["서울 공급", /^서울 공급$/],
        ["모집 공고일", /^모집공고(일)?$/],
      ],
    ],
    [
      "자격",
      [
        ["신청 자격", /^(신청자격|입주자격)$/],
        ["나이", /^나이$/],
        ["무주택", /^무주택$/],
        ["소득", /^소득 기준$/],
        ["1인 가구 소득", /^1인 가구 월소득 기준$/],
        ["총자산", /^총자산 기준$/],
        ["자동차", /^자동차 기준$/],
      ],
    ],
    [
      "일정",
      [
        ["청약 신청", /^(청약신청|접수기간|신청기간|청약접수|공고일정|일정: 청약 신청)$/],
        ["서류심사 발표", /^(서류심사\s*대상자\s*발표|일정: 서류심사 대상자 발표)$/],
        ["서류 제출", /^(?!.*계약)(.*서류.*(제출|세출)|일정: 서류 제출)/],
        ["당첨자와 예비자 발표", /^(당첨자\s*발표(일)?|일정: 당첨자, 예비자 발표)$/],
        ["계약", /(계약체결|계약기간|전자계약|방문계약|일정: 계약)/],
        ["입주", /^(입주예정월|일정: 입주)$/],
      ],
    ],
    [
      "임대 조건",
      [
        ["임대기간", /^임대기간$/],
        ["임대료 수준", /^임대료 수준$/],
        ["보증금 보증보험", /^보증금 보증보험$/],
        ["반려동물", /^반려동물$/],
        ["관리비", /^관리비$/],
      ],
    ],
    [
      "단지와 문의",
      [
        ["단지", /^단지명$/],
        ["위치", /^(주택위치|소재지|위치|주소|단지위치)$/],
        ["사업자", /^사업주체$/],
        ["시공사", /^시공사$/],
        ["신청 페이지", /(청약신청\s*(페이지|홈페이지)|인터넷청약홈페이지)/],
        ["문의", /^(문의전화|문의 전화|ARS)$/],
        ["운영시간", /^운영시간$/],
      ],
    ],
  ];
  const FACT_SKIP = /^(민간임대 입주 안내문|소액임차인 기준|최우선변제금액)/;
  function mergedFacts(n) {
    const src = [
      ...Object.entries(n.facts || {}).map(([k, v]) => [k, v, "본문"]),
      ...Object.entries(n.pdf_facts || {}).map(([k, v]) => [k, v, "PDF"]),
    ];
    const used = new Set(),
      groups = [];
    for (const [g, items] of FACT_GROUPS) {
      const rows = [];
      for (const [label, rx] of items) {
        const hits = src.filter(([k], i) => !used.has(i) && rx.test(k));
        if (!hits.length) continue;
        hits.forEach((h) => used.add(src.indexOf(h)));
        const body = hits.filter((h) => h[2] === "본문"),
          pick = body.length ? body : hits.slice(0, 1);
        const val =
          pick.length > 1
            ? pick.map(([k, v]) => `${k.replace(/\s*\(이메일\)|\s*\(우편등기\)/g, "")}: ${v}`).join(" / ")
            : pick[0][1];
        rows.push([label, val, pick.every((h) => h[2] === "PDF")]);
      }
      if (rows.length) groups.push([g, rows]);
    }
    const rest = src.filter(([k], i) => !used.has(i) && !FACT_SKIP.test(k));
    if (rest.length) groups.push(["기타", rest.map(([k, v, from]) => [k, v, from === "PDF"])]);
    if (!groups.length)
      return `<p class="note">본문 요약이 없는 공고예요. 공식 공고와 첨부파일에서 자격과 일정을 확인하세요.</p>`;
    const link = (v) =>
      /^https?:\/\//.test(v) ? `<a href="${esc(v)}" target="_blank" rel="noopener">${esc(v)}</a>` : esc(v);
    const anyPdf = groups.some(([, rows]) => rows.some((r) => r[2]));
    return `<div class="subhead">공고 정보</div>${groups.map(([g, rows]) => `<div class="fgroup"><span class="fg">${g}</span><dl class="facts">${rows.map(([k, v, pdf]) => `<dt>${esc(k)}</dt><dd>${link(v)}${pdf ? ' <span class="pdfmark" title="공고문 PDF에서 자동으로 뽑은 값">PDF</span>' : ""}</dd>`).join("")}</dl></div>`).join("")}
    ${anyPdf ? `<p class="note">공고 본문과 첨부 공고문(PDF)을 합쳤어요. PDF 표시는 공고문에서 자동으로 뽑은 값이라 공고문으로 한 번 더 확인하세요.</p>` : ""}`;
  }
  function valueList(vals, max = 6) {
    const u = [...new Set(vals.map((v) => Math.round(v / 1e4) * 1e4))].sort((a, b) => a - b);
    const shown = u.slice(0, max).map(won).join(", ");
    return u.length > max ? `${shown} 외 ${u.length - max}개` : shown;
  }
  function priceSummary(units) {
    const r = (v) => (v == null ? null : Math.round(v / 1e4) * 1e4);
    const pairs = [
      ...new Map(
        units
          .filter((u) => u.deposit != null)
          .map((u) => [r(u.deposit) + "/" + (r(u.rent) || 0), [r(u.deposit), r(u.rent) || 0]]),
      ).values(),
    ].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    if (!pairs.length) return "";
    const max = 6,
      allJeonse = pairs.every((p) => !p[1]),
      shown = pairs.slice(0, max);
    const more = pairs.length > max ? `<td class="ext" rowspan="2">외 ${pairs.length - max}가지</td>` : "";
    return `<div class="ptable"><table><tbody>
    <tr><th>${allJeonse ? "전세 보증금" : "보증금"}</th>${shown.map(([d]) => `<td>${won(d)}</td>`).join("")}${more}</tr>
    ${allJeonse ? "" : `<tr><th>월세</th>${shown.map(([, m]) => `<td>${m ? won(m) : "-"}</td>`).join("")}</tr>`}
  </tbody></table></div>`;
  }
  function areaLine(units) {
    const ms = units.map((u) => u.m2).filter((v) => v != null),
      rs = units.map((u) => u.rooms).filter((v) => v != null);
    const best = units.map((u) => badgeOf(u.m2, u.rooms)).sort((a, b) => a[1] - b[1])[0];
    if (!ms.length && !rs.length) return "";
    const mn = Math.min(...ms),
      mx = Math.max(...ms);
    return `<div class="area">${best && best[0] ? badgeHtml(best[0]) : ""}<span>전용 <span class="num">${ms.length ? (mn === mx ? mn.toFixed(2) : mn.toFixed(2) + "~" + mx.toFixed(2)) + "㎡" : "미공개"}</span>${ms.length ? ` <span class="ext">(${pyeong(mn)}${mx > mn ? "~" + pyeong(mx) : ""}평)</span>` : ""}${rs.length ? ` <span class="sep">|</span> 방 ${Math.min(...rs)}${Math.max(...rs) > Math.min(...rs) ? "~" + Math.max(...rs) : ""}개` : "방 수 표기 없음"}</span>
    ${units.some((u) => u.est) ? `<small>공고문 PDF 표에서 뽑은 값이에요. 확인이 필요해요.</small>` : ""}</div>`;
  }
  const lineDots = (st) =>
    (STLINES[st] || [])
      .map(
        (l) =>
          `<span class="ln" style="background:${LINE_COLOR[l] || "#888"}" title="${esc(l)}">${esc(l.replace("호선", "").replace(/선$/, "").slice(0, 4))}</span>`,
      )
      .join("");
  function keyFacts(n, units, mode) {
    const pf = n.pdf_facts || {},
      out = [];
    const max = (pf["임대기간"] || "").match(/최장\s*(\d+)\s*년/);
    if (max) out.push(`최장 ${max[1]}년 거주`);
    if (pf["임대료 수준"]) out.push(pf["임대료 수준"]);
    if (pf["나이"]) out.push(pf["나이"]);
    if (pf["소득 기준"])
      out.push(pf["소득 기준"].replace("도시근로자 월평균소득 ", "소득 ").replace(" (순위와 유형별)", ""));
    if (pf["보증금 보증보험"] && /완료/.test(pf["보증금 보증보험"])) out.push("보증보험 가입");
    if (pf["반려동물"] && /가능/.test(pf["반려동물"])) out.push("반려동물 가능");
    const sups = SUPPORT.filter((sp) => (units && units.length ? units : [null]).some((u) => sp.match(n, u)));
    if (mode === "money") {
      return sups.length
        ? `<div class="suprow">지원 가능성 <span>${sups.map((sp) => `<button class="link sup-link" data-supview="${sp.id}" title="${esc(sp.name)}: ${esc(sp.what)}">${esc(sp.short)}</button>`).join('<span class="sep">|</span>')}</span></div>`
        : "";
    }
    return out.length ? `<div class="keyfacts">${out.map((t) => `<span>${esc(t)}</span>`).join("")}</div>` : "";
  }
  function privateGuide(n) {
    const pf = n.pdf_facts || {};
    if (n.sector !== "민간" || !(pf["민간임대 입주 안내문"] || n.source === "청년안심")) return "";
    const small = pf["소액임차인 기준(서울)"],
      prior = pf["최우선변제금액(서울)"];
    const deps = n.units.map((u) => u.deposit).filter((v) => v != null);
    const priorNum = prior
      ? (() => {
          const m = prior.replace(/,/g, "").match(/(?:(\d+)억)?(\d+)?만/);
          return m ? +(m[1] || 0) * 1e8 + +(m[2] || 0) * 1e4 : null;
        })()
      : null;
    const covered = priorNum && deps.length ? deps.filter((d) => d <= priorNum).length : null;
    return `<details class="more guide"><summary>민간임대 계약 가이드 펼쳐 보기 <span class="ext">(공고문의 '입주(예정)자 안내문'을 정리)</span></summary>
    <p class="note">청년안심주택 민간임대는 공공이 아니라 사업자(시행사나 임대사업자)가 계약하고 관리해요. 그래서 아래를 직접 챙겨야 보증금을 지킬 수 있어요.</p>
    <ol class="check">
      <li><b>계약 전: 보증보험</b>: 사업자는 모집 전까지 임대보증금 보증보험에 가입해야 해요. 다만 가압류 같은 처분제한 등기가 생긴 뒤에 계약하면 보증보험이 보장하지 않으니, 계약 직전에 등기부를 다시 보세요.</li>
      <li><b>계약일과 잔금일: 등기부</b>: 잔금일 다음 날까지 근저당이나 가압류처럼 세입자에게 불리한 권리 변동이 없어야 해요. 전입신고와 확정일자 전에 등기부를 꼭 열람하세요.</li>
      <li><b>최우선변제</b>: ${small ? `서울은 보증금 ${esc(small)}이면 소액임차인이고, ` : "소액임차인 기준 금액 이하라면 "}${prior ? `${esc(prior)}까지는 다른 채권보다 먼저 돌려받을 수 있어요` : "최우선변제금만큼은 먼저 돌려받을 수 있어요"} (대항력을 갖췄을 때).${covered != null ? ` 이 공고 호실 ${deps.length}개 중 ${covered}개는 보증금이 이 금액 이하예요.` : ""}</li>
      <li><b>입주 당일: 대항력과 우선변제권</b>: 전입신고(다음 날부터 효력)와 확정일자를 바로 하세요. 이게 없으면 보증보험에 가입돼 있어도 보장되지 않아요.</li>
      <li><b>입주 당일: 원상복구 대비</b>: 집을 받자마자 방, 욕실, 주방 상태를 사진으로 남겨 두세요. 퇴거 때 고의나 과실로 생긴 파손은 세입자가 복구 비용을 내요.</li>
      <li><b>사는 동안: 보증보험 갱신</b>: 사업자가 보증보험을 갱신하지 못하면 보증회사에서 우편이 와요. 그때는 HUG 전세보증금반환보증이나 SGI 전세금보장신용보험에 직접 가입하세요.</li>
    </ol>
    <p class="note">도움받을 곳: 안심주택 종합지원센터 <b>02-793-0780</b> (계약, 갱신, 퇴거 안내), 서울시 전월세지원센터 <b>02-2133-1200</b> (법률 상담)</p></details>`;
  }
  function safetyCheck(n) {
    const pub = n.sector === "공공";
    const ins = (n.pdf_facts || {})["보증금 보증보험"];
    return `<div class="subhead">계약 전 안전 체크</div>
    ${
      pub
        ? `<p class="note">${esc(SOURCES[n.source] || n.source)}가 집주인(또는 직접 관리)인 공공임대라 전세사기 위험이 낮고, 공사와 직접 계약해서 중개수수료도 없어요.</p>`
        : `<ul class="check"><li>임대보증금 보증보험: ${esc(ins || "공고문에서 확인 못 함 → 계약 전에 보증서 확인")}</li>
        <li>등기부등본에서 근저당과 가압류, 소유자를 확인 (인터넷등기소, 열람 수수료 있음)</li>
        <li>건축물대장에서 위반건축물 여부와 용도(주거용인지) 확인</li>
        <li>임대사업자 등록 주택인지 렌트홈에서 확인하고, 입주하면 바로 전입신고와 확정일자</li></ul>`
    }
    ${privateGuide(n)}
    <p class="note">혼자 보러 가기 걱정되면 서울시 <b>집보기 동행</b>(무료)과 이사 당일 <b>이사동행</b>을 신청할 수 있어요. <button class="link" data-view="guide">자세히</button></p>
    <div class="links"><a href="https://1in.seoul.go.kr" target="_blank" rel="noopener">집보기 동행 신청 ↗</a><a href="https://www.iros.go.kr" target="_blank" rel="noopener">인터넷등기소 ↗</a><a href="https://www.gov.kr/mw/AA020InfoCappView.do?CappBizCD=15000000098" target="_blank" rel="noopener">건축물대장(정부24) ↗</a><a href="https://www.renthome.go.kr" target="_blank" rel="noopener">렌트홈 ↗</a><a href="https://www.khug.or.kr/jeonse/" target="_blank" rel="noopener">HUG 안심전세 ↗</a></div>`;
  }
  function stationLine(o) {
    const parts = [];
    if (o.station && o.geo === "station")
      parts.push(
        `<b>${esc(o.station)}역</b>${lineDots(o.station)} 인근 <span class="ext">(단지명 기준이라 정확한 거리는 공고문에서 확인)</span>`,
      );
    else if (o.station && o.geo !== "gu")
      parts.push(
        `<b>${esc(o.station)}역</b>${lineDots(o.station)} ${walk(o.station_m)} <span class="ext">(${walkMin(o.station_m)}${o.geo !== "exact" ? ", 근사" : ""})</span>`,
      );
    const rp = refPt();
    if (rp && o.lat != null && o.geo !== "gu") {
      const d = hav(o.lat, o.lng, rp[0], rp[1]);
      parts.push(`${esc(refLabel())}까지 <b>${walk(d)}</b>`);
    }
    return parts.join(", ");
  }
  function noticeCard({ n, units }) {
    const loc = n.units.length
      ? [...new Set(units.map((u) => u.gu))]
      : n.dongs.length
        ? n.dongs.map(([g, d]) => `${g} ${d}`)
        : n.gus;
    const locTxt = !loc.length
      ? "서울 (구 미기재)"
      : loc.slice(0, 4).join(", ") + (loc.length > 4 ? ` 외 ${loc.length - 4}곳` : "");
    const keep = new Set(units);
    return `<article class="card ${n.stale ? "stale" : ""}">
    <div class="row1"><span class="pill ${n.sector === "공공" ? "pub" : "pri"}" title="${esc(n.sector_note)}">${n.sector}임대</span>
      <span class="pill">${esc(SOURCES[n.source] || n.source)}</span><span class="pill">${esc(n.htype)}</span>${statusPill(n)}${noticeFlags(n)}${mePill(n)}${starBtn(n.key)}</div>
    <h3><a href="${esc(n.url)}" target="_blank" rel="noopener">${esc(n.title)}</a></h3>
    ${stationLine(n) && !n.units.length ? `<div class="meta st-line"><span>${stationLine(n)}</span></div>` : ""}
    <div class="meta"><span><b>${esc(locTxt)}</b></span>
      ${n.start || n.end ? `<span>접수 <time>${fmtD(n.start) || "?"}</time> ~ <time>${fmtD(n.end) || "?"}</time></span>` : ""}
      ${n.posted ? `<span>공고 <time>${esc(n.posted)}</time></span>` : ""}<span>대상 <b>${esc(n.targets.join(", "))}</b></span>
      ${n.units.length ? `<span>호실 <b>${units.length}${units.length !== n.units.length ? ` / ${n.units.length}` : ""}</b>개</span>` : n.facts["공급호수"] || n.facts["서울 공급"] ? `<span>공급 <b>${esc((n.facts["서울 공급"] ? "서울 " + n.facts["서울 공급"] : n.facts["공급호수"]).slice(0, 50))}</b></span>` : ""}
</div>
    ${units.length ? priceSummary(units) + areaLine(units) : ""}
    ${keyFacts(n, units, "info")}
    <details class="more"><summary>자세히 보기 (첨부${n.units.length ? "와 호실표" : ""})</summary>
      <p class="note">${esc(n.sector_note)}${n.operator ? ` 운영: ${esc(n.operator)}.` : ""}${n.category ? ` 분류: ${esc(n.category)}.` : ""}</p>
      ${mergedFacts(n)}${eligLine(n)}${n.units.length ? unitTable(n.units, keep) : ""}${attList(n)}${safetyCheck(n)}
      ${n.versions && n.versions.length ? `<p class="note">함께 올라온 공고: ${n.versions.map((v) => `<a href="${esc(v.url)}" target="_blank" rel="noopener">${esc(v.title)}</a>`).join(", ")}</p>` : ""}
      ${n.note ? `<p class="note">${esc(n.note)}</p>` : ""}
      <div class="links"><a href="${esc(n.url)}" target="_blank" rel="noopener">공식 공고 페이지 열기 ↗</a>${gcalLink(n)}${n.address ? mapLinks(n) : ""}</div>
    </details>${keyFacts(n, units, "money")}</article>`;
  }
  function houseCard({ h, units }) {
    const n = h.n,
      keep = new Set(units);
    const gender = [...new Set(units.map((u) => u.gender))].filter((g) => g && g !== "성별 제한 미확인");
    return `<article class="card ${n.stale ? "stale" : ""}">
    <div class="row1"><span class="pill ${n.sector === "공공" ? "pub" : "pri"}">${n.sector}임대</span><span class="pill">${esc(n.htype)}</span>${statusPill(n)}
      ${gender.includes("여성전용") ? `<span class="pill flag">여성전용 포함</span>` : ""}${h.gu === "강동구" ? `<span class="pill soft">강동구</span>` : ""}${mePill(n)}${starBtn(h.id)}</div>
    <h3>${esc(h.title)}<small>${esc(h.gu)} ${esc(h.dong)}<span class="sep">|</span>호실 ${units.length}${units.length !== h.units.length ? `/${h.units.length}` : ""}개${n.end ? `<span class="sep">|</span>마감 ${fmtD(n.end)}` : ""}</small></h3>
    ${stationLine(h) ? `<div class="meta st-line"><span>${stationLine(h)}</span></div>` : ""}
    ${priceSummary(units)}${areaLine(units)}${keyFacts(n, units, "info")}
    <details class="more"><summary>호실 ${h.units.length}개, 조건별 임대료, 위치 자세히 보기</summary>
      <p class="note">${esc(h.addr)}${h.geo ? ` (지도 위치: ${GEO_TXT[h.geo] || h.geo})` : ""}</p>
      <div class="links">${mapLinks(h)}${gcalLink(n)}</div>
      ${unitTable(h.units, keep)}
      <p class="note">${esc(h.units[0].src || "")}</p>
      ${mergedFacts(n)}${eligLine(n)}${safetyCheck(n)}
    </details>${keyFacts(n, units, "money")}
    <div class="meta notice-link"><span>공고, <a href="${esc(n.url)}" target="_blank" rel="noopener">${esc(n.title)}</a></span></div></article>`;
  }
  function calendar(rows) {
    const ev = [];
    const add = (d, t, cls, n) => {
      if (d && dnum(d) != null) ev.push({ d, t, cls, n });
    };
    for (const { n } of rows) {
      if (n.start && n.start === n.end) add(n.start, "접수 (하루)", "e", n);
      else {
        add(n.start, "접수 시작", "s", n);
        add(n.end, "접수 마감", "e", n);
      }
      for (const [k, v] of Object.entries(n.pdf_facts || {})) {
        if (!k.startsWith("일정: ") || /청약 신청/.test(k)) continue;
        const lab = k.replace("일정: ", ""),
          d = kdate(v, n.posted || today);
        if (d && !ev.some((e) => e.d === d && e.n === n)) add(d, lab, /계약|입주/.test(lab) ? "a" : "a", n);
      }
      for (const [k, v] of Object.entries(n.facts)) {
        if (/발표|당첨/.test(k)) add(kdate(v, n.posted || today), k.replace(/\s+/g, " "), "a", n);
        if (/계약/.test(k) && !/계약기간/.test(k)) add(kdate(v, n.posted || today), "계약", "a", n);
      }
    }
    const from = T - 3,
      to = T + 45;
    const days = {};
    ev.filter((e) => dnum(e.d) >= from && dnum(e.d) <= to).forEach((e) => (days[e.d] ||= []).push(e));
    const keys = Object.keys(days).sort();
    const cb = calBox() ? `<div class="hiddenhint">${calBox()}</div>` : "";
    if (!keys.length) return cb + `<div class="empty">앞으로 45일 안에 잡힌 일정이 없어요.</div>`;
    const wd = ["일", "월", "화", "수", "목", "금", "토"];
    return `${cb}<section class="panel">${keys
      .map((k) => {
        const d = dnum(k),
          dt = new Date(d * 864e5);
        const rel = d === T ? "오늘" : d > T ? `D-${d - T}` : `${T - d}일 전`;
        return `<div class="day ${d === T ? "today" : ""}"><div class="d">${k.slice(5).replace("-", ".")} <small>(${wd[dt.getUTCDay()]}) ${rel}</small></div><div>${days[k].map((e) => `<div class="ev"><span class="t ${e.cls}">${esc(e.t)}</span><a href="${esc(e.n.url)}" target="_blank" rel="noopener">${esc(e.n.title)}</a><span class="ext">${esc(SOURCES[e.n.source])}</span></div>`).join("")}</div></div>`;
      })
      .join("")}</section>`;
  }
  const SORTS = {
    notice: [
      ["deadline", "마감 임박순"],
      ["posted", "최근 공고순"],
      ["units", "공급호수 많은 순"],
      ["interest", "넓은 집 먼저"],
    ],
    house: [
      ["deadline", "마감 임박순"],
      ["dep", "보증금 낮은 순"],
      ["rent", "월세 낮은 순"],
      ["m2", "넓은 순"],
      ["station", "역 가까운 순"],
      ["ref", "기준 위치에서 가까운 순"],
      ["count", "호실 많은 순"],
    ],
  };
  const ORD = { "접수중": 0, "접수예정": 1, "일정 확인": 2, "마감": 3 };
  const dl = (n) => [
    ORD[n._status],
    n._status === "접수중"
      ? (dnum(n.end) ?? 1e9)
      : n._status === "접수예정"
        ? dnum(n.start)
        : n._status === "마감"
          ? -(dnum(n.end) || 0)
          : -(dnum(n.posted) || 0),
  ];
  function sortRows(rows) {
    const s = S.sort[S.view],
      cmp = (x, y) => {
        for (let i = 0; i < x.length; i++) {
          if (x[i] !== y[i]) return x[i] - y[i];
        }
        return 0;
      };
    const min = (a) => (a.length ? Math.min(...a) : 1e15);
    const key =
      S.view === "notice"
        ? {
            deadline: (r) => dl(r.n),
            posted: (r) => [-(dnum(r.n.posted) || dnum(r.n.start) || 0)],
            units: (r) => [-r.units.length, ...dl(r.n)],
            interest: (r) => [r.best[1], ...dl(r.n)],
          }[s]
        : {
            deadline: (r) => [...dl(r.h.n), min(r.units.map((u) => u.deposit ?? 1e15))],
            dep: (r) => [min(r.units.map((u) => u.deposit ?? 1e15))],
            rent: (r) => [min(r.units.map((u) => u.rent ?? (u.lease === "전세" ? 0 : 1e15)))],
            m2: (r) => [-Math.max(0, ...r.units.map((u) => u.m2 || 0))],
            station: (r) => [r.h.geo === "gu" ? 1e9 : (r.h.station_m ?? 1e9)],
            ref: (r) => {
              const p = refPt();
              return [p && r.h.lat != null && r.h.geo !== "gu" ? hav(r.h.lat, r.h.lng, p[0], p[1]) : 1e9];
            },
            count: (r) => [-r.units.length],
          }[s] || ((r) => [0]);
    return rows
      .map((r) => [key(r), r])
      .sort((a, b) => cmp(a[0], b[0]))
      .map((x) => x[1]);
  }
  function renderActive() {
    const df = DEFAULTS(),
      p = [];
    const lab = (k, v) => (k === "source" ? SOURCES[v] : k === "sector" ? v + "임대" : k === "gus" ? v : v);
    ["sector", "status", "kind", "htype", "target", "source", "gus", "gender", "lines"].forEach((k) => {
      S[k]
        .filter((v) => !df[k].includes(v))
        .forEach((v) =>
          p.push(
            `<button class="chip" data-k="${k}" data-v="${esc(v)}" aria-pressed="true">${esc(lab(k, v))} ✕</button>`,
          ),
        );
      if (k === "lines" && linesOn()) {
        p.push(
          `<button class="chip" id="lineAll2" aria-pressed="true">노선 ${S.lines.length ? S.lines.map((l) => l.replace("호선", "")).join(", ") : "없음"} ✕</button>`,
        );
        return;
      }
      df[k]
        .filter((v) => !S[k].includes(v))
        .forEach((v) =>
          p.push(
            `<button class="chip" data-k="${k}" data-v="${esc(v)}" aria-pressed="false">${esc(lab(k, v))} 숨김 ✕</button>`,
          ),
        );
    });
    const h = S.h;
    ["전세", "월세"]
      .filter((v) => !h.lease.includes(v))
      .forEach((v) => p.push(`<button class="chip" data-hl="${v}" aria-pressed="false">${v} 숨김 ✕</button>`));
    S.stations.forEach((st) =>
      p.push(`<button class="chip" data-stoff="${esc(st)}" aria-pressed="true">${esc(st)}역 주변 ✕</button>`),
    );
    if (h.maxDep)
      p.push(`<button class="chip" data-hoff="maxDep" aria-pressed="true">보증금 ${won(h.maxDep)} 이하 ✕</button>`);
    if (h.maxRent)
      p.push(`<button class="chip" data-hoff="maxRent" aria-pressed="true">월 ${won(h.maxRent)} 이하 ✕</button>`);
    if (h.minM2) p.push(`<button class="chip" data-hoff="minM2" aria-pressed="true">${h.minM2}㎡ 이상 ✕</button>`);
    if (h.rooms)
      p.push(
        `<button class="chip" data-hoff="rooms" aria-pressed="true">방 ${h.rooms}${h.rooms > 1 ? "개+" : "개"} ✕</button>`,
      );
    if (h.stMax)
      p.push(`<button class="chip" data-hoff="stMax" aria-pressed="true">역 ${walk(h.stMax)} 이내 ✕</button>`);
    if (S.sup) {
      const sp = SUPPORT.find((x) => x.id === S.sup);
      p.push(`<button class="chip" id="supOff" aria-pressed="true">${esc(sp ? sp.name : S.sup)} ✕</button>`);
    }
    if (meOn()) p.push(`<button class="chip" id="meReset" aria-pressed="true">내 경제 조건 ✕</button>`);
    if (h.ev)
      p.push(`<button class="chip" data-ev="" aria-pressed="true">승강기 ${h.ev === "Y" ? "있음" : "없음"} ✕</button>`);
    ["badge", "star"].forEach((k) => {
      if (h[k])
        p.push(
          `<button class="chip" data-hoff="${k}" aria-pressed="true">${{ badge: "넓은 집만", star: "찜" }[k]} ✕</button>`,
        );
    });
    $("#active").innerHTML =
      `<span title="마감, 발표 공고, 공공기숙사, 영구, 재개발, 협동조합, 신혼, 고령, 장애인/수급, 철거민, 다자녀 대상, 여성전용, 강동, 구로, 금천, 도봉, 중랑구는 처음부터 꺼져 있어요">기본 설정 적용 중${p.length ? " + 바꾼 것:" : ""}</span>${p.join("")}<button class="link" id="resetAll">기본값으로</button>`;
  }
  function render(keepPage) {
    if (!keepPage) shown = PAGE;
    if (LINE_R_DONE !== LINE_R()) computeLines();
    renderPanels();
    renderMe();
    renderSub();
    renderActive();
    renderMap();
    const nRows = noticeRows(),
      hRows = houseRows();
    const nUnits = hRows.reduce((s, r) => s + r.units.length, 0);
    $("#tabs").innerHTML = [
      ["house", `집 보기`, `${hRows.length}곳 ${nUnits}호실`],
      ["notice", "공고 보기", nRows.length],
      ["cal", "일정", ""],
      ["sup", "지원과 혜택", SUPPORT.length],
      ["guide", "가이드와 지원", ""],
      ["links", "혜택 사이트", ""],
    ]
      .map(
        ([v, t, c]) =>
          `<button role="tab" data-view="${v}" aria-selected="${S.view === v}">${t}${c !== "" ? `<span class="c">${c}</span>` : ""}</button>`,
      )
      .join("");
    const sorts = SORTS[S.view] || [];
    $("#sort").hidden = !sorts.length;
    $("#sort").innerHTML = sorts
      .map(([v, t]) => `<option value="${v}" ${S.sort[S.view] === v ? "selected" : ""}>${t}</option>`)
      .join("");
    let rows = S.view === "house" ? hRows : nRows;
    if (selPin) rows = rows.filter((r) => selPin.ids.includes(S.view === "house" ? r.h.id : r.n.key));
    let hint = "";
    if (
      S.status.length &&
      !S.status.includes("마감") &&
      S.view !== "cal" &&
      S.view !== "sup" &&
      S.view !== "guide" &&
      S.view !== "mail" &&
      S.view !== "links"
    ) {
      S.status.push("마감");
      const more = S.view === "house" ? houseRows().length - hRows.length : noticeRows().length - nRows.length;
      S.status.pop();
      if (more > 0)
        hint = `<div class="hiddenhint">접수가 끝난 공고의 ${S.view === "house" ? "집" : "공고"} ${more}${S.view === "house" ? "곳" : "건"}은 숨겨 뒀어요. <button class="link" data-k="status" data-v="마감">마감 공고도 보기</button></div>`;
    }
    if (
      meOn() &&
      !S.me.show &&
      S.view !== "cal" &&
      S.view !== "sup" &&
      S.view !== "guide" &&
      S.view !== "mail" &&
      S.view !== "links"
    ) {
      const hid = noticeRows("me").length - nRows.length;
      if (hid > 0)
        hint += `<div class="hiddenhint">경제 조건 기준을 초과하는 공고 ${hid}건은 숨겼어요. <button class="link" id="meShow">같이 보기</button></div>`;
    } else if (meOn() && S.me.show && S.view !== "guide" && S.view !== "mail" && S.view !== "links")
      hint += `<div class="hiddenhint">기준을 초과하는 공고도 같이 보는 중이에요. <button class="link" id="meShow">다시 숨기기</button></div>`;
    $("#sel").innerHTML =
      hint +
      (selPin
        ? `<div class="selbox"><span>지도에서 고른 위치의 ${S.view === "house" ? "집" : "공고"} ${rows.length}개만 보고 있어요.</span><button class="link" id="clearPin">전체 보기</button></div>`
        : "");
    if (S.view === "links") {
      $("#summary").innerHTML =
        `서울 1인가구와 청년 혜택을 모아 보는 공식 사이트 <span class="ext">(신청과 자세한 내용은 각 사이트에서 확인)</span>`;
      $("#list").innerHTML = infoNote() + portalBox();
    } else if (S.view === "guide") {
      $("#summary").innerHTML =
        `집 구할 때 챙길 것과 서울시 지원 <span class="ext">(국토부, 서울시, HUG, LH, SH, 청년안심주택 안내를 정리. 2026-11-01 확인)</span>`;
      $("#list").innerHTML = infoNote() + guidePage();
      regRender();
    } else if (S.view === "sup") {
      const AUD = ["전체", "직장인", "대학생", "대학원생", "취준생", "1인가구"],
        AREAS = ["주거", "일자리", "자산", "교통", "교육", "생활"];
      const okAud = (sp) => SUPAUD === "전체" || sp.aud.includes(SUPAUD) || sp.aud.includes("전체");
      const okKind = (sp) => !SUPKIND || sp.kind === SUPKIND;
      const list = SUPPORT.filter((sp) => okAud(sp) && okKind(sp));
      $("#summary").innerHTML =
        `<b>${list.length}</b>가지 지원과 혜택 <span class="ext">(2026-11-01 확인. 금액과 자격은 해마다 바뀌니 신청 전에 공식 공고를 확인하세요)</span>`;
      const ST = {
        "상시": ["st-open", "상시 신청"],
        "마감": ["", "2026년 모집 끝남"],
        "예정": ["st-soon", "다음 모집 예정"],
      };
      const card = (sp) => {
        const cnt = HOUSES.filter((h) => h.units.some((u) => sp.match(h.n, u))).length;
        const one = sp.what.split(/(?<=요\.)\s/)[0];
        return `<details class="card sup supitem" data-supcard="${sp.id}"${SUPOPEN.has(sp.id) ? " open" : ""}><summary><div class="row1"><span class="pill ${sp.kind === "금전" ? "pub" : "pri"}">${sp.kind === "금전" ? "금전 지원" : "서비스"}</span><span class="pill ${ST[sp.status][0]}">${ST[sp.status][1]}</span>${sp.aud
          .filter((a) => a !== "전체")
          .map((a) => `<span class="pill soft">${a}</span>`)
          .join("")}</div>
        <h3>${esc(sp.name)} <small class="ext">${esc(sp.who)}</small></h3><p class="supone">${esc(one)}</p><span class="supmore">자세히 보기</span></summary>
        <dl><dt>지원</dt><dd>${esc(sp.what)}</dd><dt>자격</dt><dd>${esc(sp.elig)}</dd><dt>신청</dt><dd>${esc(sp.how)}</dd></dl>
        <div class="links"><a href="${esc(sp.url)}" target="_blank" rel="noopener">공식 안내 ↗</a>${(sp.src || []).map(([t, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(t)} ↗</a>`).join("")}${cnt ? `<button class="link" data-sup="${sp.id}">해당될 수 있는 집 ${cnt}곳 보기</button>` : ""}</div></details>`;
      };
      $("#list").innerHTML =
        infoNote() +
        `<div class="supfilter"><div class="chips">${AUD.map((a) => `<button class="chip" data-supaud="${a}" aria-pressed="${SUPAUD === a}">${a === "전체" ? "모두" : a}</button>`).join("")}</div>
      <div class="chips">${[
        ["", "전부"],
        ["금전", "금전 지원"],
        ["서비스", "상담과 서비스"],
      ]
        .map(([v, t]) => `<button class="chip" data-supkind="${v}" aria-pressed="${SUPKIND === v}">${t}</button>`)
        .join(
          "",
        )}<button class="link" id="supAll" style="margin-left:auto">${list.every((sp) => SUPOPEN.has(sp.id)) ? "모두 접기" : "모두 펼치기"}</button></div></div>` +
        AREAS.map((ar) => {
          const g = list.filter((sp) => sp.area === ar);
          return g.length
            ? `<h2 class="suparea">${ar} <span class="ext">${g.length}</span></h2>` + g.map(card).join("")
            : "";
        }).join("") +
        `<p class="note">'해당될 수 있는 집'은 집 유형, 보증금, 월세만 보고 고른 거예요. 소득, 자산, 나이 같은 개인 조건은 각 제도 공고에서 확인하세요.</p>`;
    } else if (S.view === "cal") {
      $("#summary").innerHTML =
        `<b>${nRows.length}</b>건 공고의 일정 <span class="ext">(오늘 ${fmtD(today)}부터 45일)</span>`;
      $("#list").innerHTML = calendar(nRows);
    } else if (S.view === "house") {
      const open = rows.filter((r) => r.h.n._status === "접수중" || r.h.n._status === "접수예정").length;
      $("#summary").innerHTML =
        `<b>${rows.length}</b>곳 <span class="ext">(호실 ${rows.reduce((s, r) => s + r.units.length, 0)}개, 접수중이거나 예정 ${open}곳)</span>`;
      const sorted = sortRows(rows);
      $("#list").innerHTML = sorted.length
        ? sorted.slice(0, shown).map(houseCard).join("") +
          (sorted.length > shown
            ? `<button class="btn more-btn" id="moreBtn">${sorted.length - shown}곳 더 보기</button>`
            : "")
        : `<div class="empty">조건에 맞는 집이 없어요. 위의 조건 칩을 하나씩 풀어 보세요.</div>`;
    } else {
      const open = rows.filter((r) => r.n._status === "접수중").length,
        soon = rows.filter((r) => r.n._status === "접수예정").length;
      $("#summary").innerHTML =
        `<b>${rows.length}</b>건 <span class="ext">(접수중 ${open}, 접수예정 ${soon}, 전체 ${DATA.notices.length}건 중)</span>`;
      const sorted = sortRows(rows);
      $("#list").innerHTML = sorted.length
        ? sorted.slice(0, shown).map(noticeCard).join("") +
          (sorted.length > shown
            ? `<button class="btn more-btn" id="moreBtn">${sorted.length - shown}건 더 보기</button>`
            : "")
        : `<div class="empty">조건에 맞는 공고가 없어요. 위의 조건 칩을 하나씩 풀어 보세요.</div>`;
    }
    save();
  }
  function nextUpdate() {
    const now = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Seoul",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date());
    const t = UPDATE_TIMES.find((x) => x > now);
    return t ? `오늘 ${t}` : `내일 ${UPDATE_TIMES[0]}`;
  }
  const infoNote = () =>
    `<p class="note infonote">제가 뉴스와 신문 기사, 책을 통해 알게 된 정보 중 서울에서 혼자 거주할 방법을 고민하는 친구들에게 필요한 정보 위주로 더 찾아보고 모아서 채워 두었어요. 자세하고 정확한 내용은 각 링크에서 직접 확인해 주세요.</p>`;
  function icsUrl() {
    if (document.getElementById("embedded-data") || !/^https?:/.test(location.protocol)) return "";
    return new URL("data/schedule.ics", location.href).href;
  }
  function calBox() {
    const u = icsUrl();
    if (!u) return "";
    return `<span class="calbox">접수 일정을 내 캘린더로 받기: <a href="${esc(u.replace(/^https?:/, "webcal:"))}">아이폰, 맥 캘린더에 추가</a>, <button class="link" id="icsCopy" data-ics="${esc(u)}">구글 캘린더용 주소 복사</button> <span class="ext">(구글 캘린더 → 다른 캘린더 + → URL로 추가에 붙여 넣기. 공고 접수 시작일과 마감일이 매일 자동으로 들어와요)</span></span>`;
  }
  function renderHealth() {
    const h = DATA.health || {};
    $("#health").innerHTML =
      Object.keys(SOURCES)
        .map((k) => {
          const v = h[k];
          if (!v) return "";
          const live = DATA.notices.filter(
            (n) => n.source === k && (n.kind === "모집" || n.kind === "정정") && n._status !== "마감",
          ).length;
          return `<span class="${v.ok ? "" : "fail"}" title="${esc(v.ok ? `모은 글 ${v.count}건 중 마감, 결과 발표, 안내를 뺀 모집 공고 수예요` : v.error || "")}"><i></i>${esc(SOURCES[k])} ${v.ok ? `모집 중 ${live}건 <small>(전체 ${v.count})</small>` : "수집 실패"}</span>`;
        })
        .join("") +
      (DATA.generated_at
        ? `<span title="GitHub Actions 예약 실행이라 몇 분~수십 분 늦을 수 있어요">마지막 업데이트 <time>${esc(DATA.generated_at.replace("T", " ").slice(5, 16).replace("-", "."))}</time> (${T - dnum(DATA.generated_at.slice(0, 10)) >= 2 ? `${T - dnum(DATA.generated_at.slice(0, 10))}일 전` : `다음: ${nextUpdate()}`})</span>` +
          (T - dnum(DATA.generated_at.slice(0, 10)) >= 2
            ? `<span class="fail"><i></i>자동 업데이트가 멈춰 있어요</span>`
            : "")
        : "");
    const fails = Object.entries(h).filter(([, v]) => !v.ok);
    $("#foot").innerHTML = `매일 새벽 5시에 공식 공고를 모아 올려요. 자격과 일정은 꼭 각 기관 공고문으로 확인하세요.
    호실과 임대료는 LH 공급주택목록 엑셀과 HUG 주택 리스트에서 읽고, 청년안심주택은 공고문 PDF의 [공급현황] 표에서 뽑아요(확인 필요). 방 수는 공식 '방수' 표기가 있을 때만 씁니다.
    위치는 ${DATA.geo_provider === "kakao" ? "카카오 주소 검색" : DATA.geo_provider === "naver" ? "네이버 지도 주소 검색" : "OpenStreetMap 주소 검색으로 찾은 근사 위치"}이고, 역 거리는 직선거리예요. 지도와 역 데이터 © OpenStreetMap contributors.
    ${calBox() ? `<br>${calBox()}` : ""}
    ${fails.length ? `<br>수집 실패: ${fails.map(([k, v]) => `${esc(SOURCES[k] || k)} — ${esc(v.error || "")}`).join(" / ")}` : ""}`;
  }
  const GUIDES = [
    {
      id: "move",
      title: "혼자 집 구할 때 서울시가 같이 해 주는 것",
      by: "서울시 1인가구 지원 (내 손안에 서울 2026.3.11, 2026.4.13, 2026.8.18)",
      stages: [
        [
          "① 집 보러 갈 때: 집보기 동행 (무료)",
          [
            "공인중개사 자격이 있는 '주거안심매니저'가 집 보러 같이 가서 건물 상태, 주변 환경, 계약 조건을 같이 봐 줘요. 25개 구 모두 운영해요.",
            "서울에 살거나 살 예정인 1인가구면 신청할 수 있고, 1인가구 증빙 서류는 필요 없어요.",
            "월요일과 목요일 13:30~17:30에 정기 운영하고, 평일 저녁(20시까지)과 토요일은 미리 예약해요. 희망일 2~3일 전에 신청해요.",
          ],
        ],
        [
          "② 계약할 때: 전월세 계약 상담과 동행 (무료)",
          [
            "계약서와 등기부, 건축물대장 보는 법부터 넣을 특약, 받을 수 있는 지원 정책까지 상담해 줘요. 필요하면 계약하는 자리에도 같이 가요.",
            "위 '등기부등본 셀프 점검' 결과를 들고 가서 물어보면 좋아요.",
          ],
        ],
        [
          "③ 이사하는 날: 이사동행 (무료, 2026년 2월 시작)",
          [
            "이사 당일 최대 6시간 같이 있으면서 집 상태와 하자를 확인하고, 공과금 정산과 전입신고 같은 행정 절차를 같이 해 줘요.",
            "신청: 일인친구 콜센터 1533-1179 (평일 7~20시) 또는 1인가구 누리집.",
          ],
        ],
        [
          "④ 이사한 뒤: 중개보수와 이사비 최대 40만원",
          [
            "서울로 전입했거나 서울 안에서 이사해 전입신고한 만 19~39세 무주택 청년이면 중개보수와 이사비 실비를 합쳐 최대 40만원(생애 1회)을 받을 수 있어요.",
            "소득 기준중위소득 150% 이하, 거래금액(보증금+월세×100) 2억원 이하. 2024년 1월 이후 이사한 경우가 대상이었어요.",
            "보통 상반기와 하반기 2번 모집해요 (2026년은 4월과 8월에 2주씩 받았고 이미 마감됐어요). 영수증이나 이체내역 같은 지출 증빙을 꼭 챙겨 두세요. 청년몽땅정보통에서만 신청할 수 있고, 문의는 1877-9358이에요.",
          ],
        ],
      ],
      tel: "집보기와 계약 동행: 1인가구 포털(1in.seoul.go.kr) 또는 각 구청 1인가구 담당 / 이사동행: 1533-1179 / 서울시 담당: 02-2133-6152",
      src: [
        ["집보기 동행과 안심계약 도움서비스 (2026.3.11)", "https://mediahub.seoul.go.kr/archives/2017406"],
        ["이사동행 등 1인가구 동행서비스 (2026.4.13)", "https://mediahub.seoul.go.kr/archives/2017809"],
        ["중개보수 및 이사비 지원 (2026.8.18)", "https://mediahub.seoul.go.kr/archives/2019098"],
        ["1인가구 포털", "https://1in.seoul.go.kr"],
        ["청년몽땅정보통", "https://youth.seoul.go.kr"],
      ],
    },
    {
      id: "tips",
      title: "청년주택 당첨 확률 높이는 법",
      by: "2026년 공고문에서 직접 확인한 내용 — 청년안심주택 추가모집(10.15), LH 청년 매입임대(9.17), LH 서울번동3 행복주택(8.19)",
      stages: [
        [
          "청년안심주택",
          [
            "추가모집이 자주, 짧게 올라와요. 접수가 하루(00:00~23:00)뿐인 공고도 있어서 메일링 구독이나 찜으로 놓치지 않는 게 중요해요.",
            "소득 순위가 같으면 지역 순위로 갈려요. 단지가 있는 자치구에 살거나, 그 구에 있는 대학에 다니거나 직장이 있으면 1순위예요(재적증명서나 재직증명서로 확인).",
            "소득 순위(1순위 100%, 2순위 110%, 3순위 120%)는 직접 골라요. 낮은 구간일수록 앞 순위이고, 잘못 고르면 당첨이 취소될 수 있어요.",
            "당첨자 계약 뒤 남은 세대는 예비당첨자에게 순서대로 돌아가요. 예비 번호를 받았다면 연락을 기다려 볼 만해요.",
            "청약한 사람과 계약하는 사람, 들어가 사는 사람이 같아야 해요. 서류는 모집공고일 이후에 뗀 것만 인정돼요.",
          ],
        ],
        [
          "LH 청년 매입임대",
          [
            "같은 순위끼리 경쟁하면 배점으로 정해요. 부모님이 무주택이면 2점(신청할 때 부모 정보를 꼭 입력), 소득이 순위 기준의 절반 이하면 3점(1인 월 약 267만원 이하)이에요.",
            "청약통장 납입 횟수도 점수예요. 24회 이상 3점, 12회 이상 2점, 6회 이상 1점이라 통장을 일찍 만들어 꾸준히 넣는 게 유리해요.",
            "증빙서류를 안 내면 순위와 가점을 인정받지 못해요. 신청한 뒤에는 순위를 바꿀 수 없어요.",
          ],
        ],
        [
          "행복주택",
          [
            "청년 계층 일반공급은 서울에 살거나 소득근거지(직장)가 서울이면 1순위이고, 같은 순위 안에서는 추첨이에요.",
            "소득이 없는 청년은 같은 면적의 대학생 임대조건(더 낮은 임대료)이 적용돼요.",
            "예비입주자 순번은 LH청약플러스의 '예비입주자순위조회'에서 볼 수 있어요. 기존 예비입주자가 있으면 그 뒤 순번이 돼요.",
          ],
        ],
        [
          "공통",
          [
            "무주택과 소득, 자산 조건은 모집공고일부터 입주할 때까지 계속 지켜야 해요. 중간에 집을 사거나 소득이 크게 오르면 당첨이 취소될 수 있어요.",
            "마감된 공고도 '마감 공고도 보기'로 열어 두면 예비입주자 모집 전에 단지와 임대료를 미리 비교할 수 있어요.",
          ],
        ],
      ],
      src: [
        [
          "청년안심주택 추가모집 공고 예시",
          "https://soco.seoul.go.kr/youth/bbs/BMSR00015/view.do?boardId=6701&menuNo=400008",
        ],
        [
          "LH 청년 매입임대 공고",
          "https://apply.lh.or.kr/lhapply/apply/wt/wrtanc/selectWrtancView.do?panId=2015122300020759&ccrCnntSysDsCd=03&uppAisTpCd=13&aisTpCd=26&mi=1026",
        ],
        [
          "LH 서울번동3 행복주택 공고",
          "https://apply.lh.or.kr/lhapply/apply/wt/wrtanc/selectWrtancView.do?panId=2015122300020605&ccrCnntSysDsCd=03&uppAisTpCd=06&aisTpCd=10&mi=1026",
        ],
      ],
    },
    {
      id: "money",
      title: "경제 조건 읽는 법 (소득, 자산, 자동차, 세대)",
      by: "2026년 서울 공고문에서 정리 — LH 청년 매입임대(9.17), 통합공공임대(9.17), 행복주택(7.15, 8.19), 든든전세(10.1), 청년안심주택 추가모집(10.15)",
      stages: [
        [
          "언제가 기준일까: 모집공고일",
          [
            "모든 자격(나이, 세대, 주택, 소득, 자산)은 접수일이 아니라 모집공고일 기준으로 봐요. 그리고 입주할 때까지 계속 지켜야 해요.",
            "공고일 뒤에 세대를 나눴다면, 공고일 당시 세대주의 등본을 추가로 내야 해요.",
          ],
        ],
        [
          "무주택: '본인만'인지 '세대 전원'인지",
          [
            "청년 계층(행복주택, 청년 매입임대, 통합공공임대 청년, 청년안심주택)은 신청자 본인만 집이 없으면 돼요. 부모님이 집이 있어도 신청할 수 있어요 (청년 매입임대 공고에 명시).",
            "든든전세처럼 '무주택세대구성원'을 요구하는 공고는 주민등록상 같은 세대 전원이 집이 없어야 해요. 부모님 등본에 같이 올라 있고 부모님 집이 있으면 안 돼요.",
            "분양권과 입주권도 집으로 쳐요. 상속받은 지분 같은 예외는 공고문 '주택소유 판정기준'을 봐요.",
          ],
        ],
        [
          "세대와 세대주, 세대구성원",
          [
            "세대구성원 = 신청자 + 배우자(주소가 달라도 포함) + 같은 등본에 있는 부모나 자녀 같은 직계가족이에요.",
            "혼자 전입신고하면 '단독세대주'가 돼요.",
            "행복주택 청년 계층은 본인이 부모님 세대의 세대원이거나 단독세대주면 본인 소득만 봐요. 본인이 세대주이고 같은 등본에 부모님 같은 직계가족이 있으면 그 가족 소득까지 합쳐서 봐요 (LH 서울번동3 행복주택 공고).",
            "세대주 요건이 있는지는 공고문 '신청자격'에서 꼭 확인해요.",
          ],
        ],
        [
          "소득: 어떤 기준의 몇 %인가",
          [
            "대부분 '전년도 도시근로자 가구원수별 월평균소득'(통계청)을 써요. 2026년 공고 기준 1인 가구 100%(월 약 381만, 연 약 4,576만), 110%(월 약 419만, 연 약 5,034만), 120%(월 약 458만, 연 약 5,491만)이에요. 세전 근로소득과 사업소득의 월평균이고, 연봉은 월평균 × 12로 계산한 대략값이에요.",
            "청년 1인 가구는 20%p를 더 얹어 주는 경우가 많아요. 그래서 LH 청년 매입임대 3순위, 행복주택 청년은 1인 120%(월 458만, 연 5,491만)까지예요.",
            "통합공공임대는 보건복지부 '기준중위소득'을 써요. 150% + 1인 가구 20%p = 170%(월 약 436만, 연 약 5,231만). 참고로 1인 100%는 월 약 256만, 연 약 3,077만이에요. 소득 구간에 따라 임대료가 35~90%로 달라져요.",
            "청년안심주택은 소득 순위(1순위 100%, 2순위 110%, 3순위 120%)를 직접 골라서 신청해요. 고른 순위와 서류가 다르면 당첨이 취소될 수 있어요.",
          ],
        ],
        [
          "청약통장과 결혼 여부",
          [
            "행복주택 청년 계층은 입주 전까지 주택청약종합저축(청약저축 포함) 가입 사실을 증명해야 해요. 혼인 중이 아니어야 해요 (LH 서울번동3 행복주택 공고).",
            "LH 청년 매입임대도 미혼 청년이 대상이에요.",
          ],
        ],
        [
          "부모님 소득도 보나?",
          [
            "LH 청년 매입임대 2순위와 행복주택 대학생 계층은 본인 + 부모님 소득을 합쳐서 봐요 (같이 살지 않아도 부모님을 세대원에 적어야 해요).",
            "청년 매입임대 3순위, 행복주택 청년, 청년안심주택 청년은 본인 소득만 봐요.",
          ],
        ],
        [
          "총자산과 자동차",
          [
            "총자산 = 부동산 + 자동차 + 예금, 주식, 보험 같은 금융자산 + 기타 − 부채예요. 신청할 때 금융정보 제공 동의서를 내요.",
            "청년 자산 기준(2.51억원: 행복주택 청년, 청년 매입임대 3순위, 청년안심주택 청년), 국민임대 자산 기준(3.45억원: 통합공공임대, 청년 매입임대 2순위), 행복주택 대학생 기준(1.08억원)이 있어요.",
            "자동차는 공공주택 자동차가액 기준(2026년 4,542만원) 이하면 괜찮아요. 여러 대면 가장 비싼 차 한 대로 따지고, 총자산에도 모든 차 값을 더해요. 이륜차도 포함돼요.",
            "행복주택 대학생 계층은 차가 없어야 해요. 청년안심주택은 세대당 1대만 주차 등록할 수 있고, 기준을 넘는 차는 등록이 안 돼요.",
          ],
        ],
      ],
      src: [
        [
          "LH 청년 매입임대 공고",
          "https://apply.lh.or.kr/lhapply/apply/wt/wrtanc/selectWrtancView.do?panId=2015122300020759&ccrCnntSysDsCd=03&uppAisTpCd=13&aisTpCd=26&mi=1026",
        ],
        [
          "LH 통합공공임대 공고",
          "https://apply.lh.or.kr/lhapply/apply/wt/wrtanc/selectWrtancView.do?panId=2015122300020807&ccrCnntSysDsCd=03&uppAisTpCd=06&aisTpCd=48&mi=1026",
        ],
        [
          "LH 서울번동3 행복주택 공고",
          "https://apply.lh.or.kr/lhapply/apply/wt/wrtanc/selectWrtancView.do?panId=2015122300020605&ccrCnntSysDsCd=03&uppAisTpCd=06&aisTpCd=10&mi=1026",
        ],
        [
          "LH 관악봉천 행복주택 공고",
          "https://apply.lh.or.kr/lhapply/apply/wt/wrtanc/selectWrtancView.do?panId=2015122300020326&ccrCnntSysDsCd=03&uppAisTpCd=06&aisTpCd=10&mi=1026",
        ],
        [
          "LH 든든전세 공고",
          "https://apply.lh.or.kr/lhapply/apply/wt/wrtanc/selectWrtancView.do?panId=2015122300020843&ccrCnntSysDsCd=03&uppAisTpCd=13&aisTpCd=26&mi=1026",
        ],
        [
          "청년안심주택 추가모집 공고",
          "https://soco.seoul.go.kr/youth/bbs/BMSR00015/view.do?boardId=6701&menuNo=400008",
        ],
      ],
    },
    {
      id: "333",
      title: "안심계약 3·3·3 법칙",
      by: "국토교통부 「전세사기 피해예방 종합안내서」 (2025.8.27, 경찰청, 한국공인중개사협회 등과 함께)",
      stages: [
        [
          "계약 전",
          [
            "주변 시세를 충분히 알아봐요.",
            "등기부등본으로 권리관계(근저당, 압류 등)를 확인해요.",
            "전세보증보험에 가입할 수 있는 집인지 보증기관에 물어봐요.",
          ],
        ],
        [
          "계약할 때",
          [
            "브이월드 등에서 공인중개사가 정상 영업 중인지 확인해요.",
            "등기부와 신분증으로 계약하는 사람이 진짜 집주인인지 확인해요.",
            "표준계약서처럼 내용이 자세한 계약서를 써요.",
          ],
        ],
        [
          "계약 후",
          [
            "바로 임대차 신고(또는 확정일자)를 해요.",
            "잔금 치르기 전에 등기부를 다시 떼 봐요.",
            "이사 당일 전입신고를 마쳐요.",
          ],
        ],
      ],
      src: [
        ["국토교통부 보도자료", "https://www.molit.go.kr/USR/NEWS/dtl.jsp?lcmspage=67&id=95091157"],
        ["헤럴드경제 기사", "https://v.daum.net/v/UT1x1HMU1u?f=p"],
      ],
    },
    {
      id: "seoul",
      title: "서울시 전세사기 예방 체크리스트",
      by: "서울특별시 「전세 계약, 두렵지 않아요 – 전세사기 예방 AtoZ」 (내 손안에 서울, 2025.10.14)",
      items: [
        "시세를 보고 전세가율(보증금 ÷ 집값)을 계산해요. 70%를 넘지 않는 게 좋아요.",
        "건축물대장에 '위반건축물' 표시가 있으면 피하고, 대장과 등기부 용도가 둘 다 주택인지 봐요. 무단 개조한 지하나 옥탑을 조심해요.",
        "신탁 부동산은 신탁회사 동의 없이 맺은 계약이면 효력이 제한돼요. 등기부에서 소유자 명의를 확인해요.",
        "중개사무소 등록증이 걸려 있는지 보고, 서울시 부동산정보포털에서 중개사를 조회해요.",
        "계약금은 집주인 명의 계좌로만 보내고, 받았다는 걸 글로 남겨요.",
        "보증금 6천만 원 또는 월세 30만 원을 넘으면 30일 안에 임대차 신고를 해야 해요 (안 하면 과태료 100만 원 이하).",
        "잔금 직전과 잔금 후에 등기부를 다시 떼 보고, 입주 전 미납 공과금은 정산 확인서를 받아 둬요.",
        "입주하면 최대한 빨리 전입신고(대항력)하고, 전세보증보험 가입도 검토해요.",
      ],
      tel: "서울시 전월세종합지원센터 02-2133-1200~08 (월수금 9~17시, 화목 9~20시, 서소문청사 1동 1층)",
      src: [
        ["내 손안에 서울", "https://mediahub.seoul.go.kr/archives/2015838"],
        ["서울주거포털", "https://housing.seoul.go.kr"],
      ],
    },
    {
      id: "reg",
      title: "등기부등본 읽는 법",
      by: "HUG 안심전세포털 「등기부등본 확인」",
      items: [
        "인터넷등기소에서 누구나 700원에 열람할 수 있어요. '말소사항 포함'으로 떼면 지난 기록까지 보여요.",
        "표제부: 주소, 호수, 면적, 용도를 봐요. 근린생활시설은 주거용이 아니에요.",
        "갑구(소유권): 맨 아래 소유자가 지금 집주인이에요. 압류, 가압류, 경매개시결정, 가등기, 신탁이 있는지 봐요. 신탁이면 신탁회사 동의가 필요해요.",
        "을구(그 밖의 권리): 근저당 채권최고액 + 내 보증금을 집값과 비교해요. 합계가 대략 80% 이하면 일반적으로 안전한 편이에요.",
        "아직 등기 안 한 다른 세입자는 등기부에 안 나와요. 다가구나 다세대는 전입세대 열람내역과 확정일자 부여현황으로 같이 확인해요.",
      ],
      src: [
        ["HUG 안심전세포털", "https://www.khug.or.kr/jeonse/web/s03/s030105.jsp"],
        ["인터넷등기소", "https://www.iros.go.kr"],
      ],
    },
    {
      id: "law",
      title: "집주인에게 요구할 수 있는 정보 (2023년 개정)",
      by: "법무부와 국세청 (정책브리핑 2023.3.31, 2024.8.6), 법무부 주택임대차표준계약서",
      items: [
        "계약할 때 집주인은 선순위 임대차 정보(확정일자, 보증금 등)와 납세증명서를 보여줘야 해요.",
        "표준계약서 특약: 미리 알리지 않은 선순위 임대차나 체납 세금이 나오면, 임대차 시작일 전까지 계약금을 잃지 않고 계약을 해제할 수 있어요.",
        "계약 후 보증금이 1천만 원을 넘으면, 집주인 동의 없이도 임대차 시작일까지 세무서에서 미납 국세를 열람할 수 있어요 (계약서 지참). 계약 전에는 집주인 동의가 필요해요.",
      ],
      src: [
        ["정책브리핑(법무부)", "https://www.korea.kr/news/policyNewsView.do?newsId=148913348"],
        ["정책브리핑(국세청)", "https://www.korea.kr/multi/visualNewsView.do?newsId=148932319"],
        ["주택임대차표준계약서", "https://www.moj.go.kr/bbs/moj/118/491743/download.do"],
      ],
    },
    {
      id: "hug",
      title: "HUG 전세보증금반환보증과 안심전세앱",
      by: "주택도시보증공사(HUG) (2026.7.1 개정 기준)",
      items: [
        "보증금은 수도권 7억 원 이하일 때 가입할 수 있어요. 실제로 살면서 전입신고와 확정일자를 받아야 해요.",
        "보증금 + 선순위채권이 집값의 90% 안, 선순위채권만으로는 60% 안이어야 해요.",
        "계약기간이 1년 이상이고 공인중개사를 통한 계약이어야 해요. 경매나 압류가 없고 위반건축물이 아니어야 해요(아파트 제외).",
        "신규 계약은 잔금일과 전입일 중 늦은 날부터 계약기간 절반이 지나기 전까지 신청해요. 은행, 네이버페이, 카카오페이, 토스에서도 돼요.",
        "안심전세앱: 시세, 지역 전세가율, 경매낙찰가율, 등기부 열람(1,000원, 이후 2년 6개월 변동 알림 무료), 건축물대장(무료), 집주인 체납과 보증사고 이력 확인.",
      ],
      src: [
        ["HUG 반환보증 상품개요", "https://www.khug.or.kr/hug/web/ig/dr/igdr000001.jsp"],
        ["안심전세앱 안내", "https://www.khug.or.kr/jeonse/web/s01/s010102.jsp"],
      ],
    },
    {
      id: "apply",
      title: "LH, SH 임대주택 청약할 때",
      by: "SH 청약유의사항, 행복주택 서류제출 안내(2026.1.30), LH 청약센터 임대가이드",
      items: [
        "1세대 1주택(1실)이 원칙이에요. 한 세대에서 2명 이상 당첨되면 모두 부적격이 될 수 있어요.",
        "자격은 접수일이 아니라 모집공고일 기준이에요. 세대원 모두 무주택이어야 해요.",
        "신청서에 입력한 내용만 보고 당첨자를 정해요. 실제와 다르면 부적격이고, 잘못 입력한 불이익은 신청자 책임이에요. 수정과 취소는 접수 마감 전까지만 돼요.",
        "서류는 공고일 이후에 뗀 것만 인정돼요. 기한 안에 안 내면 청약 의사가 없는 것으로 봐요 (SH 행복주택은 등기우편으로만 접수).",
        "계약 순번에서 포기하거나 계약일에 안 가면 예비입주자 지위를 잃어요. 계약 후 집을 갖게 되면 계약 해지와 퇴거 대상이에요.",
        "재당첨과 재신청 제한은 공고마다 달라요. 공고문과 콜센터(LH 1600-1004, SH 1600-3456)로 확인해요.",
      ],
      src: [
        ["SH 청약유의사항", "https://www.i-sh.co.kr/app/lay2/S48T588C6752/contents.do"],
        [
          "SH 행복주택 서류제출 안내",
          "https://www.i-sh.co.kr/app/lay2/program/S1T294C295/www/brd/m_241/view.do?multi_itm_seqs=1%2C2%2C4%2C8%2C16%2C32%2C64%2C128%2C256&seq=299902",
        ],
        ["LH 임대가이드", "https://apply.lh.or.kr/lhapply/cm/cntnts/cntntsView.do?mi=1144&cntntsId=1023"],
      ],
    },
    {
      id: "soco",
      title: "서울시 청년안심주택",
      by: "청년안심주택 누리집 모집공고(2025.12.30), 민간임대 입주자 안내문(2025.12.31)",
      items: [
        "1세대 1실만 신청할 수 있어요. 중복 신청하면 전부 무효예요.",
        "만 19~39세와 무주택 요건은 공고일부터 입주할 때까지 계속 지켜야 해요. 신청 뒤엔 내용을 고칠 수 없어요.",
        "당첨자가 아닌 사람이 같이 살면 계약 해지와 퇴거 사유예요 (신혼부부형 제외).",
        "민간임대는 임대보증금 보증보험 가입 여부와 기간을 꼭 확인해요. 보증료 일부(안내문 예시 25%)는 세입자가 내요.",
        "전입신고와 확정일자를 안 하면 보증보험이 이행되지 않을 수 있어요. 전입 전에 등기부를 보고, 잔금일 다음 날까지 새 근저당이나 가압류가 없는지 확인해요.",
        "단지에 걸린 근저당 때문에 보증금 대출이 제한될 수 있으니 계약 전에 은행에 물어봐요.",
      ],
      tel: "안심주택 종합지원센터 02-793-0780 (최근 공고문 기재 번호)",
      src: [
        ["청년안심주택 누리집", "https://soco.seoul.go.kr"],
        [
          "모집공고(공공임대)",
          "https://soco.seoul.go.kr/coHouse/cmmn/file/fileDown.do?atchFileId=10754e8227314bca991c8247e361d753&fileSn=1",
        ],
        [
          "민간임대 입주자 안내문",
          "https://soco.seoul.go.kr/coHouse/cmmn/file/fileDown.do?atchFileId=9f26ba9a2ec84f99a305f79469d798b3&fileSn=1",
        ],
      ],
    },
  ];
  function guideSec(g) {
    const list = (a) => `<ul class="check">${a.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;
    const n = g.stages ? g.stages.length + "단계" : g.items.length + "가지";
    return `<details class="card gsec supitem" id="g-${g.id}"${GOPEN.has(g.id) ? " open" : ""} data-gsec="${g.id}"><summary><h3>${esc(g.title)} <small class="ext">${n}</small></h3><div class="ext">${esc(g.by)}</div><span class="supmore">펼쳐 보기</span></summary>
    ${g.stages ? g.stages.map(([st, a]) => `<div class="stage">${esc(st)}</div>${list(a)}`).join("") : list(g.items)}
    ${g.tel ? `<p class="note">상담: ${esc(g.tel)}</p>` : ""}
    <div class="src">자세한 내용과 최신 기준은 출처 원문에서 꼭 확인하세요. 출처: ${g.src.map(([t, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(t)} ↗</a>`).join(", ")}</div></details>`;
  }
  const PORTALS = [
    ["서울시 1인가구 포털", "https://1in.seoul.go.kr", "1인가구 혜택 전체, 집보기 동행, 이사동행, 안심장비 신청"],
    ["청년몽땅정보통", "https://youth.seoul.go.kr", "서울 청년 정책, 중개보수와 이사비 지원, 청년월세 신청"],
    ["서울주거포털", "https://housing.seoul.go.kr", "주거 지원 공고, 전월세 상담, 전세사기 예방 안내서"],
    ["온통청년", "https://www.youthcenter.go.kr", "전국 청년 정책 검색 (정부)"],
  ];
  const portalBox = () => `<article class="card gsec" id="g-portal"><h3>혜택 사이트</h3>
  <ul class="check">${PORTALS.map(([t, u, d]) => `<li><a href="${u}" target="_blank" rel="noopener"><b>${esc(t)} ↗</b></a><br><span class="ext">${esc(d)}</span></li>`).join("")}</ul>
  <p class="ext" style="margin-top:8px">지원 내용과 자격은 해마다 바뀌어요. 신청 전에 각 사이트의 공고를 꼭 확인하세요.</p></article>`;
  function guidePage() {
    const ids = [...GUIDES.map((g) => g.id), "check"];
    const all = ids.every((i) => GOPEN.has(i));
    return (
      `<div class="supfilter"><div class="chips"><button class="link" id="gAll" style="margin-left:auto">${all ? "모두 접기" : "모두 펼치기"}</button></div></div>` +
      guideSec(GUIDES[0]) +
      guideSec(GUIDES[1]) +
      guideSec(GUIDES[2]) +
      regCard() +
      GUIDES.slice(3).map(guideSec).join("") +
      `<p class="note">공식 안내를 이 사이트에 맞게 줄이고 문장을 다듬었어요. 금액과 기준은 바뀔 수 있으니 계약이나 신청 전에 출처 원문을 확인하세요. 법률 판단이 필요하면 서울시 전월세종합지원센터 무료 상담을 이용하세요.</p>`
    );
  }
  const REG = { text: "", file: "", dep: "", price: "", owner: "", err: "", busy: false };
  function regCard() {
    return `<details class="card gsec reg supitem" id="g-check"${GOPEN.has("check") ? " open" : ""} data-gsec="check"><summary><h3>등기부등본 셀프 점검 <small class="ext">PDF 올려서 점검</small></h3><div class="ext">근저당, 압류, 신탁 같은 위험 신호와 깡통전세 비율</div><span class="supmore">펼쳐 보기</span></summary>
    <div class="ext">인터넷등기소에서 열람(700원)한 등기부 PDF를 올리거나 글자를 붙여 넣으면, 근저당, 압류, 신탁 같은 위험 신호와 깡통전세 비율을 계산해 줘요. 파일은 이 브라우저 안에서만 읽고 어디에도 보내지 않아요.</div>
    <div class="row">
      <label>등기부 PDF<input type="file" id="regFile" accept="application/pdf,.pdf"></label>
      <label>보증금 (만원)<input type="number" id="regDep" min="0" step="100" placeholder="예: 20000" value="${esc(REG.dep)}"></label>
      <label>집 시세나 매매가 (만원)<input type="number" id="regPrice" min="0" step="100" placeholder="예: 30000" value="${esc(REG.price)}"></label>
      <label>계약할 집주인 이름 (선택)<input type="text" id="regOwner" placeholder="이름만" value="${esc(REG.owner)}"></label>
    </div>
    <details class="more"${REG.text && !REG.file ? " open" : ""}><summary>PDF가 안 읽히면: 등기부 글자 붙여 넣기</summary><textarea id="regText" placeholder="등기부 내용을 복사해서 붙여 넣으세요">${esc(REG.file ? "" : REG.text)}</textarea></details>
    <div class="res" id="regRes"></div>
    <div class="src">시세 알아보기: <a href="https://rt.molit.go.kr" target="_blank" rel="noopener">국토부 실거래가 ↗</a>, <a href="https://www.khug.or.kr/jeonse/web/s01/s010102.jsp" target="_blank" rel="noopener">HUG 안심전세앱 ↗</a>, 열람: <a href="https://www.iros.go.kr" target="_blank" rel="noopener">인터넷등기소 ↗</a><br>기준: 전세가율 70% (서울시 안내), 보증금+선순위 80% (HUG 등기부 안내), 90%와 선순위 60% (HUG 반환보증 가입 요건). 참고용 점검이라 법률 판단을 대신하지 않아요.</div></details>`;
  }
  const wonR = (v) => {
    v = Math.round(v / 1e4);
    return v >= 1e4
      ? `${Math.floor(v / 1e4)}억${v % 1e4 ? " " + (v % 1e4).toLocaleString() + "만" : ""}원`
      : `${v.toLocaleString()}만원`;
  };
  function regParse(raw) {
    const t = raw.replace(/\r/g, "").replace(/[ \t ]+/g, " ");
    const out = { addr: "", kind: "", owners: [], gap: [], eul: [], summary: false, jointOwn: false };
    const am = t.match(/\[(집합건물|건물|토지)\]\s*([^\n]+)/);
    if (am) {
      out.kind = am[1];
      out.addr = am[2].trim().slice(0, 80);
    }
    const iG = t.search(/【\s*갑\s*구\s*】/),
      iE = t.search(/【\s*을\s*구\s*】/);
    const iS = t.search(/주요\s*등기사항\s*요약/);
    const end = iS > 0 ? iS : t.length;
    const gapT = iG >= 0 ? t.slice(iG, iE > iG ? iE : end) : "",
      eulT = iE >= 0 ? t.slice(iE, end) : "";
    const G_KEYS = [
      "소유권보존",
      "소유권이전청구권가등기",
      "소유권이전",
      "임의경매개시결정",
      "강제경매개시결정",
      "가압류",
      "압류",
      "가처분",
      "신탁",
      "가등기",
      "공매공고",
      "환매특약",
    ];
    const E_KEYS = [
      "근저당권설정",
      "근저당권변경",
      "근저당권이전",
      "전세권설정",
      "주택임차권",
      "임차권설정",
      "질권",
      "지상권설정",
      "저당권설정",
    ];
    function entries(sec, keys) {
      const res = [],
        killed = new Set();
      for (const m of sec.matchAll(/(\d+(?:-\d+)?)\s*번\s*[^\n]{0,30}?말소/g)) killed.add(m[1]);
      const re = new RegExp(`(?:^|\\n|\\s)(\\d+(?:-\\d+)?)\\s+(${keys.join("|")})(등기)?`, "g");
      const hits = [...sec.matchAll(re)];
      hits.forEach((m, i) => {
        const body = sec.slice(m.index, i + 1 < hits.length ? hits[i + 1].index : sec.length);
        if (/말소/.test(body.slice(0, 40)) && !/^\s*\d+\s+\S+말소/.test(body)) {
        }
        const amt = body.match(/(?:채권최고액|전세금|임차보증금|청구금액)\s*금?\s*([\d,]+)\s*원/);
        const who = body.match(/(?:근저당권자|전세권자|임차권자|권리자|채권자|수탁자)\s+([^\s\d]{2,30})/);
        res.push({
          no: m[1],
          type: m[2],
          amt: amt ? +amt[1].replace(/,/g, "") : null,
          who: who ? who[1] : "",
          dead: killed.has(m[1]),
        });
      });
      return res;
    }
    out.gap = entries(gapT, G_KEYS);
    out.eul = entries(eulT, E_KEYS);
    if (iS > 0) {
      const sum = t.slice(iS);
      const ownSec = sum.split(/2\.\s*소유지분을\s*제외한/)[0];
      const own = [...ownSec.matchAll(/(?:^|\n)\s*([^\n()]{2,30}?)\s*\((소유자|공유자)\)/g)].map((m) => m[1].trim());
      if (own.length) {
        out.owners = [...new Set(own)];
        out.summary = true;
        out.jointOwn = /공유자/.test(ownSec);
      }
      const live = (sec) => new Set([...sec.matchAll(/(?:^|\n|\s)(\d+(?:-\d+)?)\s+[가-힣]+/g)].map((m) => m[1]));
      const p2 = sum.match(/2\.\s*소유지분을\s*제외한[\s\S]*?(?=3\.\s*\(근\)?저당권|$)/),
        p3 = sum.match(/3\.\s*\(근\)?저당권[\s\S]*?(?=\[\s*참\s*고|$)/);
      if (p2) {
        const L = live(p2[0].replace(/^2\./, ""));
        const none = /기록사항\s*없음/.test(p2[0]);
        out.gap.forEach((e) => {
          if (!/소유권(보존|이전)$/.test(e.type)) e.dead = none || !L.has(e.no);
        });
      }
      if (p3) {
        const L = live(p3[0].replace(/^3\./, ""));
        const none = /기록사항\s*없음/.test(p3[0]);
        out.eul.forEach((e) => (e.dead = none || !L.has(e.no)));
      }
    }
    if (!out.owners.length) {
      const own = [...gapT.matchAll(/(소유자|공유자)\s+([가-힣A-Za-z()주식회사]{2,30})/g)];
      const lastNo = [...out.gap].reverse().find((e) => /소유권(보존|이전)$/.test(e.type));
      if (own.length) {
        out.owners = [own[own.length - 1][2]];
        out.jointOwn = own[own.length - 1][1] === "공유자";
      }
      if (lastNo) out.lastOwnNo = lastNo.no;
    }
    return out;
  }
  function regItems(r) {
    const it = [],
      add = (lv, html) => it.push([lv, html]);
    const live = (a) => a.filter((e) => !e.dead);
    const G = live(r.gap),
      E = live(r.eul);
    if (!r.gap.length && !r.eul.length && !r.owners.length)
      return [
        [
          "info",
          "등기부 내용을 찾지 못했어요. 인터넷등기소 '등기사항전부증명서(열람용)' PDF인지 확인하거나 글자를 붙여 넣어 보세요. (스캔 이미지 PDF는 읽을 수 없어요)",
        ],
      ];
    if (r.addr) add("info", `[${esc(r.kind)}] ${esc(r.addr)}`);
    if (r.kind === "토지") add("warn", "토지 등기부예요. 집(건물이나 집합건물) 등기부를 따로 떼 보세요.");
    if (r.owners.length) {
      const nm = REG.owner.trim().replace(/\s/g, "");
      const same = nm && r.owners.some((o) => o.replace(/\s/g, "").includes(nm));
      add(
        nm ? (same ? "ok" : "bad") : "info",
        `현재 소유자: <b>${esc(r.owners.join(", "))}</b>${r.jointOwn ? " (공동소유 → 공유자 모두와 계약하거나 위임장 확인)" : ""}${nm ? (same ? " — 계약할 사람과 같아요." : ` — 계약할 사람(${esc(REG.owner)})과 달라요. 대리인이면 위임장과 인감증명서를 꼭 확인하세요.`) : ""}`,
      );
    }
    const hit = (re) => G.filter((e) => re.test(e.type));
    const trust = hit(/신탁/),
      auction = hit(/경매/),
      seize = hit(/^(가압류|압류|가처분|공매공고)$/),
      prov = hit(/가등기/);
    if (auction.length)
      add(
        "bad",
        `<b>경매개시결정</b>이 있어요 (갑구 ${auction.map((e) => e.no).join(", ")}번). 이미 경매에 넘어간 집이라 계약하면 안 돼요.`,
      );
    if (seize.length)
      add(
        "bad",
        `<b>${[...new Set(seize.map((e) => e.type))].join(", ")}</b>이(가) 있어요 (갑구 ${seize.map((e) => e.no).join(", ")}번). 집주인 빚 문제로 집이 묶여 있어요. 말소되기 전엔 계약하지 마세요.`,
      );
    if (trust.length)
      add(
        "bad",
        `<b>신탁</b> 등기가 있어요 (갑구 ${trust.map((e) => e.no).join(", ")}번). 실제 권리는 신탁회사에 있어서 신탁원부를 떼 보고 신탁회사(수탁자) 동의서 없이는 계약하지 마세요.`,
      );
    if (prov.length)
      add(
        "bad",
        `<b>가등기</b>가 있어요 (갑구 ${prov.map((e) => e.no).join(", ")}번). 나중에 소유자가 바뀔 수 있어 위험해요.`,
      );
    if (!auction.length && !seize.length && !trust.length && !prov.length)
      add(
        "ok",
        "갑구에 압류, 가압류, 가처분, 경매, 신탁, 가등기가 없어요." +
          (r.summary ? "" : " (말소된 기록은 '번 …말소' 표기로 걸렀어요)"),
      );
    const mort = E.filter((e) => /저당권(설정|이전|변경)/.test(e.type)),
      lease = E.filter((e) => /전세권|임차권/.test(e.type)),
      tenantOrder = E.filter((e) => /주택임차권/.test(e.type));
    const mortSum = mort.filter((e) => /설정/.test(e.type)).reduce((a, e) => a + (e.amt || 0), 0),
      leaseSum = lease.reduce((a, e) => a + (e.amt || 0), 0);
    if (tenantOrder.length)
      add(
        "bad",
        `<b>주택임차권등기</b>가 있어요 (을구 ${tenantOrder.map((e) => e.no).join(", ")}번). 이전 세입자가 보증금을 못 돌려받았다는 뜻이에요.`,
      );
    if (mort.length)
      add(
        mortSum ? "warn" : "warn",
        `근저당 ${mort.filter((e) => /설정/.test(e.type)).length}건, 채권최고액 합계 <b>${wonR(mortSum)}</b>${mort[0].who ? ` (${esc([...new Set(mort.map((e) => e.who).filter(Boolean))].slice(0, 3).join(", "))})` : ""}. 경매로 가면 이 금액이 내 보증금보다 먼저 나가요. 잔금일에 말소 조건이면 특약으로 남기세요.`,
      );
    else add("ok", "을구에 살아 있는 근저당이 없어요.");
    if (lease.length && !tenantOrder.length)
      add("warn", `전세권, 임차권 ${lease.length}건 (${wonR(leaseSum)}). 나보다 앞선 보증금이에요.`);
    const killed = r.gap.filter((e) => e.dead).length + r.eul.filter((e) => e.dead).length;
    if (killed) add("info", `말소된 기록 ${killed}건은 빼고 계산했어요.`);
    const dep = +REG.dep * 1e4,
      price = +REG.price * 1e4,
      prior = mortSum + leaseSum;
    if (price > 0) {
      const pr = prior / price,
        tot = (prior + (dep || 0)) / price;
      if (dep) {
        const jr = dep / price;
        add(
          jr > 0.8 ? "bad" : jr > 0.7 ? "warn" : "ok",
          `전세가율(보증금 ÷ 시세) <b>${Math.round(jr * 100)}%</b> — ${jr > 0.8 ? "깡통전세 위험이 커요." : jr > 0.7 ? "서울시 권장(70%)을 넘어요." : "서울시 권장 70% 이내예요."}`,
        );
        const col = tot > 0.9 ? "var(--bad)" : tot > 0.8 ? "var(--warn)" : tot > 0.7 ? "var(--warn)" : "var(--good)";
        add(
          tot > 0.9 ? "bad" : tot > 0.8 ? "bad" : tot > 0.7 ? "warn" : "ok",
          `(선순위 ${wonR(prior)} + 보증금 ${wonR(dep)}) ÷ 시세 ${wonR(price)} = <b>${Math.round(tot * 100)}%</b>
        ${tot > 0.9 ? "— HUG 반환보증 가입 기준(90%)을 넘어서 보증보험이 어려울 수 있어요." : tot > 0.8 ? "— 80%를 넘어서 위험해요. 집값이 조금만 떨어져도 보증금을 다 못 받을 수 있어요." : tot > 0.7 ? "— 80% 이하지만 여유가 크지 않아요." : "— 비교적 여유 있어요."}
        <div class="ratio"><i style="width:${Math.min(100, tot * 100).toFixed(0)}%;background:${col}"></i></div>`,
        );
        if (pr > 0.6)
          add("warn", `선순위 채권만 시세의 ${Math.round(pr * 100)}%예요. HUG 반환보증은 60% 이내여야 가입돼요.`);
      } else
        add("info", `선순위 채권은 시세의 ${Math.round(pr * 100)}%예요. 보증금을 넣으면 깡통전세 비율을 계산해요.`);
    } else
      add(
        "info",
        "보증금과 시세(매매가)를 넣으면 깡통전세 비율을 계산해요. 시세는 국토부 실거래가나 안심전세앱에서 볼 수 있어요.",
      );
    add(
      "info",
      "등기부에 안 나오는 것: 먼저 들어온 다른 세입자 보증금(다가구나 다세대), 집주인 체납 세금. 전입세대 열람, 확정일자 부여현황, 납세증명서를 집주인에게 요청하세요.",
    );
    return it;
  }
  function regRender() {
    const box = document.getElementById("regRes");
    if (!box) return;
    if (REG.busy) {
      box.innerHTML = `<div class="it"><span class="lv info">읽는 중</span><span>PDF를 읽고 있어요…</span></div>`;
      return;
    }
    if (REG.err) {
      box.innerHTML = `<div class="it"><span class="lv warn">확인</span><span>${esc(REG.err)}</span></div>`;
      return;
    }
    if (!REG.text.trim()) {
      box.innerHTML = "";
      return;
    }
    const LV = { bad: "위험", warn: "주의", ok: "양호", info: "참고" };
    box.innerHTML =
      (REG.file ? `<div class="ext">${esc(REG.file)} 읽음</div>` : "") +
      regItems(regParse(REG.text))
        .map(([lv, h]) => `<div class="it"><span class="lv ${lv}">${LV[lv]}</span><span>${h}</span></div>`)
        .join("");
  }
  let pdfjsP = null;
  function loadPdfJs() {
    if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
    if (pdfjsP) return pdfjsP;
    const base = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/";
    pdfjsP = new Promise((ok, bad) => {
      const sc = document.createElement("script");
      sc.src = base + "pdf.min.js";
      sc.onload = () => {
        try {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = base + "pdf.worker.min.js";
        } catch (_) {}
        ok(window.pdfjsLib);
      };
      sc.onerror = () => {
        pdfjsP = null;
        bad(new Error("PDF 읽기 도구를 불러오지 못했어요"));
      };
      document.head.appendChild(sc);
    });
    return pdfjsP;
  }
  async function pdfText(buf) {
    const lib = await loadPdfJs();
    let doc;
    try {
      doc = await lib.getDocument({ data: buf.slice(0) }).promise;
    } catch (e) {
      const w = new Worker(
        URL.createObjectURL(
          new Blob([`importScripts("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js")`], {
            type: "text/javascript",
          }),
        ),
      );
      doc = await lib.getDocument({ data: buf.slice(0), worker: lib.PDFWorker.fromPort({ port: w }) }).promise;
    }
    let out = "";
    for (let i = 1; i <= Math.min(doc.numPages, 40); i++) {
      const tc = await (await doc.getPage(i)).getTextContent();
      let lastY = null,
        lastX = 0;
      for (const it of tc.items) {
        const y = Math.round(it.transform[5]),
          x = it.transform[4],
          fs = Math.abs(it.transform[0]) || 8;
        if (lastY !== null && Math.abs(y - lastY) > 2) out += "\n";
        else if (lastY !== null && x - lastX > fs * 0.3) out += " ";
        out += it.str;
        lastY = y;
        lastX = x + (it.width || 0);
      }
      out += "\n";
    }
    return out;
  }
  document.addEventListener("input", (e) => {
    const id = e.target.id;
    if (id === "regDep") REG.dep = e.target.value;
    else if (id === "regPrice") REG.price = e.target.value;
    else if (id === "regOwner") REG.owner = e.target.value;
    else if (id === "regText") {
      REG.text = e.target.value;
      REG.file = "";
      REG.err = "";
    } else return;
    regRender();
  });
  document.addEventListener("change", (e) => {
    if (e.target.id !== "placeOn") return;
    $("#placeWrap").hidden = !e.target.checked;
    if (!e.target.checked) {
      MAILPLACE = "";
      $("#mailPlace").value = "";
    } else $("#mailPlace").focus();
  });
  document.addEventListener("change", async (e) => {
    if (e.target.id !== "regFile" || !e.target.files[0]) return;
    const f = e.target.files[0];
    REG.busy = true;
    REG.err = "";
    regRender();
    try {
      const t = await pdfText(await f.arrayBuffer());
      REG.text = t;
      REG.file = f.name;
      const ta = document.getElementById("regText");
      if (ta) ta.value = "";
      if (t.replace(/\s/g, "").length < 50)
        REG.err = "PDF에서 글자를 거의 찾지 못했어요 (스캔 이미지일 수 있어요). 아래 '글자 붙여 넣기'를 써 보세요.";
    } catch (err) {
      REG.err = (err && err.message ? err.message : "PDF를 읽지 못했어요") + ". 아래 '글자 붙여 넣기'를 써 보세요.";
    }
    REG.busy = false;
    regRender();
  });
  let SUPAUD = "전체",
    SUPKIND = "",
    SUPOPEN = new Set(),
    GOPEN = new Set();
  let MAILNAME = "",
    MAILPLACE = "",
    MAILADDR = "";
  const FORM_ENDPOINT = "https://formsubmit.co/ajax/c846bca72e4de837bb97d901f1aaff8f";
  function mailOpts() {
    const d = DEFAULTS(),
      o = [],
      same = (a, b) => a.length === b.length && a.every((x) => b.includes(x)),
      h = S.h;
    const man = (v) => Math.floor(v / 1e4) + "만",
      eok = (v) => +(v / 1e8).toFixed(2) + "억";
    const lbl = (k, v) => (ME_OPTS[k].find(([x]) => String(x) === String(v)) || [0, ""])[1];
    if (!same(S.gus, d.gus)) {
      if (S.gus.length && S.gus.length <= 12) o.push(["구=" + S.gus.join(","), `지역: ${S.gus.join(", ")}`]);
      else {
        const ex = ALL_GU.filter((g) => !S.gus.includes(g));
        o.push(["제외구=" + (ex.join(",") || "없음"), `공고 알림 제외 지역: ${ex.join(", ") || "없음"}`]);
      }
    }
    if (linesOn() && S.lines.length) o.push(["노선=" + S.lines.join(","), `역 1km 안 노선: ${S.lines.join(", ")}`]);
    if (!same(S.htype, d.htype)) o.push(["유형=" + S.htype.join(","), `주택 유형: ${S.htype.join(", ")}`]);
    if (!same(S.target, d.target)) o.push(["대상=" + S.target.join(","), `신청 대상: ${S.target.join(", ")}`]);
    if (h.maxRent) o.push(["월세<=" + man(h.maxRent), `월세 ${won(h.maxRent)} 이하`]);
    if (h.maxDep)
      o.push(["보증금<=" + (h.maxDep >= 1e8 ? eok(h.maxDep) : man(h.maxDep)), `보증금 ${won(h.maxDep)} 이하`]);
    if (h.minM2) o.push(["면적>=" + h.minM2, `전용면적 ${h.minM2}㎡ 이상`]);
    if (h.rooms) o.push(["방>=" + h.rooms, `방 ${h.rooms}개 이상`]);
    if (S.gender.includes("여성전용")) o.push(["여성전용=포함", "여성전용 공고도 받기"]);
    const m = S.me;
    if (m.inc) o.push(["소득<=" + (m.inc > 1e9 ? "999만" : man(m.inc)), `본인 소득 ${lbl("inc", m.inc)}`]);
    if (m.asset) o.push(["자산<=" + (m.asset > 1e11 ? "99억" : eok(m.asset)), `총자산 ${lbl("asset", m.asset)}`]);
    if (m.car) o.push(["자동차=" + { none: "없음", low: "이하", high: "초과" }[m.car], `자동차 ${lbl("car", m.car)}`]);
    if (m.home)
      o.push([
        "세대=" + { alone: "혼자", fam0: "가족무주택", fam1: "부모님집" }[m.home],
        `주민등록 세대: ${lbl("home", m.home)}`,
      ]);
    return o;
  }
  function subSummary() {
    const ex = ALL_GU.filter((g) => !S.gus.includes(g)),
      tx = TARGET_ALL.filter((t) => !S.target.includes(t));
    const o = [
      ex.length
        ? S.gus.length <= 12
          ? `지역: ${S.gus.join(", ")}`
          : `공고 알림 제외 지역: ${ex.join(", ")}`
        : "지역: 서울 전체",
    ];
    if (tx.length) o.push(`공고 알림 제외 대상: ${tx.join(", ")}`);
    if (!S.gender.includes("여성전용")) o.push("여성전용 공고 알림 제외");
    mailOpts()
      .filter(([k]) => !/^(구|제외구|대상|여성전용)=/.test(k))
      .forEach((x) => o.push(x[1]));
    return o;
  }
  function repoIssueUrl() {
    const h = location.hostname;
    if (!h.endsWith(".github.io")) return "";
    const repo = location.pathname.split("/").filter(Boolean)[0];
    return `https://github.com/${h.split(".")[0]}/${repo ? repo + "/" : ""}issues/new`;
  }
  function renderSub() {
    const il = $("#issueLink");
    if (il) {
      const u = repoIssueUrl();
      u ? il.setAttribute("href", u) : il.removeAttribute("href");
    }
    const el = $("#subConds");
    if (!el) return;
    const pk = $("#subPick");
    if (pk) {
      const chip = (attrs, on, label, extra = "") =>
        `<button class="chip" ${attrs} aria-pressed="${on}">${label}${extra}</button>`;
      const row = (title, body, more = "") =>
        `<div class="group"><span class="lbl">${title}${more}</span><div class="chips">${body}</div></div>`;
      const meRow = (key) =>
        ME_OPTS[key]
          .map(([v, t]) =>
            chip(
              `data-me="${key}" data-mev="${v}"`,
              String(S.me[key]) === String(v),
              esc(t.replace(/ \((?=[^)]*\d)[^)]*\)$/, "")),
            ),
          )
          .join("");
      pk.innerHTML =
        row(
          "공공 / 민간",
          ["공공", "민간"].map((v) => chip(`data-k="sector" data-v="${v}"`, S.sector.includes(v), v + "임대")).join(""),
        ) +
        row(
          "지역",
          ALL_GU.map((g) =>
            chip(
              `data-k="gus" data-v="${g}"`,
              S.gus.includes(g),
              esc(g.replace(/구$/, "")),
              REC_GU.includes(g) ? ' <span class="rec">권장 제외</span>' : "",
            ),
          ).join(""),
          ` <small><button class="link" id="subGuAll">전체</button> / <button class="link" id="subGuRec">권장대로</button></small>`,
        ) +
        row(
          "알림 받을 신청 대상",
          TARGET_ALL.map((v) => chip(`data-k="target" data-v="${esc(v)}"`, S.target.includes(v), esc(v))).join(""),
          " <small>끈 대상 전용 공고는 알림에서 빠져요</small>",
        ) +
        row(
          "여성전용 공고",
          chip('data-subwomen="on"', S.gender.includes("여성전용"), "알림 받기") +
            chip('data-subwomen="off"', !S.gender.includes("여성전용"), "알림 제외"),
        ) +
        row("전세 / 월세", ["전세", "월세"].map((v) => chip(`data-hl="${v}"`, S.h.lease.includes(v), v)).join("")) +
        row(
          "보증금",
          DEP_OPTS.map(([v, t]) => chip(`data-h="maxDep" data-val="${v}"`, S.h.maxDep === v, v ? t + " 이하" : t)).join(
            "",
          ),
        ) +
        row(
          "월세",
          RENT_OPTS.map(([v, t]) =>
            chip(`data-h="maxRent" data-val="${v}"`, S.h.maxRent === v, v ? t + " 이하" : t),
          ).join(""),
        ) +
        row("본인 소득", meRow("inc"), " <small>고르지 않아도 돼요</small>") +
        row("총자산", meRow("asset")) +
        row("자동차", meRow("car")) +
        row("주민등록 세대", meRow("home"));
    }
    el.innerHTML = subSummary()
      .map((x) => `<li>${esc(x)}</li>`)
      .join("");
    const sb = $("#mailSend");
    sb.disabled = !FORM_ENDPOINT || !!MAILSENT;
    sb.textContent = MAILSENT ? "신청 완료" : "구독 신청";
    sb.classList.toggle("done", !!MAILSENT);
    if (!FORM_ENDPOINT && !$("#mailCopied").textContent)
      $("#mailCopied").textContent = "구독 신청 받기를 준비하고 있어요.";
  }
  document.addEventListener("input", (e) => {
    const id = e.target.id;
    if (id === "mailName") MAILNAME = e.target.value;
    else if (id === "mailPlace") MAILPLACE = e.target.value;
    else if (id === "mailAddr") {
      MAILADDR = e.target.value;
      if (MAILSENT && MAILADDR.trim() !== MAILSENT) {
        MAILSENT = "";
        $("#mailCopied").textContent = "";
        $("#mailCopied").classList.remove("mailok");
        renderSub();
      }
    } else return;
  });
  document.addEventListener(
    "toggle",
    (e) => {
      const el = e.target;
      if (el.classList && el.classList.contains("supitem")) {
        const set = el.dataset.gsec ? GOPEN : SUPOPEN,
          id = el.dataset.gsec || el.dataset.supcard;
        el.open ? set.add(id) : set.delete(id);
      }
    },
    true,
  );
  let FSEC = "sector";
  function showFsec(k, keep) {
    FSEC = k;
    document.querySelectorAll(".fpanel .fsec").forEach((el) => el.classList.toggle("show", el.dataset.sec === k));
    document.querySelectorAll(".fbtn").forEach((b) => b.setAttribute("aria-expanded", String(b.dataset.fsec === k)));
    $("#fpanel").hidden = !k;
  }
  function fdots() {
    const d = DEFAULTS(),
      same = (a, b) => a.length === b.length && a.every((x) => b.includes(x));
    const on = {
      sector: S.sector.length !== 2,
      gu: !same(S.gus, d.gus),
      line: S.lines.length < LINES.length || S.stations.length > 0,
      house:
        JSON.stringify({ ...S.h, ref: "" }) !== JSON.stringify({ ...d.h, ref: "" }) ||
        !same(S.gender, d.gender) ||
        !!S.h.ref,
      me: meOn(),
      cat:
        !same(S.status, d.status) ||
        !same(S.kind, d.kind) ||
        !same(S.htype, d.htype) ||
        !same(S.target, d.target) ||
        !same(S.source, d.source),
    };
    Object.entries(on).forEach(([k, v]) => {
      const el = document.getElementById("fdot-" + k);
      if (el) el.classList.toggle("on", v);
    });
    const hn = [
      d.h.lease.length !== S.h.lease.length,
      S.h.maxDep,
      S.h.maxRent,
      S.h.minM2,
      S.h.rooms,
      S.h.stMax,
      S.h.ev,
      S.h.badge,
      S.h.star,
      S.h.ref,
      !same(S.gender, d.gender),
    ].filter(Boolean).length;
    const val = {
      sector: S.sector.length === 2 ? "둘 다" : S.sector.length ? S.sector[0] + "만" : "없음",
      gu: S.gus.length === ALL_GU.length ? "전체" : `${S.gus.length}개 구`,
      line: S.stations.length
        ? S.stations.slice(0, 2).join(", ") + (S.stations.length > 2 ? " 외" : "") + " 주변"
        : S.lines.length < LINES.length
          ? `${S.lines.length}개 노선`
          : "전체",
      house: hn ? `${hn}개 조건` : "전체",
      me: meOn() ? "설정함" : "안 정함",
      cat: on.cat ? "바꿈" : "기본",
      sub: "신청",
    };
    Object.entries(val).forEach(([k, v]) => {
      const el = document.getElementById("fv-" + k);
      if (el) el.textContent = v;
    });
  }
  let MAILSENT = "";
  async function mailSubmit(btn) {
    const out = $("#mailCopied"),
      nm = MAILNAME.trim(),
      em = MAILADDR.trim();
    if (!FORM_ENDPOINT) {
      out.textContent = "구독 신청 받기를 준비하고 있어요.";
      return;
    }
    if ($("#mailHoney").value) return;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) {
      out.textContent = "받을 이메일을 확인해 주세요.";
      $("#mailAddr").focus();
      return;
    }
    const o = mailOpts();
    const code = [nm ? "이름=" + nm.replace(/[;|]/g, "") : ""]
      .concat(o.map((x) => x[0]))
      .filter(Boolean)
      .join("; ");
    btn.disabled = true;
    btn.textContent = "보내는 중…";
    out.classList.remove("mailok");
    out.textContent = "";
    try {
      const r = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          _subject: "[JH Home] 메일링 구독 신청" + (nm ? " - " + nm : ""),
          "이름": nm,
          email: em,
          "조건": subSummary().join(" / "),
          "등록용 한 줄": code ? `${em} | ${code}` : em,
          ...(MAILPLACE.trim() ? { "지도에 추가할 곳": MAILPLACE.trim() } : {}),
          _template: "table",
          _captcha: "false",
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || String(j.success) !== "true") throw new Error(j.message || r.status);
      MAILSENT = em;
      out.classList.add("mailok");
      out.textContent = `신청이 전송됐어요. 운영자가 등록하면 다음 날 새벽 5시 업데이트부터 ${em}로 메일이 가요.`;
      renderSub();
    } catch (e) {
      out.textContent = "보내지 못했어요. 잠시 뒤에 다시 눌러 주세요.";
      btn.disabled = false;
      btn.textContent = "구독 신청";
    }
  }
  function selectText(el) {
    const r = document.createRange();
    r.selectNodeContents(el);
    const sel = getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
  }
  function toggleArr(a, v) {
    const i = a.indexOf(v);
    i >= 0 ? a.splice(i, 1) : a.push(v);
  }
  document.addEventListener("click", (e) => {
    const pl = e.target.closest("#map [data-place]");
    if (pl) {
      S.h.ref = S.h.ref === pl.dataset.place ? "" : pl.dataset.place;
      $("#refStation").value = S.h.ref;
      if (S.h.ref && S.view === "house") S.sort.house = "ref";
      render();
      return;
    }
    const t = e.target.closest("button, path.gu, circle.pin");
    if (!t) return;
    const d = t.dataset;
    if (t.matches("path.gu")) {
      zoomGu = zoomGu === d.gu ? null : d.gu;
      VIEW = zoomGu ? clampView(guView(zoomGu)) : null;
      selPin = null;
      render();
      return;
    }
    if (t.id === "zIn") {
      zoomCenter(1.6);
      return;
    }
    if (t.id === "zOutBtn") {
      zoomCenter(1 / 1.6);
      return;
    }
    if (t.id === "zFit") {
      setView(null, true);
      return;
    }
    if (t.matches("circle.pin")) {
      const ids = d.pin.split("\u0001");
      selPin = selPin && selPin.ids[0] === ids[0] ? null : { ids };
      render();
      $("#sel").scrollIntoView({ block: "nearest", behavior: "smooth" });
      return;
    }
    if (d.view) {
      const fromCard = !!t.closest(".card");
      S.view = d.view;
      selPin = null;
      render();
      const gid = d.goto || (fromCard ? "g-move" : "");
      if (gid) {
        const g = document.getElementById(gid);
        if (g) {
          if (g.tagName === "DETAILS") g.open = true;
          const dt = g.closest("details");
          if (dt) dt.open = true;
          const inp = g.tagName === "INPUT";
          g.scrollIntoView({ block: inp ? "center" : "start" });
          if (inp) g.focus();
        }
      }
      return;
    }
    if (d.star) {
      STARS.has(d.star) ? STARS.delete(d.star) : STARS.add(d.star);
      t.setAttribute("aria-pressed", STARS.has(d.star));
      save();
      if (S.h.star) render(true);
      return;
    }
    if (d.k) {
      toggleArr(S[d.k], d.v);
      render();
      return;
    }
    if (d.clear) {
      S[d.clear] = [];
      if (d.clear === "gus") {
        zoomGu = null;
        VIEW = null;
      }
      render();
      return;
    }
    if (d.h) {
      S.h[d.h] = +d.val;
      render();
      return;
    }
    if (d.sup) {
      S.sup = d.sup;
      S.view = "house";
      if (!S.status.includes("마감")) S.status.push("마감");
      render();
      return;
    }
    if (d.ev !== undefined) {
      S.h.ev = d.ev;
      render();
      return;
    }
    if (d.me) {
      const v = d.mev;
      S.me[d.me] = d.me === "inc" || d.me === "asset" ? +v : v;
      render();
      return;
    }
    if (t.id === "gAll") {
      const ids = [...GUIDES.map((g) => g.id), "check"];
      const all = ids.every((i) => GOPEN.has(i));
      ids.forEach((i) => (all ? GOPEN.delete(i) : GOPEN.add(i)));
      render(true);
      return;
    }
    if (t.id === "icsCopy") {
      const u = t.dataset.ics;
      (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject())
        .then(() => (t.textContent = "주소를 복사했어요"))
        .catch(() => prompt("이 주소를 복사하세요", u));
      return;
    }
    if (d.subwomen) {
      const on = d.subwomen === "on";
      S.gender = S.gender.filter((g) => g !== "여성전용");
      if (on) S.gender.push("여성전용");
      render();
      return;
    }
    if (t.id === "subGuAll") {
      S.gus = [...ALL_GU];
      render();
      return;
    }
    if (t.id === "subGuRec") {
      S.gus = ALL_GU.filter((g) => !REC_GU.includes(g));
      render();
      return;
    }
    if (t.id === "supAll") {
      const ids = [...document.querySelectorAll(".supitem")].map((x) => x.dataset.supcard);
      const all = ids.every((i) => SUPOPEN.has(i));
      ids.forEach((i) => (all ? SUPOPEN.delete(i) : SUPOPEN.add(i)));
      render(true);
      return;
    }
    if (d.supaud !== undefined) {
      SUPAUD = d.supaud;
      render(true);
      return;
    }
    if (d.supkind !== undefined) {
      SUPKIND = d.supkind;
      render(true);
      return;
    }
    if (d.fsec) {
      showFsec(FSEC === d.fsec ? "" : d.fsec);
      return;
    }
    if (t.id === "fClose") {
      showFsec("");
      return;
    }
    if (t.id === "mailSend") {
      mailSubmit(t);
      return;
    }
    if (t.id === "askPlace") {
      showFsec("sub", true);
      const cb = $("#placeOn");
      if (!cb.checked) {
        cb.checked = true;
        $("#placeWrap").hidden = false;
      }
      $("#subPanel").scrollIntoView({ block: "center" });
      $("#mailPlace").focus();
      return;
    }
    if (t.id === "meReset") {
      S.me = DEFAULTS().me;
      render();
      return;
    }
    if (t.id === "meShow") {
      S.me.show = !S.me.show;
      render(true);
      return;
    }
    if (d.hl) {
      toggleArr(S.h.lease, d.hl);
      render();
      return;
    }
    if (d.hoff) {
      S.h[d.hoff] = typeof S.h[d.hoff] === "boolean" ? false : 0;
      render();
      return;
    }
    if (d.supview) {
      S.view = "sup";
      render();
      setTimeout(() => {
        const el = document.querySelector(`[data-supcard="${d.supview}"]`);
        if (el) el.scrollIntoView({ block: "start", behavior: "smooth" });
      }, 50);
      return;
    }
    if (d.placet) {
      S.hidePlaces = S.hidePlaces || [];
      toggleArr(S.hidePlaces, d.placet);
      renderMap();
      save();
      return;
    }
    if (d.stoff) {
      S.stations = S.stations.filter((x) => x !== d.stoff);
      render();
      return;
    }
    if (t.id === "sectorBoth") {
      S.sector = ["공공", "민간"];
      render();
      return;
    }
    if (t.id === "supOff") {
      S.sup = "";
      render();
      return;
    }
    if (t.id === "zoomOut") {
      zoomGu = null;
      VIEW = null;
      render();
      return;
    }
    if (t.id === "zoomOut2") {
      zoomGu = null;
      render();
      return;
    }
    if (t.id === "guAll") {
      S.gus = [...ALL_GU];
      render();
      return;
    }
    if (t.id === "guRec") {
      S.gus = ALL_GU.filter((g) => !REC_GU.includes(g));
      render();
      return;
    }
    if (t.id === "lineAll" || t.id === "lineAll2") {
      S.lines = [...LINES];
      render();
      return;
    }
    if (t.id === "lineNone") {
      S.lines = [];
      render();
      return;
    }
    if (t.id === "clearPin") {
      selPin = null;
      render();
      return;
    }
    if (t.id === "moreBtn") {
      shown += PAGE;
      render(true);
      return;
    }
    if (t.id === "resetCats") {
      const df = DEFAULTS();
      ["sector", "source", "htype", "target", "status", "kind"].forEach((k) => (S[k] = df[k]));
      render();
      return;
    }
    if (t.id === "resetHouse") {
      S.h = { ...DEFAULTS().h, ref: S.h.ref };
      render();
      return;
    }
    if (t.id === "resetAll2") {
      $("#resetAll") && $("#resetAll").click();
      return;
    }
    if (t.id === "resetAll") {
      const df = DEFAULTS();
      Object.assign(S, { ...df, view: S.view, sort: S.sort, h: { ...df.h, ref: S.h.ref }, mapStations: S.mapStations });
      $("#q").value = "";
      zoomGu = null;
      VIEW = null;
      selPin = null;
      render();
      return;
    }
    if (t.id === "clearAll") {
      const df = DEFAULTS();
      ["status", "kind"].forEach((k) => (S[k] = []));
      S.sector = ["공공", "민간"];
      S.gus = [...ALL_GU];
      S.lines = [...LINES];
      S.htype = [...HTYPE_ALL];
      S.source = Object.keys(SOURCES);
      S.target = [...TARGET_ALL];
      S.gender = [...GENDERS];
      S.stations = [];
      S.h = { ...df.h, ref: S.h.ref };
      S.q = "";
      $("#q").value = "";
      zoomGu = null;
      VIEW = null;
      selPin = null;
      render();
      return;
    }
  });
  document.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && e.target.matches("path.gu")) {
      e.preventDefault();
      e.target.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }
  });
  document.addEventListener("change", (e) => {
    const t = e.target;
    const hmap = { "h-badge": "badge", "h-star": "star", "h-unknown": "unknown" };
    if (hmap[t.id]) {
      S.h[hmap[t.id]] = t.checked;
      render();
    }
    if (t.id === "mapPl") {
      S.mapPlaces = t.checked;
      renderMap();
      save();
    }
    if (t.id === "mapSt") {
      S.mapStations = t.checked;
      renderMap();
      save();
    }
    if (t.id === "sort") {
      S.sort[S.view] = t.value;
      render();
    }
    if (t.id === "stSearch") {
      const v = t.value.trim().replace(/역$/, "");
      if (STATIONS[v] && !S.stations.includes(v)) {
        S.stations.push(v);
      }
      t.value = "";
      render();
    }
    if (t.id === "refStation") {
      const v = t.value.trim();
      S.h.ref = placeOf(v) ? v : v.replace(/역$/, "");
      if (refPt() && S.view === "house") S.sort.house = "ref";
      render();
    }
  });
  let qt;
  $("#q").addEventListener("input", (e) => {
    clearTimeout(qt);
    qt = setTimeout(() => {
      S.q = e.target.value.trim();
      render();
    }, 150);
  });
  async function boot() {
    const emb = document.getElementById("embedded-data");
    try {
      if (emb) {
        const d = JSON.parse(emb.textContent);
        DATA = d.data;
        MAP = d.map;
        STATIONS = d.stations.stations;
        STLINES = d.stations.lines || {};
        window.__routes = d.stations.routes || {};
        PLACES = (d.places || {}).places || [];
      } else {
        const get = (u) =>
          fetch(u, { cache: "no-cache" }).then((r) => {
            if (!r.ok) throw new Error(`${u} ${r.status}`);
            return r.json();
          });
        const [d, m, s, pl] = await Promise.all([
          get("data/notices.json"),
          get("data/seoul-gu.json"),
          get("data/stations.json").catch(() => ({ stations: {} })),
          get("data/places.json").catch(() => ({ places: [] })),
        ]);
        DATA = d;
        MAP = m;
        STATIONS = s.stations;
        STLINES = s.lines || {};
        window.__routes = s.routes || {};
        PLACES = pl.places || [];
      }
    } catch (err) {
      $("#list").innerHTML =
        location.protocol === "file:"
          ? `<div class="empty">파일을 바로 열면 데이터를 불러오지 못해요. 이 폴더에서 <code>python -m http.server 8000</code>을 실행하고 <code>http://localhost:8000</code>으로 열어 주세요.</div>`
          : `<div class="empty">공고 데이터를 불러오지 못했어요 (${esc(err.message)}). 잠시 뒤 새로고침해 보세요.</div>`;
      return;
    }
    DATA.notices.forEach(prep);
    buildHouses();
    $("#refList").innerHTML =
      PLACES.map((p) => `<option value="${esc(p.short)}">${esc(p.name)} (${esc(p.kind)})</option>`).join("") +
      Object.keys(STATIONS)
        .sort((a, b) => a.localeCompare(b, "ko"))
        .map((s) => `<option value="${esc(s)}"></option>`)
        .join("");
    $("#stationList").innerHTML = Object.keys(STATIONS)
      .sort((a, b) => a.localeCompare(b, "ko"))
      .map((s) => `<option value="${esc(s)}"></option>`)
      .join("");
    try {
      const qp = new URLSearchParams(location.search);
      if (qp.get("q")) {
        S.q = qp.get("q");
        if (!S.status.includes("마감")) S.status.push("마감");
      }
      if (["house", "notice", "cal", "sup"].includes(qp.get("view"))) S.view = qp.get("view");
    } catch (e) {}
    $("#q").value = S.q;
    $("#refStation").value = S.h.ref;
    renderHealth();
    render();
  }
  boot();
})();
