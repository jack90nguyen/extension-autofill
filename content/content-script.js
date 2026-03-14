function handleAutofillRequest(sendResponse) {
  try {
    const api = window.__autofillExtension || {};
    const runAutofill = api.runAutofill;
    if (typeof runAutofill !== "function") {
      throw new Error("Autofill runtime unavailable");
    }

    const result = runAutofill();
    sendResponse({ ok: true, result });
  } catch (error) {
    sendResponse({
      ok: false,
      error: error instanceof Error ? error.message : "Autofill failed"
    });
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "RUN_AUTOFILL") {
    handleAutofillRequest(sendResponse);
    return true;
  }
  return false;
});

window.addEventListener("keydown", (event) => {
  if (event.altKey && !event.shiftKey && !event.ctrlKey && !event.metaKey && event.key.toLowerCase() === "f") {
    const api = window.__autofillExtension || {};
    if (typeof api.runAutofill === "function") {
      api.runAutofill();
    }
  }
});
