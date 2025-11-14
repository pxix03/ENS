/* ===== 선수 데이터 ===== */
const playerData = {
  "NBA": [
    {
      name: "르브론 제임스",
      img: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&w=400&q=80",
      desc: "르브론 간단 설명..."
    },
    {
      name: "스테판 커리",
      img: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&w=400&q=80",
      desc: "커리 간단 설명..."
    },
    {
      name: "케빈 듀란트",
      img: "https://images.unsplash.com/photo-1502877338535-766e3563c3ad?auto=format&w=400&q=80",
      desc: "듀란트 간단 설명..."
    }
  ],

  "FC": [
    {
      name: "모하메드 살라",
      img: "https://images.unsplash.com/photo-1508780709619-79562169bc64?auto=format&w=400&q=80",
      desc: "살라 설명..."
    },
    {
      name: "엘링 홀란드",
      img: "https://images.unsplash.com/photo-1508780709619-79562169bc64?auto=format&w=400&q=80",
      desc: "홀란드 설명..."
    },
    {
      name: "콜 파머",
      img: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&w=400&q=80",
      desc: "파머 설명..."
    }
  ],

  "E-스포츠": [
    {
      name: "페이커",
      img: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&w=400&q=80",
      desc: "페이커 설명..."
    },
    {
      name: "데프트",
      img: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&w=400&q=80",
      desc: "데프트 설명..."
    }
  ]
};

/* ===== 쇼핑 데이터 ===== */
const shopData = [
  {
    name: "농구공",
    price: "₩29,000",
    img: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&w=500&q=80",
    desc: "프리미엄 농구공"
  },
  {
    name: "축구 유니폼",
    price: "₩49,000",
    img: "https://images.unsplash.com/photo-1508780709619-79562169bc64?auto=format&w=500&q=80",
    desc: "홈 유니폼 정품"
  },
  {
    name: "게이밍 헤드셋",
    price: "₩79,000",
    img: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&w=500&q=80",
    desc: "프로 사용 게이밍 헤드셋"
  },
  {
    name: "손목 보호대",
    price: "₩15,000",
    img: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&w=500&q=80",
    desc: "스포츠 손목 보호대"
  },
  {
    name: "축구화",
    price: "₩89,000",
    img: "https://images.unsplash.com/photo-1502877338535-766e3563c3ad?auto=format&w=500&q=80",
    desc: "경량 프로 축구화"
  },
  {
    name: "농구 유니폼",
    price: "₩39,000",
    img: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&w=500&q=80",
    desc: "NBA 스타일 유니폼"
  }
];

/* ===== 경기 데이터 ===== */
const gameData = [
  {
    type: "NBA",
    name: "LA 레이커스 vs 골든스테이트",
    date: "2024-02-20",
    img: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&w=500&q=80",
    desc: "NBA 정규 시즌 경기!"
  },
  {
    type: "NBA",
    name: "밀워키 vs 보스턴",
    date: "2024-03-11",
    img: "https://images.unsplash.com/photo-1502877338535-766e3563c3ad?auto=format&w=500&q=80",
    desc: "동부컨퍼런스 라이벌전!"
  },
  {
    type: "FC",
    name: "리버풀 vs 맨시티",
    date: "2024-04-01",
    img: "https://images.unsplash.com/photo-1508780709619-79562169bc64?auto=format&w=500&q=80",
    desc: "EPL 최고의 빅매치!"
  },
  {
    type: "FC",
    name: "바르셀로나 vs 레알 마드리드",
    date: "2024-04-18",
    img: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&w=500&q=80",
    desc: "엘클라시코 매치"
  },
  {
    type: "E-스포츠",
    name: "T1 vs GEN",
    date: "2025-03-03",
    img: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&w=500&q=80",
    desc: "LCK 스프링 결승전"
  },
  {
    type: "NBA",
    name: "애틀랜타 vs 인디애나",
    date: "2025-11-01",
    status: "경기종료",
    homeScore: 128,
    awayScore: 108,
    venue: "게인브릿지 필드하우스",
    homeRecord: { points: 128, rebounds: 45, assists: 28, steals: 7, threes: 16 },
    awayRecord: { points: 108, rebounds: 39, assists: 22, steals: 5, threes: 13 },
    img: "...",
    desc: "초박빙 승부 끝에 애틀랜타 승리!"
  }
];

/* ===== 리그별 순위 데이터(예시) ===== */
/* 사진 느낌만 내는 예시 데이터라 숫자는 대충 넣어둠 */
const standingsData = {
  "NBA": [
    { rank: 1, team: "보스턴",   win: 8, draw: 2, loss: 1, gf: 25, ga: 10, form: "승 승 무 승 패" },
    { rank: 2, team: "밀워키",   win: 8, draw: 1, loss: 2, gf: 24, ga: 12, form: "승 승 패 승 승" },
    { rank: 3, team: "덴버",     win: 7, draw: 2, loss: 2, gf: 23, ga: 15, form: "무 승 승 패 승" },
    { rank: 4, team: "LA 레이커스", win: 6, draw: 3, loss: 2, gf: 21, ga: 17, form: "승 무 승 무 패" },
    { rank: 5, team: "골든스테이트", win: 6, draw: 2, loss: 3, gf: 22, ga: 19, form: "패 승 승 승 패" }
  ],
  "FC": [
    { rank: 1, team: "아스널",   win: 8, draw: 2, loss: 1, gf: 23, ga: 8,  form: "승 승 승 무 승" },
    { rank: 2, team: "맨시티",   win: 7, draw: 3, loss: 1, gf: 21, ga: 9,  form: "승 무 승 승 무" },
    { rank: 3, team: "리버풀",   win: 7, draw: 2, loss: 2, gf: 20, ga: 11, form: "승 패 승 승 승" },
    { rank: 4, team: "첼시",     win: 6, draw: 3, loss: 2, gf: 18, ga: 12, form: "무 승 승 무 승" },
    { rank: 5, team: "토트넘",   win: 6, draw: 2, loss: 3, gf: 19, ga: 14, form: "패 승 무 승 패" }
  ],
  "E-스포츠": [
    { rank: 1, team: "T1",       win: 9, draw: 0, loss: 2, gf: 19, ga: 7,  form: "승 승 승 패 승" },
    { rank: 2, team: "GEN",      win: 8, draw: 0, loss: 3, gf: 18, ga: 9,  form: "패 승 승 승 패" },
    { rank: 3, team: "KT",       win: 7, draw: 0, loss: 4, gf: 16, ga: 11, form: "승 패 승 승 패" },
    { rank: 4, team: "HLE",      win: 6, draw: 0, loss: 5, gf: 15, ga: 13, form: "승 승 패 패 승" },
    { rank: 5, team: "DRX",      win: 4, draw: 0, loss: 7, gf: 11, ga: 18, form: "패 패 승 패 패" }
  ]
};
