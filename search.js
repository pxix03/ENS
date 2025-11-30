// search.js - 한정헌
// - 상단 공통 검색창(globalSearch)에 입력한 키워드를 기준으로
//   선수 / 상품 / 경기 / 커뮤니티 글을 한 번에 검색해서
//   #searchResultBox 안에 카드 형태로 보여주는 스크립트

document.addEventListener("DOMContentLoaded", () => {
  // 공통 헤더에 있는 검색 input 요소
  const input = document.getElementById("globalSearch");
  // 검색 결과를 보여줄 박스(툴팁 형태 카드 모음)
  const box = document.getElementById("searchResultBox");

  // 이 두 요소가 없으면 검색 기능을 동작시키지 않고 바로 종료
  if (!input || !box) return;

  // === 공통 유틸 ===

  /**
   * 검색용 문자열 정규화 함수
   * - 소문자로 변환
   * - 공백 제거
   * - 하이픈(-) 제거 → "E-스포츠" / "E 스포츠" / "e스포츠" 등을 통합
   */
  const normalize = (str) => {
    if (!str) return "";
    return String(str)
      .toLowerCase()
      .replace(/\s+/g, "")   // 모든 공백 제거
      .replace(/-/g, "");    // 하이픈 제거
  };

  /**
   * 디바운스 유틸
   * - 입력이 계속 들어올 때, 일정 시간(delay) 동안 추가 입력이 없을 때만
   *   실제 함수(fn)를 실행하도록 하는 래퍼
   * - 검색처럼 입력이 자주 바뀌는 이벤트에 사용하면 성능 개선에 도움
   */
  const debounce = (fn, delay = 250) => {
    let timer;
    // 호출되는 래퍼 함수
    return (...args) => {
      // 이전에 예약된 타이머 제거
      clearTimeout(timer);
      // delay만큼 기다렸다가 fn 실행
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  // === 데이터 미리 펼치기 (검색 때는 이 배열만 탐색) ===
  // 전역에 선언되어 있을 수도 있는 데이터들을 안전하게 읽어옴
  // (정의되어 있지 않으면 기본값으로 빈 값 세팅)

  // 선수 데이터: { NBA: [...], EPL: [...], ... } 형태를 예상
  const pData = typeof playerData !== "undefined" ? playerData : {};
  // 상품 데이터: 배열 형태를 예상
  const sData = typeof shopData !== "undefined" ? shopData : [];
  // 경기 데이터: 배열 형태를 예상
  const gData = typeof gameData !== "undefined" ? gameData : [];

  // 카테고리 → 이동할 페이지 매핑 (검색 결과 카드 클릭 시 사용)
  const catPageMap = {
    "NBA": "nba.html",
    "EPL": "epl.html",
    "E-스포츠": "esports.html"
  };

  // -------- 선수 인덱스 생성 --------
  // 검색을 빠르게 하기 위해, playerData를 평탄화해서 하나의 배열로 만듦
  const playerIndex = [];
  for (let cat in pData) {
    // 각 카테고리별 선수 목록을 배열 형태로 보장
    const list = Array.isArray(pData[cat]) ? pData[cat] : [];
    // 카테고리 이름도 normalize해서 저장 (E-스포츠, e스포츠 등 처리)
    const catNorm = normalize(cat);

    list.forEach((p) => {
      const name = p.name || "";
      playerIndex.push({
        name,                              // 원본 이름
        nameLower: name.toLowerCase(),     // 이름 소문자 버전
        descLower: (p.desc || "").toLowerCase(), // 설명 소문자 버전
        img: p.img,                        // 썸네일 이미지
        cat,                               // 소속 카테고리 (NBA, EPL, E-스포츠 등)
        catNorm,                           // 정규화된 카테고리 문자열
        link: catPageMap[cat] || "index.html" // 이 선수를 보러 갈 페이지 (카테고리 페이지)
      });
    });
  }

  // -------- 상품 인덱스 생성 --------
  const shopIndex = sData.map((item) => {
    const name = item.name || "";
    return {
      name,                              // 상품 이름
      nameLower: name.toLowerCase(),     // 이름 소문자 버전
      descLower: (item.desc || "").toLowerCase(), // 설명 소문자 버전
      img: item.img,                     // 썸네일 이미지
      price: item.price,                 // 가격 표시용 텍스트
      link: "shop.html"                  // 쇼핑 메인 페이지로 이동
    };
  });

  // -------- 경기 인덱스 생성 --------
  const gameIndex = gData.map((item) => {
    const name = item.name || "";
    return {
      name,                              // 경기 이름 (예: 팀A vs 팀B)
      nameLower: name.toLowerCase(),     // 이름 소문자 버전
      descLower: (item.desc || "").toLowerCase(), // 설명 소문자 버전
      typeNorm: normalize(item.type || ""),       // 경기 타입(NBA/EPL/E-스포츠) 정규화
      img: item.img,                     // 썸네일 이미지
      date: item.date,                   // 경기 날짜
      link: "game.html"                  // 경기 일정 페이지로 이동
    };
  });

  // 각 섹션(선수/상품/경기/커뮤니티)별로 최대 몇 개까지 보여줄지 제한
  const MAX_PER_SECTION = 20; // 섹션별 최대 표시 개수

  /**
   * 실제 검색 로직을 담당하는 함수
   * - 입력값을 읽어서 필터링하고, 섹션별로 HTML 문자열을 만들어
   *   #searchResultBox 안에 한 번에 넣어줌
   */
  const handleSearch = () => {
    const raw = input.value;      // 현재 입력값 (원본)
    const trimmed = raw.trim();   // 앞뒤 공백 제거

    // 검색어가 완전히 비어 있으면
    // - 결과 박스를 숨기고 내용도 비워서 초기화
    if (!trimmed) {
      box.style.display = "none";
      box.innerHTML = "";
      return;
    }

    // 너무 짧은 검색어(1글자)는 전체 데이터 도는 걸 막기 위해 제한
    if (trimmed.length < 2) {
      box.style.display = "block";
      box.innerHTML = `
        <div style="opacity:.7; padding:8px 12px;">
          검색어를 2글자 이상 입력해주세요.
        </div>
      `;
      return;
    }

    // 검색어 소문자 버전
    const qLower = trimmed.toLowerCase();
    // 검색어 정규화 버전 (공백, 하이픈 제거)
    const qNorm = normalize(trimmed);

    // 섹션 전체 HTML 누적용 문자열
    let html = "";
    // 전체 결과 개수 (모든 섹션 합산)
    let totalCount = 0;

    /**
     * 섹션별 공통 렌더 함수
     *   - title: 섹션 제목(예: "선수", "상품")
     *   - list: 결과 배열
     *   - renderItem: 각 요소를 카드 HTML로 바꿔주는 콜백
     */
    const renderSection = (title, list, renderItem) => {
      // 결과가 없으면 아무것도 출력하지 않음
      if (!list.length) return;
      // 전체 개수에 현재 섹션 개수 추가
      totalCount += list.length;

      // 섹션 제목
      html += `<div class="section-title">${title}</div>`;
      // 카드들을 담을 그리드 래퍼
      html += `<div class="card-grid">`;
      // 각 아이템을 카드 HTML로 렌더링
      list.forEach((item) => {
        html += renderItem(item);
      });
      html += `</div>`;
    };

    // ======================
    // === 1) 선수 검색 ===
    // ======================
    const playerSeen = new Set();       // 중복 방지용 (카테고리+이름 기준)
    const playerResults = [];

    for (const p of playerIndex) {
      // 이름 / 설명 / 카테고리명 중 하나라도 검색어를 포함하면 매칭
      if (
        p.nameLower.includes(qLower) ||
        p.descLower.includes(qLower) ||
        p.catNorm.includes(qNorm)
      ) {
        // 같은 선수(카테고리+이름)가 중복해서 들어가지 않도록 Set으로 체크
        const key = `${p.cat}__${p.name}`;
        if (playerSeen.has(key)) continue;
        playerSeen.add(key);

        playerResults.push(p);

        // 섹션 최대 개수 도달 시 루프 종료
        if (playerResults.length >= MAX_PER_SECTION) break;
      }
    }

    // ======================
    // === 2) 상품 검색 ===
    // ======================
    const productSeen = new Set();  // 중복 방지용 (이름+가격 기준)
    const productResults = [];

    for (const item of shopIndex) {
      // 상품 이름 / 설명 중 하나라도 검색어를 포함하면 매칭
      if (item.nameLower.includes(qLower) || item.descLower.includes(qLower)) {
        const key = `${item.name}__${item.price}`;
        if (productSeen.has(key)) continue;
        productSeen.add(key);

        productResults.push(item);

        if (productResults.length >= MAX_PER_SECTION) break;
      }
    }

    // ======================
    // === 3) 경기 검색 ===
    // ======================
    const gameSeen = new Set();     // 중복 방지용 (이름+날짜 기준)
    const gameResults = [];

    for (const g of gameIndex) {
      // 경기 이름 / 설명 / 타입(NBA/EPL/E스포츠) 중 하나라도 포함되면 매칭
      if (
        g.nameLower.includes(qLower) ||
        g.descLower.includes(qLower) ||
        g.typeNorm.includes(qNorm)
      ) {
        const key = `${g.name}__${g.date || ""}`;
        if (gameSeen.has(key)) continue;
        gameSeen.add(key);

        gameResults.push(g);

        if (gameResults.length >= MAX_PER_SECTION) break;
      }
    }

    // ============================
    // === 4) 커뮤니티 글 검색 ===
    // ============================
    // 커뮤니티 글은 로컬스토리지에 저장되어 있으므로,
    // 검색 시점마다 최신값을 다시 읽어옴
    const posts = JSON.parse(localStorage.getItem("community_posts") || "[]");
    const postResults = [];

    for (const p of posts) {
      const titleLower = (p.title || "").toLowerCase();
      const contentLower = (p.content || "").toLowerCase();

      // 제목 / 내용 중 하나라도 검색어를 포함하면 매칭
      if (titleLower.includes(qLower) || contentLower.includes(qLower)) {
        postResults.push(p);
        if (postResults.length >= MAX_PER_SECTION) break;
      }
    }

    // ================================
    // === 섹션별 HTML 최종 생성 ===
    // ================================
    // 1) 선수 섹션
    renderSection("선수", playerResults, (p) => `
      <div class="card" onclick="location.href='${p.link}'">
        <img src="${p.img}" style="width:100%; border-radius:8px;">
        <div>${p.name}</div>
        <div style="opacity:.7; font-size:.85rem;">${p.cat}</div>
      </div>
    `);

    // 2) 상품 섹션
    renderSection("상품", productResults, (p) => `
      <div class="card" onclick="location.href='${p.link}'">
        <img src="${p.img}" style="width:100%; border-radius:8px;">
        <div>${p.name}</div>
        <div style="color:#00aaff;">${p.price}</div>
      </div>
    `);

    // 3) 경기 섹션
    renderSection("경기", gameResults, (g) => `
      <div class="card" onclick="location.href='${g.link}'">
        <img src="${g.img}" style="width:100%; border-radius:8px;">
        <div>${g.name}</div>
        <div style="opacity:0.7;">${g.date || ""}</div>
      </div>
    `);

    // 4) 커뮤니티 글 섹션
    renderSection("커뮤니티 글", postResults, (p) => {
      const content = p.content || "";
      // 내용이 너무 길면 40자까지만 잘라서 미리보기
      const preview =
        content.length > 40 ? content.substring(0, 40) + "..." : content;
      return `
        <div class="card" onclick="location.href='community.html'">
          <div style="font-weight:bold;">${p.title || ""}</div>
          <div style="opacity:0.7;">${preview}</div>
        </div>
      `;
    });

    // ======================
    // === 최종 결과 적용 ===
    // ======================
    // 아무 섹션에서도 결과가 나오지 않았으면 "검색 결과 없음" 표시
    if (!totalCount) {
      html = `
        <div style="opacity:.7; padding:8px 12px;">
          '${trimmed}' 에 대한 검색 결과가 없습니다.
        </div>
      `;
    }

    // 결과 박스를 보여주고, 한 번에 innerHTML 갱신
    box.style.display = "block";
    box.innerHTML = html; // DOM 변경은 최소화해서 한 번만 수행
  };

  // ================================
  // === 이벤트 등록 (input+디바운스) ===
  // ================================
  // 입력 이벤트에 디바운스로 감싼 handleSearch를 연결
  // → 사용자가 타이핑하는 동안 매 글자마다 검색하지 않고,
  //   250ms 동안 추가 입력이 없을 때만 검색 실행
  input.addEventListener("input", debounce(handleSearch, 250));
});
