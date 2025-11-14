// search.js (전체 교체)

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("globalSearch");
  const box = document.getElementById("searchResultBox");

  // 검색창이나 결과박스가 없으면 아무 것도 안 함
  if (!input || !box) return;

  // 한/영, 공백, 하이픈 섞여도 비교 가능하게 정규화
  const normalize = (str) => {
    if (!str) return "";
    return String(str)
      .toLowerCase()
      .replace(/\s+/g, "")   // 공백 제거
      .replace(/-/g, "");    // 하이픈 제거 (E-스포츠, E스포츠 둘 다 잡기)
  };

  input.addEventListener("input", () => {
    const raw = input.value;
    const trimmed = raw.trim();

    // 입력 없으면 박스 숨기기
    if (!trimmed) {
      box.style.display = "none";
      box.innerHTML = "";
      return;
    }

    const qLower = trimmed.toLowerCase();
    const qNorm  = normalize(trimmed);

    box.style.display = "block";
    box.innerHTML = "";

    // 전역 데이터
   // 전역 데이터 (data.js에서 const로 선언된 애들)
  const pData = typeof playerData !== "undefined" ? playerData : {};
  const sData = typeof shopData   !== "undefined" ? shopData   : [];
  const gData = typeof gameData   !== "undefined" ? gameData   : [];
  const posts = JSON.parse(localStorage.getItem("community_posts") || "[]");


    /* ----------------------------
       1) 선수 검색 (이름 / 설명 / 카테고리)
    ----------------------------- */
    let playerResults = [];
    for (let cat in pData) {
      const list = Array.isArray(pData[cat]) ? pData[cat] : [];
      const catNorm = normalize(cat);

      list.forEach(p => {
        const name = (p.name || "");
        const desc = (p.desc || "");

        if (
          name.toLowerCase().includes(qLower) ||
          desc.toLowerCase().includes(qLower) ||
          catNorm.includes(qNorm) // "E스포츠" / "E-스포츠" 로 검색해도 잡힘
        ) {
          playerResults.push({
            name,
            img: p.img,
            cat,
            link: "main.html#" + encodeURIComponent(cat)
          });
        }
      });
    }

    /* ----------------------------
       2) 쇼핑 검색 (이름 / 설명)
    ----------------------------- */
    let productResults = sData
      .filter(item => {
        const name = (item.name || "").toLowerCase();
        const desc = (item.desc || "").toLowerCase();
        return name.includes(qLower) || desc.includes(qLower);
      })
      .map(item => ({
        name: item.name,
        img: item.img,
        price: item.price,
        link: "shop.html"
      }));

    /* ----------------------------
       3) 경기 검색 (경기명 / 설명 / 타입)
    ----------------------------- */
    let gameResults = gData
      .filter(item => {
        const name = (item.name || "").toLowerCase();
        const desc = (item.desc || "").toLowerCase();
        const typeNorm = normalize(item.type || "");
        return (
          name.includes(qLower) ||
          desc.includes(qLower) ||
          typeNorm.includes(qNorm)
        );
      })
      .map(item => ({
        name: item.name,
        img: item.img,
        date: item.date,
        link: "game.html"
      }));

    /* ----------------------------
       4) 커뮤니티 검색 (제목 / 내용)
    ----------------------------- */
    let postResults = posts
      .filter(p => {
        const title = (p.title || "").toLowerCase();
        const content = (p.content || "").toLowerCase();
        return title.includes(qLower) || content.includes(qLower);
      })
      .map(p => ({
        title: p.title,
        content: p.content,
        link: "community.html"
      }));


    /* ----------------------------
       검색 결과 렌더링
       - 결과 있는 섹션만 보여줌
       - 전체 통합해서 0개일 때만 "검색 결과 없음" 한 번 출력
    ----------------------------- */
    let totalCount = 0;

    function renderSection(title, list, renderCard) {
      if (!list.length) return; // 비어 있으면 이 섹션 자체를 안 보여줌

      totalCount += list.length;

      box.innerHTML += `<div class="section-title">${title}</div>`;
      box.innerHTML += `<div class="card-grid">`;
      list.forEach(renderCard);
      box.innerHTML += `</div>`;
    }

    // 선수
    renderSection("선수", playerResults, p => {
      box.innerHTML += `
        <div class="card" onclick="location.href='${p.link}'">
          <img src="${p.img}" style="width:100%; border-radius:8px;">
          <div>${p.name}</div>
          <div style="opacity:.7; font-size:.85rem;">${p.cat}</div>
        </div>
      `;
    });

    // 상품
    renderSection("상품", productResults, p => {
      box.innerHTML += `
        <div class="card" onclick="location.href='${p.link}'">
          <img src="${p.img}" style="width:100%; border-radius:8px;">
          <div>${p.name}</div>
          <div style="color:#00aaff;">${p.price}</div>
        </div>
      `;
    });

    // 경기
    renderSection("경기", gameResults, g => {
      box.innerHTML += `
        <div class="card" onclick="location.href='${g.link}'">
          <img src="${g.img}" style="width:100%; border-radius:8px;">
          <div>${g.name}</div>
          <div style="opacity:0.7;">${g.date}</div>
        </div>
      `;
    });

    // 커뮤니티
    renderSection("커뮤니티 글", postResults, p => {
      const preview =
        (p.content || "").length > 40
          ? p.content.substring(0, 40) + "..."
          : (p.content || "");

      box.innerHTML += `
        <div class="card" onclick="location.href='${p.link}'">
          <div style="font-weight:bold;">${p.title}</div>
          <div style="opacity:0.7;">${preview}</div>
        </div>
      `;
    });

    // 전체 결과가 0개일 때만 한 번 메시지 출력
    if (!totalCount) {
      box.innerHTML = `
        <div style="opacity:.7;">
          '${trimmed}' 에 대한 검색 결과가 없습니다.
        </div>
      `;
    }
  });
});
// ==============================
//  ▶ 로그인 / 회원가입 / 장바구니 공통 스크립트
// ==============================

