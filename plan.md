# Plan: Autofill Extension - Randomized Visible Form Testing

## Objective / Mục tiêu
Xây dựng và duy trì Chrome Extension (Manifest V3) có khả năng autofill dữ liệu test ngẫu nhiên, tự nhiên hơn cho UI testing, nhưng chỉ áp dụng cho các field đang tương tác được (visible, không bị che, trong viewport), đồng thời cho phép người dùng tùy chỉnh dataset ngay trong popup.

## Constraints / Ràng buộc
- KHÔNG thay đổi hoặc thêm mới Model (ví dụ: `AdsGoogleModel`).
- KHÔNG lưu dữ liệu vào Database (Hasura/MongoDB).
- Chỉ lưu cấu hình dataset bằng `chrome.storage.sync`.
- Không autofill các field hidden, bị overlay che, hoặc nằm ngoài viewport.

## Workflow / Quy trình
Quy trình chính của extension:

1. **Bước 1: Trigger Autofill từ Popup hoặc Shortcut**
   * Tác vụ: User bấm nút trong popup hoặc nhấn `Alt + F`.
   * Kết quả: `popup.js` gửi message `RUN_AUTOFILL` đến content script.

2. **Bước 2: Scan và Filter Field hợp lệ**
   * Tác vụ: `content/autofill.js` quét `input, textarea, select`, sau đó filter theo pipeline:
     - `isVisible`
     - `isInteractable` (không bị che tại tâm phần tử)
     - `isInViewport`
   * Kết quả: Danh sách field đủ điều kiện để fill.

3. **Bước 3: Ưu tiên Field trong Modal (nếu có)**
   * Tác vụ: Nếu detect modal/dialog thì ưu tiên fill field nằm trong modal trước.
   * Kết quả: Tránh fill form nền phía sau overlay.

4. **Bước 4: Detect loại dữ liệu cần fill**
   * Tác vụ: `data/field-detector.js` detect theo `input.type` + heuristic từ `name/id/placeholder/aria-label/autocomplete`.
   * Kết quả: Xác định semantic type (`email`, `phone`, `address`, `company`, `url`, `paragraph`, ...).

5. **Bước 5: Load dataset theo thứ tự ưu tiên**
   * Tác vụ: `data/dataset-manager.js` merge dữ liệu theo thứ tự:
     - User custom data (`chrome.storage.sync`)
     - Extension default dataset
     - Built-in fallback values
   * Kết quả: Có dataset hiệu lực để random.

6. **Bước 6: Generate giá trị random tự nhiên**
   * Tác vụ: `data/random-generator.js` tạo dữ liệu random theo type:
     - text/email/phone/address/company/url
     - number theo range
     - date trong 5 năm gần nhất
     - textarea bằng paragraph slicing (`minWords/maxWords`)
     - checkbox 50/50, radio random trong group, select random option hợp lệ
   * Kết quả: Mỗi lần chạy cho dữ liệu khác nhau, hạn chế lặp.

7. **Bước 7: Apply value + dispatch event**
   * Tác vụ: Set value/checked/selectedIndex và dispatch `input`, `change`.
   * Kết quả: Tương thích React, Vue, Angular, Vanilla JS.

## Cấu trúc các hàm cần phát triển

### 1. Dataset Manager (`data/dataset-manager.js`)

#### Các hàm Helper (Private)

* **`normalizeDatasets`**:
  * **Mục đích**: Chuẩn hóa dữ liệu nhập từ user (trim, dedupe, validate min/max words).
  * **Input**: `unknown raw`.
  * **Output**: Object datasets đã normalize.

* **`mergeWithDefaults`**:
  * **Mục đích**: Merge theo ưu tiên user -> default -> fallback.
  * **Input**: `object userDatasets`.
  * **Output**: Effective datasets.

#### Hàm API Tổng hợp (Public)

* **`getEffectiveDatasets`**:
  * **Mục đích**: Trả về dataset hiệu lực cho autofill runtime.
  * **Input**: none.
  * **Luồng xử lý**: đọc `chrome.storage.sync`, normalize, merge với default/fallback.
  * **Output**: Promise object datasets.

