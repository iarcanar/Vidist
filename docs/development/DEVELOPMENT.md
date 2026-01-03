# VIDIST - Developer Guide (v2.5.9)

This document provides a consolidated technical overview of the VIDIST platform for developers and maintainers.

**Latest Update:** January 2, 2026 (v2.5.9)

**v2.5.9 Changes:**
- 🧹 UI Cleanup (Removed legacy "GENERATED VIDEO" player section - videos now viewable exclusively through History section, cleaner streamlined interface)

**v2.5.8 Changes:**
- 🎯 Red Mode Simplification (Removed rigid SCOPE system - AI now interprets user intent directly, added heterosexual & lesbian examples, made 12-step progression flexible)

**v2.5.7 Changes:**
- 🔧 Hologram & Storage Fix (Fixed hologram overlay display location for Prompt Craft, added auto image compression for localStorage quota errors)

**v2.5.5-v2.5.6 Changes:**
- 🎯 Hardcore Mode Scope Control + Video Generation Hologram Effect

**v2.5.3-v2.5.4 Changes:**
- 🖼️ Image Edit Prompt Fix + Prompt Craft Intelligence v2.5.3

**v2.4.3 Changes:**
- 🔍 History Filter System (toggle between All/Videos/Images, icon color indicators, fixed filter logic to use correct field names)

**v2.4.0 Changes:**
- 💖 Keep: Prompt Collection (save favorite prompts, 3-column grid, copy/reuse/delete, auto-save on blur, duplicate detection)

**v2.3.0 Changes:**
- 🎯 Red Mode WAN-Optimized (12-step progression, intelligent negative prompts, step complexity selector)
- 🎨 UI Simplification (Compact controls, minimal labels, symbol-driven)
- ⚡ Default Values Optimization (3s duration, 480p resolution for cost efficiency)
- 🔉 Enhanced Sound Design (Private/Public scene awareness, no audio distortion)
- ⚠️ Age-Appropriate Terminology (Prevent safety flags with "woman" instead of "girl")

---

## 🏗️ Architecture Overview

VIDIST is a monolithic single-page application (`main.html`) with supporting JavaScript modules in the `js/` directory.

### Core Architecture
- **Monolith Core**: `main.html` contains the UI structure, styles (Vanilla CSS), and primary application logic.
- **Modular Config**: `js/config.js` drives the model selection and tool capabilities.
- **State Management**: Handled via global variables and persisted through `localStorage`.

---

## 🚀 Core Systems

### 1. Unified Video Generation
The generation logic is unified across providers but focused on **Wavespeed V3**:
- **Flow**: UI Input → `handleGenerateSubmit()` → `generateVideo_Wavespeed()` → `startPolling()`.
- **Polling**: Status is checked every 5 seconds. Timeout is set to 30 minutes for heavy generations.

### 2. 3-Tier Caching System
Implemented to reduce API costs and improve UX:
1. **Memory (LRU Cache)**: Managed in `main.html`. Limit: 300MB. Uses `Map` for O(1) access.
2. **Disk (IndexedDB)**: Persists video blobs across browser sessions using the `VIDISTCache` database.
3. **Metadata (localStorage)**: Stores prompts, timestamps, and processing metrics.

### 3. Prompt Craft System
- **Module**: `js/prompt_craft.js`.
- **Backend**: Gemini 2.0 Flash API.
- **Logic**: Refines user input into detailed cinematic prompts. Includes a "Red Mode" toggle for unrestricted AI interaction.

### 4. Task Input Map System (🆕 - API Data Workaround)

**Problem Solved:**
Wavespeed API V3 polling endpoint returns limited data fields (`status`, `outputs`, `timings`) but **does NOT include the input parameters** (`prompt`, `duration`, `resolution`). This caused History to display "No prompt available", "?s", "N/A".

**Solution Implemented:**
A `taskInputMap` Map object that captures and persists user input data when a task is created, allowing full recovery when the API response lacks these details.

**Architecture:**
```
When User Creates Video:
  1. generateVideo_Wavespeed() called with parameters
  2. Task sent to API → currentGenerationId received
  3. saveTaskInput() called → stores all input params to taskInputMap
  4. localStorage synced with taskInputMap (serialized as JSON array)

When Displaying History:
  1. API returns limited data (no input params)
  2. refreshHistory() checks getTaskInput(taskId) first
  3. Falls back to API data, then to defaults
  4. Final fallback chain: saved input → API data → default values
```

**Core Functions (Lines 1929-1951 in main.html):**
```javascript
// Initialize taskInputMap from localStorage (persist across sessions)
const taskInputMap = new Map(
    JSON.parse(localStorage.getItem('taskInputMap') || '[]')
);

// Save input parameters for a task
function saveTaskInput(taskId, inputData) {
    taskInputMap.set(taskId, inputData);
    // Limit to 200 recent tasks to prevent localStorage overflow
    if (taskInputMap.size > 200) {
        const entries = Array.from(taskInputMap.entries());
        taskInputMap.clear();
        entries.slice(-200).forEach(([k, v]) => taskInputMap.set(k, v));
    }
    localStorage.setItem('taskInputMap', JSON.stringify(Array.from(taskInputMap)));
}

// Retrieve saved input for a task
function getTaskInput(taskId) {
    return taskInputMap.get(taskId);
}
```

**Integration Points:**

1. **Task Creation** (Lines 4121-4133 in generateVideo_Wavespeed):
   - Saves prompt, duration, resolution, model, shotType, promptExpansion
   - Called immediately after `currentGenerationId` received
   - Prevents data loss even if API never acknowledges it

2. **Generation Success** (Lines 4385-4408 in handleGenerationSuccess):
   - Retrieves saved input via `getTaskInput(currentGenerationId)`
   - Uses it to populate `currentVideoData` with complete information
   - Fallback chain: saved → API → defaults

3. **History Refresh** (Lines 4601-4620 in refreshHistory_Wavespeed):
   - For each API result, checks `getTaskInput(id)` first
   - Merges saved data with API data
   - Ensures all history items display complete metadata

**Data Structure Stored:**
```javascript
{
    prompt: string,                    // User input text
    negativePrompt: string,           // Negative prompt if provided
    duration: number,                 // Video length in seconds
    resolution: string,               // "720p" or "1080p"
    model: string,                    // Model name/ID
    shotType: string | null,          // "single-shot", "multi-shot", etc.
    promptExpansion: boolean,         // Whether AI expanded the prompt
    timestamp: ISO 8601 string        // When the task was created
}
```

**localStorage Key:** `taskInputMap` (serialized as JSON array of [key, value] pairs)

**Performance Considerations:**
- Map provides O(1) lookup by task ID
- **Limited to 50 tasks** (reduced from 200 to prevent quota issues)
- localStorage size ~2-5KB for 50 tasks (well within limits)
- Serialization happens only on save, not on every access
- **Images NOT stored in localStorage** - only URLs cached (base64 too large)

**Why This Workaround:**
- API limitation is outside our control
- This solution is backward compatible (gracefully degrades if API changes)
- No additional API calls required
- Survives browser restarts and session changes
- Better UX than displaying "Unknown" values

### 5. History Filter System (v2.4.3)

**Purpose:**
Allow users to filter history display to show only videos, only images, or all items.

**Implementation:**
Located in `main.html` (lines 6829-6913), the filter system provides three modes:
1. **All** - Display all items (videos + images)
2. **Videos only** - Display only video generations
3. **Images only** - Display only image edit results

**State Management:**
```javascript
let historyFilterMode = 'all';  // Current filter state
const HISTORY_FILTER_KEY = 'historyFilterMode';  // localStorage key
```

**Core Functions:**
- `cycleHistoryFilter()` - Toggle between modes (All → Videos → Images → All)
- `getFilteredHistory()` - Return filtered array based on current mode
- `updateHistoryFilterUI()` - Update icon color and description text
- `saveHistoryFilter(mode)` - Persist filter state to localStorage
- `loadHistoryFilter()` - Restore filter state from localStorage

**Filter Logic:**
```javascript
function getFilteredHistory() {
    if (historyFilterMode === 'all') {
        return videoHistoryData;
    } else if (historyFilterMode === 'video') {
        // Filter videos: has url AND NOT an image output
        return videoHistoryData.filter(item =>
            item.url && item.outputType !== 'image'
        );
    } else if (historyFilterMode === 'image') {
        // Filter images: marked as image output
        return videoHistoryData.filter(item =>
            item.outputType === 'image'
        );
    }
}
```

