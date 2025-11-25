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
    // 저장된 값이 없으면 빈 배열 반환
    return JSON.parse(localStorage.getItem("ensCart") || "[]");
  } catch (e) {
    return [];
  }
}

// 로컬스토리지에 장바구니 저장
function saveCart(cart) {
  localStorage.setItem("ensCart", JSON.stringify(cart));
}


/**
 * 장바구니에 상품 추가
 * product: { name, price, img }
 * qty: 기본 1
 */
function addToCart(product, qty) {
  if (!product || !product.name) return;  // 상품 정보 없으면 중단

  const cart = getCart(); // 현재 장바구니 가져오기

  // 같은 상품 이름이 있는지 검사
  const index = cart.findIndex((i) => i.name === product.name);

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

  saveCart(cart); // 저장
}


// =========================================
//   로그인 여부 체크 (로그인 필요 기능 보호)
// =========================================
function requireLoginForCart() {
  // getCurrentUser → auth.js에서 제공됨
  if (typeof getCurrentUser !== "function" || !getCurrentUser()) {
    // 로그인 안 되어있으면 로그인 모달 호출
    if (typeof openLoginDialog === "function") {
      openLoginDialog();
    } else {
      alert("로그인이 필요합니다.");
    }
    return false;
  }
  return true;
}


// =========================================
//   상품 상세 페이지 - 장바구니 알림 토스트 UI
// =========================================
function showCartToast() {
  let toast = document.getElementById("cartToast");

  // 토스트가 최초 생성이라면 만들기
  if (!toast) {
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
    if (actions) {
      actions.appendChild(toast);
    } else {
      document.body.appendChild(toast);
    }

    // "장바구니 바로가기" 버튼 클릭 이벤트
    const btn = document.getElementById("goCartBtn");
    if (btn) {
      btn.addEventListener("click", () => {
        toast.style.display = "none";
        location.href = "cart.html"; // 장바구니 페이지 이동
      });
    }
  }

  toast.style.display = "block"; // 토스트 표시
}


// =========================================
//   상품 상세 페이지에서 상품 정보 읽기
// =========================================
function readProductFromDetailPage() {
  const nameEl = document.getElementById("detailName");
  const priceEl = document.getElementById("detailPrice");
  const imgEl = document.getElementById("detailImg");

  // 요소가 없으면 상품 상세 페이지가 아님
  if (!nameEl || !priceEl || !imgEl) return null;

  const name = (nameEl.textContent || "").trim();
  const price = (priceEl.textContent || "").trim();
  const img = imgEl.getAttribute("src");

  if (!name) return null; // 이름 없으면 상품이 아님

  return { name, price, img };
}


// =========================================
//   상품 상세 페이지 초기화 (장바구니/구매 버튼)
// =========================================
function initProductCart() {
  const btnCart = document.getElementById("btnCart"); // 장바구니 버튼
  const btnBuy = document.getElementById("btnBuy");   // 바로구매 버튼

  // 둘 다 없으면 상품 상세 화면이 아님
  if (!btnCart && !btnBuy) return;

  // 장바구니 버튼
  if (btnCart) {
    btnCart.addEventListener("click", () => {
      if (!requireLoginForCart()) return; // 로그인 체크

      const product = readProductFromDetailPage();
      if (!product) return;

      addToCart(product, 1); // 1개 추가
      showCartToast(); // 토스트 띄우기
    });
  }

  // 바로 구매 버튼
  if (btnBuy) {
    btnBuy.addEventListener("click", () => {
      if (!requireLoginForCart()) return;

      const product = readProductFromDetailPage();
      if (!product) return;

      addToCart(product, 1);
      location.href = "cart.html"; // 바로 장바구니로 이동
    });
  }
}


