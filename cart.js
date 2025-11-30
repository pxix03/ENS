// cart.js - 이동우
// ==============================
//   공통 장바구니 기능 + 페이지별 초기화
//   - ensCart 로컬스토리지 사용
//   - 상품 상세 페이지(장바구니/바로구매 버튼)
//   - 장바구니 페이지(cart.html) 렌더링
// ==============================

// =========================================
//   공통 장바구니 데이터 로드 / 저장 함수
// =========================================

// 로컬스토리지에서 ensCart 불러오기
function getCart() {
  try {
    // localStorage에 "ensCart" 키로 저장된 JSON 문자열을 읽어서 배열로 파싱
    // ★ 값이 없으면 "[]"를 파싱해서 항상 배열 형태가 되도록 처리
    return JSON.parse(localStorage.getItem("ensCart") || "[]");
  } catch (e) {
    // JSON 파싱 실패 시(손상된 데이터 등) 방어적으로 빈 배열 반환
    return [];
  }
}

// 로컬스토리지에 장바구니 저장
function saveCart(cart) {
  // cart 배열을 JSON 문자열로 변환해서 "ensCart" 키에 저장
  localStorage.setItem("ensCart", JSON.stringify(cart));
}


/**
 * 장바구니에 상품 추가
 * product: { name, price, img }
 * qty: 기본 1
 *
 * - 같은 name을 가진 상품이 이미 있으면 수량만 증가시킴
 * - 없으면 새 항목으로 추가
 */
function addToCart(product, qty) {
  // product가 없거나, name 값이 없는 경우는 잘못된 호출이므로 무시
  if (!product || !product.name) return;  // 상품 정보 없으면 중단

  // 현재 장바구니 상태를 가져옴
  const cart = getCart(); // 현재 장바구니 가져오기

  // 같은 상품 이름이 있는지 검사 (이름으로만 동일 상품을 판정)
  const index = cart.findIndex((i) => i.name === product.name);

  // 전달된 qty가 없으면 기본값 1로 처리
  const q = qty || 1; // 기본 수량 1

  if (index >= 0) {
    // 이미 장바구니에 존재함 → 수량 증가
    cart[index].qty = (cart[index].qty || 1) + q;
  } else {
    // 새 상품 추가
    cart.push({
      name: product.name,
      price: product.price,
      img: product.img,
      qty: q,
    });
  }

  // 변경된 장바구니를 저장
  saveCart(cart); // 저장
}


// =========================================
//   로그인 여부 체크 (로그인 필요 기능 보호)
// =========================================
function requireLoginForCart() {
  // getCurrentUser → auth.js에서 제공됨
  //   - 함수가 아예 없거나
  //   - 함수는 있는데 반환값이 falsy(로그인 안 됨)이면 로그인 필요
  if (typeof getCurrentUser !== "function" || !getCurrentUser()) {
    // 로그인 안 되어있으면 로그인 모달 호출
    if (typeof openLoginDialog === "function") {
      // 모달 방식 로그인 UI가 구현되어 있으면 그것을 사용
      openLoginDialog();
    } else {
      // 그렇지 않으면 단순 경고창으로 대체
      alert("로그인이 필요합니다.");
    }
    return false;
  }
  // 여기까지 왔다는 건 로그인된 상태
  return true;
}


// =========================================
//   상품 상세 페이지 - 장바구니 알림 토스트 UI
// =========================================
function showCartToast() {
  // 이미 생성된 토스트 요소가 있는지 확인
  let toast = document.getElementById("cartToast");

  // 토스트가 최초 생성이라면 만들기
  if (!toast) {
    // 상품 상세 페이지에서 버튼 묶음 영역(.product-detail-actions)을 기준으로 붙일 예정
    const actions = document.querySelector(".product-detail-actions");

    // 토스트 박스 생성
    toast = document.createElement("div");
    toast.id = "cartToast";
    toast.innerHTML = `
      <div class="cart-toast-box">
        <div class="cart-toast-text">상품이 장바구니에 담겼습니다.</div>
        <button class="cart-toast-btn" id="goCartBtn">장바구니 바로가기 &gt;</button>
      </div>
    `;

    // 상품 상세 화면이면 actions에, 아니면 body에 추가
    //  → 상세 페이지가 아닐 수도 있다는 것을 고려한 방어 코드
    if (actions) {
      actions.appendChild(toast);
    } else {
      document.body.appendChild(toast);
    }

    // "장바구니 바로가기" 버튼 클릭 이벤트
    const btn = document.getElementById("goCartBtn");
    if (btn) {
      btn.addEventListener("click", () => {
        // 토스트 숨기고
        toast.style.display = "none";
        // 장바구니 페이지로 이동
        location.href = "cart.html"; // 장바구니 페이지 이동
      });
    }
  }

  // 토스트가 이미 존재한다면, 단순히 다시 보여주기만 함
  toast.style.display = "block"; // 토스트 표시
}


