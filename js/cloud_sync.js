/**
 * VIDIST Cloud Sync Module
 *
 * Firebase Authentication + Firestore integration for permanent cloud storage
 * - Google Sign-In (popup for desktop, redirect for mobile)
 * - Firestore document database for history + KEEP prompts
 * - Offline persistence with automatic sync
 * - Migration from existing localStorage data
 *
 * Pattern: IIFE exporting to window.vidistCloud (same as window.vidistFS)
 */
(function() {
    'use strict';

    // ========== State ==========
    let firebaseApp = null;
    let auth = null;
    let db = null;
    let currentUser = null;
    let syncQueue = [];
    let isSyncing = false;
    let lastSyncTimestamp = null;
    let isInitialized = false;

    // ========== Constants ==========
    const SYNC_DEBOUNCE_MS = 2000;
    const MAX_BATCH_SIZE = 500;
    const HISTORY_PAGE_SIZE = 50;
    const LS_KEY_LAST_SYNC = 'vidist_cloud_last_sync';
    const LS_KEY_SYNC_QUEUE = 'vidist_cloud_sync_queue';
    const LS_KEY_MIGRATION_DONE = 'vidist_cloud_migration_done';

    // ========== Initialization ==========
    async function init() {
        if (typeof firebase === 'undefined') {
            console.warn('☁️ Firebase SDK not loaded, cloud sync disabled');
            return { available: false, reason: 'SDK not loaded' };
        }

        if (typeof FIREBASE_CONFIG === 'undefined') {
            console.warn('☁️ Firebase config not found, cloud sync disabled');
            return { available: false, reason: 'Config not found' };
        }

        try {
            // Initialize Firebase
            if (!firebase.apps.length) {
                firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
                console.log('☁️ Firebase initialized');
            } else {
                firebaseApp = firebase.app();
                console.log('☁️ Firebase already initialized');
            }

            auth = firebase.auth();
            db = firebase.firestore();

            // Enable offline persistence
            try {
                await db.enablePersistence({ synchronizeTabs: true });
                console.log('☁️ Firestore offline persistence enabled');
            } catch (err) {
                if (err.code === 'failed-precondition') {
                    console.warn('☁️ Firestore persistence: multiple tabs open');
                } else if (err.code === 'unimplemented') {
                    console.warn('☁️ Firestore persistence: not supported in this browser');
                }
            }

            // Listen for auth state changes
            auth.onAuthStateChanged(async (user) => {
                currentUser = user;
                updateAuthUI(user);

                if (user) {
                    console.log('☁️ Signed in as', user.displayName || user.email);

                    // Create/update user profile document
                    try {
                        await db.collection('users').doc(user.uid).set({
                            email: user.email,
                            displayName: user.displayName,
                            photoURL: user.photoURL,
                            lastSyncAt: firebase.firestore.FieldValue.serverTimestamp(),
                            version: typeof VIDIST_VERSION !== 'undefined' ? VIDIST_VERSION.full : 'unknown'
                        }, { merge: true });
                    } catch (e) {
                        console.warn('☁️ Failed to update user profile:', e);
                    }

                    // Check if this is first login (migration needed)
                    const migrationDone = localStorage.getItem(LS_KEY_MIGRATION_DONE);
                    if (!migrationDone) {
                        console.log('☁️ First login detected - starting migration...');
                        await migrateLocalData();
                        localStorage.setItem(LS_KEY_MIGRATION_DONE, 'true');
                    } else {
                        // Returning user - load cloud data
                        await loadCloudDataToLocal();
                    }

                    // Load pending sync queue
                    loadSyncQueue();
                    processSyncQueue();
                } else {
                    console.log('☁️ Signed out');
                }
            });

            // Online/offline listeners
            window.addEventListener('online', () => {
                console.log('☁️ Back online');
                if (currentUser) {
                    updateSyncStatusUI('syncing');
                    processSyncQueue();
                }
            });

            window.addEventListener('offline', () => {
                console.log('☁️ Offline mode');
                updateSyncStatusUI('offline');
            });

            isInitialized = true;
            return { available: true };

        } catch (error) {
            console.error('☁️ Cloud sync init failed:', error);
            return { available: false, error: error.message };
        }
    }

    // ========== Authentication ==========
    async function signIn() {
        if (!auth) {
            console.warn('☁️ Auth not initialized');
            return;
        }

        updateSyncStatusUI('signing_in');

        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });

            // Use popup for desktop, redirect for mobile
            const isMobile = window.innerWidth < 768;
            if (isMobile) {
                await auth.signInWithRedirect(provider);
            } else {
                await auth.signInWithPopup(provider);
            }
        } catch (error) {
            console.error('☁️ Sign-in error:', error);
            updateSyncStatusUI('error');

            if (error.code !== 'auth/popup-closed-by-user' &&
                error.code !== 'auth/cancelled-popup-request') {
                showNotification('Sign-in failed: ' + error.message, 'error');
            } else {
                updateSyncStatusUI('signed_out');
            }
        }
    }

    async function signOut() {
        if (!auth) return;

        try {
            await auth.signOut();
            console.log('☁️ Signed out successfully');
            showNotification('Signed out from cloud', 'success');
        } catch (error) {
            console.error('☁️ Sign-out error:', error);
            showNotification('Sign-out failed: ' + error.message, 'error');
        }
    }

    function getCurrentUser() {
        return currentUser;
    }

    function isSignedIn() {
        return currentUser !== null;
    }

    // ========== History CRUD ==========
    async function saveHistoryItem(item) {
        if (!currentUser || !db) {
            console.warn('☁️ Not signed in, queueing save');
            queueWrite({ type: 'saveHistory', data: item });
            return false;
        }

        if (!item || !item.id) {
            console.warn('☁️ Invalid history item (no ID)');
            return false;
        }

        try {
            const docRef = db.collection('users').doc(currentUser.uid)
                .collection('history').doc(item.id);

            // Strip base64 data (too large for Firestore)
            const cloudItem = {
                id: item.id,
                provider: item.provider || 'unknown',
                model: item.model || 'unknown',
                modelKey: item.modelKey || null,
                outputType: item.outputType || (item.modelKey?.includes('image') ? 'image' : 'video'),
                prompt: item.prompt || '',
                negativePrompt: item.negativePrompt || '',
                status: item.status || 'completed',
                duration: item.duration || null,
                resolution: item.resolution || '',
                url: item.url || '',
                imgbbUrl: item.imgbbUrl || '',
                contentHash: item.contentHash || generateContentHash(item),
                processingTime: item.processingTime || null,
                craftData: item.craftData || null,
                shotType: item.shotType || null,
                promptExpansion: item.promptExpansion || false,
                createdAt: item.createdAt
                    ? firebase.firestore.Timestamp.fromDate(new Date(item.createdAt))
                    : firebase.firestore.FieldValue.serverTimestamp(),
                syncedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            // DO NOT store initialImage (base64) - can be 200KB+
            await docRef.set(cloudItem, { merge: true });
            updateSyncStatusUI('synced');
            console.log('☁️ Saved history item:', item.id);
            return true;

        } catch (error) {
            console.error('☁️ Failed to save history item:', error);

            if (error.code === 'unavailable' || error.code === 'resource-exhausted') {
                queueWrite({ type: 'saveHistory', data: item });
                updateSyncStatusUI('pending');
            } else {
                updateSyncStatusUI('error');
            }
            return false;
        }
    }

    async function updateHistoryItem(id, updates) {
        if (!currentUser || !db) {
            queueWrite({ type: 'updateHistory', data: { id, updates } });
            return false;
        }

        try {
            const docRef = db.collection('users').doc(currentUser.uid)
                .collection('history').doc(id);

            await docRef.update({
                ...updates,
                syncedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            console.log('☁️ Updated history item:', id);
            return true;

        } catch (error) {
            console.error('☁️ Failed to update history item:', error);
            queueWrite({ type: 'updateHistory', data: { id, updates } });
            return false;
        }
    }

    async function deleteHistoryItem(id) {
        if (!currentUser || !db) {
            queueWrite({ type: 'deleteHistory', data: { id } });
            return false;
        }

        try {
            const docRef = db.collection('users').doc(currentUser.uid)
                .collection('history').doc(id);

            await docRef.delete();
            console.log('☁️ Deleted history item:', id);
            return true;

        } catch (error) {
            console.error('☁️ Failed to delete history item:', error);
            queueWrite({ type: 'deleteHistory', data: { id } });
            return false;
        }
    }

    async function loadAllHistory() {
        if (!currentUser || !db) {
            console.warn('☁️ Not signed in, cannot load history');
            return [];
        }

        try {
            updateSyncStatusUI('syncing');

            const snapshot = await db.collection('users').doc(currentUser.uid)
                .collection('history')
                .orderBy('createdAt', 'desc')
                .get();

            const cloudHistory = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                cloudHistory.push({
                    ...data,
                    id: doc.id,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt
                });
            });

            console.log('☁️ Loaded', cloudHistory.length, 'history items from cloud');
            updateSyncStatusUI('synced');
            return cloudHistory;

        } catch (error) {
            console.error('☁️ Failed to load history:', error);
            updateSyncStatusUI('error');
            return [];
        }
    }

    async function loadCloudDataToLocal() {
        if (!currentUser || !db) return;

        updateSyncStatusUI('syncing');

        try {
            // Load history from cloud
            const cloudHistory = await loadAllHistory();

            // Merge with local videoHistoryData
            if (typeof videoHistoryData !== 'undefined') {
                const localMap = new Map(videoHistoryData.map(v => [v.id, v]));

                cloudHistory.forEach(cloudItem => {
                    if (localMap.has(cloudItem.id)) {
                        // Merge: keep local base64, update metadata from cloud
                        const localItem = localMap.get(cloudItem.id);
                        localMap.set(cloudItem.id, {
                            ...cloudItem,
                            initialImage: localItem.initialImage,
                            url: cloudItem.url || localItem.url,
                            imgbbUrl: cloudItem.imgbbUrl || localItem.imgbbUrl
                        });
                    } else {
                        // Cloud-only item: add to local
                        localMap.set(cloudItem.id, cloudItem);
                    }
                });

                // Replace videoHistoryData with merged result
                videoHistoryData = Array.from(localMap.values())
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                // Save merged data to localStorage (max 30)
                const forLocalStorage = videoHistoryData.slice(0, 30);
                if (typeof safeSetLocalStorage === 'function') {
                    safeSetLocalStorage('videoHistory', JSON.stringify(forLocalStorage));
                }

                // Re-render UI
                if (typeof renderVideoHistory === 'function') {
                    renderVideoHistory(true);
                }

                console.log('☁️ Merged cloud + local history:', videoHistoryData.length, 'items');
            }

            // Load KEEP prompts from cloud
            const keepSnapshot = await db.collection('users').doc(currentUser.uid)
                .collection('keepPrompts')
                .orderBy('createdAt', 'desc')
                .get();

            const cloudKeep = [];
            keepSnapshot.forEach(doc => {
                const data = doc.data();
                cloudKeep.push({
                    ...data,
                    id: data.id || parseInt(doc.id),
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt
                });
            });

            console.log('☁️ Loaded', cloudKeep.length, 'KEEP prompts from cloud');

            // Merge with local keep prompts
            if (typeof keepPrompts !== 'undefined' && cloudKeep.length > 0) {
                const localKeepMap = new Map(keepPrompts.map(p => [String(p.id), p]));

                cloudKeep.forEach(cloudPrompt => {
                    if (!localKeepMap.has(String(cloudPrompt.id))) {
                        localKeepMap.set(String(cloudPrompt.id), cloudPrompt);
                    }
                });

                keepPrompts = Array.from(localKeepMap.values())
                    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

                // Persist and re-render
                if (typeof saveKeepPrompts === 'function') {
                    await saveKeepPrompts();
                }
                if (typeof renderKeepList === 'function') {
                    renderKeepList();
                }
            }

            updateSyncStatusUI('synced');
            lastSyncTimestamp = Date.now();
            localStorage.setItem(LS_KEY_LAST_SYNC, String(lastSyncTimestamp));

        } catch (error) {
            console.error('☁️ Failed to load cloud data:', error);
            updateSyncStatusUI('error');
        }
    }

    // ========== KEEP Prompts CRUD ==========
    async function saveKeepPrompt(prompt) {
        if (!currentUser || !db) {
            queueWrite({ type: 'saveKeep', data: prompt });
            return false;
        }

        if (!prompt || !prompt.id) {
            console.warn('☁️ Invalid KEEP prompt (no ID)');
            return false;
        }

        try {
            const docRef = db.collection('users').doc(currentUser.uid)
                .collection('keepPrompts').doc(String(prompt.id));

            const cloudPrompt = {
                id: prompt.id,
                text: prompt.text || '',
                createdAt: prompt.createdAt
                    ? firebase.firestore.Timestamp.fromDate(new Date(prompt.createdAt))
                    : firebase.firestore.FieldValue.serverTimestamp(),
                syncedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await docRef.set(cloudPrompt, { merge: true });
            console.log('☁️ Saved KEEP prompt:', prompt.id);
            return true;

        } catch (error) {
            console.error('☁️ Failed to save KEEP prompt:', error);
            queueWrite({ type: 'saveKeep', data: prompt });
            return false;
        }
    }

    async function deleteKeepPrompt(id) {
        if (!currentUser || !db) {
            queueWrite({ type: 'deleteKeep', data: { id } });
            return false;
        }

        try {
            const docRef = db.collection('users').doc(currentUser.uid)
                .collection('keepPrompts').doc(String(id));

            await docRef.delete();
            console.log('☁️ Deleted KEEP prompt:', id);
            return true;

        } catch (error) {
            console.error('☁️ Failed to delete KEEP prompt:', error);
            queueWrite({ type: 'deleteKeep', data: { id } });
            return false;
        }
    }

    async function loadAllKeepPrompts() {
        if (!currentUser || !db) return [];

        try {
            const snapshot = await db.collection('users').doc(currentUser.uid)
                .collection('keepPrompts')
                .orderBy('createdAt', 'desc')
                .get();

            const prompts = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                prompts.push({
                    ...data,
                    id: data.id || parseInt(doc.id),
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt
                });
            });

            return prompts;

        } catch (error) {
            console.error('☁️ Failed to load KEEP prompts:', error);
            return [];
        }
    }

    // ========== Sync Engine ==========
    async function syncNow() {
        if (!currentUser) {
            showNotification('Please sign in to sync', 'warning');
            return;
        }

        console.log('☁️ Manual sync started...');
        updateSyncStatusUI('syncing');

        try {
            // First, upload any pending local changes
            await processSyncQueue();

            // Then, pull fresh cloud data
            await loadCloudDataToLocal();

            showNotification('Sync complete!', 'success');
            updateSyncStatusUI('synced');

        } catch (error) {
            console.error('☁️ Sync failed:', error);
            showNotification('Sync failed: ' + error.message, 'error');
            updateSyncStatusUI('error');
        }
    }

    function queueWrite(operation) {
        syncQueue.push({
            ...operation,
            timestamp: Date.now(),
            retries: 0
        });

        // Persist queue to localStorage
        try {
            localStorage.setItem(LS_KEY_SYNC_QUEUE,
                JSON.stringify(syncQueue.slice(-100)));
        } catch (e) {
            console.warn('☁️ Failed to persist sync queue:', e);
        }

        updateSyncStatusUI('pending');
    }

    function loadSyncQueue() {
        try {
            const stored = localStorage.getItem(LS_KEY_SYNC_QUEUE);
            if (stored) {
                syncQueue = JSON.parse(stored);
                console.log('☁️ Loaded', syncQueue.length, 'pending operations');
            }
        } catch (e) {
            console.warn('☁️ Failed to load sync queue:', e);
            syncQueue = [];
        }
    }

    async function processSyncQueue() {
        if (isSyncing || !currentUser || syncQueue.length === 0) return;

        isSyncing = true;
        updateSyncStatusUI('syncing');

        let processed = 0;
        const failed = [];

        while (syncQueue.length > 0 && processed < MAX_BATCH_SIZE) {
            const op = syncQueue.shift();

            try {
                let success = false;

                if (op.type === 'saveHistory') {
                    success = await saveHistoryItem(op.data);
                } else if (op.type === 'updateHistory') {
                    success = await updateHistoryItem(op.data.id, op.data.updates);
                } else if (op.type === 'deleteHistory') {
                    success = await deleteHistoryItem(op.data.id);
                } else if (op.type === 'saveKeep') {
                    success = await saveKeepPrompt(op.data);
                } else if (op.type === 'deleteKeep') {
                    success = await deleteKeepPrompt(op.data.id);
                }

                if (success) {
                    processed++;
                } else {
                    throw new Error('Operation returned false');
                }

            } catch (error) {
                console.warn('☁️ Failed operation:', op.type, error);

                // Re-queue with retry count
                if (op.retries < 3) {
                    failed.push({ ...op, retries: op.retries + 1 });
                } else {
                    console.error('☁️ Permanently failed operation:', op);
                }
            }
        }

        // Re-add failed operations
        syncQueue.push(...failed);

        // Persist updated queue
        try {
            localStorage.setItem(LS_KEY_SYNC_QUEUE, JSON.stringify(syncQueue));
        } catch (e) {
            console.warn('☁️ Failed to persist sync queue:', e);
        }

        isSyncing = false;

        if (processed > 0) {
            console.log('☁️ Processed', processed, 'sync operations');
        }

        updateSyncStatusUI(syncQueue.length > 0 ? 'pending' : 'synced');
    }

    // ========== Migration ==========
    async function migrateLocalData() {
        if (!currentUser || !db) return;

        console.log('☁️ Starting data migration...');
        updateSyncStatusUI('migrating');
        showMigrationProgress('Migrating your data to cloud...', 0);

        try {
            // Phase 1: Migrate video history
            let localHistory = [];
            try {
                const stored = localStorage.getItem('videoHistory');
                if (stored) {
                    localHistory = JSON.parse(stored);
                }
            } catch (e) {
                console.warn('☁️ Failed to load local history:', e);
            }

            if (localHistory.length > 0) {
                console.log('☁️ Migrating', localHistory.length, 'history items...');

                for (let i = 0; i < localHistory.length; i++) {
                    const item = localHistory[i];
                    if (!item.id) continue;

                    await saveHistoryItem(item);

                    // Update progress
                    const progress = Math.floor((i + 1) / localHistory.length * 50);
                    showMigrationProgress(
                        `Migrating history... ${i + 1}/${localHistory.length}`,
                        progress
                    );
                }

                console.log('☁️ History migration complete');
                showMigrationProgress('History migrated!', 50);
            }

            // Phase 2: Migrate KEEP prompts
            let localKeep = [];
            try {
                // Try to load from the actual KEEP system
                if (typeof keepPrompts !== 'undefined') {
                    localKeep = keepPrompts;
                }
            } catch (e) {
                console.warn('☁️ Failed to load KEEP prompts:', e);
            }

            if (localKeep.length > 0) {
                console.log('☁️ Migrating', localKeep.length, 'KEEP prompts...');

                for (let i = 0; i < localKeep.length; i++) {
                    await saveKeepPrompt(localKeep[i]);

                    const progress = 50 + Math.floor((i + 1) / localKeep.length * 50);
                    showMigrationProgress(
                        `Migrating KEEP prompts... ${i + 1}/${localKeep.length}`,
                        progress
                    );
                }

                console.log('☁️ KEEP prompts migration complete');
            }

            showMigrationProgress('Migration complete!', 100);

            showNotification(
                `Migrated ${localHistory.length} history items + ${localKeep.length} prompts to cloud`,
                'success'
            );

            updateSyncStatusUI('synced');

        } catch (error) {
            console.error('☁️ Migration failed:', error);
            updateSyncStatusUI('error');
            showNotification('Migration failed: ' + error.message, 'error');
        }

        setTimeout(hideMigrationProgress, 2000);
    }

    // ========== UI Updates ==========
    function updateSyncStatusUI(status) {
        const indicator = document.getElementById('cloud-sync-indicator');
        const statusText = document.getElementById('cloud-sync-status');

        if (!indicator) return;

        const states = {
            'synced': { color: 'bg-green-400 shadow-green-400/50', text: 'Synced', anim: '' },
            'syncing': { color: 'bg-cyan-400 shadow-cyan-400/50', text: 'Syncing...', anim: 'animate-pulse' },
            'pending': { color: 'bg-yellow-400 shadow-yellow-400/50', text: 'Pending', anim: 'cloud-sync-pulse' },
            'offline': { color: 'bg-gray-400 shadow-gray-400/50', text: 'Offline', anim: '' },
            'error': { color: 'bg-red-400 shadow-red-400/50', text: 'Error', anim: '' },
            'migrating': { color: 'bg-purple-400 shadow-purple-400/50', text: 'Migrating', anim: 'animate-pulse' },
            'signing_in': { color: 'bg-cyan-400 shadow-cyan-400/50', text: 'Signing in', anim: 'animate-pulse' },
            'signed_out': { color: 'bg-gray-500 shadow-gray-500/50', text: 'Not signed in', anim: '' }
        };

        const state = states[status] || states['synced'];

        indicator.className = `w-2 h-2 rounded-full shadow-lg ${state.color} ${state.anim}`;
        indicator.title = state.text;

        if (statusText) {
            statusText.textContent = state.text;
        }
    }

    function updateAuthUI(user) {
        const loginBtn = document.getElementById('cloud-login-btn');
        const userInfo = document.getElementById('cloud-user-info');
        const avatar = document.getElementById('cloud-user-avatar');
        const userName = document.getElementById('cloud-user-name');
        const signOutBtn = document.getElementById('cloud-signout-btn');
        const syncBtn = document.getElementById('cloud-sync-btn');
        const historyBadge = document.getElementById('cloud-history-badge');

        if (user) {
            // Signed in
            if (loginBtn) loginBtn.classList.add('hidden');
            if (userInfo) userInfo.classList.remove('hidden');
            if (avatar) avatar.src = user.photoURL || '';
            if (userName) userName.textContent = user.displayName || user.email;
            if (signOutBtn) signOutBtn.classList.remove('hidden');
            if (syncBtn) syncBtn.classList.remove('hidden');
            if (historyBadge) historyBadge.classList.remove('hidden');

            updateSyncStatusUI('synced');
        } else {
            // Signed out
            if (loginBtn) loginBtn.classList.remove('hidden');
            if (userInfo) userInfo.classList.add('hidden');
            if (signOutBtn) signOutBtn.classList.add('hidden');
            if (syncBtn) syncBtn.classList.add('hidden');
            if (historyBadge) historyBadge.classList.add('hidden');

            updateSyncStatusUI('signed_out');
        }
    }

    function showMigrationProgress(text, percent) {
        const banner = document.getElementById('cloud-migration-banner');
        const textEl = document.getElementById('cloud-migration-text');
        const progressBar = document.getElementById('cloud-migration-progress');

        if (banner) banner.classList.remove('hidden');
        if (textEl) textEl.textContent = text;
        if (progressBar) progressBar.style.width = percent + '%';
    }

    function hideMigrationProgress() {
        const banner = document.getElementById('cloud-migration-banner');
        if (banner) banner.classList.add('hidden');
    }

    function showNotification(message, type = 'info') {
        // Try to use existing notification system
        if (window.vidistFS && typeof window.vidistFS.showNotification === 'function') {
            window.vidistFS.showNotification(message, type);
        } else {
            console.log(`☁️ [${type.toUpperCase()}]`, message);
        }
    }

    // ========== Utilities ==========
    function generateContentHash(item) {
        // Simple hash for deduplication
        const source = [
            item.provider || '',
            item.model || '',
            item.prompt || '',
            item.createdAt || ''
        ].join('|');

        // DJB2 hash
        let hash = 5381;
        for (let i = 0; i < source.length; i++) {
            hash = ((hash << 5) + hash) + source.charCodeAt(i);
            hash = hash & hash;
        }
        return 'djb2:' + Math.abs(hash).toString(16);
    }

    // ========== Export Public API ==========
    window.vidistCloud = {
        init,
        signIn,
        signOut,
        isSignedIn,
        getCurrentUser,
        saveHistoryItem,
        updateHistoryItem,
        deleteHistoryItem,
        loadAllHistory,
        saveKeepPrompt,
        deleteKeepPrompt,
        loadAllKeepPrompts,
        syncNow,
        migrateLocalData,
        updateSyncStatusUI
    };

    console.log('☁️ Cloud Sync module loaded');

})();
