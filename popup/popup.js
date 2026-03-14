const runButton = document.getElementById("runAutofill");
const statusEl = document.getElementById("status");

function setStatus(text) {
  if (statusEl) {
    statusEl.textContent = text;
  }
}

async function sendAutofillMessage() {
  setStatus("Scanning fields...");
  runButton.disabled = true;

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      setStatus("No active tab found.");
      return;
    }

    const response = await chrome.tabs.sendMessage(tab.id, { type: "RUN_AUTOFILL" });
    if (!response?.ok) {
      setStatus(`Error: ${response?.error || "Autofill failed"}`);
      return;
    }

    const { scanned, eligible, filled } = response.result;
    setStatus(`Done. scanned=${scanned}, eligible=${eligible}, filled=${filled}`);
  } catch (_error) {
    setStatus("Unable to run on this page. Reload tab if needed.");
  } finally {
    runButton.disabled = false;
  }
}

runButton.addEventListener("click", sendAutofillMessage);
