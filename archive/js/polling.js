/**
 * VIDIST - Unified Polling System
 * Handles status polling for Wavespeed API
 */

import { POLLING_CONFIG } from './config.js';
import { pollWavespeedStatus } from './api-wavespeed.js';

// Polling state
let pollingInterval = null;
let timerInterval = null;
let currentPollCount = 0;
let currentElapsedSeconds = 0;

/**
 * Start polling for generation status
 * @param {Object} options - Polling options
 * @param {string} options.apiKey - API key
 * @param {string} options.pollingUrl - Polling URL
 * @param {string} options.provider - Provider ('videogen' or 'wavespeed')
 * @param {string} options.generationId - Generation ID
 * @param {Object} callbacks - Event callbacks
 */
export function startPolling(options, callbacks) {
    const {
        apiKey,
        pollingUrl,
        provider,
        generationId
    } = options;

    // Validation
    if (!apiKey || !pollingUrl || !provider) {
        const error = new Error('Missing required polling parameters');
        console.error('Polling validation failed:', { apiKey: !!apiKey, pollingUrl, provider });
        if (callbacks.onError) callbacks.onError(error);
        return;
    }

    console.log('Starting polling:', { provider, generationId, pollingUrl });

    // Clear any existing intervals
    stopPolling();

    // Reset counters
    currentPollCount = 0;
    currentElapsedSeconds = 0;

    // Start timer (updates UI every second)
    timerInterval = setInterval(() => {
        currentElapsedSeconds++;

        if (callbacks.onTimeUpdate) {
            callbacks.onTimeUpdate(currentElapsedSeconds);
        }

        // Check timeout
        if (currentElapsedSeconds >= POLLING_CONFIG.MAX_TIMEOUT) {
            console.warn(`Polling timeout after ${POLLING_CONFIG.MAX_TIMEOUT}s`);
            if (callbacks.onTimeout) {
                callbacks.onTimeout(POLLING_CONFIG.MAX_TIMEOUT);
            }
            stopPolling();
        }
    }, POLLING_CONFIG.TIMER_INTERVAL);

    // Start poller (checks status every 5 seconds)
    pollingInterval = setInterval(async () => {
        currentPollCount++;

        // Check max poll count
        if (currentPollCount > POLLING_CONFIG.MAX_POLL_COUNT) {
            console.warn(`Max poll count exceeded (${POLLING_CONFIG.MAX_POLL_COUNT})`);
            if (callbacks.onMaxAttempts) {
                callbacks.onMaxAttempts(POLLING_CONFIG.MAX_POLL_COUNT);
            }
            stopPolling();
            return;
        }

        try {
            console.log(`Polling ${provider} (attempt ${currentPollCount}): ${pollingUrl}`);

            // Call polling function for Wavespeed
            let statusData;
            if (provider === 'wavespeed') {
                statusData = await pollWavespeedStatus(apiKey, pollingUrl);
            } else {
                throw new Error(`Unknown provider: ${provider}`);
            }

            // Call status update callback
            if (callbacks.onStatusUpdate) {
                callbacks.onStatusUpdate(statusData, currentElapsedSeconds);
            }

            // Check for completion
            if (statusData.status === 'completed' || statusData.status === 'succeeded') {
                console.log('Generation completed successfully');
                if (callbacks.onSuccess) {
                    callbacks.onSuccess(statusData, currentElapsedSeconds);
                }
                stopPolling();
            }
            // Check for failure
            else if (statusData.status === 'failed' || statusData.status === 'canceled') {
                const error = new Error(statusData.error || `Generation ${statusData.status}`);
                console.error('Generation failed:', error);
                if (callbacks.onError) {
                    callbacks.onError(error);
                }
                stopPolling();
            }
            // Continue polling for pending/in_progress/processing states

        } catch (error) {
            console.error('Polling error:', error);

            // Handle critical errors (404 = task not found)
            if (error.message.includes('not found') || error.message.includes('expired')) {
                if (callbacks.onError) {
                    callbacks.onError(error);
                }
                stopPolling();
            } else {
                // Non-critical error - continue polling but notify
                if (callbacks.onPollError) {
                    callbacks.onPollError(error);
                }
                // Don't stop polling on network errors
            }
        }
    }, POLLING_CONFIG.POLL_INTERVAL);
}

/**
 * Stop all polling and timer intervals
 */
export function stopPolling() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }

    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    currentPollCount = 0;
    currentElapsedSeconds = 0;

    console.log('Polling stopped');
}

/**
 * Check if currently polling
 * @returns {boolean} True if polling is active
 */
export function isPolling() {
    return pollingInterval !== null;
}

/**
 * Get current polling stats
 * @returns {Object} Current stats
 */
export function getPollingStats() {
    return {
        isActive: isPolling(),
        pollCount: currentPollCount,
        elapsedSeconds: currentElapsedSeconds,
        maxPollCount: POLLING_CONFIG.MAX_POLL_COUNT,
        maxTimeout: POLLING_CONFIG.MAX_TIMEOUT
    };
}

export default {
    startPolling,
    stopPolling,
    isPolling,
    getPollingStats
};