// =========================================
//   상품 상세 페이지에서 상품 정보 읽기
// =========================================
function readProductFromDetailPage() {
  // product.html 내에서 상품 정보를 표시하는 요소들
  const nameEl = document.getElementById("detailName");
  const priceEl = document.getElementById("detailPrice");
  const imgEl = document.getElementById("detailImg");

  // 요소가 없으면 상품 상세 페이지가 아님 → null 반환
  if (!nameEl || !priceEl || !imgEl) return null;

  // innerText/innerHTML 대신 textContent 사용 (스크립트 등 제외)
  const name = (nameEl.textContent || "").trim();
  const price = (priceEl.textContent || "").trim();
  const img = imgEl.getAttribute("src");

  // 이름이 비어 있으면 정상 상품이 아니라고 판단
  if (!name) return null; // 이름 없으면 상품이 아님

  // 장바구니에 저장할 객체 구조로 반환
  return { name, price, img };
}


// =========================================
//   상품 상세 페이지 초기화 (장바구니/구매 버튼)
// =========================================
function initProductCart() {
  const btnCart = document.getElementById("btnCart"); // 장바구니 버튼
  const btnBuy = document.getElementById("btnBuy");   // 바로구매 버튼

  // 둘 다 없으면 상품 상세 화면이 아님 (예: shop.html 같은 페이지)
  if (!btnCart && !btnBuy) return;

  // 장바구니 버튼
  if (btnCart) {
    btnCart.addEventListener("click", () => {
      // 1) 로그인 여부 확인 (미로그인 시 함수 내부에서 모달/alert)
      if (!requireLoginForCart()) return; // 로그인 체크

      // 2) 현재 상세 페이지에서 상품 정보 읽어오기
      const product = readProductFromDetailPage();
      if (!product) return;

      // 3) 장바구니에 상품 1개 추가
      addToCart(product, 1); // 1개 추가
      // 4) "장바구니에 담겼습니다" 토스트 표시
      showCartToast(); // 토스트 띄우기
    });
  }

  // 바로 구매 버튼
  if (btnBuy) {
    btnBuy.addEventListener("click", () => {
      // 바로 구매도 로그인 필요
      if (!requireLoginForCart()) return;

      const product = readProductFromDetailPage();
      if (!product) return;

      // 바로 구매도 장바구니에 1개 담은 뒤
      addToCart(product, 1);
      // 바로 장바구니 페이지로 이동 → 결제 흐름 가정
      location.href = "cart.html"; // 바로 장바구니로 이동
    });
  }
}


