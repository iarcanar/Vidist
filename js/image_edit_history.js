// ========== IMAGE EDIT HISTORY SYSTEM ==========
// Manages undo/redo functionality for edited images

// History state (persisted to localStorage)
let imageEditHistory = [];       // Store up to 2 images: [original, latest edited]
let currentHistoryIndex = -1;    // Current position in history
const MAX_HISTORY = 2;           // Maximum 2 images only: original + latest edited
const HISTORY_STORAGE_KEY = 'imageEditHistory';
const HISTORY_INDEX_KEY = 'imageEditHistoryIndex';

// Save history to localStorage (simplified - only 2 images max)
function saveHistoryToStorage() {
    try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(imageEditHistory));
        localStorage.setItem(HISTORY_INDEX_KEY, currentHistoryIndex.toString());
    } catch (e) {
        console.warn('⚠️ Could not save image history to localStorage:', e);
        // With max 2 images, quota should never be an issue
    }
}

// Load history from localStorage (after F5 - keep only current image)
function loadHistoryFromStorage() {
    try {
        const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
        const savedIndex = localStorage.getItem(HISTORY_INDEX_KEY);

        if (savedHistory) {
            const fullHistory = JSON.parse(savedHistory);
            const index = savedIndex ? parseInt(savedIndex) : 0;

            // ✨ v2.8.13: After F5 refresh, keep ONLY the current image (1 image)
            if (fullHistory.length > 0 && index >= 0 && index < fullHistory.length) {
                imageEditHistory = [fullHistory[index]]; // Keep only current viewing image
                currentHistoryIndex = 0; // Reset to index 0
                console.log('📂 Loaded current image only after refresh (1 image preserved)');
            } else {
                imageEditHistory = [];
                currentHistoryIndex = -1;
                console.log('📂 No valid history found after refresh');
            }
            return true;
        }
    } catch (e) {
        console.warn('⚠️ Could not load image history from localStorage:', e);
    }
    return false;
}

// Add image to history
function addToImageHistory(base64Data) {
    // If we're not at the end of history, remove everything after current position
    if (currentHistoryIndex < imageEditHistory.length - 1) {
        imageEditHistory = imageEditHistory.slice(0, currentHistoryIndex + 1);
    }

    // Add new image
    imageEditHistory.push(base64Data);

    // Limit to MAX_HISTORY images
    if (imageEditHistory.length > MAX_HISTORY) {
        imageEditHistory.shift(); // Remove oldest
    } else {
        currentHistoryIndex++;
    }

    saveHistoryToStorage();
    updateHistoryUI();
    console.log(`📸 Added to history (${imageEditHistory.length}/${MAX_HISTORY}), index: ${currentHistoryIndex}`);
}

// Navigate history (direction: -1 for prev, +1 for next)
function navigateImageHistory(direction) {
    const newIndex = currentHistoryIndex + direction;

    if (newIndex < 0 || newIndex >= imageEditHistory.length) {
        console.warn('Cannot navigate: out of bounds');
        return;
    }

    currentHistoryIndex = newIndex;
    const imageData = imageEditHistory[currentHistoryIndex];

    // Update UI
    window.imageBase64Data = imageData;
    document.getElementById('image-preview-left').src = imageData;

    // ✨ NEW: Dispatch custom event for index.html to sync local variable
    window.dispatchEvent(new CustomEvent('imageHistoryNavigated', {
        detail: { imageData: imageData, index: currentHistoryIndex }
    }));

    updateHistoryUI();

    // ✨ NEW: Also update modal image and navigation if modal is open
    const modalImage = document.getElementById('modal-image-full');
    const imageModal = document.getElementById('image-modal');
    if (modalImage && imageModal && !imageModal.classList.contains('hidden')) {
        // Modal is open - update the image
        modalImage.src = imageData;
    }

    if (typeof window.updateModalNavigationUI === 'function') {
        window.updateModalNavigationUI();
    }

    console.log(`🔄 Navigated to history index: ${currentHistoryIndex}/${imageEditHistory.length - 1}`);
}

// Update history navigation UI
function updateHistoryUI() {
    const navContainer = document.getElementById('edit-history-nav');
    const prevBtn = document.getElementById('history-prev-btn');
    const nextBtn = document.getElementById('history-next-btn');
    const statusText = document.getElementById('history-status');

    if (!navContainer || !prevBtn || !nextBtn || !statusText) return;

    // Show/hide navigation
    if (imageEditHistory.length > 0) {
        navContainer.classList.remove('hidden');

        // Update buttons state
        prevBtn.disabled = currentHistoryIndex <= 0;
        nextBtn.disabled = currentHistoryIndex >= imageEditHistory.length - 1;

        // Update status text
        if (imageEditHistory.length === 1) {
            statusText.textContent = 'Original';
        } else {
            const position = currentHistoryIndex + 1;
            statusText.textContent = `${position}/${imageEditHistory.length}`;
        }
    } else {
        navContainer.classList.add('hidden');
    }
}

// Clear history (manual clear only)
function clearImageHistory() {
    imageEditHistory = [];
    currentHistoryIndex = -1;
    saveHistoryToStorage();
    updateHistoryUI();
    console.log('🗑️ Image history cleared');
}

// Initialize history system
function initImageEditHistory() {
    // Load history from storage on init
    const loaded = loadHistoryFromStorage();
    if (loaded) {
        updateHistoryUI();
    }

    // Previous button
    document.getElementById('history-prev-btn')?.addEventListener('click', () => {
        navigateImageHistory(-1);
    });

    // Next button
    document.getElementById('history-next-btn')?.addEventListener('click', () => {
        navigateImageHistory(1);
    });

    console.log('✅ Image Edit History initialized (max: 2 images - original + latest edited)');
}

// Get current state (for checking if history is empty)
function getHistoryState() {
    return imageEditHistory;
}

// Get current history index
function getCurrentIndex() {
    return currentHistoryIndex;
}

// Export functions for use in main.html
if (typeof window !== 'undefined') {
    window.imageEditHistory = {
        add: addToImageHistory,
        navigate: navigateImageHistory,
        clear: clearImageHistory,
        init: initImageEditHistory,
        updateUI: updateHistoryUI,
        getState: getHistoryState,
        getCurrentIndex: getCurrentIndex
    };
}
