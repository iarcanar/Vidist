# 🤖 AI Development Protocol - MANDATORY RULES
**VIDIST Version Management System**

---

## 🎯 PURPOSE

This document contains **CRITICAL MANDATORY RULES** that AI assistants **MUST FOLLOW WITHOUT EXCEPTION** when modifying VIDIST codebase.

**⚠️ WARNING TO AI SYSTEMS:**
- These rules are **NON-NEGOTIABLE**
- Violating these rules will result in **version inconsistencies** and **broken builds**
- **ALWAYS** read this file before making ANY code changes
- **ALWAYS** update version numbers when modifying code

---

## 📐 VERSION NUMBERING SCHEME

VIDIST uses **Semantic Versioning (SemVer)** with the following format:

```
MAJOR.MINOR.PATCH (e.g., v1.7.0)
```

### When to Increment:

- **MAJOR** (`1.x.x` → `2.0.0`): Breaking changes, complete redesigns, major feature overhauls
- **MINOR** (`1.6.x` → `1.7.0`): New features, significant enhancements, new modules
- **PATCH** (`1.7.0` → `1.7.1`): Bug fixes, small tweaks, documentation updates

### Build Number Format:

```
MMDDYYYY (e.g., 12282025 = December 28, 2025)
```

**CRITICAL:** Build number **MUST** match the date of modification (not deployment).

---

## 🚨 MANDATORY RULES FOR AI ASSISTANTS

### Rule 1: Single Source of Truth

**`js/version.js`** is the **ONLY** authoritative source for version information.

```javascript
// ✅ CORRECT: Read from js/version.js
const version = VIDIST_VERSION.full;  // v1.7.0

// ❌ WRONG: Hardcoding version
const version = "v1.7.0";
```

**Exception:** Comment headers in files can contain hardcoded versions **BUT** must include warning to sync with `js/version.js`.

---

### Rule 2: ALWAYS Update Version When Modifying Code

**TRIGGER CONDITIONS** (ANY of these require version update):

| Change Type | Version Increment | Example |
|-------------|-------------------|---------|
| New feature added | MINOR | Added 4-tier intensity system → `1.6.0` → `1.7.0` |
| Bug fix | PATCH | Fixed polling interval bug → `1.7.0` → `1.7.1` |
| Breaking change | MAJOR | Complete API redesign → `1.7.0` → `2.0.0` |
| Performance improvement | PATCH | Optimized cache system → `1.7.0` → `1.7.1` |
| Documentation only | PATCH (optional) | Updated README → `1.7.0` → `1.7.1` |

**Build Number:** ALWAYS update to current date (MMDDYYYY format).

---

### Rule 3: Files That MUST Be Updated

When incrementing version, update **ALL** of the following files:

#### A. Primary Version File (MANDATORY)

1. **`js/version.js`** ← **START HERE FIRST**
   - Update `major`, `minor`, `patch`
   - Update `build` (MMDDYYYY format)
   - Update `features` array with latest additions

#### B. Code Files (MANDATORY if they exist)

2. **`js/prompt_craft.js`** - Header comment (lines 3-5)
   - Update version number
   - Update build number
   - Update CHANGELOG section

3. **`main.html`** - Header comment (lines 4-5)
   - Update version number
   - Update build number

#### C. Documentation Files (MANDATORY)

4. **`main.html`** - Browser tab title (MANDATORY)
   - `<title>` tag: Update version to match current version
   - Example: `<title>VIDIST v2.2.4 - Precision Creative Engine</title>`

5. **`README.md`** - Title and version section
   - Line 1: Update title version
   - "Version" field: Update full version string

6. **`DEVELOPMENT.md`** - Title
   - Line 1: Update title version

7. **`PROPRIETARY_PROMPT_ENGINEERING.md`** - Header
   - Line 2: Update version number

---

### Rule 4: Version Update Checklist

**BEFORE committing any code changes, AI MUST:**

