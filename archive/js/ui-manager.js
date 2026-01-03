/**
 * VIDIST - UI Manager (Wavespeed Only)
 */

import { MODEL_CONFIG } from './config.js';
import { calculateWavespeedCost } from './utils.js';

export function updateUIForModel(modelKey, elements) {
    const config = MODEL_CONFIG[modelKey];
    if (!config) return;

    // 1. Update Resolution Options
    // Wan 2.5 (มี 480p) vs Wan 2.6 (เริ่ม 720p)
    const resSelect = elements.resolutionSelect;
    const currentRes = resSelect.value;
    resSelect.innerHTML = config.supportedResolutions.map(r => 
        `<option value="${r}">${r}</option>`
    ).join('');
    
    // พยายามคงค่าเดิมไว้ ถ้าไม่มีให้เลือกค่าแรก
    if (config.supportedResolutions.includes(currentRes)) {
        resSelect.value = currentRes;
    } else {
        resSelect.value = config.supportedResolutions[0]; // Default to first available
    }

    // 2. Update Duration Options
    const durSelect = elements.durationSelect;
    durSelect.innerHTML = '';
    
    if (config.durationMode === 'fixed') {
        // Wan 2.6: 5, 10, 15
        config.allowedDurations.forEach(d => {
            durSelect.add(new Option(`${d} Seconds`, d));
        });
    } else {
        // Wan 2.5: 3-10 Range
        for (let i = config.minDuration; i <= config.maxDuration; i++) {
            durSelect.add(new Option(`${i} Seconds`, i));
        }
        // Set default to 5s if available
        durSelect.value = 5; 
    }

    // 3. Show/Hide Wan 2.6 Specifics
    const wan26Settings = document.getElementById('wan26-settings');
    if (wan26Settings) {
        // Show only if supportsShotType is true (Wan 2.6)
        wan26Settings.classList.toggle('hidden', !config.supportsShotType);
    }

    // 4. Update Cost
    updateCostDisplay(config, elements);
}

export function updateCostDisplay(config, elements) {
    const { durationSelect, resolutionSelect, costDisplay } = elements;
    const duration = parseInt(durationSelect.value) || 5;
    const resolution = resolutionSelect.value;
    
    const cost = calculateWavespeedCost(duration, resolution, config.pricing);
    costDisplay.textContent = `$${cost.toFixed(2)}`;
}