(function () {
  function isInViewport(element) {
    if (!element || !(element instanceof Element)) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );
  }

  window.__autofillUtils = window.__autofillUtils || {};
  window.__autofillUtils.isInViewport = isInViewport;
})();
