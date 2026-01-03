/**
 * VIDIST - History Management
 * Manages video generation history with cache integration
 */

import { STORAGE_KEYS, CACHE_CONFIG } from './config.js';
import { getVideoCache } from './video-cache.js';
import { getLocalStorage, setLocalStorage, formatDate, truncateString } from './utils.js';

/**
 * Load video history (cache-first merge strategy)
 * @param {string} wavespeedApiKey - Wavespeed API key (optional, currently unused as Wavespeed doesn't have history endpoint)
 * @returns {Promise<Array>} Merged video history
 */
export async function loadHistory(wavespeedApiKey = null) {
    console.log('Loading video history (cache-first)...');

    // Step 1: Load from localStorage (fastest, most complete)
    const localCache = loadHistoryFromLocalStorage();
    const historyMap = new Map();

    // Add local cache to map (highest priority)
    localCache.forEach(video => {
        if (video && video.provider && video.id) {
            const key = `${video.provider}-${video.id}`;
            historyMap.set(key, video);
        }
    });

    console.log(`Loaded ${historyMap.size} videos from local cache`);

    // Note: Wavespeed doesn't have history endpoint yet
    // All videos from Wavespeed are already in localStorage from auto-save

    // Convert map to array
    const mergedHistory = Array.from(historyMap.values());

    // Sort by date (newest first)
    mergedHistory.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
    });

    // Save merged history to localStorage
    saveHistoryToLocalStorage(mergedHistory);

    // Preload videos into cache
    await preloadHistoryVideos(mergedHistory);

    console.log(`Total history: ${mergedHistory.length} videos`);

    return mergedHistory;
}

/**
 * Load history from localStorage
 * @returns {Array} Video history array
 */
export function loadHistoryFromLocalStorage() {
    const history = getLocalStorage(STORAGE_KEYS.VIDEO_HISTORY, []);

    if (!Array.isArray(history)) {
        console.warn('Invalid history format in localStorage, resetting');
        return [];
    }

    return history;
}

/**
 * Save history to localStorage
 * @param {Array} history - Video history array
 */
export function saveHistoryToLocalStorage(history) {
    setLocalStorage(STORAGE_KEYS.VIDEO_HISTORY, history);
}

/**
 * Add video to history and save
 * @param {Object} video - Video object to add
 */
export function addVideoToHistory(video) {
    const history = loadHistoryFromLocalStorage();

    // Check if already exists
    const exists = history.some(v =>
        v.provider === video.provider && v.id === video.id
    );

    if (exists) {
        console.log('Video already in history:', video.id);
        return;
    }

    // Add to beginning
    history.unshift(video);

    // Limit history size (keep last 100 items)
    const trimmedHistory = history.slice(0, 100);

    saveHistoryToLocalStorage(trimmedHistory);
    console.log('Added video to history:', video.id);
}

/**
 * Clear all history
 */
export function clearHistory() {
    setLocalStorage(STORAGE_KEYS.VIDEO_HISTORY, []);
    console.log('History cleared');
}

/**
 * Preload history videos into cache
 * @param {Array} videos - Video history array
 */
async function preloadHistoryVideos(videos) {
    const cache = getVideoCache();

    // Get videos with URLs
    const videosToCache = videos
        .filter(v => v.url)
        .slice(0, CACHE_CONFIG.PRELOAD_LIMIT)
        .map(v => ({ id: v.id, url: v.url }));

    if (videosToCache.length > 0) {
        console.log(`Preloading ${videosToCache.length} videos into cache...`);
        await cache.preloadVideos(videosToCache, CACHE_CONFIG.PRELOAD_LIMIT);
    }
}

/**
 * Render video history to DOM
 * @param {Array} videos - Video history array
 * @param {HTMLElement} container - Container element
 * @param {Function} onVideoClick - Callback when video is clicked
 */
