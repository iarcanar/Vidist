/**
 * VIDIST Utility Functions
 */

export function calculateWavespeedCost(duration, resolution, pricing) {
    if (!pricing || !pricing[resolution]) return 0;
    return pricing[resolution] * duration;
}

export function formatTime(seconds) {
    if (seconds < 60) return `${Math.floor(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${Math.floor(secs)}s`;
}

// Helper to validate base64 or URL
export function isValidImage(data) {
    if (!data) return false;
    if (data.startsWith('http')) return true;
    if (data.startsWith('data:image')) return true;
    return false;
}