# 🖼️ Image Attachment System - Technical Reference

## 📋 Overview

ระบบจัดการภาพที่แนบเพื่อใช้เป็นภาพเริ่มต้น (First Frame) สำหรับ Image-to-Video mode ใน VIDIST

---

## 🏗️ Architecture

### Core Components

```
User Input → Storage → Persistence → Restore
    ↓          ↓           ↓            ↓
  Upload   imageBase64   localStorage  Preview
  / URL     Variable      (Cache)      Update
```

---

## 📂 ไฟล์ที่เกี่ยวข้อง

| ไฟล์ | บรรทัด | หน้าที่ |
|------|--------|---------|
| `main.html` | 3082 | localStorage keys definition |
| `main.html` | 3153-3176 | `saveImageToStorage()` function |
| `main.html` | 3228-3234 | Image restore logic in `loadAllStateFromStorage()` |
| `main.html` | 3261-3275 | `restoreImagePreview()` function |
| `main.html` | 4782-4872 | `handleImageUrl()` - URL loading |
| `main.html` | 5140-5242 | `handleFiles()` - File upload |
| `main.html` | 4592-4601 | `clearUploadedImage()` |

---

## 🔑 localStorage Keys

```javascript
// Line 3082
const ATTACHED_IMAGE_STORAGE_KEY = 'vidist_attached_image';
```

**Data Format:**
- Base64 string (if uploaded/pasted): `"data:image/png;base64,iVBORw0KG..."`
- URL string (if CORS blocked): `"https://example.com/image.jpg"`

---

## 🔄 Data Flow

### 1. **Image Upload** (3 วิธี)

#### A. File Upload (Drag & Drop / Click)
```javascript
handleFiles() → reader.onload → {
    imageBase64Data = e.target.result;
    saveImageToStorage(imageBase64Data);  // ✅ Line 5190
    updatePreview();
}
```

#### B. Paste from Clipboard (Ctrl+V)
```javascript
paste event → handleFiles() → same as above ✅
```

#### C. Image URL
```javascript
handleImageUrl() → {
    Case 1 (CORS OK):
        canvas.toDataURL() → imageBase64Data
        saveImageToStorage(imageBase64Data);  // ✅ Line 4812

    Case 2 (CORS blocked):
        handleImageUrlFallback() → imageBase64Data = url
        saveImageToStorage(url);  // ✅ Line 4855
}
```

---

### 2. **Storage Function**

```javascript
// Line 3153-3176
function saveImageToStorage(base64Data) {
    if (!base64Data) {
        localStorage.removeItem(ATTACHED_IMAGE_STORAGE_KEY);
        return;
    }

    const success = safeSetLocalStorage(ATTACHED_IMAGE_STORAGE_KEY, base64Data);
    // safeSetLocalStorage() checks quota and size limits
}
```

**Quota Protection:**
- Max size: 500KB per item
- Auto-cleanup if quota exceeded
- Logs size in KB

---

### 3. **Restore on Page Load**

```javascript
// Line 3228-3234 in loadAllStateFromStorage()
const savedImage = localStorage.getItem(ATTACHED_IMAGE_STORAGE_KEY);
if (savedImage) {
    imageBase64Data = savedImage;  // Restore to global variable
    restoreImagePreview(savedImage);  // Update UI
}
```

**Called from:** `initializeApp()` Phase 6 (line 3789)

---

### 4. **UI Update Function**

```javascript
// Line 3261-3275
function restoreImagePreview(base64Data) {
    const imagePreview = document.getElementById('image-preview');
    const uploadedImage = document.getElementById('uploaded-image');
    const removeImageBtn = document.getElementById('remove-image-btn');

    if (imagePreview && uploadedImage) {
        uploadedImage.src = base64Data;
        imagePreview.classList.remove('hidden');
        removeImageBtn?.classList.remove('hidden');
    }
}
```

**UI Elements Updated:**
- `#image-preview` - Container
- `#uploaded-image` - `<img>` element
- `#remove-image-btn` - Clear button

---

## 🔍 Debugging Checklist

### Before F5 (Should See in Console):

```
✅ Image loaded from URL (base64 mode): https://...
💾 Image attachment saved (size: 234.5 KB)
```

**OR**

```
✅ Image loaded from URL (URL mode): https://...
💾 Image attachment saved (size: 0.1 KB)
```

**OR**

```
✅ File loaded: image.jpg
💾 Image attachment saved (size: 456.7 KB)
```

### After F5 (Should See in Console):

```
🔍 Loading all state from storage...
✅ Image attachment restored (size: XXX KB)
🖼️ Image preview restored
```

---

## 🐛 Common Issues

### Issue 1: Image Not Saved

**Symptoms:**
- No `💾 Image attachment saved` log
- localStorage empty after upload

**Causes:**
1. `saveImageToStorage()` not called
2. Image too large (> 500KB) → rejected
3. localStorage quota exceeded

**Check:**
```javascript
// In console after upload
localStorage.getItem('vidist_attached_image')
// Should return base64 string or URL, not null
```

---

### Issue 2: Image Not Restored

**Symptoms:**
- localStorage has data but preview not showing
- See `✅ Image attachment restored` but no preview

