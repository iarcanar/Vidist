/**
 * VIDIST Configuration
 * Wavespeed Only - Wan 2.5 & Wan 2.6
 *
 * ✅ PERFORMANCE FIX: Centralized config file (loaded as regular script)
 * This file replaces duplicate MODEL_CONFIG in main.html
 */

const WAVESPEED_API_BASE_URL = "https://api.wavespeed.ai/api/v3";

const MODEL_CONFIG = {
    // Wan 2.5 Image-to-Video
    "ws-wan-25-i2v": {
        provider: 'wavespeed',
        name: 'Wan 2.5 I2V',
        internal_id: 'alibaba/wan-2.5/image-to-video',
        // Wan 2.5: เลือกเวลาได้ละเอียด (3-10s)
        durationMode: 'range',
        minDuration: 3,
        maxDuration: 10,
        // Wan 2.5: รองรับ 480p ได้
        maxResolution: "1080p",
        supportedResolutions: ["480p", "720p", "1080p"],
        supportsAudio: true,
        features: ["i2v"],
        supportsNegativePrompt: true,
        // Config พิเศษ
        supportsShotType: false,
        supportsExpansion: true,
        pricing: {
            '480p': 0.05,
            '720p': 0.10,
            '1080p': 0.15
        }
    },
    // Wan 2.5 Video Extend
    "ws-wan-25-extend": {
        provider: 'wavespeed',
        name: 'Wan 2.5 Extend',
        internal_id: 'alibaba/wan-2.5/video-extend',
        requiresStartVideo: true,  // KEY: Requires BOTH image (for prompt craft) + start video
        // Wan 2.5 Extend: เลือกเวลาได้ละเอียด (3-10s) สำหรับการต่อความยาววิดีโอ
        durationMode: 'range',
        minDuration: 3,
        maxDuration: 10,
        // รองรับ resolution เหมือน Wan 2.5
        maxResolution: "1080p",
        supportedResolutions: ["480p", "720p", "1080p"],
        supportsAudio: true,
        features: ["i2v", "extend"],  // image-to-video + video extension (Prompt Craft + Start Video)
        supportsNegativePrompt: true,
        // Config พิเศษ
        supportsShotType: false,
        supportsExpansion: true,
        pricing: {
            '480p': 0.05,
            '720p': 0.10,
            '1080p': 0.15
        }
    },
    // Wan 2.6 Image-to-Video
    "ws-wan-26-i2v": {
        provider: 'wavespeed',
        name: 'Wan 2.6 I2V',
        internal_id: 'alibaba/wan-2.6/image-to-video',
        // Wan 2.6: บังคับเวลา 5, 10, 15 เท่านั้น
        durationMode: 'fixed',
        allowedDurations: [5, 10, 15],
        // Wan 2.6: ไม่รองรับ 480p
        maxResolution: "1080p",
        supportedResolutions: ["720p", "1080p"],
        supportsAudio: true,
        features: ["i2v"],
        supportsNegativePrompt: true,
        // Config พิเศษสำหรับ 2.6
        supportsShotType: true,
        supportsExpansion: true,
        pricing: {
            '720p': 0.10,
            '1080p': 0.15
        }
    },
    // Wan 2.6 Image Edit
    "ws-wan-26-image-edit": {
        provider: 'wavespeed',
        name: 'Wan 2.6 Image Edit',
        internal_id: 'alibaba/wan-2.6/image-edit',
        outputType: 'image',  // NEW: ระบุว่าผลลัพธ์เป็นภาพ
        features: ["image-edit"],
        supportsNegativePrompt: true,
        supportsExpansion: true,
        pricing: {
            'fixed': 0.035  // $0.035 per edit
        }
    },
    // Kling Video O1 STD Image-to-Video
    "ws-kling-o1-i2v": {
        provider: 'wavespeed',
        name: 'Kling Video O1 STD',
        internal_id: 'kwaivgi/kling-video-o1-std/image-to-video',
        // Duration: conditional based on last_image
        // With last_image: 3-10s | Without: 5 or 10s only
        durationMode: 'range',
        minDuration: 3,
        maxDuration: 10,
        // Standard resolution support (API documentation doesn't specify, using defaults)
        maxResolution: "1080p",
        supportedResolutions: ["720p", "1080p"],
        supportsAudio: false,  // Not mentioned in docs
        features: ["i2v"],
        supportsNegativePrompt: false,  // Only positive prompt in docs
        // Special feature: Last Image support
        supportsLastImage: true,  // NEW: Optional final frame
        supportsShotType: false,
        supportsExpansion: false,
        pricing: {
            '720p': 0.084,
            '1080p': 0.084  // Same price per second
        }
    }
};

const STATUS_TEXT = {
    'pending': 'รอดำเนินการ',
    'in_queue': 'อยู่ในคิว',
    'in_progress': 'กำลังสร้างวิดีโอ',
    'completed': 'เสร็จสมบูรณ์',
    'failed': 'ล้มเหลว',
    'created': 'สร้าง Task แล้ว',
    'processing': 'กำลังประมวลผล',
    'succeeded': 'สำเร็จ',
    'canceled': 'ยกเลิก',
    'starting': 'กำลังเริ่มต้น'
};

const POLLING_CONFIG = {
    MAX_POLL_COUNT: 360,     // 30 นาที
    MAX_TIMEOUT: 1800,       // 1800 วินาที
    POLL_INTERVAL: 5000      // 5 วินาที
};