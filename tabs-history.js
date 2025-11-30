// tabs-history.js - 한정헌
// 페이지 안의 탭 상태를 URL 쿼리와 history 에 같이 묶어주는 유틸
// - 여러 탭(예: players/standings, info/review 등)을
//   ?tab=players 같은 형태로 URL에 반영하고
//   브라우저 뒤로가기/앞으로가기를 눌렀을 때도
//   탭 상태가 함께 변하도록 도와주는 공통 스크립트

(function () {
  // key별로 onChange, default 값 저장
  // 예: { tab: { defaultVal: 'players', onChange: f }, gmonth: {...}, ... }
  const tabStores = {};

  /**
   * 현재 location.pathname과 주어진 쿼리파라미터(params)를 합쳐서
   * 최종 URL 문자열을 만드는 함수
   *  - params: URLSearchParams 객체
   */
  function buildUrl(params) {
    // URLSearchParams를 문자열로 변환 (? 뒤에 들어갈 내용)
    const qs = params.toString();
    // 쿼리스트링이 있으면 "path?쿼리" 형식, 없으면 "path"만
    return qs ? `${location.pathname}?${qs}` : location.pathname;
  }

  /**
   * 탭 그룹 등록 + 최초 상태 복원
   *
   *   key         : URL 쿼리 이름 (예: "tab", "conf", "scat"...)
   *   defaultVal  : 값이 없을 때 기본 탭 값
   *   onChange(v, push):
   *      - v    : 선택된 값 (예: "players", "standings")
   *      - push : true 면 사용자가 탭을 클릭해서 바뀐 것,
   *               false 면 popstate(뒤로가기/앞으로가기) 또는 초기 setup에서 호출된 것
   *
   * 사용 예:
   *   setupTabHistory("tab", "players", (mode, push) => {
   *     changeCategoryMode(mode, push);
   *   });
   */
  window.setupTabHistory = function (key, defaultVal, onChange) {
    // 이 key에 대한 기본값과 onChange 콜백을 저장
    tabStores[key] = { defaultVal, onChange };

    // 현재 URL의 쿼리 파라미터 읽어오기
    const params = new URLSearchParams(location.search);
    // URL에 이미 key가 있으면 그 값을 쓰고, 없으면 defaultVal 사용
    let value = params.get(key) || defaultVal;
    // URLSearchParams 객체에도 현재 선택된 값을 세팅해 줌
    params.set(key, value);

    // 기존 history.state가 객체 형태이면 복사하고, 아니면 빈 객체 사용
    const prevState = (history.state && typeof history.state === "object")
      ? history.state
      : {};
    // 기존 state에 현재 key의 값(value)을 덮어쓴 새 state 구성
    const newState = { ...prevState, [key]: value };

    // 현재 history entry를 교체(replaceState)
    //  - URL도 buildUrl(params)로 업데이트
    history.replaceState(newState, document.title, buildUrl(params));

    // 초기 호출: onChange를 호출하되, push=false로 전달해서
    // "지금은 history를 새로 쌓는 상황이 아니다"라는 의미를 줌
    onChange(value, false); // 초기 호출에서는 pushState 안 함
  };

  /**
   * 탭 값 변경 시 URL + history 에 반영
   *
   *   key   : URL 쿼리에서 사용할 이름 (예: "tab")
   *   value : 변경할 값 (예: "players" / "standings")
   *   push  : true면 history.pushState, false면 history.replaceState
   */
  window.updateTabHistory = function (key, value, push = true) {
    // 현재 URL 쿼리 읽어오기
    const params = new URLSearchParams(location.search);
    // 변경하려는 key의 값을 새 value로 설정
    params.set(key, value);

    // 기존 state 유지
    const prevState = (history.state && typeof history.state === "object")
      ? history.state
      : {};
    // 현재 key의 값을 새 value로 덮어쓴 state 구성
    const newState = { ...prevState, [key]: value };

    if (push === false) {
      // push=false 인 경우:
      //   - 현재 히스토리 엔트리를 교체(replaceState)
      //   - 뒤로가기/앞으로가기 스택은 늘어나지 않음
      history.replaceState(newState, document.title, buildUrl(params));
    } else {
      // push=true 인 경우:
      //   - 새로운 히스토리 엔트리를 쌓음(pushState)
      //   - 뒤로가기/앞으로가기에 영향을 주는 시점
      history.pushState(newState, document.title, buildUrl(params));
    }
  };

  /**
   * 브라우저 뒤로가기(popstate) / 앞으로가기(popstate) 시
   *   - history.state에 저장된 탭 상태들을 읽어와서
   *   - 각 탭 그룹별 onChange를 호출하여 UI를 다시 맞춰줌
   */
  window.addEventListener("popstate", (event) => {
    // event.state: 현재 히스토리 엔트리에 저장된 객체
    const state = event.state || {};
    // 등록된 모든 탭 그룹(key)에 대해 반복
    Object.keys(tabStores).forEach((key) => {
      const store = tabStores[key];
      // state에 해당 key 값이 있으면 사용, 없으면 기본값(defaultVal) 사용
      const value = state[key] || store.defaultVal;
      // popstate 에서는 push=false로 onChange 호출
      //  → UI는 바뀌지만, history는 더 쌓지 않음
      store.onChange(value, false); // popstate 에서는 pushState 하지 않음
    });
  });
})();
