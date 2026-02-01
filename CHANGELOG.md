# VIDIST Changelog

## v3.3.0 (2026-02-01)
**✨ Grok Image Edit Support - Complete Integration**

### Added
- **Grok Imagine Image** as image editing provider (alongside Gemini 2.5 Flash and WAN 2.6)
- Full integration with existing image edit workflow:
  - Floating processing UI with progress bar
  - Edit history support (Original ↔ Edited navigation)
  - imgbb permanent storage for edited images
  - Auto-save compatibility
  - Video history panel integration

### Fixed
- **CRITICAL**: Grok API image edit endpoint requiring specific format
  - Fixed: API expects `image: { url: '...' }` (object) not string
  - Fixed: API requires public URL (imgbb) not data URI
  - Solution: Upload source image to imgbb before sending to Grok API
- **CORS issue**: Grok image URLs don't have proper CORS headers
  - Solution: Use `img.crossOrigin` + canvas extraction instead of fetch()
  - Fallback: Display image URL directly if canvas fails
- **Missing edit history**: Original image not preserved
  - Solution: Add original to edit history before editing (same pattern as Gemini/WAN)

### Implementation
- Modified `editImage_Grok()` function:
  - Added imgbb upload for source image
  - Payload format: `{ model, image: { url: publicUrl }, prompt }`
  - Floating UI + progress simulation
  - Edit history integration
- Modified `handleImageEditCompleteGrok()`:
  - Multi-layered image download approach (img + canvas)
  - imgbb upload for permanent storage
  - UI update with fade animation
  - Edit history tracking
- Total changes: ~150 lines modified/added

### Technical Details
- imgbb API key required (same as video generation)
- Cost: $0.022 per edit (instant response, no polling)
- Supports base64 extraction or URL fallback
- Complete parity with Gemini/WAN providers

---

## v3.1.0 (2026-01-30)
**🔄 GitHub Pages History Sync Fix - Export/Import System**

### Fixed
- **CRITICAL**: Video history not showing on GitHub Pages after push (worked fine locally)
- Root cause: localStorage is origin-specific
  - Local (`file:///` or `http://localhost`) has separate storage from GitHub Pages (`https://iarcanar.github.io`)
  - When pushing to GitHub Pages, deployed version starts with empty localStorage
  - No synchronization mechanism existed between the two origins

### Added
- **Import button** in kebab menu (⋮) alongside existing Export button
- **Auto-detection banner** shows on first GitHub Pages visit when localStorage is empty
  - Message: "First time on GitHub Pages? Export from local, then import here"
  - "Import Now" and "Maybe Later" buttons
  - Auto-dismisses and remembers user choice
- **Smart import modes**:
  - **Merge**: Combines imported data with existing, skips duplicates (checks video ID)
  - **Replace All**: Overwrites entire history
- **Hidden file input** with JSON validation and error handling
- **Migration guidance** displayed automatically on GitHub Pages

### Implementation
- 6 new JavaScript functions (208 lines):
  - `importHistory()` - Triggers file picker
  - `handleImportFile()` - Validates JSON and offers merge/replace choice
  - `mergeImportedHistory()` - Adds new videos with duplicate prevention
  - `replaceImportedHistory()` - Overwrites entire history
  - `checkFirstTimeDeployment()` - Detects empty localStorage on GitHub Pages domain
  - `dismissMigrationBanner()` - Hides banner and remembers dismissal
- HTML migration banner with gradient styling and action buttons
- Window function exports for onclick handlers

### Security
- API keys **excluded** from export by default (must be re-entered on GitHub Pages)
- File validation (JSON format check)
- Duplicate prevention (ID-based checking)
- Quota enforcement (max 30 videos)

### User Experience
1. See migration banner on first GitHub Pages visit
2. Click "Import Now" → Select exported JSON file
3. Choose Merge or Replace → History appears instantly
4. Refresh preserves history (saved to GitHub Pages localStorage)

### Benefits
- Solves localStorage cross-origin isolation issue
- Simple 2-click migration process
- No external dependencies or backend required
- Works entirely client-side
- Permanent solution once migrated
- Backward compatible with existing Export functionality

---

## v3.0.0 (2026-01-30)
**🚀 MAJOR - Gemini imgbb Upload Revolution (Permanent Storage Solution)**

### Fixed
- **CRITICAL**: Gemini edited images disappearing after page refresh
- localStorage quota exceeded errors (5-10MB limit)
- Emergency cleanup still failing despite multiple optimizations
- Data lost on refresh due to quota issues

