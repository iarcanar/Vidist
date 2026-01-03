/**
 * VIDIST - Wavespeed API Handler
 */

import { WAVESPEED_API_BASE_URL } from './config.js';

/**
 * Unified Wavespeed Video Generation Function
 * Handles all model types: I2V, Extend, T2V, Kling O1
 * @param {string} apiKey - Wavespeed API Key
 * @param {object} config - Model configuration from MODEL_CONFIG
 * @param {object} payload - Request payload with all parameters (image, video, lastImage, prompt, duration, etc.)
 * @returns {Promise<{id: string, pollingUrl: string}>}
 */
export async function generateWavespeedVideo(apiKey, config, payload) {
    const endpoint = `${WAVESPEED_API_BASE_URL}/${config.internal_id}`;

    // Build basic body
    const body = {
        prompt: payload.prompt,
        duration: payload.duration,
        resolution: payload.resolution,
        seed: payload.seed ?? -1
    };

    // Image input (for I2V models, including Extend)
    if (payload.image) {
        body.image = payload.image.includes(',')
            ? payload.image.split(',')[1]  // Strip data:image prefix
            : payload.image;
    }

    // Video input (for Extend models only - controlled by config.requiresStartVideo)
    if (config.requiresStartVideo && payload.video) {
        body.video = payload.video.includes(',')
            ? payload.video.split(',')[1]  // Strip data:video prefix
            : payload.video;
    }

    // Last image input (for Kling O1 - controlled by config.supportsLastImage)
    if (config.supportsLastImage && payload.lastImage) {
        body.last_image = payload.lastImage.includes(',')
            ? payload.lastImage.split(',')[1]  // Strip data:image prefix
            : payload.lastImage;
    }

    // Optional parameters (controlled by config flags)
    if (payload.negativePrompt) body.negative_prompt = payload.negativePrompt;
    if (payload.audioUrl) body.audio = payload.audioUrl;

    // Wan 2.6 specific parameters
    if (config.supportsShotType && payload.shotType) {
        body.shot_type = payload.shotType;
    }
    if (config.supportsExpansion) {
        body.enable_prompt_expansion = !!payload.promptExpansion;
    }

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok || (data.code && data.code !== 200)) {
            throw new Error(data.message || data.error || `HTTP ${response.status}`);
        }

        // Validate response structure
        if (data.data?.id && data.data?.urls?.get) {
            return {
                id: data.data.id,
                pollingUrl: data.data.urls.get
            };
        }

        throw new Error("Invalid API Response Structure");

    } catch (error) {
        console.error("Wavespeed Video Generation Error:", error);
        throw error;
    }
}

// ========== DEPRECATED: Old functions kept for backward compatibility ==========
// TODO: Remove after updating all call sites

export async function generateWavespeed(apiKey, config, payload) {
    const endpoint = `${WAVESPEED_API_BASE_URL}/${config.internal_id}`;

    // เตรียม Body พื้นฐาน
    const body = {
        prompt: payload.prompt,
        duration: payload.duration,
        resolution: payload.resolution,
        seed: -1
    };

    // จัดการรูปภาพ (รองรับทั้ง Base64 และ URL)
    if (payload.image) {
        if (payload.image.startsWith('data:image')) {
            // ตัด prefix ออกส่งแค่ base64
            body.image = payload.image.split(',')[1];
        } else {
            body.image = payload.image;
        }
    }

    // Optional Params
    if (payload.negativePrompt) body.negative_prompt = payload.negative_prompt;
    if (payload.audioUrl) body.audio = payload.audioUrl;

    // --- Wan 2.6 Specifics ---
    if (config.supportsShotType && payload.shotType) {
        body.shot_type = payload.shotType;
    }
    if (config.supportsExpansion) {
        // บังคับส่ง boolean
        body.enable_prompt_expansion = !!payload.promptExpansion;
    }

    // ** Content Filter Bypass ** (พยายามส่ง safety_checker: false หาก API รองรับในอนาคต)
    // body.safety_checker = false; 

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok || (data.code && data.code !== 200)) {
            throw new Error(data.message || data.error || `HTTP ${response.status}`);
        }

        // ตรวจสอบ Response Structure
        if (data.data && data.data.id && data.data.urls?.get) {
            return {
                id: data.data.id,
                pollingUrl: data.data.urls.get
            };
        } else {
            throw new Error("Invalid API Response Structure");
        }

    } catch (error) {
        console.error("Wavespeed Generate Error:", error);
        throw error;
    }
}

