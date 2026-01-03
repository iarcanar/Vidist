# Implementation Plan: LRU Cache + IndexedDB + Auto-Clean
**Version**: 2.8
**Date**: October 26, 2025
**Status**: ✅ Completed

---

## 🎯 Overview

### What We're Adding:
1. **LRU Cache Class** - Memory-controlled cache (300MB limit)
2. **IndexedDB Persistence** - Cache survives page refresh
3. **Auto-Clean Expired** - Remove videos older than 24 hours

### What We're NOT Doing:
- ❌ Web Worker for polling (over-engineering)
- ❌ Lazy thumbnail loading (not needed yet)
- ❌ Rewriting existing cache functions (integrate instead)

---

## 📋 Implementation Checklist

### Phase 1: LRU Cache Class ✅
- [x] Create `LRUCache` class with 300MB limit
- [x] Implement `get(key)` - returns blob URL, updates LRU order
- [x] Implement `set(key, blobUrl, size)` - adds to cache, evicts if needed
- [x] Implement `evict()` - removes oldest entries (auto in `set()`)
- [x] Implement `clear()` - clears all cache
- [x] Add size tracking (`currentSize`, `maxSize`)
- [x] Replace global `videoCache` Map with `LRUCache` instance
- [x] Add `getStats()` method for monitoring

**Location**: `main.html` lines 803-906

---

### Phase 2: IndexedDB Persistence ✅
- [x] Create `initIndexedDB()` function
- [x] Create object store `videos` with schema:
  ```javascript
  {
    id: string,           // video ID
    blob: Blob,          // video file
    timestamp: number,   // Date.now()
    size: number,        // blob.size
    provider: string     // 'videogen' | 'wavespeed'
  }
  ```
- [x] Implement `cacheToDB(id, blob, metadata)` - save to IndexedDB
- [x] Implement `getFromDB(id)` - retrieve from IndexedDB
- [x] Implement `cleanExpiredCache()` - delete entries > 24h
- [x] Implement `clearIndexedDBCache()` - clear all DB cache
- [x] Handle quota exceeded errors with retry

**Location**: `main.html` lines 908-1099

---

### Phase 3: Auto-Clean Expired ✅
- [x] Run `cleanExpiredCache()` on app init
- [x] Run periodic cleanup every 1 hour (setInterval)
- [x] Add console logging for cleaned items (with size stats)
- [x] Log cache stats on startup

**Location**: `initializeApp()` function lines 1373-1394

---

### Phase 4: Integration with Existing Code ✅
- [x] Update `preloadVideoToCache()`:
  - Check LRU cache first
  - Fallback to IndexedDB (restore to LRU)
  - Track blob size for both providers
  - Persist to both LRU and IndexedDB
- [x] Update `getCachedVideo()`:
  - Made async
  - Calls `videoCache.get()`
- [x] Update `cacheVideo()`:
  - Wrapper for `videoCache.set()`
- [x] Handle quota exceeded gracefully (retry after cleanup)

**Location**: Lines 895-901, 1101-1192

---

### Phase 5: Testing & Documentation ✅
- [x] Code complete and ready for testing
- [x] Console logging comprehensive
- [x] Plan document created
- [ ] Manual testing required (load videos, refresh, wait 24h)
- [ ] README.md update pending
- [ ] Implementation guide pending

---

## 🛠️ Technical Details

### LRU Cache Class Structure

```javascript
class LRUCache {
    constructor(maxSize = 300 * 1024 * 1024) {
        this.maxSize = maxSize;           // 300MB in bytes
        this.currentSize = 0;             // Current total size
        this.cache = new Map();           // Map<videoId, {blobUrl, size, timestamp}>
    }

    async get(key) {
        if (!this.cache.has(key)) return null;

        // Move to end (most recently used)
        const value = this.cache.get(key);
        this.cache.delete(key);
        this.cache.set(key, value);

        return value.blobUrl;
    }

    async set(key, blobUrl, size) {
        // Remove if exists
        if (this.cache.has(key)) {
            this.currentSize -= this.cache.get(key).size;
            this.cache.delete(key);
        }

        // Evict oldest until space available
        while (this.currentSize + size > this.maxSize && this.cache.size > 0) {
            const oldestKey = this.cache.keys().next().value;
            const oldestValue = this.cache.get(oldestKey);

            // Revoke blob URL to free memory
            if (oldestValue.blobUrl.startsWith('blob:')) {
                URL.revokeObjectURL(oldestValue.blobUrl);
            }

            this.currentSize -= oldestValue.size;
            this.cache.delete(oldestKey);

            console.log(`🗑️ Evicted cache: ${oldestKey} (${(oldestValue.size / 1024 / 1024).toFixed(2)}MB)`);
        }

        // Add new entry
        if (this.currentSize + size <= this.maxSize) {
            this.cache.set(key, {
                blobUrl,
                size,
                timestamp: Date.now()
            });
            this.currentSize += size;

            console.log(`💾 Cached: ${key} (${(size / 1024 / 1024).toFixed(2)}MB) | Total: ${(this.currentSize / 1024 / 1024).toFixed(2)}MB / ${(this.maxSize / 1024 / 1024).toFixed(2)}MB`);
        } else {
            console.warn(`⚠️ Video too large to cache: ${key} (${(size / 1024 / 1024).toFixed(2)}MB)`);
        }
    }

    clear() {
        // Revoke all blob URLs
        for (const [key, value] of this.cache.entries()) {
            if (value.blobUrl.startsWith('blob:')) {
                URL.revokeObjectURL(value.blobUrl);
            }
        }
        this.cache.clear();
        this.currentSize = 0;
        console.log('🧹 LRU Cache cleared');
    }

    getStats() {
        return {
            count: this.cache.size,
            currentSize: this.currentSize,
            maxSize: this.maxSize,
            usagePercent: ((this.currentSize / this.maxSize) * 100).toFixed(2)
        };
    }
}
```