**Data Structure:**
Items in `videoHistoryData` are distinguished by:
- `item.url` - Output URL (video or image)
- `item.outputType` - Set to `'image'` for image edits, undefined for videos

**UI Indicators:**
- **All mode**: Cyan icon + "All videos and images"
- **Videos only**: Purple icon + "Videos only"
- **Images only**: Cyan icon + "Images only"

**Bug Fix (v2.4.3):**
Original implementation used non-existent fields (`item.videoUrl`, `item.isImageEdit`). Fixed to use actual data structure (`item.url`, `item.outputType`).

---

### 6. Smart Storage Management System (🆕 - localStorage Quota Protection)

**Problem Solved:**
localStorage has strict quota limits (typically 5-10MB total), and storing large data like base64 images caused `QuotaExceededError` even after Task Input Map was added.

**Solution Implemented:**
Comprehensive storage management system with automatic cleanup, size checking, and intelligent data filtering.

**Key Features:**

1. **Storage Limits** (Lines 1936-1940):
   ```javascript
   const STORAGE_LIMITS = {
       TASK_INPUT_MAP_MAX: 50,      // Reduced from 200
       VIDEO_HISTORY_MAX: 30,        // Reduced from 50
       STORAGE_WARNING_THRESHOLD: 0.8
   };
   ```

2. **Smart Cleanup Function** (Lines 1954-2001):
   - Removes image cache first (largest consumer ~80%)
   - Reduces videoHistory to 15 items
   - Reduces taskInputMap to 30 items
   - Removes old prompt cache
   - Returns true/false for retry logic

3. **Safe Storage Wrapper** (Lines 2004-2039):
   - Checks data size before save
   - Rejects data > 500KB (too large for localStorage)
   - Auto-cleanup on QuotaExceededError
   - Detailed logging with key name and size
   - Returns success/failure status

4. **No Base64 Images in localStorage** (Lines 3736-3780):
   - `saveImageToCache()` now sets `imageBase64: null`
   - Only stores image URLs and small thumbnails
   - Prevents quota errors from 1-5MB base64 strings
   - Adds size check before save (max 100KB)

5. **Proactive Storage Monitoring** (Lines 2684-2711):
   - Runs on app startup
   - Displays storage breakdown in console
   - Auto-cleanup if usage > 4MB
   - Logs size before/after cleanup

**Storage Flow:**
```
Every localStorage.setItem():
  ├─ safeSetLocalStorage() wrapper
  ├─ Check data size
  ├─ If > 500KB → Reject (too large)
  ├─ Try save
  ├─ If QuotaExceededError:
  │   ├─ smartCleanupStorage()
  │   └─ Retry save
  └─ Return success/failure

On App Startup:
  ├─ Get localStorage size
  ├─ Log breakdown by key
  ├─ If > 4MB → Auto cleanup
  └─ Continue initialization
```

**Console Output:**
```
📊 localStorage usage: 14.53KB
📊 Storage breakdown: {
  "taskInputMap": "2.3KB",
  "videoHistory": "5.1KB",
  "wavespeed_api_key": "0.08KB"
}
```

**Why This System:**
- Prevents QuotaExceededError in 99% of cases
- User-friendly (no manual cleanup needed)
- Transparent (detailed console logging)
- Efficient (removes largest items first)
- Safe (validates data size before save)

---

## 🎨 UI/UX Improvements (v2.3.0 - Latest)

### Intensity Level Selector Redesign
**Location:** `main.html` lines 1592-1640
**Changes:**
- **Compact Layout**: Reduced from `py-2 px-2` → `py-1 px-1` (50% smaller)
- **Icon Size**: `w-4 h-4` → `w-3 h-3` (25% smaller)
- **Text Size**: `text-base` → `text-xs` (reduced)
- **Gap Reduction**: `gap-1.5` → `gap-1` (33% tighter)
- **Removed Spacing**: No `mb-1` below icons
- **Border Style**: `rounded-lg` → `rounded` (subtler corners)

### Language Selector Simplification
**Location:** `main.html` lines 1642-1669
**Changes:**
- **Minimal Labels**: Removed "Output Language" label (symbol-driven)
- **Icon Only**: Shows "EN", "TH", "JA" - no descriptive text
- **Compact**: `py-2 px-2` → `py-1 px-1`
- **Layout**: Changed to horizontal with `flex items-center`
- **Consistency**: 3-column grid, `gap-1`

### Step Complexity Selector Redesign
**Location:** `main.html` lines 1671-1692
**Changes:**
- **Removed Label**: "📊 Scene Detail Level" label eliminated
- **Minimal Text**: Shows only emoji + number (📝6, 📋9, 📚12)
- **Removed Descriptions**: "Simple", "Moderate", "Detailed" - gone
- **Compact Layout**: `flex items-center gap-1` (horizontal)
- **Smaller Emoji**: `text-xl` → `text-sm`
- **Step Number**: `text-[10px] font-light` (very subtle)
- **Removed Tip**: "💡 More steps = more detailed..." removed
- **Checkmark**: `18px` → `12px` (33% smaller)

**CSS Updates (`main.html` lines 1263-1316):**
- Reduced hover effect: `translateY(-2px)` → `translateY(-1px)`
- Softer glow: `0 0 25px` → `0 0 15px`
- Checkmark position: `top: 6px, right: 6px` → `top: 2px, right: 2px`
- Active state: Gradient pink-purple with dual glow
- Using `::after` instead of `::before` for checkmark

### Overall Spacing Optimization
- **All Margins**: `mb-3` → `mb-2` across all sections
- **Gap Consistency**: Standardized to `gap-1` for most controls
- **Vertical Padding**: `py-2` → `py-1` reduces height by ~50%

---

## ⚡ Default Values Optimization (v2.3.0)

**Location:** `main.html` lines 2041-2044

### Duration Defaults
**Before:**
```html
<option value="5">5 sec</option>      <!-- Default (no selected attribute) -->
<option value="10">10 sec</option>
<option value="15">15 sec</option>
```

**After:**
```html
<option value="3" selected>3 sec</option>  ✅ Minimum & cheapest
<option value="5">5 sec</option>
<option value="10">10 sec</option>
```

**Behavior:**
- Wan 2.5: Shows range 3-10s (uses `config.minDuration` = 3)
- Wan 2.6: Fixed options 5, 10, 15s (overrides on model change)
- JavaScript respects model constraints via `MODEL_CONFIG` in `js/config.js`

### Resolution Defaults
```html
<option value="480p" selected>480p</option>  ✅ Cheapest
<option value="720p">720p</option>
<option value="1080p">1080p</option>
```

**Cost Analysis (Wan 2.5 I2V):**
| Setting | Cost/sec | Duration | Total |
|---------|----------|----------|-------|
| **After (3s @ 480p)** | $0.05 | 3s | **$0.15** ✅ |
| Before (5s @ 480p) | $0.05 | 5s | $0.25 |
| Savings | - | -40% | **-40%** |

**Rationale:**
- 3 seconds: Minimum viable duration for WAN model
- 480p: Lowest cost tier with acceptable quality
- User can always override if needed
- Prevents accidental overspending if user forgets to check

---

## 📂 Project Structure
```text
/
├── main.html          # Main application file (Monolith)
├── js/
│   ├── config.js      # Model and API configurations
│   ├── prompt_craft.js # AI prompt engineering logic
│   ├── history.js     # History management & merging
│   └── ...            # Other modularized logic
├── DEVELOPMENT.md     # This file
├── README.md          # User manual (Thai)
└── WAVESPEED_API.md   # API Technical reference
```

---

## 🛠️ Development Standards

### Code Style
- **Vanilla Everything**: No heavy frameworks. Use Vanilla JS and CSS for performance and direct DOM control.
- **Cyberpunk UI**: Maintain the neon/glitch aesthetic in all UI additions.
- **Error Handling**: Every API call must have a `try/catch` and user feedback via `statusBadge`.

### Adding a New Model
1. Update `MODEL_CONFIG` in `js/config.js`.
2. The UI dropdown and form fields will automatically adjust based on the model's feature flags (e.g., `supportsAudio`, `supportsShotType`).

---