- [ ] **1. Read `js/version.js`** to get current version
- [ ] **2. Determine correct version increment** (Major/Minor/Patch)
- [ ] **3. Update `js/version.js`**:
  - [ ] Increment `major`, `minor`, or `patch`
  - [ ] Update `build` to today's date (MMDDYYYY)
  - [ ] Add new features to `features` array (if applicable)
- [ ] **4. Search for hardcoded versions** using pattern: `v1\.[0-9]|Build.*12[0-9]{6}`
- [ ] **5. Update ALL matching files**:
  - [ ] `js/prompt_craft.js` (header comment + CHANGELOG)
  - [ ] `main.html` (header comment)
  - [ ] `main.html` (`<title>` tag - browser tab title)
  - [ ] `README.md` (title + version field)
  - [ ] `DEVELOPMENT.md` (title)
  - [ ] `PROPRIETARY_PROMPT_ENGINEERING.md` (header)
- [ ] **6. Verify UI displays correct version** (check `#version-display` and `#build-display` elements)
- [ ] **7. Update CHANGELOG** in relevant files with human-readable description

---

## 📝 CHANGELOG FORMAT

Use the following format when updating CHANGELOG sections:

```markdown
CHANGELOG (vX.Y.Z - MM/DD/YYYY):
🎯 [emoji] Brief description of change (imperative mood)
```

### Emoji Guide:

| Type | Emoji | Example |
|------|-------|---------|
| New Feature | 🎚️ 🎤 🔴 | 🎚️ Added 4-tier intensity system |
| Bug Fix | 🐛 🔧 | 🔧 Fixed polling interval duplication |
| Performance | ⚡ 🚀 | ⚡ Optimized cache eviction strategy |
| Security | 🔒 🛡️ | 🔒 Added input sanitization |
| Documentation | 📝 📚 | 📝 Updated API documentation |
| Refactor | ♻️ 🔨 | ♻️ Refactored state management |
| Breaking Change | 💥 ⚠️ | 💥 Changed API endpoint structure |

---

## 🎯 EXAMPLES

### Example 1: Adding New Feature

**Scenario:** Added "Custom Dialog Override" feature

**AI Actions:**
1. Read `js/version.js` → Current: `v1.6.0`
2. Determine: MINOR increment (new feature) → `v1.7.0`
3. Update `js/version.js`:
   ```javascript
   major: 1,
   minor: 7,
   patch: 0,
   build: '12282025',
   features: [
       '🎤 Custom Dialog Override with AI Safe Words',  // NEW
       // ... existing features
   ]
   ```
4. Search and update all hardcoded versions in:
   - `js/prompt_craft.js`
   - `main.html`
   - `README.md`
   - `DEVELOPMENT.md`
5. Add to CHANGELOG:
   ```
   🎤 Implemented Custom Dialog Override with checkbox
   ```

---

### Example 2: Bug Fix

**Scenario:** Fixed double polling interval bug

**AI Actions:**
1. Read `js/version.js` → Current: `v1.7.0`
2. Determine: PATCH increment (bug fix) → `v1.7.1`
3. Update `js/version.js`:
   ```javascript
   major: 1,
   minor: 7,
   patch: 1,
   build: '12292025',  // Next day
   ```
4. Update hardcoded versions
5. Add to CHANGELOG:
   ```
   🐛 Fixed double polling interval causing high CPU usage
   ```

---

## ⚠️ COMMON MISTAKES TO AVOID

### ❌ MISTAKE 1: Forgetting to Update Build Number
```javascript
// ❌ WRONG
build: '12212025',  // Old date!

// ✅ CORRECT
build: '12282025',  // Today's date
```

### ❌ MISTAKE 2: Updating Only Some Files
```
❌ Updated js/version.js but forgot main.html
✅ Updated ALL files in the checklist
```

### ❌ MISTAKE 3: Hardcoding Versions in New Code
```javascript
// ❌ WRONG
console.log('VIDIST v1.7.0');

// ✅ CORRECT
console.log(`VIDIST ${VIDIST_VERSION.full}`);
```