// =========================================
//   장바구니 페이지(cart.html) 렌더링
// =========================================
function initCartPage() {
  const box = document.getElementById("cartList");        // 상품 목록 표시
  const countEl = document.getElementById("cartCount");   // 상품 개수
  const totalEl = document.getElementById("cartTotalPrice"); // 총 금액
  const finalEl = document.getElementById("cartFinalPrice"); // 최종 금액
  const btnOrderAll = document.getElementById("btnOrderAll"); // 전체 구매 버튼

  // cartList가 없으면 장바구니 페이지 아님
  if (!box) return;

  // "10,000원 → 숫자 10000" 변환
  function parsePriceNumber(str) {
    const num = parseInt(String(str || "0").replace(/[^\d]/g, ""), 10);
    return isNaN(num) ? 0 : num;
  }

  // 숫자 → "10,000원" 변환
  function formatPrice(num) {
    const n = Number(num) || 0;
    return n.toLocaleString("ko-KR") + "원";
  }

  // 장바구니 화면 렌더링
  function renderCart() {
    const list = getCart(); // 전체 장바구니

    // 상품 개수 표시
    if (countEl) countEl.textContent = list.length;

    // 장바구니가 비어있을 때
    if (!list.length) {
      box.innerHTML = `<div class="cart-empty">장바구니에 담긴 상품이 없습니다.</div>`;
      if (totalEl) totalEl.textContent = "0원";
      if (finalEl) finalEl.textContent = "0원";
      return;
    }

    let total = 0;      // 총 금액 계산
    box.innerHTML = ""; // 초기화

    list.forEach((item, index) => {
      const priceNum = parsePriceNumber(item.price); // 숫자로 변환
      const qty = item.qty || 1; // 수량
      const itemTotal = priceNum * qty; // 상품별 합계
      total += itemTotal; // 전체 합계 누적

      // 장바구니 아이템 HTML 생성
      box.innerHTML += `
        <div class="cart-item">
          <div class="cart-item-check">
            <input type="checkbox" checked>
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

    if (totalEl) totalEl.textContent = formatPrice(total);  // 총 상품 금액
    if (finalEl) finalEl.textContent = formatPrice(total);  // 최종 결제 금액
  }


  // ===============================
  //   수량 + / - , 삭제 이벤트 처리
  // ===============================
  document.addEventListener("click", function (e) {

    // (1) 수량 증가/감소 버튼
    const qtyBtn = e.target.closest(".qty-btn");
    if (qtyBtn) {
      const idx = Number(qtyBtn.dataset.idx);       // 상품 인덱스
      const delta = Number(qtyBtn.dataset.delta);   // -1 or +1
      const cart = getCart();

      if (!cart[idx]) return;

      const current = cart[idx].qty || 1;        // 현재 수량
      const next = current + delta;              // 변경된 수량

      if (next <= 0) {
        // 수량 0 이하 → 삭제 여부 확인
        if (!confirm("해당 상품을 장바구니에서 삭제할까요?")) return;
        cart.splice(idx, 1); // 상품 삭제
      } else {
        cart[idx].qty = next; // 수량 변경
      }

      saveCart(cart); // 변경 내용 저장
      renderCart();   // 화면 다시 렌더링
      return;
    }

    // (2) 삭제 버튼
    const removeBtn = e.target.closest(".cart-item-remove");
    if (removeBtn) {
      const idx = Number(removeBtn.dataset.idx);
      const cart = getCart();

      if (!cart[idx]) return;

      if (confirm("해당 상품을 삭제하시겠습니까?")) {
        cart.splice(idx, 1); // 삭제
        saveCart(cart);
        renderCart();
      }
    }
  });


  // ===============================
  // 전체 구매 버튼
  // ===============================
  if (btnOrderAll) {
    btnOrderAll.addEventListener("click", () => {
      const cart = getCart();

      if (!cart.length) {
        alert("장바구니에 담긴 상품이 없습니다.");
        return;
      }

      alert("구매완료!"); // 실제 결제는 없음
    });
  }

  // 초기 렌더링 실행
  renderCart();
}


// =========================================
//   공통 초기화 (모든 페이지에서 실행)
// =========================================
document.addEventListener("DOMContentLoaded", () => {
  initProductCart(); // 상품 상세 페이지 버튼 활성화
  initCartPage();    // 장바구니 페이지 렌더링
});