export async function renderHistory(videos, container, onVideoClick) {
    if (!container) {
        console.error('History container not found');
        return;
    }

    if (!Array.isArray(videos) || videos.length === 0) {
        container.innerHTML = '<p class="text-sm text-gray-500 text-center py-8">ยังไม่มีวิดีโอ สร้างวิดีโอแรกของคุณเลย!</p>';
        return;
    }

    const cache = getVideoCache();
    await cache.init();

    // Render video cards
    const cardsHTML = await Promise.all(
        videos.map((video, index) => renderVideoCard(video, index, cache))
    );

    container.innerHTML = `<div class="grid grid-cols-1 gap-3">${cardsHTML.join('')}</div>`;

    // Attach click handlers
    if (onVideoClick) {
        videos.forEach((video, index) => {
            const card = container.querySelector(`[data-video-index="${index}"]`);
            if (card && video.url) {
                card.addEventListener('click', () => onVideoClick(index, video));
            }
        });
    }
}

/**
 * Render single video card
 * @param {Object} video - Video object
 * @param {number} index - Video index
 * @param {Object} cache - Video cache instance
 * @returns {Promise<string>} HTML string
 */
async function renderVideoCard(video, index, cache) {
    const provider = video.provider || 'wavespeed';
    const model = video.model || 'unknown';
    const duration = video.duration ? `${video.duration}s` : '?s';
    const resolution = video.resolution || 'N/A';
    const prompt = truncateString(video.prompt || 'No prompt', 80);
    const hasUrl = !!video.url;

    // Try to get cached video URL
    let videoSrc = video.url;
    if (hasUrl && cache) {
        const cachedUrl = await cache.getVideo(video.id);
        if (cachedUrl) {
            videoSrc = cachedUrl;
            console.log(`Using cached video for ${video.id}`);
        }
    }

    const providerColor = provider === 'wavespeed' ? 'bg-cyan-500/70' : 'bg-purple-500/70';
    const cursorClass = hasUrl ? 'cursor-pointer' : 'opacity-60 pointer-events-none';

    return `
        <div class="video-thumbnail rounded-xl overflow-hidden ${cursorClass}"
             data-video-index="${index}"
             ${hasUrl ? '' : 'title="Video URL missing"'}>
            <div class="relative bg-black aspect-video overflow-hidden">
                ${hasUrl ? `
                    <video
                        class="w-full h-full object-cover"
                        src="${videoSrc}#t=0.5"
                        preload="metadata"
                        muted
                        playsinline
                        onerror="this.style.display='none'; this.parentElement.querySelector('.placeholder-icon').style.display='flex';"
                    ></video>
                    <div class="placeholder-icon absolute inset-0 flex items-center justify-center bg-gray-900" style="display: none;">
                        <svg class="w-12 h-12 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                    </div>
                    <div class="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/10 transition-all group">
                        <span class="absolute top-1 right-1 text-xs px-2 py-0.5 rounded ${providerColor} text-white font-semibold">${provider.toUpperCase()}</span>
                        <svg class="w-12 h-12 text-cyan-400 opacity-0 group-hover:opacity-90 transition-opacity drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                        </svg>
                    </div>
                ` : `
                    <div class="absolute inset-0 flex items-center justify-center bg-gray-900">
                        <span class="absolute top-1 right-1 text-xs px-2 py-0.5 rounded ${providerColor} text-white font-semibold">${provider.toUpperCase()}</span>
                        <svg class="w-12 h-12 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                        <span class="absolute bottom-2 text-xs text-red-400">Missing URL</span>
                    </div>
                `}
            </div>
            <div class="p-3 bg-[#131320]/80">
                <p class="text-xs font-medium text-gray-300 truncate mb-1" title="${prompt}">${prompt}</p>
                <div class="flex justify-between text-xs text-gray-500">
                    <span class="truncate text-cyan-400" title="${model}">${model}</span>
                    <span class="whitespace-nowrap ml-2 text-purple-400">${duration}•${resolution}</span>
                </div>
            </div>
        </div>
    `;
}

export default {
    loadHistory,
    loadHistoryFromLocalStorage,
    saveHistoryToLocalStorage,
    addVideoToHistory,
    clearHistory,
    renderHistory
};