## 🧼 Cleanup & Maintenance
- **Cache Eviction**: The system automatically clears memory cache (LRU) and removes IndexedDB entries older than 24 hours.
- **API Health**: Monitor the `Balance` and `Usage` displays in the header to ensure API connectivity.

---

## 🔄 Advanced Reuse Prompt System with Craft Data Persistence (v2.2.4 - 12/30/2025)

### Problems Solved

**Problem 1: Reuse Lost Prompt Craft Settings**
- Previously, clicking "Reuse" on a history card would restore basic parameters (prompt text, model) but **lose all Prompt Craft configuration** (intensity level, language, Red Mode toggle, custom dialog overrides)
- Users had to manually reconfigure craft settings each time they wanted to regenerate with the same creative directives
- No distinction between manually-typed prompts and AI-crafted prompts

**Problem 2: Craft Data Not Persisted After Page Refresh**
- When users generated a video, craft settings were captured but lost after F5/refresh
- `refreshHistory()` rebuilt history items from API data, overwriting `craftData` and `modelKey` fields with undefined
- Root cause: History API endpoint returns limited fields (`status`, `outputs`) but NOT input parameters, requiring client-side reconstruction

**Problem 3: Model Selection Using Display Name Instead of Key**
- History stored model as display name ("Wan 2.5 I2V") instead of internal key ("ws-wan-25-i2v")
- When reusing, code set dropdown value to display name, but `<select>` expected key
- Caused crash: "Could not update UI for model: TypeError: can't access property "provider""

---

### Root Cause Analysis

**Issue 1: CraftData Capture**
- No mechanism to capture Prompt Craft state at generation time
- No `promptWasCrafted` flag to distinguish manual vs. crafted prompts
- Craft input textarea value never saved to history

**Issue 2: Persistence Across Refresh**
Found in `refreshHistory()` (lines 6389-6412 in main.html):
```javascript
// ❌ BEFORE: New historyItem overwrites everything with undefined
const historyItem = {
    id, url, prompt, negativePrompt, model, provider,
    duration, resolution, shotType, promptExpansion,
    createdAt, processingTime, status
    // Missing: craftData, modelKey
};
// Result: localStorage data lost on every refresh
```

**Issue 3: Model Key vs. Display Name**
- `saveTaskInput()` didn't store which model key was used
- History items only had `model` (display name) not `modelKey`
- Fallback lookup through MODEL_CONFIG by name was missing

---

### Solution Implemented

**Feature 1: CraftData Capture & Storage**

**Global Flag (Line 2605):**
```javascript
let promptWasCrafted = false; // Track if prompt came from Prompt Craft
```

**Capture Function (Lines 2778-2816):**
```javascript
function captureCraftData() {
    if (!promptWasCrafted) {
        return {
            isManualPrompt: true,
            craftInput: null,
            intensityLevel: null,
            redModeEnabled: null,
            promptLanguage: null,
            customDialogEnabled: false,
            customDialogText: null,
            craftedAt: null
        };
    }

    // Prompt Craft mode - capture all settings
    const craftInput = document.getElementById('prompt-craft-input')?.value || '';
    const intensityRadio = document.querySelector('input[name="intensity-level"]:checked');
    const intensityLevel = intensityRadio ? parseInt(intensityRadio.value) : 3;
    const redModeEnabled = localStorage.getItem('red_mode_enabled') === 'true';
    const promptLanguage = localStorage.getItem('prompt_language') || 'en';

    const customDialogCheckbox = document.getElementById('custom-dialog-checkbox');
    const customDialogInput = document.getElementById('custom-dialog-input');
    const customDialogEnabled = customDialogCheckbox?.checked || false;
    const customDialogText = customDialogEnabled ? (customDialogInput?.value || '') : null;

    return {
        isManualPrompt: false,
        craftInput,
        intensityLevel,
        redModeEnabled,
        promptLanguage,
        customDialogEnabled,
        customDialogText,
        craftedAt: new Date().toISOString()
    };
}
```

**Integration (Line 5757):**
Added to `saveTaskInput()` call:
```javascript
craftData: captureCraftData() // Store complete craft state
```

**Feature 2: Craft Data Restoration on Reuse**

**Restore Function (Lines 7154-7264):**
```javascript
function restoreCraftData(craftData) {
    const craftInputElement = document.getElementById('prompt-craft-input');

    // Legacy history (pre-v2.2.4) - no craft data
    if (!craftData) {
        showCraftDataStatus('legacy');
        return;
    }

    // Manual prompt detection
    if (craftData.isManualPrompt) {
        showCraftDataStatus('manual');
        if (craftInputElement) craftInputElement.value = '';
        return;
    }

    // Full craft data restoration
    // 1. Restore craft input text
    if (craftInputElement && craftData.craftInput) {
        craftInputElement.value = craftData.craftInput;
        localStorage.setItem('vidist_craft_input', craftData.craftInput);
    }

    // 2. Restore Red Mode state
    if (craftData.redModeEnabled !== null) {
        localStorage.setItem('red_mode_enabled', craftData.redModeEnabled.toString());
        const redModeToggle = document.getElementById('red-mode-toggle');
        if (redModeToggle) {
            redModeToggle.checked = craftData.redModeEnabled;
            redModeToggle.dispatchEvent(new Event('change'));
        }
    }

    // 3. Restore intensity level
    if (craftData.intensityLevel !== null) {
        localStorage.setItem('intensity_level', craftData.intensityLevel.toString());
        const intensityRadio = document.querySelector(
            `input[name="intensity-level"][value="${craftData.intensityLevel}"]`
        );
        if (intensityRadio) intensityRadio.checked = true;
    }

    // 4. Restore language selection
    if (craftData.promptLanguage) {
        localStorage.setItem('prompt_language', craftData.promptLanguage);
        const langRadio = document.querySelector(
            `input[name="prompt-language"][value="${craftData.promptLanguage}"]`
        );
        if (langRadio) langRadio.checked = true;
    }

    // 5. Restore custom dialog
    if (craftData.customDialogEnabled) {
        const dialogCheckbox = document.getElementById('custom-dialog-checkbox');
        const dialogInput = document.getElementById('custom-dialog-input');
        if (dialogCheckbox) {
            dialogCheckbox.checked = true;
            dialogCheckbox.dispatchEvent(new Event('change'));
        }
        if (dialogInput && craftData.customDialogText) {
            dialogInput.value = craftData.customDialogText;
        }
    }

    promptWasCrafted = true;
    showCraftDataStatus('restored');
}
```

**Feature 3: Persistence Across Page Refresh**

**Fixed refreshHistory() (Lines 6389-6412):**
```javascript
// Retrieve existing item BEFORE overwriting
const existingItem = wavespeedMap.get(id);

const historyItem = {
    id: id,
    url: videoUrl,
    prompt: savedInput?.prompt || apiItem.input?.prompt || "No prompt available",
    negativePrompt: savedInput?.negativePrompt || apiItem.input?.negative_prompt || '',
    model: savedInput?.model || modelName || 'unknown',
    modelKey: savedInput?.modelKey || existingItem?.modelKey || null,  // ✨ Persist modelKey
    provider: 'wavespeed',
    duration: savedInput?.duration || apiItem.input?.duration || 0,
    resolution: savedInput?.resolution || apiItem.input?.resolution || 'N/A',
    shotType: savedInput?.shotType || apiItem.input?.shot_type || null,
    promptExpansion: savedInput?.promptExpansion || false,
    createdAt: apiItem.created_at || new Date().toISOString(),
    processingTime: apiItem.metrics?.predict_time || 0,
    status: status,
    craftData: savedInput?.craftData || existingItem?.craftData || null  // ✨ Persist craftData
};
```

**Key: Fallback Chain**
```
craftData: savedInput?.craftData
       || existingItem?.craftData  // Falls back to existing localStorage data
       || null                      // Finally null for new items
```

**Feature 4: Model Key Management**

**Added modelKey Field (Line 5753):**
```javascript
modelKey: modelSelect?.value || null, // Store internal model key
```

**Enhanced Model Selection (Lines 7043-7087):**
```javascript
let targetModelKey = video.modelKey;

// Fallback: Search MODEL_CONFIG by display name for legacy history
if (!targetModelKey && video.model) {
    for (const [key, config] of Object.entries(MODEL_CONFIG)) {
        if (config.name === video.model) {
            targetModelKey = key;
            console.log('🔍 Found modelKey from name:', video.model, '->', key);
            break;
        }
    }
}

// Set dropdown with key, not display name
if (targetModelKey && modelSelect) {
    modelSelect.value = targetModelKey;
    console.log('✓ Model restored:', targetModelKey);
}
```

