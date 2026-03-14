(function () {
  const FIELD_SELECTOR = "input, textarea, select";
  const MODAL_SELECTORS = [
    '[role="dialog"]',
    '[aria-modal="true"]',
    ".modal",
    ".ant-modal",
    ".MuiDialog-root"
  ];

  function dispatchFieldEvents(element) {
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function setInputValue(input, radioState) {
    const type = (input.type || "text").toLowerCase();

    if (type === "hidden" || type === "file") {
      return false;
    }

    if (type === "checkbox") {
      if (!input.checked) {
        input.checked = true;
        dispatchFieldEvents(input);
      }
      return true;
    }

    if (type === "radio") {
      const groupName = input.name || `__no_name__${radioState.unnamedIndex++}`;
      if (radioState.processedGroups.has(groupName)) {
        return false;
      }

      radioState.processedGroups.add(groupName);
      if (!input.checked) {
        input.checked = true;
        dispatchFieldEvents(input);
      }
      return true;
    }

    const valueByType = {
      email: "test@example.com",
      password: "123456",
      number: "123",
      search: "test",
      text: "test"
    };

    const nextValue = valueByType[type] ?? "test";
    if (input.value !== nextValue) {
      input.value = nextValue;
      dispatchFieldEvents(input);
    }
    return true;
  }

  function setFieldValue(field, radioState) {
    if (field instanceof HTMLInputElement) {
      return setInputValue(field, radioState);
    }

    if (field instanceof HTMLTextAreaElement) {
      const nextValue = "test content";
      if (field.value !== nextValue) {
        field.value = nextValue;
        dispatchFieldEvents(field);
      }
      return true;
    }

    if (field instanceof HTMLSelectElement) {
      if (!field.options.length) {
        return false;
      }

      const nextIndex = field.options.length > 1 ? 1 : 0;
      if (field.selectedIndex !== nextIndex) {
        field.selectedIndex = nextIndex;
        dispatchFieldEvents(field);
      }
      return true;
    }

    return false;
  }

  function shouldFill(field) {
    if (!(field instanceof Element)) {
      return false;
    }

    if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
      if (field.readOnly) {
        return false;
      }
    }

    const utils = window.__autofillUtils || {};
    const visible = typeof utils.isVisible === "function" ? utils.isVisible(field) : false;
    const interactable = typeof utils.isInteractable === "function" ? utils.isInteractable(field) : false;
    const inViewport = typeof utils.isInViewport === "function" ? utils.isInViewport(field) : false;

    return visible && interactable && inViewport;
  }

  function getTargetFields(allFields) {
    const eligible = allFields.filter(shouldFill);
    if (!eligible.length) {
      return [];
    }

    const modals = document.querySelectorAll(MODAL_SELECTORS.join(","));
    if (!modals.length) {
      return eligible;
    }

    const modalFields = eligible.filter((field) => {
      for (const modal of modals) {
        if (modal.contains(field)) {
          return true;
        }
      }
      return false;
    });

    return modalFields.length ? modalFields : eligible;
  }

  function runAutofill() {
    const fields = Array.from(document.querySelectorAll(FIELD_SELECTOR));
    const targetFields = getTargetFields(fields);

    const radioState = {
      processedGroups: new Set(),
      unnamedIndex: 0
    };

    let filledCount = 0;
    for (const field of targetFields) {
      if (setFieldValue(field, radioState)) {
        filledCount += 1;
      }
    }

    return {
      scanned: fields.length,
      eligible: targetFields.length,
      filled: filledCount
    };
  }

  window.__autofillExtension = window.__autofillExtension || {};
  window.__autofillExtension.runAutofill = runAutofill;
})();
