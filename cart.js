// cart.js
// ==============================
//   공통 장바구니 기능 + 페이지별 초기화
//   - ensCart 로컬스토리지 사용
//   - 상품 상세 페이지(장바구니/바로구매 버튼)
//   - 장바구니 페이지(cart.html) 렌더링
// ==============================

// ---- 공통: 장바구니 데이터 ----
function getCart() {
  try {
    return JSON.parse(localStorage.getItem("ensCart") || "[]");
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem("ensCart", JSON.stringify(cart));
}

/**
 * 장바구니에 상품 추가
 * product: { name, price, img }
 * qty: 수량 (기본 1)
 */
function addToCart(product, qty) {
  if (!product || !product.name) return;

  const cart = getCart();
  const index = cart.findIndex((i) => i.name === product.name);
  const q = qty || 1;

  if (index >= 0) {
    // 이미 있는 상품 → 수량만 증가
    cart[index].qty = (cart[index].qty || 1) + q;
  } else {
    cart.push({
      name: product.name,
      price: product.price,
      img: product.img,
      qty: q,
    });
  }

  saveCart(cart);
}

// ---- 공통: 로그인 체크 ----
function requireLoginForCart() {
  // getCurrentUser는 auth.js(또는 기존 search.js)에서 제공
  if (typeof getCurrentUser !== "function" || !getCurrentUser()) {
    if (typeof openLoginDialog === "function") {
      openLoginDialog();
    } else {
      alert("로그인이 필요합니다.");
    }
    return false;
  }
  return true;
}

// ---- 상품 상세 페이지: 토스트 ----
function showCartToast() {
  let toast = document.getElementById("cartToast");
  if (!toast) {
    const actions = document.querySelector(".product-detail-actions");

    toast = document.createElement("div");
    toast.id = "cartToast";
    toast.innerHTML = `
      <div class="cart-toast-box">
        <div class="cart-toast-text">상품이 장바구니에 담겼습니다.</div>
        <button class="cart-toast-btn" id="goCartBtn">장바구니 바로가기 &gt;</button>
      </div>
    `;

    if (actions) {
      actions.appendChild(toast);
    } else {
      document.body.appendChild(toast);
    }

    const btn = document.getElementById("goCartBtn");
    if (btn) {
      btn.addEventListener("click", () => {
        toast.style.display = "none";
        location.href = "cart.html";
      });
    }
  }

  toast.style.display = "block";
}

// ---- 상품 상세 페이지: 현재 화면에서 상품 정보 읽기 ----
function readProductFromDetailPage() {
  const nameEl = document.getElementById("detailName");
  const priceEl = document.getElementById("detailPrice");
  const imgEl = document.getElementById("detailImg");

  if (!nameEl || !priceEl || !imgEl) return null;

  const name = (nameEl.textContent || "").trim();
  const price = (priceEl.textContent || "").trim();
  const img = imgEl.getAttribute("src");

  if (!name) return null;

  return { name, price, img };
}

// ---- 상품 상세 페이지 초기화 (btnCart / btnBuy) ----
function initProductCart() {
  const btnCart = document.getElementById("btnCart");
  const btnBuy = document.getElementById("btnBuy");

  // 상품 상세 페이지가 아니면 패스
  if (!btnCart && !btnBuy) return;

  if (btnCart) {
    btnCart.addEventListener("click", () => {
      if (!requireLoginForCart()) return;

      const product = readProductFromDetailPage();
      if (!product) return;

      addToCart(product, 1);
      showCartToast();
    });
  }

  if (btnBuy) {
    btnBuy.addEventListener("click", () => {
      if (!requireLoginForCart()) return;

      const product = readProductFromDetailPage();
      if (!product) return;

      addToCart(product, 1);
      // 바로 구매 → 장바구니 페이지로 이동
      location.href = "cart.html";
    });
  }
}

// ---- 장바구니 페이지(cart.html) 초기화 ----
function initCartPage() {
  const box = document.getElementById("cartList");
  const countEl = document.getElementById("cartCount");
  const totalEl = document.getElementById("cartTotalPrice");
  const finalEl = document.getElementById("cartFinalPrice");
  const btnOrderAll = document.getElementById("btnOrderAll");

  // cartList가 없으면 장바구니 페이지가 아님
  if (!box) return;

  function parsePriceNumber(str) {
    const num = parseInt(String(str || "0").replace(/[^\d]/g, ""), 10);
    return isNaN(num) ? 0 : num;
  }

  function formatPrice(num) {
    const n = Number(num) || 0;
    return n.toLocaleString("ko-KR") + "원";
  }

  function renderCart() {
    const list = getCart();

    if (countEl) countEl.textContent = list.length;

    if (!list.length) {
      box.innerHTML = `<div class="cart-empty">장바구니에 담긴 상품이 없습니다.</div>`;
      if (totalEl) totalEl.textContent = "0원";
      if (finalEl) finalEl.textContent = "0원";
      return;
    }

    let total = 0;
    box.innerHTML = "";

    list.forEach((item, index) => {
      const priceNum = parsePriceNumber(item.price);
      const qty = item.qty || 1;
      const itemTotal = priceNum * qty;
      total += itemTotal;

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

    if (totalEl) totalEl.textContent = formatPrice(total);
    if (finalEl) finalEl.textContent = formatPrice(total);
  }

  // 수량/삭제 버튼 이벤트 (위임)
  document.addEventListener("click", function (e) {
    const qtyBtn = e.target.closest(".qty-btn");
    if (qtyBtn) {
      const idx = Number(qtyBtn.dataset.idx);
      const delta = Number(qtyBtn.dataset.delta);
      const cart = getCart();
      if (!cart[idx]) return;

      const current = cart[idx].qty || 1;
      const next = current + delta;
      if (next <= 0) {
        if (!confirm("해당 상품을 장바구니에서 삭제할까요?")) return;
        cart.splice(idx, 1);
      } else {
        cart[idx].qty = next;
      }
      saveCart(cart);
      renderCart();
      return;
    }

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

  if (btnOrderAll) {
    btnOrderAll.addEventListener("click", () => {
      const cart = getCart();
      if (!cart.length) {
        alert("장바구니에 담긴 상품이 없습니다.");
        return;
      }
      alert("구매완료!");
    });
  }
  

  // 초기 렌더링
  renderCart();
}

// ---- 공통 초기화 ----
document.addEventListener("DOMContentLoaded", () => {
  initProductCart();
  initCartPage();
});
