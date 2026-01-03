# Wavespeed API Reference (V3)

Technical documentation for the Wavespeed AI Video Generation API used in VIDIST.

---

## 🔗 Endpoints

### 1. Create Prediction (T2V/I2V)
**POST** `https://api.wavespeed.ai/api/v3/{model_id}`

**Headers:**
- `Authorization: Bearer {API_KEY}`
- `Content-Type: application/json`

**Example Payload (Wan 2.6 I2V):**
```json
{
  "prompt": "Cinematic shot of a drone flying over neo-tokyo",
  "image": "iVBORw0KGgoAAAANSU...", 
  "duration": 5,
  "resolution": "1080p",
  "negative_prompt": "blurry, low quality",
  "shot_type": "multi-shot",
  "expand_prompt": true
}
```

> [!IMPORTANT]
> **Base64 Encoding**: The `image` string MUST NOT include the "data:image/..." prefix. Use `canvas.toDataURL().split(',')[1]`.

---

### 2. Check Status (Polling)
**GET** `https://api.wavespeed.ai/api/v3/predictions/{id}/result`

**Response (In Progress):**
```json
{
  "code": 200,
  "data": { "status": "processing" }
}
```

**Response (Succeeded):**
```json
{
  "code": 200,
  "data": {
    "status": "succeeded",
    "outputs": ["https://s3.wavespeed.io/outputs/video.mp4"],
    "timings": { "inference": 45000 }
  }
}
```

---

### 3. Check Balance
**GET** `https://api.wavespeed.ai/api/v3/balance`

**Response:**
```json
{
  "code": 200,
  "data": { "balance": 150.50 }
}
```

---

## 🏗️ Model Features Matrix

| Model Key | Feature | Value |
|-----------|---------|-------|
| `ws-wan-25-i2v` | Duration | 3-10s (Range) |
| `ws-wan-26-i2v` | Duration | 5, 10, 15s (Fixed) |
| `ws-wan-26-i2v` | Shot Type | single-shot, multi-shot |
| `ws-kling-o1-i2v`| Last Image | Supported in `last_image` field |

---

## ⚠️ Known Quirks & Limitations

### API Behavior
1. **Processing Units**: Wavespeed returns timings in **milliseconds**. Divide by 1000 for seconds.
2. **Direct URLs**: Video outputs are direct S3/CDN links. No authentication header is needed to play them.
3. **Task ID**: Polling URL is usually provided in the initial creation response under `data.urls.get`.

### 🔴 CRITICAL: Input Parameters Not Returned in Polling Response

**Issue:** The polling endpoint (`GET /api/v3/predictions/{id}/result`) does **NOT** return the input parameters that were sent in the creation request.

**Affected Fields:**
- ❌ `prompt` - User input text
- ❌ `negative_prompt` - Negative prompt
- ❌ `duration` - Video duration
- ❌ `resolution` - Output resolution
- ❌ `shot_type` - Camera shot type
- ❌ Model configuration parameters

**What IS Returned:**
```json
{
  "status": "succeeded",
  "outputs": ["https://s3.wavespeed.io/...video.mp4"],
  "timings": { "inference": 45000 }
}
```

**Impact on VIDIST:**
- History cannot display the original prompt/settings without storing them separately
- Users see "No prompt available", "?s", "N/A" in History panel

**Workaround in VIDIST:**
We implemented a **Task Input Map System** that:
1. Captures all input parameters when task is created
2. Stores them in `localStorage` with the task ID as key
3. Uses saved data when displaying History instead of relying on API
4. Provides fallback chain: saved input → API data → defaults

**See:** DEVELOPMENT.md → "Task Input Map System" section for implementation details.

### Example Data Flow

**Creation Request** → API creates task
```json
POST /api/v3/ws-wan-26-i2v
{
  "prompt": "Cinematic drone shot over neon city",
  "duration": 10,
  "resolution": "1080p",
  "shot_type": "multi-shot"
}
↓
Response: { "data": { "id": "pred_xyz123", "urls": { "get": "..." } } }
```

**Polling Response** → Data is lost!
```json
GET /api/v3/predictions/pred_xyz123/result
↓
Response: {
  "data": {
    "status": "succeeded",
    "outputs": ["https://..."],
    "timings": { "inference": 45000 }
    // ❌ NO input parameters!
  }
}
```

**VIDIST Solution** → Task Input Map saves it:
```javascript
saveTaskInput('pred_xyz123', {
    prompt: 'Cinematic drone shot over neon city',
    duration: 10,
    resolution: '1080p',
    shotType: 'multi-shot'
});
// Later when displaying History:
const savedInput = getTaskInput('pred_xyz123');
displayPrompt(savedInput.prompt); // ✅ Shows saved prompt
```

---

*Reference Build: 12212025*
