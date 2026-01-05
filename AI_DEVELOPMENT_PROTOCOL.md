# AI Development Protocol for VIDIST

> **CRITICAL DOCUMENT** - All AI assistants MUST read and follow this protocol when making changes to this project.

---

## 🚨 MANDATORY VERSION UPDATE RULES

### Rule #1: Version Update is ALWAYS Required

Every time you modify `index.html`, you **MUST** also update `js/version.js`:

1. **Increment patch version** (e.g., patch: 6 → patch: 7)
2. **Add changelog entry** at the TOP of the `features` array
3. **Update build date** if it's a new day (format: `gitMMDDYYYY`)

### Rule #2: Pre-commit Hook Will Block Invalid Commits

A Git pre-commit hook is installed that will **BLOCK** any commit where:
- `index.html` is modified
- BUT `js/version.js` is NOT modified

**The commit will fail with an error message until you update the version.**

---

## Version Update Checklist

```
┌─────────────────────────────────────────────────────────────┐
│  BEFORE EVERY COMMIT, CHECK:                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  □ Did I modify index.html?                                 │
│    → YES: Update js/version.js BEFORE committing            │
│    → NO: Version update not required                        │
│                                                             │
│  □ Version.js updates required:                             │
│    1. patch: [current] → [current + 1]                      │
│    2. features: Add new entry at TOP of array               │
│    3. build: Update date if new day (gitMMDDYYYY)           │
│                                                             │
│  □ Commit message format:                                   │
│    v[VERSION]: [Brief Description]                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Version File Structure

**File:** `js/version.js`

```javascript
const VIDIST_VERSION = {
    major: 2,       // Increment for breaking changes
    minor: 7,       // Increment for new features
    patch: 6,       // Increment for bug fixes, UI changes, any modification
    build: 'git01052026',  // Format: gitMMDDYYYY

    features: [
        '🎬 [Feature Name] v2.7.6 (Description of changes)',  // ← Add new entry HERE
        '🔍 Previous Feature v2.7.5 (Previous description)',
        // ... older entries
    ]
}
```

---

## Commit Message Format

```
v[VERSION]: [Brief Description]

🎬 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: [Model Name] <noreply@anthropic.com>
```

**Example:**
```
v2.7.7: Add dark mode toggle

🎬 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

---

## Version Increment Rules

| Change Type | Action | Example |
|-------------|--------|---------|
| Bug fix | patch++ | 2.7.6 → 2.7.7 |
| New feature | patch++ | 2.7.6 → 2.7.7 |
| UI change | patch++ | 2.7.6 → 2.7.7 |
| Refactor | patch++ | 2.7.6 → 2.7.7 |
| HOTFIX | patch++ | 2.7.6 → 2.7.7 |
| Breaking change | minor++ | 2.7.6 → 2.8.0 |
| Major rewrite | major++ | 2.7.6 → 3.0.0 |

---

## ❌ NEVER Do These

- ❌ **NEVER** hardcode version numbers in `index.html`
- ❌ **NEVER** commit `index.html` without updating `js/version.js`
- ❌ **NEVER** skip version increment for "small" changes
- ❌ **NEVER** use `--no-verify` to bypass hook (except emergencies)
- ❌ **NEVER** forget to add a changelog entry to the `features` array

---

## ✅ ALWAYS Do These

- ✅ **ALWAYS** read this document before starting work
- ✅ **ALWAYS** update `js/version.js` when modifying `index.html`
- ✅ **ALWAYS** increment the patch number (or minor/major as needed)
- ✅ **ALWAYS** add a changelog entry with emoji prefix
- ✅ **ALWAYS** use the correct commit message format
- ✅ **ALWAYS** verify the version displays correctly after deployment

---

## Changelog Entry Format

```javascript
'[EMOJI] [Feature Name] v[VERSION] ([Description])',
```

**Emoji Guide:**
| Emoji | Use For |
|-------|---------|
| 🎬 | Video features |
| 🖼️ | Image features |
| 🔍 | Search/filter features |
| 🗑️ | Delete functionality |
| 🎨 | UI/styling changes |
| 🔧 | Bug fixes |
| ⚡ | Performance improvements |
| 💾 | Storage/persistence |
| 📱 | Mobile features |
| ✨ | General improvements |

---

## Single Source of Truth

```
js/version.js  ← THE ONLY FILE WITH VERSION INFO
     │
     ├── index.html loads version via JavaScript
     ├── Console displays version on startup
     └── All version displays read from this file
```

**NEVER** put version numbers directly in HTML. They must ALWAYS come from `js/version.js`.

---

## Emergency Bypass

If you absolutely must commit without version update (NOT RECOMMENDED):

```bash
git commit --no-verify -m "Emergency: [reason]"
```

**Warning:** This bypasses all hooks. Use only in true emergencies.

---

## Verification Steps

After every deployment:

1. Open https://iarcanar.github.io/Vidist/
2. Check version in header matches `js/version.js`
3. Open DevTools Console → verify version log
4. If mismatch: Clear cache (Ctrl+Shift+R) and verify again

---

*Last Updated: 2026-01-05*
*Protocol Version: 1.0*
