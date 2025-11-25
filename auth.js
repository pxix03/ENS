// auth.js - 이동우
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

// 현재 로그인된 유저 저장
function saveCurrentUser(user) {
  localStorage.setItem("ensUser", JSON.stringify(user));
}
// 로그인 정보 제거 (로그아웃)
function clearCurrentUser() {
  localStorage.removeItem("ensUser");
}

// -----------------------------------
// 계정 목록(아이디/비번 저장용)
// -----------------------------------
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

// -----------------------------------
// 로그인 모달 생성 (없으면 만들고, 있으면 그대로 사용)
// -----------------------------------
function ensureLoginModal() {
  let overlay = document.getElementById("loginModalOverlay");
  if (overlay) return;

  // 로그인창 HTML 생성
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
        <button type="button" class="login-btn-submit"  id="loginSubmitBtn">로그인</button>
        <button type="button" class="login-btn-signup"  id="signupSubmitBtn">회원가입</button>
        <button type="button" class="login-btn-cancel"  id="loginCancelBtn">취소</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // 바깥(검은 영역) 클릭 시 닫기
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) hideLoginModal();
  });

  // 버튼 이벤트
  document.getElementById("loginCancelBtn").addEventListener("click", hideLoginModal);
  document.getElementById("loginSubmitBtn").addEventListener("click", handleLoginSubmit);
  document.getElementById("signupSubmitBtn").addEventListener("click", handleSignupSubmit);

  // 엔터키 → 로그인 실행
  ["loginIdInput", "loginPwInput"].forEach((id) => {
    const input = document.getElementById(id);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        handleLoginSubmit();
      }
    });
  });
}

// 로그인 모달 열기 + (옵션) 히스토리 반영
function openLoginDialog(updateHistory = true) {
  ensureLoginModal();

  const overlay = document.getElementById("loginModalOverlay");
  const idInput = document.getElementById("loginIdInput");
  const pwInput = document.getElementById("loginPwInput");
  if (!overlay || !idInput || !pwInput) return;

  overlay.style.display = "flex";
  idInput.value = "";
  pwInput.value = "";
  idInput.focus();

  // 브라우저 뒤로가기로 닫을 수 있도록 상태 기록 (alogin = "OPEN")
  if (updateHistory && window.updateTabHistory) {
    updateTabHistory("alogin", "OPEN", true);
  }
}

// 로그인 모달 닫기 + (옵션) 히스토리에서 로그인 상태 제거
function hideLoginModal(updateHistory = true) {
  const overlay = document.getElementById("loginModalOverlay");
  if (overlay) overlay.style.display = "none";

  // 로그인 상태를 히스토리에서 제거
  if (updateHistory && window.updateTabHistory) {
    updateTabHistory("alogin", "", false); // replaceState
  }
}

// -----------------------------------
// 로그인 처리
// -----------------------------------
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

  // 로그인 성공
  saveCurrentUser({ id: acc.id });
  hideLoginModal();
  removeShopLoginOverlay();
  renderHeaderUser();
  return true;
}

// -----------------------------------
// 회원가입 처리
// -----------------------------------
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
  // 계정 저장
  accounts.push({ id, pw });
  saveAccounts(accounts);

  // 가입과 동시에 로그인 처리
  saveCurrentUser({ id });
  hideLoginModal();
  removeShopLoginOverlay();
  renderHeaderUser();
  alert("회원가입이 완료되었습니다.\n로그인된 상태로 쇼핑을 이용할 수 있습니다.");
  return true;
}

// -----------------------------------
// 로그인 버튼 클릭 시 실행
// -----------------------------------
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

// -----------------------------------
// 회원가입 버튼 클릭 시 실행
// -----------------------------------
function handleSignupSubmit() {
  const idInput = document.getElementById("loginIdInput");
  const pwInput = document.getElementById("loginPwInput");
  if (!idInput || !pwInput) return;

  const id = idInput.value.trim();
  const pw = pwInput.value;

  signupWith(id, pw);
}

// ------------------------------
// 쇼핑 페이지 헤더 유저 영역 (로그인/로그아웃/장바구니)
// ------------------------------
function renderHeaderUser() {
  const box = document.getElementById("userDisplay");
  if (!box) return;
  
  // 쇼핑 페이지에서만 보이게
  const path = location.pathname.split("/").pop();
  const isShopPage = ["shop.html", "product.html", "cart.html"].includes(path);

  if (!isShopPage) {
    box.style.display = "none";   // 쇼핑 외 페이지는 숨김
    return;
  } else {
    box.style.display = "";
  }

  const user = getCurrentUser();

  // 로그인 안됨
  if (!user) {
    box.innerHTML = `
      <button class="btn-login" id="loginBtn">로그인</button>
      <button class="btn-cart"  id="cartHeaderBtn">장바구니</button>
    `;
  // 로그인 됨
  } else {
    const displayName = user.name || user.id || "회원";
    box.innerHTML = `
      <span class="login-name">${displayName}님</span>
      <button class="btn-cart"   id="cartHeaderBtn">장바구니</button>
      <button class="btn-logout" id="logoutBtn">로그아웃</button>
    `;
  }

  // 이벤트 연결
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
// 쇼핑 페이지에서 로그인 강제 (필요시 사용)
// ------------------------------
function removeShopLoginOverlay() {
  const overlay = document.getElementById("shopLoginOverlay");
  if (overlay) overlay.remove();

  document.querySelectorAll(".blurred-behind-login").forEach(el => {
    el.classList.remove("blurred-behind-login");
  });
}

function enforceShopLoginIfNeeded() {
  // 지금은 비워둔 상태
}

// -----------------------------------
// 페이지 로드시 자동 실행
// -----------------------------------
document.addEventListener("DOMContentLoaded", () => {
  renderHeaderUser();
  enforceShopLoginIfNeeded();

  //뒤로가기와 로그인창 연동 (SHOP / PRODUCT / CART 페이지에서 동작)
  if (window.setupTabHistory) {
    setupTabHistory("alogin", "", (value, push) => {
      if (value === "OPEN") {
        // 히스토리/URL 상태에 맞춰 모달 열기 (히스토리는 건드리지 않음)
        openLoginDialog(false);
      } else {
        // 닫힌 상태면 모달 닫기
        hideLoginModal(false);
      }
    });
  }
});

