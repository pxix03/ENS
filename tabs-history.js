// tabs-history.js
// 페이지 안의 탭 상태를 URL 쿼리와 history 에 같이 묶어주는 유틸

(function () {
  // key별로 onChange, default 값 저장
  const tabStores = {};

  function buildUrl(params) {
    const qs = params.toString();
    return qs ? `${location.pathname}?${qs}` : location.pathname;
  }

  /**
   * 탭 그룹 등록 + 최초 상태 복원
   *   key         : URL 쿼리 이름 (예: "tab", "conf", "scat"...)
   *   defaultVal  : 값이 없을 때 기본 탭
   *   onChange(v, push):
   *      - v    : 선택된 값
   *      - push : true 면 사용자가 클릭해서 바뀐 것, false 면 popstate / 초기화
   */
  window.setupTabHistory = function (key, defaultVal, onChange) {
    tabStores[key] = { defaultVal, onChange };

    const params = new URLSearchParams(location.search);
    let value = params.get(key) || defaultVal;
    params.set(key, value);

    const prevState = (history.state && typeof history.state === "object")
      ? history.state
      : {};
    const newState = { ...prevState, [key]: value };

    history.replaceState(newState, document.title, buildUrl(params));
    onChange(value, false); // 초기 호출에서는 pushState 안 함
  };

  /**
   * 탭 값 변경 시 URL + history 에 반영
   */
  window.updateTabHistory = function (key, value, push = true) {
    const params = new URLSearchParams(location.search);
    params.set(key, value);

    const prevState = (history.state && typeof history.state === "object")
      ? history.state
      : {};
    const newState = { ...prevState, [key]: value };

    if (push === false) {
      // 현재 엔트리만 교체
      history.replaceState(newState, document.title, buildUrl(params));
    } else {
      // 새 히스토리 쌓기
      history.pushState(newState, document.title, buildUrl(params));
    }
  };

  /**
   * 브라우저 뒤로가기 / 앞으로가기
   */
  window.addEventListener("popstate", (event) => {
    const state = event.state || {};
    Object.keys(tabStores).forEach((key) => {
      const store = tabStores[key];
      const value = state[key] || store.defaultVal;
      store.onChange(value, false); // popstate 에서는 pushState 하지 않음
    });
  });
})();
