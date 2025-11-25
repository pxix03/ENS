// search.js (최적화 버전)

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("globalSearch");
  const box = document.getElementById("searchResultBox");

  if (!input || !box) return;

  // === 공통 유틸 ===
  const normalize = (str) => {
    if (!str) return "";
    return String(str)
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/-/g, ""); // E-스포츠 / E스포츠 통합
  };

  const debounce = (fn, delay = 250) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  // === 데이터 미리 펼치기 (검색 때는 이 배열만 탐색) ===
  const pData = typeof playerData !== "undefined" ? playerData : {};
  const sData = typeof shopData !== "undefined" ? shopData : [];
  const gData = typeof gameData !== "undefined" ? gameData : [];

  const catPageMap = {
    "NBA": "nba.html",
    "EPL": "epl.html",
    "E-스포츠": "esports.html"
  };

  const playerIndex = [];
  for (let cat in pData) {
    const list = Array.isArray(pData[cat]) ? pData[cat] : [];
    const catNorm = normalize(cat);
    list.forEach((p) => {
      const name = p.name || "";
      playerIndex.push({
        name,
        nameLower: name.toLowerCase(),
        descLower: (p.desc || "").toLowerCase(),
        img: p.img,
        cat,
        catNorm,
        link: catPageMap[cat] || "index.html"
      });
    });
  }

  const shopIndex = sData.map((item) => {
    const name = item.name || "";
    return {
      name,
      nameLower: name.toLowerCase(),
      descLower: (item.desc || "").toLowerCase(),
      img: item.img,
      price: item.price,
      link: "shop.html"
    };
  });

  const gameIndex = gData.map((item) => {
    const name = item.name || "";
    return {
      name,
      nameLower: name.toLowerCase(),
      descLower: (item.desc || "").toLowerCase(),
      typeNorm: normalize(item.type || ""),
      img: item.img,
      date: item.date,
      link: "game.html"
    };
  });

  const MAX_PER_SECTION = 20; // 섹션별 최대 표시 개수

  const handleSearch = () => {
    const raw = input.value;
    const trimmed = raw.trim();

    // 검색어 없으면 바로 종료 (DOM만 한 번 정리)
    if (!trimmed) {
      box.style.display = "none";
      box.innerHTML = "";
      return;
    }

    // 너무 짧은 검색어는 전체 데이터 도는 거 막기
    if (trimmed.length < 2) {
      box.style.display = "block";
      box.innerHTML = `
        <div style="opacity:.7; padding:8px 12px;">
          검색어를 2글자 이상 입력해주세요.
        </div>
      `;
      return;
    }

    const qLower = trimmed.toLowerCase();
    const qNorm = normalize(trimmed);

    let html = "";
    let totalCount = 0;

    const renderSection = (title, list, renderItem) => {
      if (!list.length) return;
      totalCount += list.length;

      html += `<div class="section-title">${title}</div>`;
      html += `<div class="card-grid">`;
      list.forEach((item) => {
        html += renderItem(item);
      });
      html += `</div>`;
    };

    // === 1) 선수 ===
    const playerSeen = new Set();
    const playerResults = [];
    for (const p of playerIndex) {
      if (
        p.nameLower.includes(qLower) ||
        p.descLower.includes(qLower) ||
        p.catNorm.includes(qNorm)
      ) {
        const key = `${p.cat}__${p.name}`;
        if (playerSeen.has(key)) continue;
        playerSeen.add(key);
        playerResults.push(p);
        if (playerResults.length >= MAX_PER_SECTION) break;
      }
    }

    // === 2) 상품 ===
    const productSeen = new Set();
    const productResults = [];
    for (const item of shopIndex) {
      if (item.nameLower.includes(qLower) || item.descLower.includes(qLower)) {
        const key = `${item.name}__${item.price}`;
        if (productSeen.has(key)) continue;
        productSeen.add(key);
        productResults.push(item);
        if (productResults.length >= MAX_PER_SECTION) break;
      }
    }

    // === 3) 경기 ===
    const gameSeen = new Set();
    const gameResults = [];
    for (const g of gameIndex) {
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

    // === 4) 커뮤니티 (로컬스토리지는 그때그때 읽기) ===
    const posts = JSON.parse(localStorage.getItem("community_posts") || "[]");
    const postResults = [];
    for (const p of posts) {
      const titleLower = (p.title || "").toLowerCase();
      const contentLower = (p.content || "").toLowerCase();
      if (titleLower.includes(qLower) || contentLower.includes(qLower)) {
        postResults.push(p);
        if (postResults.length >= MAX_PER_SECTION) break;
      }
    }

    // === 섹션별 HTML 만들기 (문자열로 한 번에) ===
    renderSection("선수", playerResults, (p) => `
      <div class="card" onclick="location.href='${p.link}'">
        <img src="${p.img}" style="width:100%; border-radius:8px;">
        <div>${p.name}</div>
        <div style="opacity:.7; font-size:.85rem;">${p.cat}</div>
      </div>
    `);

    renderSection("상품", productResults, (p) => `
      <div class="card" onclick="location.href='${p.link}'">
        <img src="${p.img}" style="width:100%; border-radius:8px;">
        <div>${p.name}</div>
        <div style="color:#00aaff;">${p.price}</div>
      </div>
    `);

    renderSection("경기", gameResults, (g) => `
      <div class="card" onclick="location.href='${g.link}'">
        <img src="${g.img}" style="width:100%; border-radius:8px;">
        <div>${g.name}</div>
        <div style="opacity:0.7;">${g.date || ""}</div>
      </div>
    `);

    renderSection("커뮤니티 글", postResults, (p) => {
      const content = p.content || "";
      const preview =
        content.length > 40 ? content.substring(0, 40) + "..." : content;
      return `
        <div class="card" onclick="location.href='community.html'">
          <div style="font-weight:bold;">${p.title || ""}</div>
          <div style="opacity:0.7;">${preview}</div>
        </div>
      `;
    });

    // === 최종 적용 ===
    if (!totalCount) {
      html = `
        <div style="opacity:.7; padding:8px 12px;">
          '${trimmed}' 에 대한 검색 결과가 없습니다.
        </div>
      `;
    }

    box.style.display = "block";
    box.innerHTML = html; // 한 번만 변경
  };

  // 디바운스로 input 이벤트 최적화
  input.addEventListener("input", debounce(handleSearch, 250));
});