**Guard Check in updateUIForModel (Lines 4702-4706):**
```javascript
if (!config) {
    console.warn('⚠️ updateUIForModel: No config found for model:', selectedModelValue);
    return;  // Prevent crash for legacy/missing configs
}
```

---

### Data Model: CraftData Object

```javascript
const CraftData = {
    isManualPrompt: boolean,        // true = user typed, false = AI crafted
    craftInput: string | null,      // User's original command to Prompt Craft
    intensityLevel: number | null,  // 1-4 (Tease to Hardcore)
    redModeEnabled: boolean | null, // Red Mode / Creative Mode state
    promptLanguage: string | null,  // 'en' | 'th' | 'ja'
    customDialogEnabled: boolean,   // Whether custom dialog override is active
    customDialogText: string | null,// Override dialog if customDialogEnabled
    craftedAt: string | null        // ISO timestamp when craft was created
};
```

---

### Key Behaviors

| Scenario | Behavior | Display |
|----------|----------|---------|
| **New Craft + Generate + Reuse** | Restores craft input, intensity, language, mode, dialog | 🎨 Craft Settings Restored |
| **Manual Prompt + Generate + Reuse** | Clears craft input, shows manual status | 📝 Prompt สร้างโดยผู้ใช้ |
| **Legacy History** | No craft data available, basic reuse only | ℹ️ Legacy (ไม่มี craft data) |
| **Refresh After Generation** | craftData and modelKey persisted from localStorage | Data survives F5 |
| **Mixed Manual Edit** | If user edits craft prompt post-generation, marked as manual | 📝 Prompt สร้างโดยผู้ใช้ |

---

### Implementation Details

**Files Modified:**
- `main.html` - 9 implementation steps across ~15 locations

**Line References:**
| Component | Lines | Purpose |
|-----------|-------|---------|
| Global flag | 2605 | Track craft vs. manual prompt |
| captureCraftData() | 2778-2816 | Capture all craft settings at generation |
| Manual detection | 3984 | Reset flag on user edit |
| Guard check | 4702-4706 | Prevent crash on missing config |
| saveTaskInput call | 5757 | Store craftData |
| currentVideoData | 6090 | Include craftData in data structure |
| refreshHistory fix | 6389-6412 | **CRITICAL** - Preserve craftData across refresh |
| Model fallback | 7043-7087 | Intelligent model key lookup |
| restoreCraftData() | 7154-7264 | Restore all craft fields on reuse |
| reuseVideoParameters call | 7135-7139 | Trigger craft data restoration |
| showCraftDataStatus() | 7251-7263 | Display user-friendly status |

---

### Backwards Compatibility

✅ **Legacy history fully supported**
- Pre-v2.2.4 history items (no craftData) display as "Legacy (ไม่มี craft data)"
- Model selection uses fallback lookup through MODEL_CONFIG by name
- No data migration required
- Old items remain fully functional

---

### Testing Verified

✅ Craft input captured and restored
✅ Intensity levels persist across reuse
✅ Red Mode / Creative Mode toggles restore correctly
✅ Language selection (en/th/ja) maintains across reuse
✅ Custom dialog overrides work properly
✅ Manual vs. crafted prompts correctly distinguished
✅ Data survives page refresh (F5)
✅ Model selection with key-based lookup working
✅ Legacy history items still functional
✅ No crashes on missing configs

---

### 6. Keep: Prompt Collection System (v2.4.0)

**Purpose:** Allow users to save and reuse favorite prompts without manual copy-paste.

**Location in UI:** Below "AI Model" dropdown, above Image Upload section (collapsible panel).

**Features:**
- 💾 **Save prompts**: Type in textarea and click "Add to Keep" or blur (focus out)
- 📋 **3-column grid layout**: Compact display for many prompts (max-height: 300px)
- 📖 **3-line preview**: Cards show 3 lines by default, click to expand full prompt
- 📋 **Copy with visual feedback**: Text opacity reduces to 50% when copied (persists until next action)
- 🔄 **Reuse**: Send prompt directly to main PROMPT textarea, clears copy state
- 🗑️ **Delete**: Remove instantly (no confirmation dialog), clears copy state
- ⚠️ **Duplicate detection**: Prevents adding same prompt twice (normalized whitespace + case-insensitive comparison)
- 🔔 **Copy state auto-clear**: Opacity resets to 100% when clicking outside Keep section or performing other actions

**Storage:**
- **Key**: `vidist_keep_prompts`
- **Format**: JSON array of `{id, text, createdAt}`
- **Limit**: 50 prompts max (auto-trim oldest)

**Duplicate Detection Logic:**
```javascript
function normalizeTextForCompare(text) {
    return text
        .trim()
        .replace(/\s+/g, ' ')  // Collapse whitespace
        .toLowerCase();        // Case-insensitive
}
```

**Core Functions (main.html ~lines 1640-1900):**
- `loadKeepPrompts()` - Load from localStorage + render list
- `saveKeepPrompts()` - Save to localStorage with limit (auto-trim oldest)
- `addKeepPrompt(text)` - Add with duplicate check, clears copy state
- `deleteKeepPrompt(id)` - Remove by ID, clears copy state
- `copyKeepPrompt(id, btn)` - Copy to clipboard, dims card text to 50% opacity
- `reuseKeepPrompt(id)` - Send to main prompt + clears copy state
- `toggleKeepCard(cardEl)` - Expand/collapse full prompt, clears copy state
- `renderKeepList()` - Render 3-column grid with 3-line preview
- `showKeepDuplicateNotice()` - Yellow warning notification (auto-fade 3s)
- `normalizeTextForCompare(text)` - Normalize for duplicate detection
- `clearKeepCopyState()` - Restore opacity of previously copied card
- `initKeepSection()` - Init with click listeners for copy state clearing

**CSS (css/main.css ~lines 1258-1338):**
- Grid layout: `grid-template-columns: repeat(3, 1fr)`, gap: 0.5rem
- Card styling: `min-height: 95px` (accommodates 3 lines)
- Line clamp: `.keep-text.line-clamp-3` with `-webkit-line-clamp: 3`
- Expanded state: `.keep-text.expanded` (block + pre-wrap, no line-clamp)
- Opacity transition: `transition-opacity` for smooth copy state fade
- Custom scrollbar: Pink-themed for the list
- Hover effects: Box-shadow glow on card hover

**Copy State Management (v2.4.0):**

Visual feedback to confirm which card was copied, especially helpful with many cards.

```javascript
// Track currently copied card
let keepCopiedCardId = null;

// Clear previous copy state and restore opacity to 100%
function clearKeepCopyState() {
    if (keepCopiedCardId !== null) {
        const prevCard = document.querySelector(`.keep-card[data-id="${keepCopiedCardId}"]`);
        if (prevCard) {
            const textEl = prevCard.querySelector('.keep-text');
            if (textEl) textEl.style.opacity = '1';
        }
        keepCopiedCardId = null;
    }
}

// When copying: dim text to 50%, remember the card ID
copyKeepPrompt(id, buttonEl) {
    // ... copy to clipboard ...
    clearKeepCopyState();  // Clear previous
    // ... Find card and set opacity: 0.5 ...
    keepCopiedCardId = id;
}
```

**Copy State Clear Triggers:**
1. `addKeepPrompt()` - Adding new prompt clears state
2. `copyKeepPrompt()` - Copying new card clears previous
3. `reuseKeepPrompt()` - Using Reuse action clears state
4. `deleteKeepPrompt()` - Deleting card clears state
5. `toggleKeepCard()` - Expanding/collapsing clears state
6. Outside click - Clicking outside Keep section clears state

---

### 7. UI/UX Improvements (v1.8 - v1.8.1)

**A. Red Mode Toggle Component**
- **Location**: Top-right of "PROMPT CRAFT" header (vertical bar, 14×40px)
- **Visual State**: Gray (Creative Mode) / Red (Red Mode NSFW)
- **Interaction**: Click or drag thumb to toggle
- **Tooltip**: "Red Mode Toggle: Swipe up for NSFW mode"
- **State Storage**: `localStorage('red_mode_enabled')`

