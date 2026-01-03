# 🔄 Emergency Rollback Plan (VIDIST v2.4.2 -> v2.4.1)

Use this plan to revert all changes made for the **Image Edit History** feature.

## 1. Revert `js/version.js`
- **Action**: Change version info back to v2.4.1
- **Location**: Top of file
- **Code to Change**:
  ```javascript
  // Change back to:
  major: 2,
  minor: 4,
  patch: 1,
  build: '12312025',
  ```
- **Remove Feature**: Remove the line `'📸 Image Edit History v2.4.2 ...'` from `features` array.

## 2. Revert `js/config.js`
- **Action**: Remove the `ws-wan-26-image-edit` model configuration.
- **Location**: Inside `MODEL_CONFIG` object (around line 83-95).
- **Code to Remove**:
  ```javascript
  // Wan 2.6 Image Edit
  "ws-wan-26-image-edit": {
      ...
  },
  ```

## 3. Revert `main.html`

### 3.1 Revert Title
- **Location**: `<title>` tag (around line 57)
- **Action**: Change back to `VIDIST v2.3.0 - Precision Creative Engine` (or previous state).

### 3.2 Remove `escapeHtml` Function
- **Location**: Around line 2830
- **Action**: Delete the function `function escapeHtml(unsafe) { ... }`.

### 3.3 Revert `editImage_Wavespeed` & `pollImageEditStatus`
- **Location**: Around line 5895-5945
- **Action**:
  1. Remove `saveTaskInput(...)` call.
  2. Remove Placeholder creation block (`const placeholderImageData = ...`).
  3. Remove Global tracking variables (`let currentEditPredictionId...`).
  4. In `pollImageEditStatus`, remove the assignment of these global variables.

### 3.4 Revert `handleImageEditComplete`
- **Location**: Around line 6100
- **Action**: Remove the block `// ========== ✨ NEW: Update placeholder in videoHistoryData ...`.

### 3.5 Revert `refreshHistory`
- **Location**: Around line 6360
- **Action**:
  1. Remove `outputType` detection and variable.
  2. Remove `outputType` field assignment in `historyItem`.

### 3.6 Revert `renderVideoHistory`
- **Location**: Around line 6830 (inside map loop)
- **Action**:
  1. Remove `const isImage = ...` detection.
  2. Remove `if (isImage) { return ... }` block (the entire Image Card HTML generation).
  3. Leave only the return statement for the Video Card.

### 3.7 Revert `reuseVideoParameters`
- **Location**: Around line 7093
- **Action**: Revert function signature to accept only `index`.
  ```javascript
  // Revert to:
  function reuseVideoParameters(index) {
      const video = videoHistoryData[index];
      // ...
  }
  ```

### 3.8 Remove Helper Functions
- **Location**: Bottom of script (around line 8100+)
- **Action**: Delete the block `// ========== ✨ NEW: Image Modal and Helper Functions ...` which includes:
  - `openImageModal`
  - `closeImageModal`
  - `downloadImage`
