# Visible Form Autofill (Chrome Extension)

Chrome Extension (Manifest V3) that autofills only form fields that are currently visible, interactable, and fully inside the viewport.

It is designed for frontend testing on real pages with overlays/modals, and avoids filling hidden or covered fields.

## Features

- Supports `input`, `textarea`, and `select`
- Supported input types:
  - `text`, `email`, `search`, `password`, `number`, `checkbox`, `radio`
- Filtering pipeline before fill:
  1. Visible check
  2. Interactable / not covered check
  3. In-viewport check
- Modal-priority mode (if modal containers exist, fields inside them are prioritized)
- Trigger methods:
  - Popup button
  - Keyboard shortcut: `Alt + F`
- Dispatches `input` and `change` events for SPA compatibility (React/Vue/Angular)

## Autofill Rules

| Field | Value |
|---|---|
| text | `test` |
| email | `test@example.com` |
| password | `123456` |
| number | `123` |
| checkbox | checked |
| radio | first visible option per group |
| textarea | `test content` |
| select | option index `1` (or `0` if only one option) |

## Project Structure

```text
autofill-extension/
  manifest.json
  content/
    content-script.js
    autofill.js
  utils/
    visibility.js
    interactable.js
    viewport.js
  popup/
    popup.html
    popup.js
```

## Install (Load Unpacked)

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select this folder (the one containing `manifest.json`)

## Usage

- Open any page with forms.
- Click the extension icon and press **Autofill Active Page**.
- Or press `Alt + F` while the page is focused.

Popup status reports:
- `scanned`: total discovered fields
- `eligible`: fields that passed all checks
- `filled`: fields updated with test values

## Validation Scenarios

### Scenario 1: Page form + overlay + modal form

Expected:
- Only modal fields are filled (if modal selectors are present and fields are eligible)
- Covered/background form fields are skipped

### Scenario 2: Hidden form fields

Examples:
- `display: none`
- `visibility: hidden`
- `opacity: 0`
- `pointer-events: none`

Expected:
- Hidden fields are ignored

### Scenario 3: Fields outside viewport

Expected:
- Out-of-viewport fields are ignored

## Notes

- The extension intentionally avoids autofilling non-interactable elements.
- It does not require build tooling or extra configuration.
