/**
 * VIDIST Video Cache System
 * Intelligent video caching using IndexedDB for fast playback
 * Features: LRU eviction, size limits, preloading
 */

import { CACHE_CONFIG } from './config.js';

class VideoCache {
    constructor(options = {}) {
        this.maxSizeMB = options.maxSizeMB || CACHE_CONFIG.MAX_SIZE_MB;
        this.maxItems = options.maxItems || CACHE_CONFIG.MAX_ITEMS;
        this.dbName = options.dbName || CACHE_CONFIG.DB_NAME;
        this.dbVersion = options.dbVersion || CACHE_CONFIG.DB_VERSION;

        this.db = null;
        this.cacheMap = new Map(); // In-memory metadata cache
        this.totalSizeMB = 0;
        this.initPromise = null;
    }

    /**
     * Initialize IndexedDB
     */
    async init() {
        if (this.initPromise) return this.initPromise;

        this.initPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('Failed to open IndexedDB:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log(`IndexedDB '${this.dbName}' opened successfully`);
                this.loadMetadata().then(resolve);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create object store for video blobs
                if (!db.objectStoreNames.contains(CACHE_CONFIG.STORE_VIDEOS)) {
                    db.createObjectStore(CACHE_CONFIG.STORE_VIDEOS);
                }

                // Create object store for metadata
                if (!db.objectStoreNames.contains(CACHE_CONFIG.STORE_METADATA)) {
                    const metadataStore = db.createObjectStore(CACHE_CONFIG.STORE_METADATA);
                    metadataStore.createIndex('timestamp', 'timestamp', { unique: false });
                    metadataStore.createIndex('accessCount', 'accessCount', { unique: false });
                }

                console.log('IndexedDB schema created');
            };
        });

        return this.initPromise;
    }

    /**
     * Load metadata from IndexedDB into memory
     */
    async loadMetadata() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([CACHE_CONFIG.STORE_METADATA], 'readonly');
            const store = transaction.objectStore(CACHE_CONFIG.STORE_METADATA);
            const request = store.openCursor();

            this.cacheMap.clear();
            this.totalSizeMB = 0;

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    const metadata = cursor.value;
                    this.cacheMap.set(cursor.key, metadata);
                    this.totalSizeMB += metadata.sizeMB;
                    cursor.continue();
                } else {
                    console.log(`Loaded ${this.cacheMap.size} cached videos (${this.totalSizeMB.toFixed(2)} MB)`);
                    resolve();
                }
            };

            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Cache a video from URL
     * @param {string} videoId - Unique video identifier
     * @param {string} videoUrl - Video URL to fetch
     * @returns {Promise<string>} Blob URL for cached video
     */
    async cacheVideo(videoId, videoUrl) {
        await this.init();

        // Check if already cached
        if (this.cacheMap.has(videoId)) {
            console.log(`Video ${videoId} already cached`);
            return this.getVideo(videoId);
        }

        try {
            console.log(`Caching video: ${videoId}`);

            // Fetch video as blob
            const response = await fetch(videoUrl);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const blob = await response.blob();
            const sizeMB = blob.size / (1024 * 1024);

            console.log(`Fetched video blob: ${sizeMB.toFixed(2)} MB`);

            // Check if single video exceeds max cache size
            if (sizeMB > this.maxSizeMB) {
                console.warn(`Video too large (${sizeMB.toFixed(2)} MB), skipping cache`);
                return URL.createObjectURL(blob); // Return blob URL without caching
            }

            // Evict if needed before adding
            await this.evictIfNeeded(sizeMB);

            // Store video blob
            await this.storeBlob(videoId, blob);

            // Store metadata
            const metadata = {
                videoId,
                originalUrl: videoUrl,
                sizeMB: sizeMB,
                timestamp: Date.now(),
                accessCount: 1,
                cachedAt: new Date().toISOString()
            };

            await this.storeMetadata(videoId, metadata);

            // Update in-memory cache
            this.cacheMap.set(videoId, metadata);
            this.totalSizeMB += sizeMB;

            console.log(`Cached video ${videoId}: ${sizeMB.toFixed(2)} MB (Total: ${this.totalSizeMB.toFixed(2)} MB)`);

            // Return blob URL
            return URL.createObjectURL(blob);

        } catch (error) {
            console.error(`Failed to cache video ${videoId}:`, error);
            // Fallback: return original URL
            return videoUrl;
        }
    }

    /**
     * Get cached video as blob URL
     * @param {string} videoId - Video identifier
     * @returns {Promise<string|null>} Blob URL or null if not cached
     */
    async getVideo(videoId) {
        await this.init();

        if (!this.cacheMap.has(videoId)) {
            return null;
        }

        try {
            // Retrieve blob from IndexedDB
            const blob = await this.retrieveBlob(videoId);

            if (!blob) {
                console.warn(`Video ${videoId} metadata exists but blob missing`);
                await this.removeVideo(videoId);
                return null;
            }

            // Update access metadata
            const metadata = this.cacheMap.get(videoId);
            metadata.accessCount++;
            metadata.timestamp = Date.now();
            await this.storeMetadata(videoId, metadata);
            this.cacheMap.set(videoId, metadata);

            // Return blob URL
            return URL.createObjectURL(blob);

        } catch (error) {
            console.error(`Failed to retrieve video ${videoId}:`, error);
            return null;
        }
    }

    /**
     * Preload multiple videos
     * @param {Array<{id, url}>} videos - Array of video objects
     * @param {number} limit - Maximum number to preload
     */
    async preloadVideos(videos, limit = CACHE_CONFIG.PRELOAD_LIMIT) {
        await this.init();

        const toPreload = videos.slice(0, limit);
        console.log(`Preloading ${toPreload.length} videos...`);

        // Preload in parallel (but limit concurrency to 3)
        const batchSize = 3;
        for (let i = 0; i < toPreload.length; i += batchSize) {
            const batch = toPreload.slice(i, i + batchSize);
            await Promise.all(
                batch.map(video => this.cacheVideo(video.id, video.url).catch(err => {
                    console.warn(`Failed to preload ${video.id}:`, err);
                }))
            );
        }

        console.log('Preloading complete');
    }

    /**
     * Evict videos if cache exceeds limits
     */
    async evictIfNeeded(newVideoSizeMB = 0) {
        await this.init();

        const projectedSize = this.totalSizeMB + newVideoSizeMB;
        const projectedCount = this.cacheMap.size + 1;

        if (projectedSize <= this.maxSizeMB && projectedCount <= this.maxItems) {
            return; // No eviction needed
        }

        console.log(`Cache limits exceeded (${projectedSize.toFixed(2)} MB / ${projectedCount} items), evicting...`);

        // Sort by LRU (timestamp ascending)
        const sortedEntries = Array.from(this.cacheMap.entries())
            .sort((a, b) => a[1].timestamp - b[1].timestamp);

        // Evict until within limits
        let evictedCount = 0;
        for (const [videoId, metadata] of sortedEntries) {
            if (this.totalSizeMB + newVideoSizeMB <= this.maxSizeMB &&
                this.cacheMap.size < this.maxItems) {
                break;
            }

            await this.removeVideo(videoId);
            evictedCount++;
        }

        console.log(`Evicted ${evictedCount} videos (New total: ${this.totalSizeMB.toFixed(2)} MB)`);
    }

    /**
     * Remove specific video from cache
     */
    async removeVideo(videoId) {
        await this.init();

        const metadata = this.cacheMap.get(videoId);
        if (!metadata) return;

        try {
            // Remove from IndexedDB
            await this.deleteBlob(videoId);
            await this.deleteMetadata(videoId);

            // Remove from in-memory cache
            this.totalSizeMB -= metadata.sizeMB;
            this.cacheMap.delete(videoId);

            console.log(`Removed video ${videoId} from cache`);
        } catch (error) {
            console.error(`Failed to remove video ${videoId}:`, error);
        }
    }

    /**
     * Clear all cached videos
     */
    async clearAll() {
        await this.init();

        try {
            const transaction = this.db.transaction(
                [CACHE_CONFIG.STORE_VIDEOS, CACHE_CONFIG.STORE_METADATA],
                'readwrite'
            );

            transaction.objectStore(CACHE_CONFIG.STORE_VIDEOS).clear();
            transaction.objectStore(CACHE_CONFIG.STORE_METADATA).clear();

            await new Promise((resolve, reject) => {
                transaction.oncomplete = resolve;
                transaction.onerror = () => reject(transaction.error);
            });

            this.cacheMap.clear();
            this.totalSizeMB = 0;

            console.log('All cached videos cleared');
        } catch (error) {
            console.error('Failed to clear cache:', error);
        }
    }

    /**
     * Get cache statistics
     */
    async getStats() {
        await this.init();

        return {
            totalVideos: this.cacheMap.size,
            totalSizeMB: parseFloat(this.totalSizeMB.toFixed(2)),
            maxSizeMB: this.maxSizeMB,
            maxItems: this.maxItems,
            usagePercent: parseFloat(((this.totalSizeMB / this.maxSizeMB) * 100).toFixed(1)),
            videos: Array.from(this.cacheMap.values()).map(meta => ({
                id: meta.videoId,
                sizeMB: parseFloat(meta.sizeMB.toFixed(2)),
                accessCount: meta.accessCount,
                cachedAt: meta.cachedAt
            }))
        };
    }

    // ===== Internal Helper Methods =====

    async storeBlob(videoId, blob) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([CACHE_CONFIG.STORE_VIDEOS], 'readwrite');
            const store = transaction.objectStore(CACHE_CONFIG.STORE_VIDEOS);
            const request = store.put(blob, videoId);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async retrieveBlob(videoId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([CACHE_CONFIG.STORE_VIDEOS], 'readonly');
            const store = transaction.objectStore(CACHE_CONFIG.STORE_VIDEOS);
            const request = store.get(videoId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteBlob(videoId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([CACHE_CONFIG.STORE_VIDEOS], 'readwrite');
            const store = transaction.objectStore(CACHE_CONFIG.STORE_VIDEOS);
            const request = store.delete(videoId);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async storeMetadata(videoId, metadata) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([CACHE_CONFIG.STORE_METADATA], 'readwrite');
            const store = transaction.objectStore(CACHE_CONFIG.STORE_METADATA);
            const request = store.put(metadata, videoId);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async deleteMetadata(videoId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([CACHE_CONFIG.STORE_METADATA], 'readwrite');
            const store = transaction.objectStore(CACHE_CONFIG.STORE_METADATA);
            const request = store.delete(videoId);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

// Singleton instance
let cacheInstance = null;

/**
 * Get video cache instance (singleton)
 */
export function getVideoCache() {
    if (!cacheInstance) {
        cacheInstance = new VideoCache();
    }
    return cacheInstance;
}

/**
 * Initialize and return video cache
 */
export async function initVideoCache(options) {
    const cache = getVideoCache();
    await cache.init();
    return cache;
}

export default VideoCache;