### Problem Analysis
Previous fixes attempted but insufficient:
- v2.12.18: Fixed thumbnail display ✅
- v2.12.19: Stripped redundant URL (50% reduction) ✅
- v2.12.20: Never clears history entirely ✅
- **BUT**: Gemini base64 still too large (200-500KB per image)
- localStorage quota (5-10MB) fundamentally insufficient for image storage

### Solution: imgbb Cloud Upload
**Why imgbb is BETTER than IndexedDB:**
- Unlimited storage (vs 50-100MB browser limit)
- Permanent URLs (vs browser-specific temporary storage)
- Cross-device compatible (share URLs between devices)
- Simpler implementation (1 API call vs 200+ lines of IndexedDB code)
- Already integrated (`uploadImageToImgbb` exists)
- Tiny localStorage footprint (URL = 40 bytes vs base64 = 200KB)

### Implementation
**Phase 1** (Line 7790): Upload edited image to imgbb
- Automatically uploads completed Gemini edits to imgbb
- Updates history item with permanent `imgbbUrl`
- Saves to localStorage with tiny URL instead of huge base64
- Graceful fallback: keeps base64 if upload fails

**Phase 2** (Line 7737-7785): Code cleanup
- **DELETED** 50+ lines of emergency cleanup code
- No longer needed with imgbb URLs
- Simplified codebase dramatically

**Phase 3** (Line 10264-10266): Rendering priority
- Updated to prefer `imgbbUrl` first (permanent)
- Fallback chain: imgbbUrl → url → initialImage (base64) → cachedUrl

### Benefits
- **NO quota errors ever** - 40 bytes per image instead of 200KB
- **Permanent storage** - Images hosted on imgbb CDN
- **Unlimited capacity** - Can store 1000+ Gemini edits
- **Fast rendering** - imgbb CDN delivery
- **Graceful degradation** - Works offline with base64 fallback
- **Simpler codebase** - Removed complexity, easier to maintain

### Results
Console output:
```
📤 Uploading Gemini image to imgbb...
✅ Gemini image uploaded: https://i.ibb.co/...
💾 Gemini history saved with imgbb URL (no quota issues!)
```
- Thumbnails persist after F5 forever
- localStorage stays small
- Cross-device URL sharing possible

### Tradeoff
- Requires network connection for upload
- Acceptable for history feature (one-time upload per edit)

---

## v2.7.9 (2026-01-05)
**Mobile Language Selector Fix - Media Query Adjustment**

### Fixed
- Language selector (EN/TH/JA) buttons displayed as 3 rows on most mobile devices
- Previous fix only applied to screens <480px, now applies to all mobile devices (<768px)
- Reduced button height from 52px to 36px for compact layout
- Now uses 768px media query instead of 480px for broader mobile coverage

### Changed
- Moved language selector CSS fix to proper mobile breakpoint
- Button height: 52px → 36px
- Padding reduced for tighter spacing

---

## v2.7.8 (2026-01-05)
**Mobile Language Selector Layout Enhancement**

### Fixed
- EN/TH/JA language buttons showing as 3 rows on mobile
- Grid layout conflict with generic grid-cols-3 override
- Added specific selector to exclude language selector from vertical stacking

### Changed
- Language selector now displays as single row with 3 equal columns
- Applied `grid-template-columns: repeat(3, 1fr)` with !important

### Technical
- Used CSS specificity override: `#language-selector .grid-cols-3`
- Fixed issue where `.grid-cols-3 { grid-template-columns: 1fr }` affected language buttons

---

## v2.7.7 (2026-01-05)
**Mobile History Hide Button Fix**

### Fixed
- Hide content button in history panel not working on mobile
- CSS specificity issue where ID selector overrode .hidden class
- Images and videos still visible despite hide button showing closed eye icon

### Technical
- **Root Cause**: `#video-history { display: grid; }` (ID selector, specificity 0,1,0,0)
  overrode `.hidden { display: none; }` (class selector, specificity 0,0,1,0)
- **Solution**: Added `#video-history.hidden { display: none !important; }`

### Changed
- Added explicit combined selector for ID + class
- Used !important to ensure display: none takes precedence

---

## v2.7.6 (2026-01-05)
**Video UI Enhancement - Hover Delete & Drag Replace**

### Added
- **Hover Delete Button**: Delete button on top-right of video preview
  - Trash icon matching image delete pattern
  - Fade-in effect on hover (opacity-0 → opacity-100)
  - Red gradient styling with shadow effects