**Causes:**
1. DOM elements not found (`#uploaded-image` missing)
2. `restoreImagePreview()` not called
3. Timing issue (DOM not ready)

**Check:**
```javascript
// In console after F5
document.getElementById('uploaded-image')
// Should return <img> element, not null
```

---

### Issue 3: CORS Issues with URLs

**Symptoms:**
- Image shows but not saved as base64
- Fallback to URL mode

**Expected Behavior:**
- URL mode saves URL string (tiny ~100 bytes)
- Base64 mode saves full image (large ~1-3 MB)

**Check Console:**
```
⚠️ Canvas tainted by CORS, trying URL mode...
✅ Image loaded from URL (URL mode): https://...
ℹ️ Image will be sent as URL to API (not base64)
```

---

## 📊 Storage Size Limits

| Type | Typical Size | localStorage Limit | Status |
|------|-------------|-------------------|--------|
| URL string | ~100 bytes | 5-10 MB | ✅ Always fits |
| Small image (base64) | 50-200 KB | 5-10 MB | ✅ Usually fits |
| Large image (base64) | 1-3 MB | 5-10 MB | ⚠️ May exceed |
| Huge image (base64) | > 5 MB | 5-10 MB | ❌ Rejected |

**Smart Storage Management:**
- `safeSetLocalStorage()` checks size before save
- Rejects data > 500KB with warning
- Auto-cleanup if quota exceeded

---

## 🔧 Global Variables

```javascript
let imageBase64Data = null;  // Line ~2510
// Stores current image (base64 or URL string)
// Used for API submission
```

**Important:**
- This variable is NOT persisted (cleared on refresh)
- Must be restored from localStorage on page load
- Restoration happens in `loadAllStateFromStorage()`

---

## 🎯 Expected Behavior

### Scenario 1: Upload File → F5

1. User drags image file
2. `handleFiles()` reads file → base64
3. `saveImageToStorage(base64)` saves to localStorage
4. Preview shows image
5. **F5 refresh**
6. `loadAllStateFromStorage()` reads localStorage
7. `imageBase64Data = savedImage` (restore variable)
8. `restoreImagePreview(savedImage)` (restore UI)
9. **Result:** Image still visible ✅

### Scenario 2: Paste URL → F5

1. User pastes image URL
2. `handleImageUrl()` loads image
3. If CORS OK: converts to base64, saves
4. If CORS blocked: saves URL string
5. Preview shows image
6. **F5 refresh**
7. Same restore process as Scenario 1
8. **Result:** Image still visible ✅

---

## 🧪 Manual Testing

### Test 1: Check Storage After Upload

```javascript
// After uploading image, run in console:
const saved = localStorage.getItem('vidist_attached_image');
console.log('Saved:', saved ? 'YES' : 'NO');
console.log('Size:', saved ? (saved.length / 1024).toFixed(1) + ' KB' : 'N/A');
console.log('Type:', saved?.startsWith('data:') ? 'Base64' : 'URL');
```

### Test 2: Check Restore After F5

```javascript
// After F5 refresh, run in console:
console.log('imageBase64Data:', imageBase64Data ? 'EXISTS' : 'NULL');
console.log('Preview element:', document.getElementById('uploaded-image'));
console.log('Preview visible:',
    !document.getElementById('image-preview')?.classList.contains('hidden')
);
```

### Test 3: Force Restore

```javascript
// Manually trigger restore (for debugging)
const saved = localStorage.getItem('vidist_attached_image');
if (saved) {
    imageBase64Data = saved;
    restoreImagePreview(saved);
    console.log('✅ Manual restore completed');
}
```

---

## 🔗 Related Systems

### Video Attachment
- Same pattern but uses `ATTACHED_VIDEO_URL_KEY` and `ATTACHED_VIDEO_BASE64_KEY`
- Video data much larger → higher risk of quota issues
- User requested NOT to persist video (too large)

### Craft Input
- Uses `CRAFT_INPUT_STORAGE_KEY`
- Auto-saves on input (debounced 500ms)
- Much smaller data (text only)

### Generation State
- Uses `GENERATION_STATE_KEY`
- Stores task ID, polling URL, API key
- Related to progress bar persistence

---

## 📝 Version History

- **v1.10.0** (12/29/2025): Initial image persistence implementation
- **v1.11.0** (12/29/2025): Fixed URL loading (added `saveImageToStorage()` calls)

---

## 🎯 Next Steps for Debugging

1. **Open Console** (F12) before uploading image
2. **Upload image** (any method)
3. **Check for log:** `💾 Image attachment saved (size: XXX KB)`
4. **Verify localStorage:**
   ```javascript
   localStorage.getItem('vidist_attached_image')
   ```
5. **Press F5**
6. **Check for logs:**
   ```
   🔍 Loading all state from storage...
   ✅ Image attachment restored (size: XXX KB)
   🖼️ Image preview restored
   ```
7. **If image still missing**, check:
   - DOM elements exist
   - No JavaScript errors
   - localStorage not cleared by browser

---

**Last Updated:** December 29, 2025 (v1.11.0)
**Status:** ⚠️ Under investigation - User reports persistence not working
