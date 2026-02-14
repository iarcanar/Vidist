/**
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║ VIDIST File System Access Module (v3.4.0)                            ║
 * ║ Manages local hard drive saving via File System Access API           ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 */

(function() {
    'use strict';

    // ========== Constants ==========
    const FS_DB_NAME = 'VIDISTFileSystem';
    const FS_DB_VERSION = 1;
    const FS_STORE_NAME = 'directoryHandles';
    const FS_HISTORY_STORE = 'fileHistory';

    // localStorage keys for settings (per-machine by nature)
    const LS_KEY_AUTO_SAVE = 'vidist_fs_auto_save';
    const LS_KEY_IMAGE_MODE = 'vidist_fs_image_mode';
    const LS_KEY_STORAGE_MODE = 'vidist_fs_storage_mode';
    const LS_KEY_DAILY_COUNTERS = 'vidist_fs_daily_counters';

    // ========== State ==========
    let fsDB = null;
    let directoryHandle = null;
    let isSupported = false;
    let hasPermission = false;
    let dailyCounters = {};

    // ========== IndexedDB Initialization ==========
    async function initFSDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(FS_DB_NAME, FS_DB_VERSION);

            request.onerror = () => {
                console.error('FS IndexedDB error:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                fsDB = request.result;
                console.log('✅ FS IndexedDB initialized');
                resolve(fsDB);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Store for directory handle
                if (!db.objectStoreNames.contains(FS_STORE_NAME)) {
                    db.createObjectStore(FS_STORE_NAME, { keyPath: 'key' });
                    console.log('📁 Created directoryHandles store');
                }

                // Store for file write history
                if (!db.objectStoreNames.contains(FS_HISTORY_STORE)) {
                    const histStore = db.createObjectStore(FS_HISTORY_STORE, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    histStore.createIndex('timestamp', 'timestamp', { unique: false });
                    console.log('📝 Created fileHistory store');
                }
            };
        });
    }

    // ========== Directory Handle Persistence ==========
    async function saveDirectoryHandle(handle) {
        if (!fsDB) return false;

        return new Promise((resolve) => {
            try {
                const tx = fsDB.transaction([FS_STORE_NAME], 'readwrite');
                const store = tx.objectStore(FS_STORE_NAME);
                store.put({ key: 'selectedDirectory', handle: handle });

                tx.oncomplete = () => {
                    directoryHandle = handle;
                    hasPermission = true;
                    console.log('💾 Directory handle saved to IndexedDB');
                    resolve(true);
                };
                tx.onerror = () => {
                    console.warn('⚠️ Failed to save directory handle');
                    resolve(false);
                };
            } catch (e) {
                console.error('Failed to save directory handle:', e);
                resolve(false);
            }
        });
    }

    async function restoreDirectoryHandle() {
        if (!fsDB) return false;

        return new Promise((resolve) => {
            try {
                const tx = fsDB.transaction([FS_STORE_NAME], 'readonly');
                const store = tx.objectStore(FS_STORE_NAME);
                const request = store.get('selectedDirectory');

                request.onsuccess = async () => {
                    if (request.result && request.result.handle) {
                        directoryHandle = request.result.handle;

                        // Verify permission still valid
                        try {
                            const perm = await directoryHandle.queryPermission({ mode: 'readwrite' });
                            if (perm === 'granted') {
                                hasPermission = true;
                                console.log('✅ Directory handle restored with permission');
                                resolve(true);
                            } else {
                                // Need user gesture to re-request
                                console.log('⚠️ Directory handle restored but permission needs re-authorization');
                                hasPermission = false;
                                resolve(true); // Still restored, just needs re-auth
                            }
                        } catch (e) {
                            console.log('⚠️ Permission check failed, needs re-authorization');
                            hasPermission = false;
                            resolve(true);
                        }
                    } else {
                        resolve(false);
                    }
                };
                request.onerror = () => resolve(false);
            } catch (e) {
                resolve(false);
            }
        });
    }

    // ========== Daily Counter Management ==========
    function getTodayString() {
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yyyy = now.getFullYear();
        return `${dd}${mm}${yyyy}`;
    }

    function loadDailyCounters() {
        try {
            const stored = localStorage.getItem(LS_KEY_DAILY_COUNTERS);
            if (stored) {
                dailyCounters = JSON.parse(stored);
            }
        } catch (e) {
            dailyCounters = {};
        }

        // Clean old dates (keep only today)
        const today = getTodayString();
        const cleaned = {};
        if (dailyCounters[today]) {
            cleaned[today] = dailyCounters[today];
        }
        dailyCounters = cleaned;
    }

    function saveDailyCounters() {
        try {
            localStorage.setItem(LS_KEY_DAILY_COUNTERS, JSON.stringify(dailyCounters));
        } catch (e) {
            console.warn('Failed to save daily counters:', e);
        }
    }

    // ========== Smart File Naming ==========
    function generateFilename(provider, outputType) {
        const today = getTodayString();
        const type = outputType === 'video' ? 'vids' : 'imgs';
        const ext = outputType === 'video' ? 'mp4' : 'png';

        // Initialize counters for today if not exists
        if (!dailyCounters[today]) {
            dailyCounters[today] = {};
        }

        const counterKey = `${provider}-${type}`;
        if (!dailyCounters[today][counterKey]) {
            dailyCounters[today][counterKey] = 0;
        }

        dailyCounters[today][counterKey]++;
        const counter = String(dailyCounters[today][counterKey]).padStart(2, '0');

        saveDailyCounters();

        return `${provider}-${type}-${today}-${counter}.${ext}`;
    }

    // ========== Settings Management ==========
    function getSettings() {
        return {
            autoSave: localStorage.getItem(LS_KEY_AUTO_SAVE) !== 'false', // default: true
            imageMode: localStorage.getItem(LS_KEY_IMAGE_MODE) || 'both',
            storageMode: localStorage.getItem(LS_KEY_STORAGE_MODE) || 'both'
        };
    }

    function updateSettings(settings) {
        if ('autoSave' in settings) {
            localStorage.setItem(LS_KEY_AUTO_SAVE, String(settings.autoSave));
        }
        if ('imageMode' in settings) {
            localStorage.setItem(LS_KEY_IMAGE_MODE, settings.imageMode);
        }
        if ('storageMode' in settings) {
            localStorage.setItem(LS_KEY_STORAGE_MODE, settings.storageMode);
        }
        console.log('💾 FS settings updated:', settings);
    }

    function getSelectedPath() {
        if (!directoryHandle) return null;
        return directoryHandle.name;
    }

    function revokePermission() {
        directoryHandle = null;
        hasPermission = false;

        // Remove from IndexedDB
        if (fsDB) {
            try {
                const tx = fsDB.transaction([FS_STORE_NAME], 'readwrite');
                const store = tx.objectStore(FS_STORE_NAME);
                store.delete('selectedDirectory');
                console.log('🗑️ Directory handle removed from IndexedDB');
            } catch (e) {
                console.warn('Failed to remove directory handle:', e);
            }
        }
    }

    // ========== Directory Selection ==========
    async function selectDirectory() {
        if (!isSupported) {
            return { success: false, reason: 'not_supported' };
        }

        try {
            const handle = await window.showDirectoryPicker({
                id: 'vidist-save-dir',
                mode: 'readwrite',
                startIn: 'documents'
            });

            // Request permission
            const perm = await handle.requestPermission({ mode: 'readwrite' });
            if (perm !== 'granted') {
                return { success: false, reason: 'permission_denied' };
            }

            // Save handle to IndexedDB
            await saveDirectoryHandle(handle);

            console.log('📁 Directory selected:', handle.name);
            return { success: true, name: handle.name };

        } catch (error) {
            if (error.name === 'AbortError') {
                return { success: false, reason: 'cancelled' };
            }
            console.error('Directory selection failed:', error);
            return { success: false, reason: error.message };
        }
    }

    // ========== History JSON Sidecar Management ==========
    async function appendToHistoryJSON(entry) {
        if (!directoryHandle || !hasPermission) return false;

        try {
            // Read existing history
            let history = [];
            try {
                const fileHandle = await directoryHandle.getFileHandle('vidist-history.json', { create: false });
                const file = await fileHandle.getFile();
                const text = await file.text();
                history = JSON.parse(text);
                if (!Array.isArray(history)) history = [];
            } catch (e) {
                // File doesn't exist yet, start fresh
                history = [];
            }

            // Append new entry
            history.push({
                id: entry.id || `fs-${Date.now()}`,
                filename: entry.filename,
                provider: entry.provider,
                model: entry.model || 'unknown',
                outputType: entry.outputType,
                prompt: entry.prompt || '',
                negativePrompt: entry.negativePrompt || '',
                resolution: entry.resolution || '',
                duration: entry.duration || null,
                hash: entry.hash || null,
                originalUrl: entry.originalUrl || '',
                imgbbUrl: entry.imgbbUrl || '',
                generationParams: entry.generationParams || {},
                createdAt: entry.createdAt || new Date().toISOString(),
                savedAt: entry.savedAt || new Date().toISOString()
            });

            // Write back
            const fileHandle = await directoryHandle.getFileHandle('vidist-history.json', { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(JSON.stringify(history, null, 2));
            await writable.close();

            console.log('📝 History JSON updated:', history.length, 'entries');
            return true;

        } catch (error) {
            console.error('Failed to update history JSON:', error);

            if (error.name === 'NotAllowedError') {
                hasPermission = false;
            }

            return false;
        }
    }

    // ========== File Writing ==========
    async function saveVideoToLocal(blob, provider, metadata = {}) {
        if (!directoryHandle || !hasPermission) {
            console.warn('No directory handle or permission for local save');
            return { success: false, reason: 'no_permission' };
        }

        try {
            const filename = generateFilename(provider, 'video');

            // Create file in directory
            const fileHandle = await directoryHandle.getFileHandle(filename, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();

            console.log('💾 Video saved to local:', filename);

            // Append to history JSON
            await appendToHistoryJSON({
                filename,
                ...metadata,
                provider,
                outputType: 'video',
                savedAt: new Date().toISOString()
            });

            return { success: true, filename };

        } catch (error) {
            console.error('Failed to save video to local:', error);

            if (error.name === 'NotAllowedError') {
                hasPermission = false;
                return { success: false, reason: 'permission_revoked' };
            }
            if (error.name === 'NotFoundError') {
                hasPermission = false;
                return { success: false, reason: 'directory_not_found' };
            }

            return { success: false, reason: error.message };
        }
    }

    async function saveImageToLocal(blob, provider, metadata = {}) {
        if (!directoryHandle || !hasPermission) {
            return { success: false, reason: 'no_permission' };
        }

        try {
            const filename = generateFilename(provider, 'image');

            const fileHandle = await directoryHandle.getFileHandle(filename, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();

            console.log('💾 Image saved to local:', filename);

            await appendToHistoryJSON({
                filename,
                ...metadata,
                provider,
                outputType: 'image',
                savedAt: new Date().toISOString()
            });

            return { success: true, filename };

        } catch (error) {
            console.error('Failed to save image to local:', error);

            if (error.name === 'NotAllowedError') {
                hasPermission = false;
            }

            return { success: false, reason: error.message };
        }
    }

    // ========== Notification System ==========
    function showFSNotification(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `fixed bottom-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-semibold
            transition-all duration-300 transform translate-y-20 opacity-0
            ${type === 'success' ? 'bg-green-600/90 text-green-100 border border-green-400/50' : ''}
            ${type === 'error' ? 'bg-red-600/90 text-red-100 border border-red-400/50' : ''}
            ${type === 'info' ? 'bg-orange-600/90 text-orange-100 border border-orange-400/50' : ''}`;
        toast.style.backdropFilter = 'blur(10px)';
        toast.textContent = message;

        document.body.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.style.transform = 'translateY(0)';
            toast.style.opacity = '1';
        });

        // Auto-dismiss after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateY(20px)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ========== Initialization ==========
    async function initFileSystem() {
        // Feature detection
        isSupported = ('showDirectoryPicker' in window);

        if (!isSupported) {
            console.log('ℹ️ File System Access API not supported in this browser');
            return { supported: false };
        }

        // Initialize IndexedDB for directory handle persistence
        try {
            await initFSDB();
        } catch (e) {
            console.error('Failed to init FS IndexedDB:', e);
            return { supported: true, hasPermission: false, restored: false };
        }

        // Load daily counters from localStorage
        loadDailyCounters();

        // Try to restore previously selected directory handle
        const restored = await restoreDirectoryHandle();

        console.log('✅ File System module initialized:', {
            supported: isSupported,
            hasStoredHandle: restored,
            hasPermission: hasPermission
        });

        return { supported: true, hasPermission, restored };
    }

    // ========== Helper: base64 to Blob ==========
    function base64ToBlob(base64, mimeType = 'image/png') {
        // Remove data URI prefix if exists
        const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;

        const byteCharacters = atob(base64Data);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        return new Blob(byteArrays, { type: mimeType });
    }

    // ========== Export to window ==========
    window.vidistFS = {
        init: initFileSystem,
        isSupported: () => isSupported,
        hasPermission: () => hasPermission,
        selectDirectory: selectDirectory,
        saveVideo: saveVideoToLocal,
        saveImage: saveImageToLocal,
        appendHistory: appendToHistoryJSON,
        getSettings: getSettings,
        updateSettings: updateSettings,
        getSelectedPath: getSelectedPath,
        revokePermission: revokePermission,
        generateFilename: generateFilename,
        showNotification: showFSNotification,
        base64ToBlob: base64ToBlob
    };

    console.log('📦 VIDIST File System module loaded');

})();