/**
 * Generate WAN 2.5 Video Extend
 * @param {string} apiKey - Wavespeed API Key
 * @param {object} config - Model configuration from MODEL_CONFIG
 * @param {object} payload - Request payload
 * @returns {Promise<{id: string, pollingUrl: string}>}
 */
export async function generateWavespeedVideoExtend(apiKey, config, payload) {
    const endpoint = `${WAVESPEED_API_BASE_URL}/${config.internal_id}`;

    // เตรียม Body พื้นฐาน
    const body = {
        prompt: payload.prompt,
        duration: payload.duration,
        resolution: payload.resolution,
        seed: -1
    };

    // จัดการวิดีโอ (รองรับทั้ง Base64 และ URL)
    if (payload.video) {
        if (payload.video.startsWith('data:video')) {
            // ตัด prefix ออกส่งแค่ base64
            body.video = payload.video.split(',')[1];
        } else {
            body.video = payload.video;
        }
    } else {
        throw new Error('Video is required for video extend');
    }

    // Optional Params
    if (payload.negativePrompt) body.negative_prompt = payload.negativePrompt;
    if (payload.audioUrl) body.audio = payload.audioUrl;

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok || (data.code && data.code !== 200)) {
            throw new Error(data.message || data.error || `HTTP ${response.status}`);
        }

        // ตรวจสอบ Response Structure
        if (data.data && data.data.id && data.data.urls?.get) {
            return {
                id: data.data.id,
                pollingUrl: data.data.urls.get
            };
        } else {
            throw new Error("Invalid API Response Structure");
        }

    } catch (error) {
        console.error("Wavespeed Video Extend Error:", error);
        throw error;
    }
}

export async function pollWavespeedStatus(apiKey, pollingUrl) {
    try {
        const response = await fetch(pollingUrl, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        // Parse Standardized Status
        let status = 'pending';
        let videoUrl = null;
        let error = null;

        if (data.data) {
            status = data.data.status;
            if (status === 'succeeded' || status === 'completed') {
                videoUrl = data.data.outputs?.[0];
            } else if (status === 'failed') {
                error = data.data.error;
            }
        }

        return { status, videoUrl, error, raw: data };

    } catch (error) {
        console.error("Polling Error:", error);
        throw error;
    }
}

export async function fetchWavespeedBalance(apiKey) {
    try {
        // Fallback to usage_stats if balance endpoint is deprecated/not found
        // But for now, let's try the documented usage_stats which is more robust
        const stats = await fetchWavespeedUserStats(apiKey);
        if (stats && stats.balance !== undefined) return stats.balance;

        // Legacy try
        const response = await fetch(`${WAVESPEED_API_BASE_URL}/balance`, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        const data = await response.json();
        if (data.code === 200) return data.data.balance;
        return 0;
    } catch (e) {
        return 0;
    }
}

export async function fetchWavespeedUserStats(apiKey) {
    try {
        const response = await fetch(`${WAVESPEED_API_BASE_URL}/user/usage_stats`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });
        const data = await response.json();
        if (data.code === 200) return data.data;
        return null;
    } catch (e) {
        console.error("Fetch User Stats Error:", e);
        return null;
    }
}

/**
 * Fetch Video History from Wavespeed API
 * @param {string} apiKey 
 * @param {number} limit 
 * @returns {Promise<Array>}
 */
export async function fetchWavespeedHistory(apiKey, limit = 50) {
    try {
        // Try standard GET /predictions
        const endpoint = `${WAVESPEED_API_BASE_URL}/predictions`;

        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            throw new Error(errorBody.message || errorBody.error || `HTTP ${response.status}`);
        }

        const data = await response.json();

        // Handle different possible response structures
        let predictions = [];
        if (Array.isArray(data)) {
            predictions = data;
        } else if (data.results && Array.isArray(data.results)) {
            predictions = data.results;
        } else if (data.data && Array.isArray(data.data)) {
            predictions = data.data;
        } else if (data.predictions && Array.isArray(data.predictions)) {
            predictions = data.predictions;
        }

        return predictions;
    } catch (error) {
        console.error("History Fetch Error:", error);
        throw error;
    }
}