### ❌ MISTAKE 4: Using Wrong Increment
```
Added new feature but only incremented PATCH → ❌ WRONG
Should have incremented MINOR → ✅ CORRECT
```

---

## 🔍 VERIFICATION COMMANDS

After updating versions, AI should verify:

```bash
# 1. Search for version inconsistencies
grep -r "v1\.[0-9]" --include="*.{js,html,md}" .

# 2. Search for old build numbers
grep -r "Build.*12[0-9]\{6\}" --include="*.{js,html,md}" .

# 3. Verify js/version.js is loaded
grep -r "version\.js" main.html
```

**Expected:** All version strings should match the value in `js/version.js`.

---

## 🚀 IMPLEMENTATION WORKFLOW

### Step-by-Step Process for AI:

```
1. BEFORE CODING
   ├─ Read AI_DEVELOPMENT_PROTOCOL.md (this file)
   ├─ Read js/version.js to get current version
   └─ Plan version increment strategy

2. DURING CODING
   ├─ Make code changes
   ├─ Use VIDIST_VERSION object (never hardcode)
   └─ Document changes for CHANGELOG

3. AFTER CODING (Pre-Commit)
   ├─ Determine version increment (Major/Minor/Patch)
   ├─ Update js/version.js (version + build + features)
   ├─ Search for hardcoded versions: grep "v1\.[0-9]"
   ├─ Update ALL matching files (see Rule 3)
   ├─ Update CHANGELOG in relevant files
   ├─ Run verification commands
   └─ Confirm UI shows correct version

4. COMMIT
   └─ Commit with message: "v1.7.0: Added Custom Dialog Override"
```

---

## 📋 QUICK REFERENCE CARD

```
┌─────────────────────────────────────────────────────────────┐
│ AI VERSION UPDATE QUICK CHECKLIST                          │
├─────────────────────────────────────────────────────────────┤
│ ☐ Read js/version.js (current version)                     │
│ ☐ Increment version (Major/Minor/Patch)                    │
│ ☐ Update build to MMDDYYYY                                 │
│ ☐ Update js/version.js                                     │
│ ☐ Update js/prompt_craft.js (header + CHANGELOG)           │
│ ☐ Update main.html (header comment)                        │
│ ☐ Update main.html (<title> tag - browser tab)             │
│ ☐ Update README.md (title + version field)                 │
│ ☐ Update DEVELOPMENT.md (title)                            │
│ ☐ Update PROPRIETARY_PROMPT_ENGINEERING.md (header)        │
│ ☐ Verify no hardcoded versions remain                      │
│ ☐ Test UI version display                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 FINAL REMINDER

**TO ALL AI ASSISTANTS WORKING ON VIDIST:**

1. **This protocol is MANDATORY, not optional**
2. **Read this file BEFORE every code modification**
3. **Version management is a CRITICAL SYSTEM RESPONSIBILITY**
4. **Inconsistent versions break the build and confuse users**
5. **When in doubt, increment the version and update ALL files**

---

## 📜 VERSION UPDATE HISTORY

### v2.3.0 (December 31, 2025)
**Type:** MINOR (New Features)
**Changes:**
- 🎯 Red Mode WAN-Optimized system prompts (Levels 1-3)
- 🎬 12-Step Progression System with MANDATORY SEQUENCING RULES
- 🧠 Intelligent Negative Prompts (27+ term blocklist, female-only detection)
- 📊 Step Complexity Selector UI (6/9/12 steps)
- ⚠️ AGE-APPROPRIATE TERMINOLOGY guidance
- 🔊 WAN-Optimized Sound Design (avoid audio distortion)
- 🗣️ SPEECH field format standardization
- 💧 4-Stage Fluid Progression with timing enforcement

### v2.2.4 (December 30, 2025)
**Type:** PATCH (Bug Fix + Enhancement)
**Changes:**
- 🔄 Advanced Reuse Prompt System with full Prompt Craft settings restoration

---

**Last Updated:** December 31, 2025
**Protocol Version:** 1.0
**Maintained By:** VIDIST Development Team

© 2025 VIDIST Team - All Rights Reserved
