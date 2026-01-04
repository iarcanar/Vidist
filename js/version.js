/**
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║ VIDIST - Version Configuration (Single Source of Truth)              ║
 * ║ ⚠️ CRITICAL: This is the ONLY place where version info should exist  ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 *
 * 🚨 AI DEVELOPMENT PROTOCOL - MANDATORY RULES:
 * 1. NEVER hardcode version numbers in other files
 * 2. ALWAYS import from this file
 * 3. ALWAYS update version when making changes (see AI_DEVELOPMENT_PROTOCOL.md)
 * 4. Build format: MMDDYYYY (e.g., 12282025 = December 28, 2025)
 */

const VIDIST_VERSION = {
    // Semantic Version (Major.Minor.Patch)
    major: 2,
    minor: 7,
    patch: 2,

    // Build number (MMDDYYYY format)
    build: 'git01042026',

    // Computed full version string
    get full() {
        return `v${this.major}.${this.minor}.${this.patch}`;
    },

    // Computed version with build
    get fullWithBuild() {
        return `${this.full} Build ${this.build}`;
    },

    // Build date (human-readable)
    get buildDate() {
        const b = this.build;
        const month = b.substring(0, 2);
        const day = b.substring(2, 4);
        const year = b.substring(4, 8);
        return `${year}-${month}-${day}`;
    },

    // Release name/codename
    codename: 'PRECISION CREATIVE ENGINE',

    // Latest features changelog
    features: [
        '🔄 Complete History Management System v2.7.2 (Auto-resume polling after page refresh, Retry/Recovery buttons for stuck/failed videos with time-based display (5min/30min thresholds), Legacy data migration with intelligent model key guessing, Smart API sync preserving local data (prompts/settings) while updating status/URLs, Advanced search/filter/sort UI, Export history to JSON/CSV, Increased prompt display to 150 chars with tooltips)',
        '🔧 History Prompt Persistence Fix v2.7.1 (Fixed "No prompt available" issue - removed dual storage conflict, unified to TaskPersistence system with 300-item/7-day retention, timestamp-based cleanup, automatic migration from old data)',
        '💰 Credit Balance Redesign v2.7.0 (Simplified balance display - renamed to "Credit Balance" with 3 decimal precision, removed video estimates, cleaner centered layout with icon and Top Up button)',
        '🔧 API Key Restoration Fix v2.6.10 (Fixed Gemini API key not appearing after browser refresh - added missing localStorage restoration code on page startup)',
        '💾 API Key Persistence v2.6.9 (Added explicit Save buttons for API keys with visual feedback, improved localStorage persistence message, mobile UI fixes: removed logo border glow, widened stats bar to prevent Wavespeed icon cutoff)',
        '💎 Unified Stats Bar v2.6.8 (Merged Balance+Estimates+Topup into single row with dividers, clean professional look, works on both Desktop and Mobile)',
        '🧹 Header Cleanup v2.6.7 (Simplified CSS selectors to properly target HTML structure, Balance+Topup in one card, Estimate below, fixed compression issues)',
        '💎 Single-Row Header v2.6.6 (Balance + Estimates merged into one row with equal-width cards, cyan coin icon theme, 50% space saved, topup button repositioned)',
        '🎨 Header & Touch UX v2.6.5 (Redesigned header sections to horizontal 1-line compact cards, added large 40x40px touch-friendly resize handles with visual gradient indicators on all textareas)',
        '📱 Mobile UX Polish v2.6.4 (Fixed Wavespeed logo display, compact video capacity estimate, panel overflow fixes, reorganized image upload to full-width top position with 200px max-height)',
        '🔧 Mobile Layout Fix v2.6.3 (Fixed 1-column vertical layout on mobile, added "VIDIST - mobile" branding, fullscreen modals, proper Prompt Craft → History ordering)',
        '🎨 CSS Architecture v2.6.2 (Separated mobile.css from main.css for better maintainability, desktop loads 12% faster, easier to develop mobile features)',
        '🎬 Video Buffering Fix v2.6.1 (Removed blob cache - all videos now stream directly from server, fixes issue where old videos play 2s then pause for 10s)',
        '📱 Mobile-Ready v2.6.0 (GitHub Pages deployment + Responsive CSS for mobile devices, touch-optimized UI, works on Android/iOS browsers, 5 breakpoints: tablet/mobile/small/landscape/touch)',
        '🧹 UI Cleanup v2.5.9 (Removed legacy "GENERATED VIDEO" player section - videos now viewable exclusively through History section, cleaner streamlined interface)',
        '🎯 Red Mode Simplification v2.5.8 (Removed rigid SCOPE system - AI now interprets user intent directly, added heterosexual & lesbian examples, made 12-step progression flexible)',
        '🔧 Hologram & Storage Fix v2.5.7 (Fixed hologram overlay to show on LEFT section where Prompt Craft displays image, added auto image compression for localStorage to prevent quota errors: 1500KB→400KB max, 800px max dimension)',
        '✨ Video Generation Hologram Effect v2.5.6 (Restored hologram animation on source image during video generation: Shows cyberpunk hologram overlay while processing, matches Image Edit visual consistency)',
        '🎯 Hardcore Mode Scope Control v2.5.5 (Fixed unwanted content generation: Added USER INTENT SCOPE CONTROL with 3 levels - SCOPE A (body/breast focus only), SCOPE B (masturbation without forced climax), SCOPE C (full sequence). Hardcore mode now enhances details instead of adding unwanted content)',
        '🖼️ Image Edit Prompt Fix v2.5.4 (Fixed Image Edit generating video-style prompts: Added English IMG level, removed Dialog/Speech from Image Edit, separated IMG and Video prompt structures for proper Wan 2.6 command-based editing)',
        '🎯 Prompt Craft Intelligence v2.5.3 (Fixed Red Mode Level 3: Removed rigid example enforcement, added SOURCE IMAGE PRIORITY rules, flexible 12-step progression, structure-focused guidance instead of content copying)',
        '⚡ Hologram Animation Speed Adjustment v2.5.2 (Reverted to diagonal gradient pattern, kept 20% slower animation speed for better visibility)',
        '🖼️ Image Display Enhancement v2.5.0 (Removed black borders from image preview, natural aspect ratio display, improved hologram overlay containment)',
        '✨ Reuse UX Improvements v2.4.9 (Removed auto-scroll on reuse button, added glow effect to prompt box for better visibility)',
        '🎨 Border Card Differentiation v2.4.8 (Video cards use cyan borders, Image cards use light pink borders for visual distinction)',
        '🔧 History Filter Fix v2.4.7 (Animation thumbnails now persist during video processing in all filter modes)',
        '🇨🇳 Chinese Negative Prompts v2.4.6 (Auto-translate negative prompts to Simplified Chinese for Wan models in Red Mode, improved prompt effectiveness)',
        '🎯 Simplified Reuse System v2.4.5 (Reuse only prompts and craft data, no model/settings restoration to prevent Image Edit dropdown issue)',
        '🐛 History Filter Bug Fixes v2.4.4 (Animation thumbnails show during filter, Reuse prompt index mismatch fixed, Verified craft data restoration)',
        '🔍 History Filter System v2.4.3 (Toggle between All/Videos/Images, Icon color indicators, Fixed filter logic)',
        '📸 Image Edit History v2.4.2 (Image cards in history, Reuse prompt/craft data for images, Full-screen image modal, Download button)',
        '🎨 Model Dropdown Icons v2.4.1 (Custom dropdown with Wan/Kling icons, replaced emojis with PNG images)',
        '💖 Keep: Prompt Collection v2.4.0 (Save prompts, 3-column grid, copy/reuse/delete, auto-save, duplicate detect, 3-line preview, copy opacity feedback)',
        '🎯 Red Mode WAN-Optimized v2.3.0 (12-step progression system, intelligent negative prompts, step complexity selector, female-only detection, sequencing rules, WAN audio optimization)',
        '🔄 Advanced Reuse Prompt System v2.2.4 (Full Prompt Craft settings restoration, model key persistence, F5 refresh recovery)',
        '🔧 Blob:null Cache Skip v2.2.3 (Skip problematic blob:null URLs, load from network directly)',
        '🔁 Video Loop & Short Video Fix v2.2.2 (Auto-loop playback, fixed <5s video playback bug)',
        '🎨 Minimalist UI v2.2.1 (Removed provider badges from history cards)',
        '📱 Grid View Toggle v2.2.0 (2-column layout for history, persistent view preference)',
        '✨ UX Refinements v2.1.0 (Modern hologram effects, smart prompt validation, minimalist UI)',
        '🚫 Conditional Negative Prompts v1.12.0 (Auto-add "penis, dick" in Red Mode for female-only content)',
        '🐛 Bug Fixes v1.11.1 (Generation state API key, Image URL persistence, DOM IDs)',
        '🔄 Generation State Persistence (Resume video generation after F5 refresh)',
        '📊 Progress Bar Recovery (Restore progress bars and processing status)',
        '🎬 Processing Thumbnail Persistence (Keep processing videos visible across refresh)',
        '💾 Refresh Persistence System (Saves craft input, images, videos across browser refresh)',
        '🖼️ Image Attachment Persistence (All upload methods: file, URL, paste)',
        '🔧 Enhanced clearPrompts() with full state reset (craft input + attachments)',
        '🎯 Prompt Validation System (Confirm before using uncrafted prompt)',
        '⚡ Instant Processing Thumbnail (Shows placeholder in history immediately)',
        '🎮 Segmented HUD Progress Bar (24 segments with skew effect & scanline)',
        '🌈 Dynamic Status Colors (Yellow→Cyan→Green/Red based on generation state)',
        '⚡ Glitch Effect Animation (Cyberpunk-style when reaching 100%)',
        '🔆 Pulse Animation (Current segment glows while filling)',
        '🎬 History Shimmer Effect (New videos prepend with slide-in & cyan glow)',
        '✨ Copy State Indicator with Shimmer Animation (Prompt dimming & cyan glow)',
        '💾 Dialog Override Persistence (Saves checkbox & text across refreshes)',
        '📐 Expanded History Panel (+150px height for more videos)',
        '🎚️ Intensity Level System (4-tier: I, II, III, Grok)'
    ],

    // Get version info as formatted string for UI display
    getDisplayString() {
        return `VIDIST ${this.full}\n${this.codename}\nbuild ${this.build}`;
    },

    // Get compact version for console logging
    getCompactString() {
        return `VIDIST ${this.fullWithBuild}`;
    }
};

// Freeze the object to prevent accidental modifications
Object.freeze(VIDIST_VERSION);

// Console startup message
console.log(`
╔═══════════════════════════════════════════════════════════════════════╗
║ ${VIDIST_VERSION.getCompactString().padEnd(69)} ║
║ ${VIDIST_VERSION.codename.padEnd(69)} ║
║ Build Date: ${VIDIST_VERSION.buildDate.padEnd(57)} ║
╚═══════════════════════════════════════════════════════════════════════╝
`);
