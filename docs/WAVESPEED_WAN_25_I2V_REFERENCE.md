# WaveSpeed Wan 2.5 Image-to-Video API Reference
**Last Updated:** 2026-02-13
**Status:** ✅ Verified - Vidist implementation is 100% accurate

---

## API Endpoint

```
POST https://api.wavespeed.ai/api/v3/alibaba/wan-2.5/image-to-video
GET https://api.wavespeed.ai/api/v3/predictions/{requestId}/result
```

---

## Request Parameters

| Parameter | Type | Required | Default | Range/Values | Description |
|-----------|------|----------|---------|--------------|-------------|
| `image` | string | **Yes** | — | base64 | Input image for video generation |
| `prompt` | string | **Yes** | — | — | Positive prompt describing desired output |
| `negative_prompt` | string | No | — | — | Negative prompt to exclude unwanted elements |
| `resolution` | string | No | `720p` | `480p`, `720p`, `1080p` | Output video resolution |
| `duration` | integer | No | `5` | 3–10 seconds | Video length in seconds |
| `enable_prompt_expansion` | boolean | No | `false` | true/false | Activates prompt optimization |
| `seed` | integer | No | `-1` | -1 to 2147483647 | Random seed; -1 generates random |
| `audio` | string | No | — | URL | Optional audio URL to guide video |

---

## Pricing (Per Second)

| Resolution | Price per Second | Example: 5s | Example: 10s |
|------------|------------------|-------------|--------------|
| **480p** | $0.05/s | $0.25 | $0.50 |
| **720p** | $0.10/s | $0.50 | $1.00 |
| **1080p** | $0.15/s | $0.75 | $1.50 |

**Cost Calculation:** `price = pricing[resolution] × duration`

---

## Audio Constraints

| Constraint | Specification |
|------------|---------------|
| **Formats** | WAV, MP3 |
| **Duration** | 3–30 seconds |
| **File Size** | ≤ 15 MB |
| **Behavior** | Audio exceeding video duration is trimmed; shorter audio results in silent padding |

---

## Response Format

### Success (Status Check)
```json
{
  "code": 200,
  "data": {
    "id": "task_abc123",
    "status": "completed",
    "outputs": [
      "https://cdn.wavespeed.ai/videos/output.mp4"
    ],
    "model": "alibaba/wan-2.5/image-to-video",
    "urls": {
      "get": "https://api.wavespeed.ai/api/v3/predictions/task_abc123/result"
    },
    "has_nsfw_contents": [false]
  }
}
```

### Status Values
- `created` - Task created
- `pending` - Waiting in queue
- `in_queue` - Queued for processing
- `in_progress` / `processing` - Currently generating
- `completed` / `succeeded` - Finished successfully
- `failed` - Generation failed
- `canceled` - User cancelled

---

## Vidist Implementation

### Config Location
**File:** [js/config.js:13-34](../js/config.js#L13-L34)

```javascript
"ws-wan-25-i2v": {
    provider: 'wavespeed',
    name: 'Wan 2.5 I2V',
    internal_id: 'alibaba/wan-2.5/image-to-video',
    durationMode: 'range',
    minDuration: 3,
    maxDuration: 10,
    maxResolution: "1080p",
    supportedResolutions: ["480p", "720p", "1080p"],
    supportsAudio: true,
    features: ["i2v"],
    supportsNegativePrompt: true,
    supportsShotType: false,
    supportsExpansion: true,
    pricing: {
        '480p': 0.05,
        '720p': 0.10,
        '1080p': 0.15
    }
}
```

### Request Assembly
**File:** [index.html:6762-6838](../index.html#L6762-L6838)

```javascript
const body = {
    prompt: string,
    duration: number,
    resolution: string,
    seed: -1,
    image: base64String,  // Data URI prefix stripped
    // Optional parameters:
    negative_prompt: string,
    audio: urlString,
    enable_prompt_expansion: boolean
};
```

### Cost Calculation
**File:** [index.html:5901-5929](../index.html#L5901-L5929)

```javascript
const duration = parseInt(durationSelectWavespeed.value);
const resolution = resolutionSelect.value;
const rate = config.pricing[resolution];
const cost = rate * duration;
```

---

## Verification Summary

| Component | Docs | Vidist | Status |
|-----------|------|--------|--------|
| Endpoint URL | ✓ | ✓ | ✅ MATCH |
| All 8 Parameters | ✓ | ✓ | ✅ MATCH |
| Resolution Options | 480p/720p/1080p | 480p/720p/1080p | ✅ MATCH |
| Duration Range | 3-10s | 3-10s | ✅ MATCH |
| Pricing (3 levels) | ✓ | ✓ | ✅ MATCH |
| Cost Formula | per-second × duration | per-second × duration | ✅ MATCH |

**Result:** 100% accurate implementation ✅

---

## Notes

1. **UI Default vs API Default**
   - Vidist UI defaults to 480p (budget-friendly)
   - API defaults to 720p (balanced quality)
   - No impact: Vidist always sends explicit resolution value

2. **Seed Customization**
   - Currently hardcoded to `-1` (random)
   - Users cannot set custom seed from UI
   - Future enhancement: Add seed input for reproducible results

3. **Audio Validation**
   - Format/size/duration constraints shown in UI placeholder
   - No client-side validation (relies on API error handling)
   - Works correctly: API returns clear errors for invalid audio

---

## Related Models

- **Wan 2.5 Video Extend:** [alibaba/wan-2.5/video-extend](./WAVESPEED_WAN_25_EXTEND_REFERENCE.md)
- **Wan 2.6 I2V:** Different duration mode (fixed 5/10/15s only)
- **Wan 2.6 Flash:** Lower pricing ($0.025-$0.0375/s) with audio toggle

---

## Official Documentation
- **WaveSpeed Docs:** https://wavespeed.ai/docs/docs-api/alibaba/alibaba-wan-2.5-image-to-video
- **API Version:** v3
- **Model Provider:** Alibaba DashScope