* **`saveUserConfig`**:
  * **Mục đích**: Lưu dataset user từ popup.
  * **Input**: datasets object.
  * **Output**: `Promise<boolean>`.

* **`restoreDefaultConfig`**:
  * **Mục đích**: Reset dữ liệu user về default.
  * **Input**: none.
  * **Output**: `Promise<boolean>`.

### 2. Field Detector (`data/field-detector.js`)

* **`detectFieldType`**:
  * **Mục đích**: Detect semantic type của field theo input type + heuristic attributes.
  * **Input**: `Element field`.
  * **Output**: `string` type (`text`, `email`, `phone`, `address`, `company`, `url`, `paragraph`, ...).

### 3. Random Generator (`data/random-generator.js`)

* **`randomItem` / `randomInt` / `randomBoolean` / `shuffle`**:
  * **Mục đích**: Bộ utility random dùng chung.

* **`generateParagraph`**:
  * **Mục đích**: Sinh nội dung textarea bằng random slicing paragraph.
  * **Input**: `paragraphText`, `minWords`, `maxWords`.
  * **Output**: `string`.

* **`generateValue`**:
  * **Mục đích**: Sinh value theo semantic type + dataset + session cache.
  * **Input**: `string type`, `datasets`, `context`.
  * **Output**: `string` value.

### 4. Autofill Runtime (`content/autofill.js`)

* **`runAutofill`**:
  * **Mục đích**: Hàm entry chạy toàn bộ pipeline autofill cho page hiện tại.
  * **Input**: none.
  * **Luồng xử lý**:
    1) scan fields -> 2) filter visibility/interactable/viewport -> 3) modal priority -> 4) detect type -> 5) generate random value -> 6) apply + dispatch event.
  * **Output**:
    ```js
    {
      scanned: number,
      eligible: number,
      filled: number
    }
    ```

## Error Handling / Xử lý lỗi

- Không throw exception ra ngoài API message handler của extension.
- Dùng `Promise.catch`/`try-catch` ở popup và content script để tránh crash extension.
- Log lỗi bằng `console.error` hoặc hiển thị trạng thái lỗi trong popup.

## Checklist / Việc cần làm

- [x] Thiết kế kiến trúc module `data/` (dataset-manager, random-generator, field-detector)
- [x] Thêm quyền `storage` và inject các module mới vào `manifest.json`
- [x] Nâng cấp autofill flow để dùng semantic detection + random value generation
- [x] Hỗ trợ random cho checkbox/radio/select/number/date/url/tel/textarea
- [x] Bổ sung session cache để giảm trùng giá trị trong cùng lần chạy
- [x] Mở rộng popup để chỉnh sửa dataset người dùng
- [x] Lưu/đọc/restore dataset qua `chrome.storage.sync`
- [x] Cập nhật tài liệu `README.md`
- [ ] Bổ sung automated test (nếu setup test harness cho extension)
- [ ] Bổ sung UI validation chi tiết hơn cho dataset editor (error per field)

## Related Files / Files liên quan

- `manifest.json`: thêm permission `storage`, thêm script modules cho data layer.
- `content/autofill.js`: runtime autofill pipeline và apply random values.
- `content/content-script.js`: nhận message trigger và xử lý async autofill.
- `utils/visibility.js`: kiểm tra visibility.
- `utils/interactable.js`: kiểm tra element có bị che hay không.
- `utils/viewport.js`: kiểm tra field nằm trong viewport.
- `data/dataset-manager.js`: quản lý storage, normalize, merge datasets.
- `data/random-generator.js`: sinh dữ liệu random tự nhiên và utilities.
- `data/field-detector.js`: detect semantic type của field.
- `popup/popup.html`: UI popup + dataset editor.
- `popup/popup.js`: logic trigger autofill, load/save/restore dataset.
- `README.md`: mô tả behavior, workflow sử dụng, và khả năng random hóa.

## Execution Steps / Các bước thực hiện

Viết từng function nhỏ -> Test compile/reload extension -> Viết function khác -> Test compile/reload extension -> Test thủ công trên form thường + modal + overlay -> Hoàn thiện docs.
