(function () {
  function isVisible(element) {
    if (!element || !(element instanceof Element)) {
      return false;
    }

    const style = window.getComputedStyle(element);
    if (style.display === "none") return false;
    if (style.visibility === "hidden") return false;
    if (style.opacity === "0") return false;
    if (style.pointerEvents === "none") return false;

    const rect = element.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return false;

    return true;
  }

  window.__autofillUtils = window.__autofillUtils || {};
  window.__autofillUtils.isVisible = isVisible;
})();
