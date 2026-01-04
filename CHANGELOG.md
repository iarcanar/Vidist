# VIDIST Changelog

## v2.7.3 (2026-01-04)
**Header Redesign - Mobile-First Responsive**

### Added
- Single-row horizontal layout on all screen sizes
- Left-aligned app name and version
- Compact TOP UP button (75px fixed width on mobile)
- Triple constraint CSS (width + min-width + max-width)
- Whitespace-nowrap to prevent text wrapping

### Changed
- Mobile logo: 32px (from 48px)
- Mobile button size: 75px width (< 768px), 65px (< 480px)
- Balance text: 12px mobile, 10px extra small
- TOP UP label: 7px mobile, 6px extra small
- Removed 2-row stacked layout (reverted to horizontal)

### Fixed
- TOP UP button overflow on mobile screens
- Button expanding beyond screen width
- Text wrapping in small buttons
- Left alignment for better readability

---

## v2.7.2 (2026-01-04)
**Complete History Management System**

### Added
- Auto-resume polling after page refresh
- Retry/Recovery buttons for stuck/failed videos
- Legacy data migration with intelligent model key guessing
- Smart API sync preserving local data
- Advanced search/filter/sort UI
- Export history to JSON/CSV
- Increased prompt display to 150 chars with tooltips

---

## v2.7.1 (2026-01-04)
**History Prompt Persistence Fix**

### Fixed
- "No prompt available" issue
- Removed dual storage conflict
- Unified to TaskPersistence system
- 300-item/7-day retention
- Timestamp-based cleanup
- Automatic migration from old data

---

## v2.7.0 (2026-01-03)
**Credit Balance Redesign**

### Changed
- Simplified balance display
- Renamed to "Credit Balance"
- 3 decimal precision
- Removed video estimates
- Cleaner centered layout with icon and Top Up button

---

🔖 Generated with Claude Code