// 현재 로그인한 유저 정보 가져오기
function getCurrentUser() {
  try {
    const raw = localStorage.getItem("ensUser");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function saveCurrentUser(user) {
  localStorage.setItem("ensUser", JSON.stringify(user));
}
function clearCurrentUser() {
  localStorage.removeItem("ensUser");
}

// ----- 계정(아이디/비번) 리스트 -----
function getAccounts() {
  try {
    return JSON.parse(localStorage.getItem("ensAccounts") || "[]");
  } catch (e) {
    return [];
  }
}
function saveAccounts(list) {
  localStorage.setItem("ensAccounts", JSON.stringify(list));
}

// ------------------------------
// 로그인 모달 생성 & 표시
// ------------------------------
function ensureLoginModal() {
  let overlay = document.getElementById("loginModalOverlay");
  if (overlay) return;

  overlay = document.createElement("div");
  overlay.id = "loginModalOverlay";
  overlay.innerHTML = `
    <div class="login-modal" role="dialog" aria-modal="true">
      <div class="login-modal-title">로그인 / 회원가입</div>
      <div class="login-modal-desc">
        ENS 계정 아이디와 비밀번호를 입력해 주세요.
      </div>

      <label class="login-modal-label" for="loginIdInput">아이디</label>
      <input id="loginIdInput" class="login-modal-input" type="text" placeholder="아이디를 입력하세요.">

      <label class="login-modal-label" for="loginPwInput">비밀번호</label>
      <input id="loginPwInput" class="login-modal-input" type="password" placeholder="비밀번호를 입력하세요.">

      <div class="login-modal-buttons">
        <button type="button" class="login-btn-cancel"  id="loginCancelBtn">취소</button>
        <button type="button" class="login-btn-submit"  id="loginSubmitBtn">로그인</button>
        <button type="button" class="login-btn-signup"  id="signupSubmitBtn">회원가입</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // 바깥(검은 영역) 클릭 시 닫기
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) hideLoginModal();
  });

  document.getElementById("loginCancelBtn").addEventListener("click", hideLoginModal);
  document.getElementById("loginSubmitBtn").addEventListener("click", handleLoginSubmit);
  document.getElementById("signupSubmitBtn").addEventListener("click", handleSignupSubmit);

  ["loginIdInput", "loginPwInput"].forEach((id) => {
    const input = document.getElementById(id);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        handleLoginSubmit();
      }
    });
  });
}

function openLoginDialog() {
  ensureLoginModal();
  const overlay = document.getElementById("loginModalOverlay");
  const idInput = document.getElementById("loginIdInput");
  const pwInput = document.getElementById("loginPwInput");
  if (!overlay || !idInput || !pwInput) return;

  overlay.style.display = "flex";
  idInput.value = "";
  pwInput.value = "";
  idInput.focus();
}

function hideLoginModal() {
  const overlay = document.getElementById("loginModalOverlay");
  if (overlay) overlay.style.display = "none";
}

// ----- 로그인 / 회원가입 동작 -----
function loginWith(id, pw) {
  const accounts = getAccounts();
  const acc = accounts.find(a => a.id === id);
  if (!acc) {
    alert("존재하지 않는 아이디입니다.\n회원가입 버튼을 눌러 계정을 만들어 주세요.");
    return false;
  }
  if (acc.pw !== pw) {
    alert("비밀번호가 일치하지 않습니다.");
    return false;
  }

  saveCurrentUser({ id: acc.id });
  hideLoginModal();
  removeShopLoginOverlay();
  renderHeaderUser();
  return true;
}

function signupWith(id, pw) {
  if (!id || !pw) {
    alert("아이디와 비밀번호를 모두 입력해 주세요.");
    return false;
  }
  if (id.length < 3) {
    alert("아이디는 3글자 이상 입력해 주세요.");
    return false;
  }
  if (pw.length < 4) {
    alert("비밀번호는 4글자 이상 입력해 주세요.");
    return false;
  }

  const accounts = getAccounts();
  if (accounts.some(a => a.id === id)) {
    alert("이미 사용 중인 아이디입니다. 다른 아이디를 사용해 주세요.");
    return false;
  }

  accounts.push({ id, pw });
  saveAccounts(accounts);

  saveCurrentUser({ id });
  hideLoginModal();
  removeShopLoginOverlay();
  renderHeaderUser();
  alert("회원가입이 완료되었습니다.\n로그인된 상태로 쇼핑을 이용할 수 있습니다.");
  return true;
}

function handleLoginSubmit() {
  const idInput = document.getElementById("loginIdInput");
  const pwInput = document.getElementById("loginPwInput");
  if (!idInput || !pwInput) return;

  const id = idInput.value.trim();
  const pw = pwInput.value;

  if (!id || !pw) {
    alert("아이디와 비밀번호를 모두 입력해 주세요.");
    return;
  }
  loginWith(id, pw);
}

function handleSignupSubmit() {
  const idInput = document.getElementById("loginIdInput");
  const pwInput = document.getElementById("loginPwInput");
  if (!idInput || !pwInput) return;

  const id = idInput.value.trim();
  const pw = pwInput.value;

  signupWith(id, pw);
}

// ------------------------------
// 쇼핑 페이지 헤더 유저 영역
// ------------------------------
function renderHeaderUser() {
  const box = document.getElementById("userDisplay");
  if (!box) return;

  const path = location.pathname.split("/").pop();
  const isShopPage = ["shop.html", "product.html", "cart.html"].includes(path);

  if (!isShopPage) {
    box.style.display = "none";   // 쇼핑 외 페이지는 숨김
    return;
  } else {
    box.style.display = "";
  }

  const user = getCurrentUser();
  if (!user) {
    box.innerHTML = `
      <button class="btn-login" id="loginBtn">로그인</button>
      <button class="btn-cart"  id="cartHeaderBtn">장바구니</button>
    `;
  } else {
    const displayName = user.name || user.id || "회원";
    box.innerHTML = `
      <span class="login-name">${displayName}님</span>
      <button class="btn-cart"   id="cartHeaderBtn">장바구니</button>
      <button class="btn-logout" id="logoutBtn">로그아웃</button>
    `;
  }

  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const cartBtn = document.getElementById("cartHeaderBtn");

  if (loginBtn) {
    loginBtn.addEventListener("click", openLoginDialog);
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (confirm("로그아웃 하시겠습니까?")) {
        clearCurrentUser();
        location.reload();
      }
    });
  }

  if (cartBtn) {
    cartBtn.addEventListener("click", () => {
      const current = getCurrentUser();
      if (!current) {
        openLoginDialog();
      } else {
        location.href = "cart.html";
      }
    });
  }
}

// ------------------------------
// 쇼핑 페이지에서 로그인 강제
// ------------------------------
function removeShopLoginOverlay() {
  const overlay = document.getElementById("shopLoginOverlay");
  if (overlay) overlay.remove();

  document.querySelectorAll(".blurred-behind-login").forEach(el => {
    el.classList.remove("blurred-behind-login");
  });
}

function enforceShopLoginIfNeeded() {
  
}

// 초기 실행
document.addEventListener("DOMContentLoaded", () => {
  renderHeaderUser();
  enforceShopLoginIfNeeded();
});