---

### IndexedDB Schema

```javascript
// Database: VIDISTCache
// Version: 1
// Object Store: videos

{
    id: "gen_abc123",                    // Primary Key
    blob: Blob(12345678),               // Video file
    timestamp: 1729900800000,           // Created at
    size: 12345678,                     // Blob size in bytes
    provider: "videogen"                // Provider name
}
```

---

### Integration Points

#### 1. Replace Global videoCache
```javascript
// OLD (line 804)
const videoCache = new Map();

// NEW
const videoCache = new LRUCache(300 * 1024 * 1024); // 300MB
```

#### 2. Update preloadVideoToCache()
```javascript
// OLD
const blobUrl = URL.createObjectURL(blob);
cacheVideo(videoId, blobUrl);

// NEW
const blobUrl = URL.createObjectURL(blob);
await videoCache.set(videoId, blobUrl, blob.size);
await cacheToDB(videoId, blob, { provider, timestamp: Date.now() });
```

#### 3. Update getCachedVideo()
```javascript
// OLD
function getCachedVideo(videoId) {
    return videoCache.get(videoId);
}

// NEW
async function getCachedVideo(videoId) {
    // Check LRU cache first (in memory)
    let cachedUrl = await videoCache.get(videoId);

    // Fallback to IndexedDB
    if (!cachedUrl) {
        const dbEntry = await getFromDB(videoId);
        if (dbEntry && dbEntry.blob) {
            cachedUrl = URL.createObjectURL(dbEntry.blob);
            // Add back to LRU cache
            await videoCache.set(videoId, cachedUrl, dbEntry.size);
        }
    }

    return cachedUrl;
}
```

---

## ⚠️ Error Handling

### Quota Exceeded Error
```javascript
try {
    await cacheToDB(id, blob, metadata);
} catch (error) {
    if (error.name === 'QuotaExceededError') {
        console.warn('⚠️ IndexedDB quota exceeded, cleaning...');
        await cleanExpiredCache();
        // Retry once
        try {
            await cacheToDB(id, blob, metadata);
        } catch (retryError) {
            console.error('❌ Failed to cache even after cleanup:', retryError);
        }
    } else {
        console.error('❌ IndexedDB error:', error);
    }
}
```

### Blob URL Revocation
```javascript
// Always revoke when removing from cache
if (blobUrl.startsWith('blob:')) {
    URL.revokeObjectURL(blobUrl);
    console.log('🧹 Revoked blob URL:', videoId);
}
```

---

## 📊 Performance Expectations

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Memory usage | Unlimited | 300MB max | Controlled |
| Cache persistence | None | 24h | Survives refresh |
| Browser crash risk | High (1GB+ videos) | Low | Safe limits |
| Repeat video load | Fast (if in memory) | Fast (LRU or IndexedDB) | Same |
| Storage cleanup | Manual only | Auto 24h | Automatic |

---

## 🧪 Testing Plan

### Test 1: LRU Eviction
```javascript
// Simulate loading 400MB of videos
for (let i = 0; i < 40; i++) {
    const blob = new Blob([new ArrayBuffer(10 * 1024 * 1024)]); // 10MB each
    await videoCache.set(`test_${i}`, URL.createObjectURL(blob), blob.size);
}
// Expected: First 10 videos evicted, last 30 remain
```

### Test 2: IndexedDB Persistence
```javascript
// Load videos → Refresh page → Check if still cached
await preloadVideoToCache('test_id', 'test_url', 'videogen');
// Refresh page
const cached = await getCachedVideo('test_id');
// Expected: cached !== null (loaded from IndexedDB)
```

### Test 3: Auto-Clean Expired
```javascript
// Mock old entry
await cacheToDB('old_video', blob, { timestamp: Date.now() - 25 * 60 * 60 * 1000 });
await cleanExpiredCache();
const result = await getFromDB('old_video');
// Expected: result === null (cleaned)
```

---

## 📝 Code Locations

| Component | File | Line Range | Status |
|-----------|------|------------|--------|
| LRU Cache Class | main.html | After 834 | ⏳ Pending |
| IndexedDB Functions | main.html | After LRU | ⏳ Pending |
| Integration | main.html | 835-903 | ⏳ Pending |
| Auto-Clean Init | main.html | initializeApp() | ⏳ Pending |

---

## 🎯 Success Criteria

- [ ] LRU cache limits memory to 300MB
- [ ] Videos persist after page refresh (IndexedDB)
- [ ] Old videos (24h+) auto-delete
- [ ] No quota exceeded errors
- [ ] Existing features still work
- [ ] Console logs show cache stats

---

**Next Steps**:
1. ✅ Create this plan document
2. ⏳ Implement LRU Cache class
3. ⏳ Implement IndexedDB layer
4. ⏳ Add auto-clean logic
5. ⏳ Integrate with existing code
6. ⏳ Test and update docs

**Status**: 🚧 Ready to implement | **Version**: 2.8 | **Date**: October 26, 2025
