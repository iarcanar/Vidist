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
    minor: 11,
    patch: 0,

    // Build number (MMDDYYYY format)
    build: '01292026',

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
        '🔇 MUTE Feature v2.11.0 - Silent Visual-Only Prompts (NEW FEATURE: MUTE checkbox in Prompt Craft (Red Mode only) completely removes all audio/speech from generated prompts - Auto-disables SPEECH checkbox when enabled, Silent mode system prompts focus purely on visual elements (body language, facial expressions, movements, camera angles, lighting), Post-processing removes SOUND:/SPEECH:/Dialog: fields from AI output, Multi-language support (TH/EN/JA), localStorage persistence + history restoration, Results in completely silent, visual-only video prompts)',
        '🔄 Race Condition & Dialog Override Fix v2.10.0 (CRITICAL FIXES: 1) History Panel Race Condition - Added rendering ID counter with 2 checkpoints to prevent concurrent render overwrites, clicking new video thumbnail now opens correct video instead of previous one, no more manual refresh needed; 2) Prompt Craft Dialog Override - Fixed SPEECH field appearing when checkbox checked but empty, clarified dialogInstruction and added CRITICAL RULES emphasis, allows Wan model to generate natural audio without explicit speech)',
        '🎨 Gemini 2.5 Flash Image Edit v2.9.0 (NEW MODEL OPTION: Added Gemini "Nano Banana" alongside WAN 2.6 for image editing - Dropdown model selector with pricing display ($0.039 Gemini vs $0.035 WAN), Gemini as default selection, Synchronous API (5-15s vs 20-40s), Conditional UI (hides negative prompt/expansion for Gemini), Provider-specific routing architecture, Separate billing (Gemini via Google AI, not Wavespeed), Full history integration and auto-save support)',
        '🔧 History Panel Auto-Update Fix v2.8.14 (CRITICAL FIX: Video completion now always updates history panel automatically - added renderVideoHistory() call in fallback case when placeholder not found, ensures UI updates even after aggressive cleanup, no more manual refresh needed)',
        '🎯 Minimal Image History v2.8.13 (MAJOR CHANGE: Reduced image edit history from 10 → 2 images only (original + latest edited), F5 refresh keeps only current viewing image (1 image), Previous/Next buttons still work for 2-image navigation, Eliminates localStorage quota issues completely)',
        '🔒 localStorage Quota Data Loss Fix v2.8.12 (CRITICAL FIX: Aggressive cleanup now keeps 5 most recent history items instead of wiping everything - prevents data loss when localStorage is full, Added quota handling to image edit history with auto-reduce to 3 images, History preserved during localStorage pressure)',
        '🚫 Non-Interactive Processing Cards v2.8.11 (Removed delete button from processing cards - cards are now purely status displays, no hover interactions during video/image generation, prevents accidental cancellation, cleaner separation between active processing and completed items)',
        '🗑️ Simplified Delete Dialogs v2.8.10 (Removed redundant double confirmations - single short question "ต้องการลบรายการนี้?" with custom cyberpunk dialog, silent success (no alert after deletion), all messages in Thai, cleaner UX without interruption)',
        '✨ Box-Shadow Containment v2.8.9 (Fixed shadow/glow overflow on mobile - moved box-shadow from container to wrapper div, now contained within overflow:hidden boundary, eliminates edge artifacts around floating image on mobile)',
        '📱 Mobile Hologram Fix v2.8.8 (Fixed cyber effect overflow on mobile floating image, added wrapper div constraints max-height:170px, overflow:hidden prevents hologram from extending beyond image bounds, perfect fit on mobile screens)',
        '🔇 Silent Auto-Cleanup v2.8.7 (Removed storage quota alert when pasting images, aggressive auto-cleanup deletes oldest data silently, reduced videoHistory to 10 items, no user interruption during paste)',
        '🔧 Display Override Fix v2.8.6 (Fixed floating container showing when hidden - display:flex was overriding .hidden class due to ID selector specificity, now uses :not(.hidden) selector for flexbox)',
        '✨ Equal Size Scaling v2.8.5 (Both base and floating images now scale to same size 238px max, removed scale animation - only translate offset, hologram effect perfectly fits floating image, base image scales with editing-scaled class, centered flexbox layout)',
        '🔧 Positioning Fix v2.8.4 (Fixed floating container position - added inset-0 to properly overlay base image, floating image now appears at correct location with 30px right and 30px up offset)',
        '🔧 Syntax Fix v2.8.3 (Fixed duplicate const sourceImage declaration causing SyntaxError, reuses variable from line 6675)',
        '✨ Floating Processing Visual v2.8.2 (Image edit shows floating scaled image with hologram overlay, dimmed base image, real-time progress updates, smooth float-up-right animation on start, float-away exit animation, 85% scale with shadow and cyan glow, stays within 280px container bounds, callback-based sequential animations, responsive design for mobile, professional depth and visual hierarchy)',
        '🔧 Image Edit Navigation Fix v2.8.1 (Fixed critical bug where Previous/Next + Edit sent wrong image to API, Source validation before API call, Smooth fade transitions for result display with pulse cyan glow, Event-driven sync between modules, Maintains correct image selection across navigation)',
        '📱 Mobile UX Complete v2.8.0 (Two-tap touch interactions for history cards with cyan glow, Custom dialog system replacing browser alerts with cyberpunk theme, Video player tap controls for play/pause, Fixed Step buttons to single row layout, All mobile optimizations unified in one release)',
        '📱 Mobile Language Selector Fix v2.7.9 (Moved fix to 768px media query - previous fix only applied to screens <480px, now works on all mobile devices, reduced button height for compact layout)',
        '📱 Mobile Language Selector v2.7.8 (Fixed EN/TH/JA language buttons showing as 3 rows on mobile - now displays as single row with 3 equal columns, excluded from grid-cols-3 override)',
        '🔧 Mobile CSS Fix v2.7.7 (Fixed history hide button not working on mobile - CSS specificity issue where ID selector overrode .hidden class, added !important override for #video-history.hidden)',
        '🎬 Video UI Enhancement v2.7.6 (Hover delete button on top-right of video preview with smooth fade-in effect and trash icon, Drag & drop to replace video directly without manual deletion, matches image upload UX patterns)',
        '🔍 Enhanced History Search v2.7.5 (Multi-field search for resolution (480p/720p/1080p), duration (3s/5s/10s), type (image/video/edit) - Export button moved to kebab menu (⋮) for better organization and future extensibility)',
        '🗑️ Delete Button v2.7.4 (Added delete button to all history cards - Processing/Image/Video, permanently deletes from both local storage and Wavespeed server API, bilingual confirmation dialog, red gradient styling with trash icon, bottom-right position on Image/Video cards, bottom-left on Processing cards, graceful error handling for API failures)',
        '🎨 Header Redesign v2.7.3 (Two-row responsive layout for mobile, combined Balance+TopUp button with 2-line display, improved typography hierarchy with consistent scaling, 44px minimum touch targets for accessibility, desktop-only build number to reduce clutter, shimmer hover effect on button)',
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