- **Drag & Drop Replace**: Drop new video directly on preview to replace
  - Shows "Drop to Replace Video" overlay
  - Automatically clears old video and loads new one
  - Validates file type before accepting

### Technical
- Reused design patterns from image preview component
- Added videoDragOverlay element reference
- Implemented dragover/dragleave/drop event listeners
- Shows status message for non-video files

### Changed
- Video preview container now has `relative group` for hover effects
- Reduced complexity of remove button visibility

---

## v2.7.5 (2026-01-05)
**Enhanced History Search & Kebab Menu**

### Added
- **Multi-field Search**: Search history by multiple criteria
  - Resolution: "480", "480p", "720p", "1080p" (flexible format)
  - Duration: "3s", "5s", "10s" (both with/without 's' suffix)
  - Type: "image", "video", "edit"
  - Text: Search prompt text as usual
- **Kebab Menu**: Moved Export button to kebab menu (⋮)
  - Cleaner interface
  - Prepared for future menu options

### Technical
- Added regex pattern matching for duration/resolution
- Made search suffixes optional (e.g., "p" in "480p")
- Implemented menu toggle with click-outside-to-close
- Updated search placeholder to show all options

### Changed
- Export button: Full-width button → Kebab menu option
- Search capabilities expanded significantly

---

## v2.7.4 (2026-01-04)
**Delete Button Implementation**

### Added
- **Delete Functionality** for all history card types
  - Processing cards: Delete button (bottom-left)
  - Image cards: Delete button (bottom-right)
  - Video cards: Delete button (bottom-right)
- **Bilingual Confirmation Dialog**: Thai/English support
- **Server Integration**: Deletes from both local storage AND Wavespeed API
- **Graceful Error Handling**: Shows error message if API call fails

### Technical
- Implemented delete functions for each card type
- Added confirmation dialog with bilingual support
- Integrated with existing Wavespeed API management

### Styling
- Red gradient button (from-red-500 to-pink-600)
- Trash icon SVG
- Hover effects with scale and color transitions

---

## v2.7.3 (2026-01-04)
**Header Redesign - Mobile-First Responsive**

### Added
- Single-row horizontal layout on all screen sizes
- Compact TOP UP button (75px on mobile, 65px on extra small)
- Triple constraint CSS for button stability

### Changed
- Mobile logo: 32px (from 48px)
- Mobile button width: 75px (<768px), 65px (<480px)
- Balance text: 12px mobile, 10px extra small
- TOP UP label: 7px mobile, 6px extra small
- Removed 2-row stacked layout

### Fixed
- TOP UP button overflow on mobile
- Text wrapping in small buttons
- Left alignment for better readability

---

## v2.7.2 (2026-01-04)
**Complete History Management System**

### Added
- Auto-resume polling after page refresh
- Retry/Recovery buttons for stuck/failed videos
- Legacy data migration with intelligent model key guessing
- Smart API sync preserving local data (prompts/settings)
- Advanced search/filter/sort UI
- Export history to JSON/CSV
- Increased prompt display to 150 chars with tooltips

---

## v2.7.1 (2026-01-04)
**History Prompt Persistence Fix**

### Fixed
- "No prompt available" issue
- Dual storage conflict
- Unified to TaskPersistence system
- Implemented 300-item/7-day retention
- Added timestamp-based cleanup
- Automatic migration from old data

---

## v2.7.0 (2026-01-03)
**Credit Balance Redesign**

### Changed
- Simplified balance display
- Renamed to "Credit Balance"
- 3 decimal precision
- Removed video estimates
- Cleaner centered layout with icon

---

## Version Protocol (All versions after v2.7.0)

### Automation Rules
- **Single Source of Truth**: `js/version.js` is the ONLY place for version info
- **Pre-commit Hook**: Blocks commits if `index.html` changes but `version.js` doesn't
- **Semantic Versioning**: Major.Minor.Patch (currently 2.7.x)
- **Build Format**: gitMMDDYYYY (e.g., git01052026 = January 5, 2026)
- **Changelog**: Automatic entries from commit messages

### Update Rules
- **Always update version** when modifying `index.html`
- **Increment patch** for any change (bug fix, feature, CSS)
- **Add changelog entry** to features array in `js/version.js`
- **Commit format**: `v[VERSION]: [Description]`
- **Never hardcode** version numbers in HTML files

---

🔖 Generated with [Claude Code](https://claude.com/claude-code)
