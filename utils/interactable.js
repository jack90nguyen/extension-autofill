(function () {
  function isInteractable(element) {
    if (!element || !(element instanceof Element)) {
      return false;
    }

    if (element.hasAttribute("disabled") || element.getAttribute("aria-disabled") === "true") {
      return false;
    }

    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const topElement = document.elementFromPoint(centerX, centerY);
    if (!topElement) {
      return false;
    }

    return topElement === element || element.contains(topElement);
  }

  window.__autofillUtils = window.__autofillUtils || {};
  window.__autofillUtils.isInteractable = isInteractable;
})();