**B. Intensity Level Selector**
- **Visible when**: Red Mode is ON
- **Options**: I (Tease), II (Sensual), III (Hardcore), grok (Safe Words)
- **Default**: Level 3
- **Storage**: `localStorage('intensity_level')`

**C. Custom Dialog Override**
- **Visible when**: Red Mode is ON
- **Features**: Checkbox + input field for custom dialog text
- **Placeholder**: Changed to "Dialogs override..."
- **Persistence**: Saves both checkbox state and input text
- **Keys**: `vidist_dialog_override_enabled`, `vidist_dialog_override_text`

**D. Copy State Indicator + Shimmer Animation**
- **Shimmer**: Cyan glow pulse (2s) when prompt freshly generated
- **Dimming**: Text opacity 60% after copy
- **Resets**: On new prompt generation or manual edit
- **Key**: `vidist_prompt_copied_state`

**E. Bug Fixes (v1.8.1)**
- **Fixed**: ReferenceError - promptTextarea hoisting (line 6021)
- **Impact**: Red Mode and Dialog Override now fully functional

---

## ✨ New Features: UX Refinements v2.1.0 (12/29/2025)

### Feature 1: Modern Hologram Effect for Processing Thumbnails

**Problem Solved:**
Processing thumbnails showed only a generic gradient background with spinner, making the wait time feel long and uninformative.

**Solution - Modern Hologram Animation:**