// =========================================
//   장바구니 페이지(cart.html) 렌더링
// =========================================
function initCartPage() {
  // cart.html에 존재하는 요소들
  const box = document.getElementById("cartList");              // 장바구니 리스트 영역
  const countEl = document.getElementById("cartCount");         // 상품 개수 표시 영역
  const totalEl = document.getElementById("cartTotalPrice");    // 총 상품 금액 (전체)
  const finalEl = document.getElementById("cartFinalPrice");    // 결제 예정 금액 (선택 상품만)
  const btnOrderAll = document.getElementById("btnOrderAll");   // 선택 상품 구매 버튼
  const btnDeleteSelected = document.getElementById("btnDeleteSelected"); // 선택 상품 삭제 버튼

  // cartList가 없으면 장바구니 페이지가 아님 (다른 페이지에서는 바로 종료)
  if (!box) return;

  /**
   * "10,000원" 같은 문자열에서 숫자만 뽑아 정수로 변환하는 헬퍼
   * - 숫자가 아니거나 비어 있으면 0으로 처리
   */
  function parsePriceNumber(str) {
    // 문자열에서 숫자가 아닌 문자 제거 (comma, 원, 공백 등)
    const num = parseInt(String(str || "0").replace(/[^\d]/g, ""), 10);
    return isNaN(num) ? 0 : num;
  }

  /**
   * 숫자 값을 "10,000원" 형식의 문자열로 바꿔주는 헬퍼
   * - localeString으로 천 단위 콤마 추가
   */
  function formatPrice(num) {
    const n = Number(num) || 0;
    return n.toLocaleString("ko-KR") + "원";
  }

  /**
   * 현재 화면에서 체크된 상품들의 index 목록을 구하는 함수
   * - cart 배열과 index를 매칭시키기 위해 data-idx 속성을 사용
   */
  function getSelectedIndexes() {
    const inputs = box.querySelectorAll(".cart-item-check-input:checked");
    const result = [];
    inputs.forEach((input) => {
      const idx = Number(input.dataset.idx);
      if (!Number.isNaN(idx)) result.push(idx);
    });
    return result;
  }

  /**
   * 오른쪽 합계 영역(총 상품 금액 + 결제 예정 금액) 갱신
   * - 총 상품 금액: 장바구니 전체 금액
   * - 결제 예정 금액: 체크박스 선택된 상품들만의 합계
   */
  function updateSummary() {
    const cart = getCart();

    // 1) 총 상품 금액 = 장바구니 전체
    let total = 0;
    cart.forEach((item) => {
      const priceNum = parsePriceNumber(item.price);
      const qty = item.qty || 1;
      total += priceNum * qty;
    });
    if (totalEl) totalEl.textContent = formatPrice(total);

    // 2) 결제 예정 금액 = 체크된 상품만
    const selectedIdxs = getSelectedIndexes();
    let selectedTotal = 0;

    selectedIdxs.forEach((idx) => {
      const item = cart[idx];
      if (!item) return;
      const priceNum = parsePriceNumber(item.price);
      const qty = item.qty || 1;
      selectedTotal += priceNum * qty;
    });

    if (finalEl) finalEl.textContent = formatPrice(selectedTotal);
  }

  /**
   * 장바구니 리스트 전체를 다시 그리는 함수
   * - getCart()로 최신 데이터를 가져와 DOM을 재구성
   * - 수량 변경/삭제 후 항상 이 함수를 통해 UI를 갱신
   */
  function renderCart() {
    const list = getCart();

    // 상단 "장바구니 (N)" 같은 부분에 개수 표시
    if (countEl) countEl.textContent = list.length;

    // 장바구니가 완전히 비어 있을 때의 처리
    if (!list.length) {
      box.innerHTML = `<div class="cart-empty">장바구니에 담긴 상품이 없습니다.</div>`;
      if (totalEl) totalEl.textContent = "0원";
      if (finalEl) finalEl.textContent = "0원";
      return;
    }

    // 리스트가 있으면 카드들을 새로 그려 줌
    box.innerHTML = "";
    list.forEach((item, index) => {
      const priceNum = parsePriceNumber(item.price);
      const qty = item.qty || 1;
      const itemTotal = priceNum * qty;

      // 각 cart-item에는
      // - 체크박스(data-idx)
      // - 썸네일 이미지
      // - 상품명/단가
      // - 수량 +/-
      // - 아이템별 합계 금액
      // - 삭제 버튼
      box.innerHTML += `
        <div class="cart-item">
          <div class="cart-item-check">
            <input
              type="checkbox"
              class="cart-item-check-input"
              data-idx="${index}"
              checked
            >
          </div>
          <div class="cart-item-thumb">
            <img src="${item.img}" alt="${item.name}">
          </div>
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">${formatPrice(priceNum)}</div>
          </div>
          <div class="cart-item-qty">
            <button class="qty-btn" data-idx="${index}" data-delta="-1">-</button>
            <span class="qty">${qty}</span>
            <button class="qty-btn" data-idx="${index}" data-delta="1">+</button>
          </div>
          <div class="cart-item-total">
            ${formatPrice(itemTotal)}
          </div>
          <button class="cart-item-remove" data-idx="${index}">삭제</button>
        </div>
      `;
    });

    // 새로 그린 뒤, 합계/결제 예정 금액 다시 계산
    updateSummary();
  }

  /**
   * 수량 변경/삭제 버튼 처리 (이벤트 위임 방식)
   * - 문서 전체에 click 리스너를 붙이고, 실제로 필요한 target만 골라 처리
   * - cart-item이 매번 새로 그려지기 때문에, 각 버튼마다 리스너를 다시 걸 필요 없음
   */
  document.addEventListener("click", function (e) {
    // 수량 + / - 버튼 찾기
    const qtyBtn = e.target.closest(".qty-btn");
    if (qtyBtn) {
      const idx = Number(qtyBtn.dataset.idx);     // 대상 상품 index
      const delta = Number(qtyBtn.dataset.delta); // +1 또는 -1
      const cart = getCart();
      if (!cart[idx]) return;

      const current = cart[idx].qty || 1;
      const next = current + delta;

      if (next <= 0) {
        // 수량이 0 이하가 되면 삭제 여부 확인
        if (!confirm("해당 상품을 장바구니에서 삭제할까요?")) return;
        cart.splice(idx, 1); // 해당 index 삭제
      } else {
        // 수량만 변경
        cart[idx].qty = next;
      }
      // 변경 사항 저장 후 다시 렌더링
      saveCart(cart);
      renderCart();
      return; // 아래 삭제 버튼 로직으로 내려가지 않도록 종료
    }

    // 개별 삭제 버튼 처리
    const removeBtn = e.target.closest(".cart-item-remove");
    if (removeBtn) {
      const idx = Number(removeBtn.dataset.idx);
      const cart = getCart();
      if (!cart[idx]) return;

      if (confirm("해당 상품을 삭제하시겠습니까?")) {
        cart.splice(idx, 1);
        saveCart(cart);
        renderCart();
      }
    }
  });

  // ✅ 체크박스 선택/해제 시 결제 예정 금액만 다시 계산
  box.addEventListener("change", (e) => {
    if (e.target.classList.contains("cart-item-check-input")) {
      updateSummary();
    }
  });

  // 선택 상품 구매
  if (btnOrderAll) {
    btnOrderAll.addEventListener("click", () => {
      const cart = getCart();
      if (!cart.length) {
        alert("장바구니에 담긴 상품이 없습니다.");
        return;
      }

      const selectedIdxs = getSelectedIndexes();
      if (!selectedIdxs.length) {
        alert("구매할 상품을 선택해주세요.");
        return;
      }

      if (!confirm(`선택한 ${selectedIdxs.length}개 상품을 구매하시겠습니까?`)) {
        return;
      }

      // 실제 결제를 구현하지 않고,
      // 구매했다고 가정하고 선택된 항목만 장바구니에서 제거
      const newCart = cart.filter((_, idx) => !selectedIdxs.includes(idx));
      saveCart(newCart);
      renderCart();

      alert("구매가 완료되었습니다.");
    });
  }

  // 선택 상품 삭제
  if (btnDeleteSelected) {
    btnDeleteSelected.addEventListener("click", () => {
      const cart = getCart();
      if (!cart.length) {
        alert("장바구니에 담긴 상품이 없습니다.");
        return;
      }

      const selectedIdxs = getSelectedIndexes();
      if (!selectedIdxs.length) {
        alert("삭제할 상품을 선택해주세요.");
        return;
      }

      if (!confirm(`선택한 ${selectedIdxs.length}개 상품을 삭제하시겠습니까?`)) {
        return;
      }

      // 선택된 index를 제외하고 새 배열 생성
      const newCart = cart.filter((_, idx) => !selectedIdxs.includes(idx));
      saveCart(newCart);
      renderCart();
    });
  }

  // 초기 렌더링 (페이지 들어왔을 때 장바구니 상태 보여주기)
  renderCart();
}

// =========================================
//   공통 초기화 (모든 페이지에서 실행)
// =========================================
document.addEventListener("DOMContentLoaded", () => {
  initProductCart(); // 상품 상세 페이지 버튼 활성화 (해당 요소가 없으면 내부에서 자동 무시)
  initCartPage();    // 장바구니 페이지 렌더링 (cartList가 없으면 내부에서 자동 무시)
});