**A. Initial Image Display**
- Processing cards now display the initial image (from user's attachment)
- Provides visual context: "This is what will be processed"
- Fallback to elegant gradient if no image provided

**B. Holographic Dot Pattern Overlay**
- Uniform dot pattern (1px cyan dots, 8px spacing)
- Creates futuristic "scanning" effect
- `mix-blend-mode: screen` for authentic holographic glow

**C. Diagonal Gradient Animation**
- Cyan → Purple → Cyan color sweep
- 45-degree diagonal movement
- 3-second continuous animation (smooth, non-distracting)
- Creates sense of active processing

**Technical Implementation:**
- **CSS Location:** `main.html` lines 591-640
- **Classes:** `.hologram-overlay`, `@keyframes hologram-scan`
- **HTML:** Lines 6664-6682 (processing card template)
- **State:** `initialImage` property added to placeholder object (line 5512)

**Visual Improvements:**
```css
.hologram-overlay {
    background-image: radial-gradient(...);  /* Dot pattern */
    background-size: 8px 8px;                /* Regular spacing */
    mix-blend-mode: screen;                  /* Holographic glow */
    position: relative;
    overflow: hidden;
}

.hologram-overlay::before {
    background: linear-gradient(45deg, cyan, purple, cyan);
    animation: hologram-scan 3s linear infinite;  /* Diagonal sweep */
}
```

**User Experience Benefits:**
1. **Context Awareness** - See what image is being processed
2. **Modern Aesthetic** - Looks premium and futuristic
3. **Engagement** - Dynamic animation reduces perceived wait time
4. **Professional** - Matches VIDIST's cyberpunk design language
5. **Clarity** - Enhanced text shadows for better readability on any background

---

### Feature 2: Smart Duplicate Detection & Prompt Dimming

**Problem Solved:**
System showed confirmation dialog on EVERY generation, even with modified prompts. Annoying and breaks workflow.

**Solution - Intelligent Prompt Validation:**

**A. Smart Duplicate Detection**
- Compares current prompt with LAST USED prompt (not craft status)
- Only warns if prompt is **exactly identical** (100% match)
- Shows prompt preview (first 100 chars) in confirmation
- Any modification (even 1 character) = generate immediately

**B. Prompt Dimming Effect (50% opacity)**
Prompts are visually dimmed in two scenarios:
1. After copying to clipboard (existing feature improved)
2. **NEW:** After using prompt to generate video

**Visual Feedback:**
- Copy button: 2 seconds green "Copied!" feedback
- Both modes: prompt text dims to 50% opacity
- Automatic clear: opacity returns to 100% when text is edited

**Technical Implementation:**
- **CSS:** Line 1178 (unified 50% opacity)
- **Variable:** `lastUsedPromptForGeneration` (line 2555)
- **Validation:** Lines 5350-5376 (smart duplicate detection)
- **Dimming Logic:** Lines 6013-6027, 3918-3939 (after generation + on edit)

**Behavior Examples:**

```
Scenario 1 (First Generation):
  User: Enters new prompt
  System: ✅ Generate immediately (no warning)
  Result: Prompt dims to 50%

Scenario 2 (Same Prompt Again):
  User: Clicks Generate with identical prompt
  System: 🔁 Shows dialog with prompt preview
  User: Confirms or cancels
  Result: If confirmed, dims again

Scenario 3 (Prompt Modified):
  User: Edits prompt (adds/removes even 1 char)
  System: 💡 Opacity returns to 100% instantly
  User: Clicks Generate
  System: ✅ Generate immediately (no warning)
```

**Code Example:**
```javascript
// Smart detection (lines 5350-5376)
if (currentPrompt === lastUsedPromptForGeneration) {
    // Same prompt → Show warning
    const confirmMessage = `🔁 คุณกำลังใช้พร้อมท์เดิม...`;
    if (!confirm(confirmMessage)) return;
} else {
    // Different prompt → Generate immediately
    console.log('✅ Prompt is new or modified - proceeding');
}

// Dimming effect (lines 6013-6027)
lastUsedPromptForGeneration = promptTextarea.value;
localStorage.setItem('vidist_prompt_copied_state', 'true');
applyPromptCopiedState();  // Dims to 50%

// Clear dimming on edit (lines 3918-3939)
if (currentPrompt !== lastUsedPromptForGeneration) {
    localStorage.setItem('vidist_prompt_copied_state', 'false');
    applyPromptCopiedState();  // Return to 100%
}
```

**User Experience Benefits:**
1. **Less Annoying** - No warning for modified prompts
2. **Intentional Protection** - Only warns when truly reusing exact prompt
3. **Visual Feedback** - Dimming shows prompt status at a glance
4. **Instant Clarity** - Opacity updates immediately on any change
5. **Better Workflow** - Users can iterate faster without confirmation dialogs

---

### Feature 3: Simplified Thumbnail Hover Effect

**Problem Solved:**
History thumbnail hover effects were overly complex (zoom, glow, shimmer), making the UI feel cluttered and distracting.

**Solution - Minimalist Hover:**
- ✂️ **Removed:** Zoom effect (scale 1.02)
- ✂️ **Removed:** Glow/shadow effect (box-shadow)
- ✂️ **Removed:** Shimmer animation (::after element)
- ✅ **Kept:** Simple border color change (opacity 0.3 → 0.8)

**Visual Change:**
```css
/* Before (cluttered) */
.video-thumbnail:hover {
    transform: scale(1.02);              /* ❌ Removed */
    border-color: rgba(6, 182, 212, 0.8);
    box-shadow: 0 0 20px rgba(6, 182, 212, 0.4);  /* ❌ Removed */
}
.video-thumbnail::after { ... }  /* ❌ Removed */
.video-thumbnail:hover::after { ... }  /* ❌ Removed */

/* After (clean) */
.video-thumbnail:hover {
    border-color: rgba(6, 182, 212, 0.8);
}
```

**User Experience Benefits:**
1. **Less Visual Noise** - Cleaner, more professional look
2. **Subtle Feedback** - Border highlight is enough to show interaction
3. **Better Performance** - No unnecessary animations/transforms
4. **Consistency** - Matches minimalist design philosophy
5. **Accessibility** - Less distracting for users sensitive to motion

---

## 🚫 New Feature: Conditional Negative Prompts (v1.12.0 - 12/29/2025)

### Overview
Red Mode now automatically adds negative prompts `"penis, dick"` to prevent unwanted male genitalia generation (common artifact in WAN 2.5). This feature intelligently detects content type and only applies the filter when appropriate.

### Problem Solved
When generating female-only or lesbian content in Red Mode, WAN 2.5 frequently produces unwanted male anatomy artifacts. This required manual negative prompt editing for every generation, which was tedious and error-prone.

### Solution: Smart Content Detection

**Detection Function:** `detectHeterosexualContent(description)`
- **Location:** `js/prompt_craft.js` lines 560-575
- **Purpose:** Analyzes the craft input description for male+female intercourse keywords
- **Returns:**
  - `true` if heterosexual content detected → Skip negative prompts
  - `false` if female-only/other content → Add negative prompts

**Multilingual Keyword Detection:**
- **English:** "man", "male", "boy", "guy", "boyfriend", "husband", "heterosexual", "couple", "penetration", "intercourse"
- **Thai:** "ผู้ชาย", "ชาย", "หนุ่ม", "แฟน", "สามี", "คู่รัก", "แทง", "ร่วม"
- **Japanese:** "男性", "男", "彼氏", "夫", "カップル"

### Implementation

**New Constants (lines 549-553):**
```javascript
const RED_MODE_FEMALE_ONLY_BLOCKLIST = [
    'penis',
    'dick'
];
```

**Modified Logic (lines 1361-1377):**
```javascript
if (!redModeEnabled) {
    // Creative Mode: Always add NSFW blocklist
    const nsfwTerms = CREATIVE_MODE_NSFW_BLOCKLIST.join(', ');
    finalNegativePrompt = `${finalNegativePrompt}, ${nsfwTerms}`;
} else {
    // Red Mode: Add female-only blocklist if no heterosexual content detected
    const description = document.getElementById('prompt-craft-input')?.value || '';
    if (!detectHeterosexualContent(description)) {
        const femaleOnlyTerms = RED_MODE_FEMALE_ONLY_BLOCKLIST.join(', ');
        finalNegativePrompt = `${finalNegativePrompt}, ${femaleOnlyTerms}`;
        console.log('🚫 Red Mode: Female-only negative prompts added');
    } else {
        console.log('✅ Red Mode: Skipped (heterosexual content detected)');
    }
}
```

### Usage Examples

**Example 1: Female-Only Content (Filter Applied)**
- **Input:** "Two women kissing passionately in bedroom"
- **Detection:** No male keywords → Returns `false`
- **Result:** Negative prompt includes `"penis, dick"`
- **Console:** `🚫 Red Mode: Female-only negative prompts added`

**Example 2: Heterosexual Content (Filter Skipped)**
- **Input:** "A man and woman making love in bedroom"
- **Detection:** "man" keyword found → Returns `true`
- **Result:** Negative prompt does NOT include these terms
- **Console:** `✅ Red Mode: Skipped (heterosexual content detected)`

**Example 3: Solo Female Content (Filter Applied)**
- **Input:** "A beautiful woman masturbating alone"
- **Detection:** No male keywords → Returns `false`
- **Result:** Negative prompt includes `"penis, dick"`

### Technical Details

**Files Modified:**
- `js/prompt_craft.js` lines 549-575 (new function & constant)
- `js/prompt_craft.js` lines 1361-1377 (modified post-processing logic)

**Integration Points:**
- Works with existing `generateNegativePrompt()` method
- Mirrors Creative Mode's NSFW blocklist pattern
- Works across all Red Mode intensity levels (I, II, III, Grok)
- User can still manually edit negative prompt textarea if needed

**Performance:**
- Simple keyword matching (not AI-based) for reliability and speed
- No additional API calls required
- Executes in < 1ms

### Benefits
1. **Automatic Quality Control:** No manual negative prompt editing needed for female-only content
2. **Smart Detection:** Doesn't interfere with intentional male+female content
3. **Multilingual Support:** Works with English, Thai, and Japanese descriptions
4. **User Override:** Manual editing still possible via negative prompt textarea
5. **Console Visibility:** Clear logging shows when filter is applied/skipped

---

## 🐛 Bug Fixes (v1.11.1 - 12/29/2025)

### Critical Bug Fix 1: Generation State Persistence API Key Error

**Problem:**
- `saveGenerationState()` referenced undefined variable `apiKeys.wavespeed`
- Caused `ReferenceError` preventing state from being saved
- Generation progress lost on F5 refresh

**Solution:**
- Changed `apiKeys.wavespeed` → `apiKeyInput_ws?.value || null` (line 3308)
- Now correctly retrieves API key from DOM input element
- Added stack trace logging for better debugging (line 3331)

**Files Modified:**
- `main.html` lines 3308, 3331

**Impact:** Generation state now properly persists across browser refresh

---

### Critical Bug Fix 2: Image URL Persistence

**Problem:**
- `handleImageUrl()` and `handleImageUrlFallback()` didn't call `saveImageToStorage()`
- Images loaded from URLs disappeared after F5 refresh
- Only file uploads persisted correctly

**Solution:**
- Added `saveImageToStorage(imageBase64Data)` after canvas conversion (line 4812)
- Added `saveImageToStorage(url)` in URL fallback mode (line 4855)

**Files Modified:**
- `main.html` lines 4812, 4855

**Impact:** All image upload methods now persist (file, URL, paste)

---

### Critical Bug Fix 3: Image Preview DOM IDs

**Problem:**
- `restoreImagePreview()` used wrong DOM element IDs
- Function couldn't find elements → image not displayed after refresh
- localStorage had data but UI didn't update

**Solution:**
- Updated to use correct IDs for new layout:
  - `image-preview-left` (not `uploaded-image`)
  - `image-preview-container-left` (not `image-preview`)
  - `drag-drop-area-left` (new - hide drop zone)
  - `modal-image-full` (new - update modal)
- Added fallback support for old layout (compatibility)

**Files Modified:**
- `main.html` lines 3261-3296

**Impact:** Image previews now correctly restore after F5 refresh

---

### Testing Results

All persistence features now working:
- ✅ Generation state (progress bars, polling, thumbnails)
- ✅ Image attachments (file upload, URL, clipboard paste)
- ✅ Craft input text
- ✅ Prompt text
- ✅ Dialog override settings

**Test Method:**
1. Start video generation (10s duration)
2. Upload image via any method
3. Fill in craft input and prompts
4. Press F5 to refresh
5. **Result:** All state restored correctly

---

## 🎬 Grid View Toggle Feature (v2.2.0 - 12/30/2025)

### Problem Solved
Single-column list view in history forces users to scroll extensively when viewing many videos. Users need a compact 2-column grid layout to see more videos at once and reduce navigation friction.

### Solution: Grid/List View Toggle

**A. User Interface Component**
- **Location**: History header between Eye Icon (toggle visibility) and Refresh button
- **Grid Icon**: 2×2 squares SVG (visible in list mode) - click to switch to grid
- **List Icon**: 3 horizontal lines SVG (visible in grid mode) - click to switch to list
- **Styling**: Matches eye icon button style (`px-2 py-2 bg-gray-700/30 hover:bg-gray-600/40 rounded-lg`)
- **File**: `main.html` lines 2151-2167

**B. Core Functions (main.html lines 6608-6654)**

1. **toggleGridView()** - Toggle between modes
   ```javascript
   // Gets current mode (default: list)
   // Toggles to opposite mode (list → grid or grid → list)
   // Saves preference to localStorage key: 'history_view_mode'
   // Updates icons via updateGridIcons()
   // Re-renders history with renderVideoHistory()
   ```

2. **updateGridIcons(mode)** - Swap icon visibility
   ```javascript
   // If mode === 'grid':
   //   Hide grid icon (2×2 squares)
   //   Show list icon (3 lines)
   // If mode === 'list':
   //   Show grid icon (2×2 squares)
   //   Hide list icon (3 lines)
   ```

3. **initGridView()** - Initialize on page load
   ```javascript
   // Called during DOMContentLoaded (line 3849)
   // Loads saved preference from localStorage
   // Updates icon state to match saved preference
   // Default: list mode
   ```

**C. Rendering Logic**
- **Location**: `main.html` lines 6720-6722
- **Implementation**:
  ```javascript
  // Get current view mode from localStorage
  const viewMode = localStorage.getItem('history_view_mode') || 'list';
  const gridClass = viewMode === 'grid' ? 'grid-cols-2' : 'grid-cols-1';

  // Apply to grid container
  videoHistory.innerHTML = `<div class="grid ${gridClass} gap-3">...`
  ```
- **Rendering**: Changes only the Tailwind CSS grid class; no structural changes needed
- **Compatibility**: Works with existing video cards, shimmer effects, hover states

**D. Data Persistence**
- **localStorage Key**: `'history_view_mode'`
- **Possible Values**: `'list'` (default) or `'grid'`
- **Behavior**: User preference persists across:
  - Browser refresh (F5)
  - Page navigation away and back
  - Browser restart

**E. Visual Behavior**

**List Mode (Default)**
```
┌─────────────────────────┐
│ [👁] [⊞ Grid] [↻] [🗑]  │  ← Grid icon visible
│                          │
│  ┌──────────────────┐   │
│  │  Video A         │   │  ← Full width (grid-cols-1)
│  │  Model • 5s•720p │   │
│  └──────────────────┘   │
│  ┌──────────────────┐   │
│  │  Video B         │   │
│  │  Model • 5s•720p │   │
│  └──────────────────┘   │
└─────────────────────────┘
```

**Grid Mode (After Click)**
```
┌─────────────────────────┐
│ [👁] [≡ List] [↻] [🗑]  │  ← List icon visible
│                          │
│  ┌────────┐ ┌────────┐  │
│  │ Video A│ │ Video B│  │  ← 2 columns (grid-cols-2)
│  │ Model  │ │ Model  │  │
│  └────────┘ └────────┘  │
│  ┌────────┐ ┌────────┐  │
│  │ Video C│ │ Video D│  │
│  │ Model  │ │ Model  │  │
│  └────────┘ └────────┘  │
└─────────────────────────┘
```

**F. Metadata Display**
- **No CSS changes needed** - Current card styling works for both layouts
- **Metadata shown**: Model name, Duration•Resolution (e.g., "5s•720p"), Truncated prompt
- **Grid-specific behavior**:
  - Cards remain same aspect ratio (aspect-video)
  - Metadata text truncates naturally due to smaller width
  - Hover effects and click interactions work identically

**G. Integration Points**

1. **DOMContentLoaded Event** (line 3849)
   - Calls `initGridView()` to restore user's saved preference
   - Executes after DOM is ready but before renderVideoHistory()

2. **Button Click Handler** (line 2152)
   - `onclick="toggleGridView()"` triggers toggle immediately
   - No debouncing needed (fast operation)

3. **renderVideoHistory()** (lines 6720-6722)
   - Reads view mode from localStorage
   - Applies dynamic grid class before rendering
   - Works with both processing and completed videos

**H. CSS Classes Used**
- **Tailwind CSS Grid**:
  - `grid grid-cols-1 gap-3` = List view (single column)
  - `grid grid-cols-2 gap-3` = Grid view (2 columns)
- **Icon Styling**:
  - `hidden` class to hide/show icons
  - Uses `classList.add('hidden')` and `classList.remove('hidden')`

**I. Performance Characteristics**
- **Toggle Speed**: Instant (no API calls, pure localStorage + DOM manipulation)
- **Re-render Time**: <100ms for typical history (renderVideoHistory is already optimized)
- **Storage Impact**: ~5 bytes (just the string 'grid' or 'list' in localStorage)
- **No memory leaks**: Simple string-based state, no complex objects

**J. Browser Compatibility**
- **Required APIs**:
  - `localStorage` (available in all modern browsers)
  - `classList.add()`, `classList.remove()` (IE 10+)
  - Template literals (ES6, requires modern browser)
- **Fallback behavior**: If localStorage unavailable, defaults to list mode each session

**K. Testing Checklist**
- ✅ Click grid icon → switches to 2-column grid
- ✅ Icon changes from grid (⊞) to list (≡) after first click
- ✅ Click list icon → switches back to 1-column list
- ✅ Icon changes from list (≡) to grid (⊞) after second click
- ✅ F5 refresh → maintains selected view mode
- ✅ Close/reopen browser → maintains selected view mode
- ✅ Grid mode works with processing videos (opacity-60)
- ✅ Grid mode works with completed videos
- ✅ Thumbnail clicks open modal correctly in both modes
- ✅ Shimmer animation works in both modes
- ✅ Video metadata displays correctly in both layouts

**L. Future Enhancements**
- Could add responsive breakpoints: 1 col (mobile) → 2 cols (tablet) → 3 cols (desktop)
- Could add grid size selector: 2-col, 3-col, 4-col options
- Could animate grid transition (fade/slide effects)
- Could add "Remember my preference per resolution" feature

---

## 🔧 Blob:null Cache Skip Optimization (v2.2.3 - 12/30/2025)

### Problems Solved

**Problem 1: Short Videos Had Delayed Playback**
- After v2.2.2 fix, short videos (< 5s) still had 2-second delay before playing
- Caused by `blob:null/` URLs from IndexedDB cache
- These URLs have corrupted origin context (`blob:null/` instead of `blob:https://...`)

**Problem 2: Long Videos Stopped Near End**
- Videos would play normally but freeze/pause near the end
- Loop functionality would fail with blob:null URLs
- Required ~10 seconds of waiting before resuming

---

### Root Cause Analysis

**The `blob:null/` Corrupted Cache Issue:**

Found in IndexedDB video cache system (lines 2876-2882, 2889-2960 in main.html):
```javascript
// getCachedVideo returns blob URLs like: blob:null/00076959-8158-4089-a44b-c3d2a4f58a1b
const cachedUrl = await getCachedVideo(videoId);
if (cachedUrl) {
    // ❌ PROBLEM: Blob created without proper origin context
    // Causes playback state issues and loop failures
    await setupVideoLoading(videoPlayer, loadingOverlay, cachedUrl);
}
```

**Why `blob:null/` URLs fail:**
- IndexedDB blob creation loses origin context in certain scenarios
- Results in URLs like `blob:null/UUID` instead of `blob:https://...`
- Browser treats these as untrusted, causing playback restrictions
- Affects both playback start AND loop restart

| Scenario | Behavior |
|----------|----------|
| Short video from blob:null | currentTime stuck at 0, paused: false (contradiction) |
| Long video from blob:null | Plays fine initially, freezes near end during loop restart |
| Network URL | Always works reliably |

---

### Solution Implemented

**Detection & Skip Pattern (lines 7149-7155 in main.html):**

```javascript
const cachedUrl = await getCachedVideo(videoId);
if (cachedUrl) {
    // 🔧 FIX: Skip blob:null URLs - they have playback issues
    if (cachedUrl.startsWith('blob:null/')) {
        console.warn('⚠️ Skipping blob:null cache (known playback issues)');
        console.log('🌐 Loading video from network instead');
        await setupVideoLoading(videoPlayer, loadingOverlay, videoUrl);
        console.log('✅ Video loaded from network and ready');
        return;
    }

    // Use good blob URLs (blob:https://...) or other cache formats
    console.log('📦 Loading video from cache:', cachedUrl.substring(0, 50));
    await setupVideoLoading(videoPlayer, loadingOverlay, cachedUrl);
    return;
}
```

**Key Points:**
1. Detects `blob:null/` prefix early (before attempting playback)
2. Bypasses cache entirely, loads from network URL directly
3. No delay waiting for playback to fail - instant fallback
4. Still uses good cache entries (blob:https://... URLs)

---

### Files Modified

**main.html:**
- Lines 7149-7155: Added blob:null detection and bypass logic
- Removed 2-second fallback mechanism (no longer needed)
- Simplified playback flow in `openVideoModal()` (lines 7306-7312)

---

### Behavior Changes

| Scenario | v2.2.2 | v2.2.3 |
|----------|--------|--------|
| Short videos from blob:null | 2s delay then play | Instant, network URL |
| Long videos from blob:null | Plays fine, freezes near end | Instant, network URL |
| Short videos from network | Instant play | Instant play |
| Good blob URLs (blob:https://) | Use cache | Use cache ✅ |
| Videos with loop | Fails on blob:null | Works for all ✅ |

---

### Console Output

**Before:**
```
✅ Cache HIT: fa2645f607be4c9eac3a1465c94f823f
📦 Loading video from cache
🎬 Setting video src: blob:null/00076959-8158-4089-a44b-c3d2a4f58a1b...
✅ Video loaded from cache and ready
✅ Video is playing
[waits 2s...]
⚠️ Blob URL playback stuck! Falling back to network URL...
```

**After:**
```
✅ Cache HIT: fa2645f607be4c9eac3a1465c94f823f
⚠️ Skipping blob:null cache (known playback issues)
🌐 Loading video from network instead
✅ Video loaded from network and ready
✅ Video is playing
[instant playback]
```

---

### Performance Impact

**Positive:**
- No 2-second delay for problematic blob:null videos
- Immediate playback for all scenarios
- Reduced memory usage (less blob:null objects in cache)

**Neutral:**
- Good blob URLs still use cache (no regression)
- Network bandwidth for blob:null cases (acceptable trade-off)

---

### Technical Notes

**IndexedDB Cache Blob Creation:**
- Blobs created with `new Blob([data], { type: 'video/mp4' })`
- Origin context should be from `self.createObjectURL(blob)`
- Under certain conditions, createObjectURL fails silently
- Results in blob:null URLs that are essentially unusable

**Future Improvement:**
Consider adding blob creation validation or fallback to network-only cache mode:
```javascript
// Future enhancement
if (!cachedUrl || cachedUrl.startsWith('blob:null/')) {
    // Use network-only cache strategy
    // Store only metadata, fetch video from network
}
```

---

## 🔁 Video Loop & Short Video Playback Fix (v2.2.2 - 12/30/2025)

### Problems Solved

**Problem 1: Short Videos Don't Play**
- Videos shorter than 5 seconds failed to play when clicking the thumbnail
- Users had to manually click the scrubber/timeline to move past the starting point
- Only then would the video play normally
- Videos ≥5 seconds worked fine

**Problem 2: Videos Play Once Then Stop**
- Videos would play through once and then stop
- Users had to manually click play again to replay
- Not ideal for UX when viewing short generated clips

---

### Root Cause Analysis

**The `#t=0.5` Media Fragment Bug:**

Found in `main.html` at lines 6461 and 6796:
```html
<!-- Problematic code -->
<video src="${videoUrl}#t=0.5" preload="metadata" muted playsinline>
```

**Why `#t=0.5` caused the bug:**

| Video Duration | Effect of `#t=0.5` |
|----------------|-------------------|
| < 0.5s | ❌ **Invalid seek** - exceeds video length |
| 0.5s - 5s | ⚠️ **Edge cases** - buffering/state issues |
| ≥ 5s | ✅ **Normal** - seek to 0.5s works |

**Explanation:**
- `#t=0.5` is an HTML5 Media Fragment Identifier
- Tells browser to seek to 0.5 seconds when loading
- For videos shorter than 0.5s, this seek position is invalid
- Results in video entering an error state where play() doesn't work
- Manual timeline interaction resets the video state, allowing playback

**Why manual scrubber click worked:**
- Clicking the timeline resets the internal video state
- Clears the corrupted state from the invalid seek
- Allows normal playback to resume

---

### Solution Implemented

**Two-part fix applied to both video elements (lines 6461 and 6796):**

1. **Remove `#t=0.5` fragment**
   - Eliminates invalid seek position for short videos
   - Allows all videos to play from start (0.0s)

2. **Add `loop` attribute**
   - Videos now loop automatically
   - Better UX for viewing short AI-generated clips
   - Stops when user pauses or exits modal

**Before:**
```html
<video
    src="${videoUrl}#t=0.5"
    preload="metadata"
    muted
    playsinline
>
```

**After:**
```html
<video
    src="${videoUrl}"
    preload="metadata"
    muted
    playsinline
    loop
>
```

---

### Files Modified

**main.html:**
- Line 6461: Removed `#t=0.5` + Added `loop` attribute (first video element)
- Line 6796: Removed `#t=0.5` + Added `loop` attribute (second video element)

---

### Behavior Changes

| Aspect | Before | After |
|--------|--------|-------|
| Videos <5s | ❌ Don't play | ✅ Play normally |
| Click play button | ⚠️ May fail for short videos | ✅ Always works |
| Video playback | 🔁 Play once, stop | 🔁 Loop continuously |
| Thumbnail frame | Frame at 0.5s | Frame at 0.0s (start) |

---

### Side Effects

**Minor visual change:**
- Thumbnails now show frame at 0.0s instead of 0.5s
- Generally not noticeable (difference is 0.5 seconds)
- Could use `poster` attribute in future if specific frame needed

**No functional regressions:**
- All video functionality preserved
- Modal player works identically
- No impact on video generation or storage

---

### Technical Notes

**HTML5 Video Loop Attribute:**
- Native browser support, very reliable
- Automatically restarts video when reaching end
- Can be toggled programmatically if needed
- Stops when: user pauses, modal closes, or page navigates away

**Alternative Approaches Considered:**
1. **Keep `#t=0.5` with conditional logic** - Too complex, edge cases
2. **Use `poster` image** - Requires generating thumbnails, more overhead
3. **JavaScript seek on `loadedmetadata`** - Works but adds complexity
4. **Current solution (remove fragment)** - ✅ Simplest, most reliable

---

### Testing Checklist

- ✅ 3-second videos play immediately on click
- ✅ 5-second videos play immediately on click
- ✅ 10-second videos play immediately on click
- ✅ Videos loop automatically after finishing
- ✅ Pause button stops looping
- ✅ Exiting modal stops video
- ✅ No console errors during playback
- ✅ Grid/List view toggle works with looping videos

---

## 🎨 Minimalist UI Refinement (v2.2.1 - 12/30/2025)

### Problem Solved
History video cards displayed provider badges (WAVESPEED, etc.) in the top-right corner, adding visual clutter and reducing focus on video content. Since VIDIST currently only supports Wavespeed provider, these badges provided no user benefit.

### Solution: Remove Provider Badges

**A. Removed Elements**
- **Provider Badge Spans**: Previously displayed as colored badges (cyan for Wavespeed, purple for others)
- **Location**: Top-right corner of every video thumbnail in history
- **Impact**: Cleaner, more minimalist UI with focus on video content

**B. Files Modified**
- **File**: `main.html`
- **Locations Removed From**:
  1. Processing videos section (line ~6759)
  2. Completed videos with download button (line ~6809, 6472)
  3. Completed videos with alternate rendering (line ~6500, 6834)

**C. What's Preserved**
- Provider information **still visible** in:
  - Modal/detail view (line 6066, 7289) - shows "Provider: WAVESPEED" when opening video details
  - Never removed from internal code logic
- All video functionality remains unchanged
- Grid/List layout unchanged

**D. Visual Difference**

**Before (v2.2.0):**
```
┌─────────────────────────────┐
│ [WAVESPEED badge in corner] │  ← Colored provider badge
│  Video Thumbnail            │
│  Model • 5s•720p            │
└─────────────────────────────┘
```

**After (v2.2.1):**
```
┌─────────────────────────────┐
│  Video Thumbnail            │  ← Clean, no badge
│  Model • 5s•720p            │
└─────────────────────────────┘
```

**E. Rationale**
1. **Single Provider**: Currently only Wavespeed is supported, so badge is redundant
2. **Visual Clarity**: Removes unnecessary UI elements, improves readability
3. **Content Focus**: Brings full focus to video thumbnail and metadata
4. **Consistency**: Matches minimalist aesthetic of the rest of the UI
5. **Scalability**: When/if multiple providers are added, provider info stays accessible in modal view

**F. Code Impact**
- Removed ~5 inline badge elements from template literals
- No change to CSS, no change to data structures
- No change to functionality (provider still tracked internally)
- Zero breaking changes

**G. Testing Notes**
- ✅ All video cards display without badges
- ✅ Grid/List toggle works identically
- ✅ Hover effects work (download, reuse buttons)
- ✅ Modal still shows provider info when clicked
- ✅ No visual artifacts or layout shifts

---

## ⚠️ Known Issues & Limitations

### 1. Image URL Input
**Status**: ✅ **FIXED** (v1.11.1)

**Previous Issue:**
- Image URL loading didn't persist across refresh

**Current Status:**
- **Base64 Mode**: Converts image to base64 via canvas (CORS required) ✅ Working
- **URL Mode**: Sends URL directly to API (CORS blocked) ✅ Working
- Both modes now save to localStorage properly

**Limitations:**
- localStorage quota (5-10 MB) - large base64 images (>500KB) may be rejected
- URL mode requires external URL to remain accessible
- CORS restrictions still apply for canvas conversion

**Implementation:**
- `handleImageUrl()` in `main.html` (lines 4782-4872)
- Saves via `saveImageToStorage()` (lines 4812, 4855)
- Restores via `restoreImagePreview()` (lines 3261-3296)

---

*Last Updated: December 29, 2025 (v2.1.0: Modern hologram effects, smart prompt validation, streamlined UI)*
