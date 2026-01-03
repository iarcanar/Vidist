# 📋 แผนการปรับปรุง: Intensity Level System สำหรับ Prompt Craft

> **เป้าหมาย:** เพิ่มระบบควบคุมความเข้มข้น (Intensity Level) 3 ระดับให้กับ Prompt Craft เพื่อให้ผู้ใช้เลือกระดับ NSFW content ได้ตามต้องการ

---

## 🎯 ภาพรวม

### 3 ระดับความเข้มข้น

1. **Level 1: Tease & Allure (ยั่ว/โชว์)**
   - Focus: ความสวยงาม, ท่าโพส, สายตา, การขยับเสื้อผ้าเล็กน้อย
   - ห้าม: แก้ผ้าหมด, การสอดใส่, น้ำแตก
   - Vibe: Softcore, Artistic, Gravure

2. **Level 2: Sensual Action (ช่วยตัวเอง)**
   - Focus: การสัมผัส, บดเบียด, หายใจแรง, เหงื่อ
   - อนุญาต: แก้ผ้า, ท่าทางช่วยตัวเอง
   - Vibe: Erotic, R-18, Soft-Action

3. **Level 3: Hardcore Climax (จัดเต็ม)**
   - Focus: Physics ของเหลว, การเกร็ง, การสอดใส่รุนแรง
   - บังคับ: ต้องจบด้วย Climax เสมอ
   - Vibe: Hardcore, Pornographic, Cumshot

### Dialog & Sound Effect ตาม Level

- **Level 1:** เสียงหายใจเบา, คำพูดเชิญชวน, หัวเราะคิกคัก
  - Ex: "Hmm... do you like this view?"

- **Level 2:** เสียงครางในลำคอ, หอบหายใจ, บอกความรู้สึกเสียว
  - Ex: "อื้ออ... (pant pant) เสียวจัง..."

- **Level 3:** เสียงครางดัง/ตะโกน, เสียงเนื้อกระทบ, คำหยาบ, พูดไม่รู้เรื่อง
  - Ex: "อ๊าาา! แตก... จะแตกแล้ว! (scream)"

---

## 📁 ไฟล์ที่ต้องแก้ไข

1. **d:\for_back_home2026\Vidist\main.html**
   - เพิ่ม UI Controls สำหรับ Intensity Level Selector
   - เพิ่ม CSS Styles
   - เพิ่ม Event Listeners

2. **d:\for_back_home2026\Vidist\js\prompt_craft.js**
   - เพิ่ม Method `getRedModePrompt(level)`
   - ปรับ `generatePrompt()` รับ parameter `intensityLevel`
   - เพิ่ม State Management สำหรับ intensity level
   - ปรับ `handleGenerate()` อ่านค่า intensity level จาก UI

---

## 🎨 PART 1: UI Changes (main.html)

### 1.1 เพิ่ม HTML Structure

**ตำแหน่ง:** หลังบรรทัด 1095 (หลัง Red Mode Toggle, ก่อน Craft Input Textarea)

```html
<!-- Intensity Level Selector (Red Mode Only) -->
<div id="intensity-level-selector" class="hidden mb-3">
    <div class="flex items-center gap-2 mb-2">
        <span class="text-xs text-gray-400 uppercase tracking-wide font-semibold">Intensity Level:</span>
        <span class="text-[10px] text-gray-500">(Red Mode only)</span>
    </div>
    <div class="grid grid-cols-3 gap-2">
        <!-- Level 1: Tease & Allure -->
        <label class="intensity-btn cursor-pointer">
            <input type="radio" name="intensity-level" value="1" class="hidden intensity-radio">
            <div class="intensity-label flex flex-col items-center py-2 px-3 rounded-lg border border-purple-500/30 bg-purple-500/5 transition-all hover:border-purple-500/50">
                <span class="text-xs font-bold text-purple-300">Level 1</span>
                <span class="text-[10px] text-gray-400 text-center mt-0.5">Tease & Allure</span>
                <span class="text-[9px] text-gray-500 text-center mt-0.5">ยั่ว/โชว์</span>
            </div>
        </label>

        <!-- Level 2: Sensual Action -->
        <label class="intensity-btn cursor-pointer">
            <input type="radio" name="intensity-level" value="2" class="hidden intensity-radio">
            <div class="intensity-label flex flex-col items-center py-2 px-3 rounded-lg border border-purple-500/30 bg-purple-500/5 transition-all hover:border-purple-500/50">
                <span class="text-xs font-bold text-purple-300">Level 2</span>
                <span class="text-[10px] text-gray-400 text-center mt-0.5">Sensual Action</span>
                <span class="text-[9px] text-gray-500 text-center mt-0.5">ช่วยตัวเอง</span>
            </div>
        </label>

        <!-- Level 3: Hardcore Climax (Default) -->
        <label class="intensity-btn cursor-pointer">
            <input type="radio" name="intensity-level" value="3" class="hidden intensity-radio" checked>
            <div class="intensity-label flex flex-col items-center py-2 px-3 rounded-lg border border-purple-500/30 bg-purple-500/5 transition-all hover:border-purple-500/50">
                <span class="text-xs font-bold text-purple-300">Level 3</span>
                <span class="text-[10px] text-gray-400 text-center mt-0.5">Hardcore Climax</span>
                <span class="text-[9px] text-gray-500 text-center mt-0.5">จัดเต็ม</span>
            </div>
        </label>
    </div>
</div>
```

### 1.2 เพิ่ม CSS Styles

**ตำแหน่ง:** ในส่วน `<style>` (หลัง Red Mode Toggle styles, ประมาณบรรทัด 810)

```css
/* ========== Intensity Level Selector Styles ========== */
.intensity-btn {
    display: block;
}

.intensity-label {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Default State */
.intensity-btn .intensity-label {
    border-color: rgba(168, 85, 247, 0.3);
    background: rgba(168, 85, 247, 0.05);
}

/* Hover State */
.intensity-btn:hover .intensity-label {
    border-color: rgba(168, 85, 247, 0.5);
    background: rgba(168, 85, 247, 0.1);
}

/* Checked State */
.intensity-btn input:checked + .intensity-label {
    background: rgba(168, 85, 247, 0.25);
    border-color: rgba(168, 85, 247, 0.8);
    box-shadow: 0 0 8px rgba(168, 85, 247, 0.4), inset 0 0 8px rgba(168, 85, 247, 0.15);
}

/* Checked + Hover State */
.intensity-btn input:checked + .intensity-label:hover {
    box-shadow: 0 0 12px rgba(168, 85, 247, 0.6), inset 0 0 10px rgba(168, 85, 247, 0.2);
}

/* Active/Click State */
.intensity-btn:active .intensity-label {
    transform: scale(0.98);
}

/* Text glow effect on checked */
.intensity-btn input:checked + .intensity-label span {
    text-shadow: 0 0 4px rgba(168, 85, 247, 0.5);
}
```

### 1.3 เพิ่ม JavaScript - Show/Hide Logic

**ตำแหน่ง:** ใน `initPromptCraft()` function (ประมาณบรรทัด 5846)

```javascript
// Initialize Red Mode Toggle
const redModeToggle = new RedModeToggle('red-mode-toggle-container', (enabled) => {
    // Callback: Update controller state when toggle changes
    if (promptCraftController && typeof promptCraftController.onRedModeChange === 'function') {
        promptCraftController.onRedModeChange(enabled);
    }

    // ========== NEW: Show/Hide Intensity Level Selector ==========
    const intensitySelector = document.getElementById('intensity-level-selector');
    if (intensitySelector) {
        if (enabled) {
            // Red Mode ON → Show selector
            intensitySelector.classList.remove('hidden');
        } else {
            // Creative Mode ON → Hide selector
            intensitySelector.classList.add('hidden');
        }
    }
});

// ========== NEW: Load initial Red Mode state and show/hide selector ==========
const savedRedMode = localStorage.getItem('red_mode_enabled');
const isRedModeEnabled = savedRedMode === 'true';
const intensitySelector = document.getElementById('intensity-level-selector');
if (intensitySelector && isRedModeEnabled) {
    intensitySelector.classList.remove('hidden');
}
```

---

## 💻 PART 2: Code Changes (prompt_craft.js)

### 2.1 เพิ่ม Method `getRedModePrompt(level)` ใน GeminiClient Class

**ตำแหน่ง:** ใน GeminiClient class, หลัง constructor (ประมาณบรรทัด 410)

```javascript
// ========== NEW: Get Red Mode System Prompt based on Intensity Level ==========
getRedModePrompt(level) {
    const baseRules = `You are a video prompt engineer for WAN 2.5. Output ONLY the prompt paragraph.`;

    // กำหนด Rules ตาม Level
    const levelRules = {
        1: `
        LEVEL: TEASE & ALLURE (Soft)
        - Focus on: Posing, eye contact, facial expressions, slight clothing movement.
        - FORBIDDEN: Full nudity (unless specified), penetration, fluids/cum, orgasm.
        - ENDING: Sustain the pose or a cute smile.
        - DIALOG STYLE: Soft, inviting, playful.
        Example: "Hmm... do you like this view?"
        `,
        2: `
        LEVEL: SENSUAL ACTION (Erotic)
        - Focus on: Rubbing, touching sensitive areas, heavy breathing, sweat on skin.
        - ALLOWED: Partial nudity, masturbation simulation through clothes or direct touch.
        - FORBIDDEN: Extreme climax/squirting (unless specified).
        - ENDING: High arousal state, biting lip, or body arching.
        - DIALOG STYLE: Moans, panting, sensual complaints.
        Example: "อื้ออ... (pant pant) เสียวจัง..."
        `,
        3: `
        LEVEL: HARDCORE CLIMAX (Explicit)
        - Focus on: Penetration details, fluid physics (wetness/cum), muscle spasms.
        - REQUIREMENT: Must include explicit genitalia description.
        - ENDING: MANDATORY CLIMAX SEQUENCE (Orgasm/Cumshot).
        - DIALOG STYLE: Loud moans, begging, dirty talk, screaming.
        Example: "อ๊aaaา! แตก... จะแตกแล้ว! (scream)"
        `
    };

    return `${baseRules}

    CURRENT INTENSITY LEVEL: ${level}
    ${levelRules[level]}

    PROMPT STRUCTURE (MUST FOLLOW THIS ORDER):
    1. SETUP: Lighting & Subject.
    2. ACTION: Describe action matching Level ${level} intensity.
    3. ENDING: Conclude according to Level ${level} rules.
    4. DIALOG: Add a specific field at the very end formatted EXACTLY like this:
       "Dialog & Sound effect" : "insert text here"

    CRITICAL RULES:
    - Output ONLY the final video prompt - absolutely NO explanations or headers.
    - Write as a single flowing paragraph with clear progression.
    - Use DIRECT and EXPLICIT terms appropriate for Level ${level}.

    INPUT:`;
}
```

### 2.2 ปรับ `generatePrompt()` Method

**ตำแหน่ง:** แก้ไข method `generatePrompt()` ใน GeminiClient class (บรรทัด 413)

**เปลี่ยนจาก:**
```javascript
async generatePrompt(userDescription, imageBase64, redModeEnabled = false) {
    // ...
    const systemPrompt = redModeEnabled
        ? WAN_25_SYSTEM_PROMPT           // Red Mode: NSFW-oriented
        : CREATIVE_MODE_SYSTEM_PROMPT;   // Creative Mode: Cinematic/Professional
    // ...
}
```

**เป็น:**
```javascript
async generatePrompt(userDescription, imageBase64, redModeEnabled = false, intensityLevel = 3) {
    if (!this.apiKey) {
        throw new Error('Gemini API key not configured');
    }

    if (!imageBase64) {
        throw new Error('No image provided');
    }

    // Select system prompt based on mode and intensity level
    let systemPrompt;
    if (redModeEnabled) {
        // Red Mode: Use intensity-based prompt
        systemPrompt = this.getRedModePrompt(intensityLevel);
        console.log(`🎚️ Red Mode with Intensity Level ${intensityLevel}`);
    } else {
        // Creative Mode: Use standard cinematic prompt
        systemPrompt = CREATIVE_MODE_SYSTEM_PROMPT;
    }

    // ... (rest of the function remains the same)
}
```

### 2.3 เพิ่ม Intensity Level State Management

**ตำแหน่ง:** ใน PromptCraftState class (บรรทัด 276)

**เพิ่มใน constructor:**
```javascript
constructor() {
    this.promptUndoStack = [];
    this.craftInputUndoStack = [];
    this.apiKey = null;
    this.isProcessing = false;
    this.redModeEnabled = false;
    this.intensityLevel = 3;  // ========== NEW: Default intensity level ==========
}
```

**เพิ่ม methods ใหม่:**
```javascript
// ========== NEW: Intensity Level Management ==========
setIntensityLevel(level) {
    this.intensityLevel = level;
    localStorage.setItem('intensity_level', level.toString());
    console.log(`🎚️ Intensity Level set to: ${level}`);
}

getIntensityLevel() {
    return this.intensityLevel;
}
```

**เพิ่มใน init() method:**
```javascript
init() {
    // ... (existing code)

    // Load Red Mode state from localStorage
    const savedRedMode = localStorage.getItem('red_mode_enabled');
    this.redModeEnabled = savedRedMode === 'true';
    console.log('🎨 Red Mode loaded:', this.redModeEnabled ? 'ENABLED (NSFW)' : 'DISABLED (Creative)');

    // ========== NEW: Load Intensity Level from localStorage ==========
    const savedIntensity = localStorage.getItem('intensity_level');
    if (savedIntensity) {
        this.intensityLevel = parseInt(savedIntensity);
        console.log(`🎚️ Intensity Level loaded: ${this.intensityLevel}`);
    } else {
        this.intensityLevel = 3; // Default to level 3
    }
}
```

### 2.4 ปรับ `handleGenerate()` ใน PromptCraftController

**ตำแหน่ง:** ใน handleGenerate() method (บรรทัด 834)

**เพิ่มการอ่านค่า intensity level จาก UI:**
```javascript
async handleGenerate() {
    const userInput = this.elements.descriptionInput?.value?.trim();

    // ... (existing validation code)

    // ========== NEW: Read Intensity Level from UI ==========
    const intensityRadio = document.querySelector('input[name="intensity-level"]:checked');
    const intensityLevel = intensityRadio ? parseInt(intensityRadio.value) : 3;

    // Save intensity level to state
    this.state.setIntensityLevel(intensityLevel);

    // Get Red Mode state
    const redModeEnabled = this.state.isRedModeEnabled();
    const modeLabel = redModeEnabled ? `🔴 RED MODE (NSFW) - Level ${intensityLevel}` : '🎨 CREATIVE MODE (Safe)';

    try {
        // ... (existing code)

        // Call Gemini API with intensity level
        console.log(`🚀 Generating with ${modeLabel} using Gemini 2.0 Flash...`);
        const [promptResult, negativeResult] = await Promise.allSettled([
            this.client.generatePrompt(userInput, base64Image, redModeEnabled, intensityLevel),  // ========== NEW: Pass intensityLevel ==========
            this.client.generateNegativePrompt(userInput, base64Image, redModeEnabled)
        ]);

        // ... (rest of the function remains the same)
    } catch (error) {
        // ... (existing error handling)
    }
}
```

### 2.5 เพิ่ม Event Listener สำหรับ Intensity Selector

**ตำแหน่ง:** ใน setupEventListeners() method (บรรทัด 733)

```javascript
setupEventListeners() {
    // ... (existing event listeners)

    // ========== NEW: Intensity Level Radio Buttons ==========
    const intensityRadios = document.querySelectorAll('input[name="intensity-level"]');
    intensityRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const level = parseInt(e.target.value);
            this.state.setIntensityLevel(level);

            // Visual feedback
            const levelNames = {
                1: 'Tease & Allure',
                2: 'Sensual Action',
                3: 'Hardcore Climax'
            };
            this.showStatus(`🎚️ Intensity: ${levelNames[level]}`, 2000);
        });
    });

    // ========== NEW: Load saved intensity level and update UI ==========
    const savedLevel = this.state.getIntensityLevel();
    const savedRadio = document.querySelector(`input[name="intensity-level"][value="${savedLevel}"]`);
    if (savedRadio) {
        savedRadio.checked = true;
    }
}
```

---

## 🔍 สรุปการเปลี่ยนแปลง

### ไฟล์ที่แก้ไข

| ไฟล์ | การเปลี่ยนแปลง | บรรทัดที่แก้ |
|------|----------------|-------------|
| **main.html** | เพิ่ม HTML structure สำหรับ Intensity Selector | หลัง 1095 |
| | เพิ่ม CSS styles | หลัง 810 |
| | เพิ่ม Show/Hide logic | ประมาณ 5884-5905 |
| **prompt_craft.js** | เพิ่ม `getRedModePrompt(level)` method | หลัง 410 |
| | ปรับ `generatePrompt()` รับ intensityLevel | 413 |
| | เพิ่ม intensity state management | 276-320 |
| | ปรับ `handleGenerate()` | 834 |
| | เพิ่ม event listeners | 733 |

### Features ใหม่

✅ **3 Intensity Levels:**
- Level 1: Tease & Allure (Soft)
- Level 2: Sensual Action (Erotic)
- Level 3: Hardcore Climax (Explicit)

✅ **UI Controls:**
- Segmented control แบบ 3 ตัวเลือก
- แสดง/ซ่อนอัตโนมัติตาม Red Mode state
- Visual feedback ชัดเจน

✅ **State Persistence:**
- บันทึก intensity level ลง localStorage
- โหลดค่ากลับมาเมื่อ refresh

✅ **Backward Compatible:**
- Default = Level 3 (เหมือนเดิม)
- ไม่กระทบ Creative Mode

---

## 🧪 การทดสอบ

### Test Cases

1. **UI Visibility**
   - [ ] เปิด Red Mode → Intensity Selector แสดง
   - [ ] ปิด Red Mode → Intensity Selector ซ่อน
   - [ ] Refresh หน้า → ค่าที่เลือกไว้ยังคงอยู่

2. **Level Selection**
   - [ ] เลือก Level 1 → บันทึกลง localStorage
   - [ ] เลือก Level 2 → บันทึกลง localStorage
   - [ ] เลือก Level 3 → บันทึกลง localStorage
   - [ ] เปลี่ยน Level → แสดง status message

3. **Prompt Generation**
   - [ ] Level 1 + Craft → ได้ prompt แบบ Soft (ไม่มี climax)
   - [ ] Level 2 + Craft → ได้ prompt แบบ Erotic (มี arousal)
   - [ ] Level 3 + Craft → ได้ prompt แบบ Hardcore (มี climax)

4. **Dialog & Sound Effects**
   - [ ] Level 1 → Dialog เบาๆ เชิญชวน
   - [ ] Level 2 → Dialog ครางเบา หอบหายใจ
   - [ ] Level 3 → Dialog ครางดัง dirty talk

5. **Backward Compatibility**
   - [ ] Creative Mode ทำงานปกติ (ไม่กระทบ)
   - [ ] Red Mode โดยไม่เลือก level → ใช้ Level 3 default
   - [ ] ไม่มี localStorage → ใช้ Level 3 default

---

## 📌 หมายเหตุสำหรับผู้พัฒนา

1. **Default Value:**
   - Intensity Level default = 3 (Hardcore) เพื่อ backward compatibility
   - ผู้ใช้เก่าจะไม่เห็นความต่างจากเดิม

2. **Visual Design:**
   - ใช้ Purple theme เหมือน Prompt Craft section
   - Segmented control ดู modern และใช้งานง่าย

3. **State Management:**
   - ใช้ localStorage เก็บ intensity_level
   - ใช้ radio buttons (native HTML) เพื่อความเสถียร

4. **Error Handling:**
   - ถ้าไม่มี intensity radio checked → ใช้ default = 3
   - ถ้า localStorage corrupt → ใช้ default = 3

5. **Performance:**
   - Show/Hide selector ใช้ CSS class toggle (ไม่ re-render)
   - Event listener ผูกครั้งเดียวตอน init

---

## ✅ Checklist การทำงาน

- [ ] 1. เพิ่ม HTML structure ใน main.html
- [ ] 2. เพิ่ม CSS styles ใน main.html
- [ ] 3. เพิ่ม Show/Hide logic ใน initPromptCraft()
- [ ] 4. เพิ่ม getRedModePrompt(level) ใน prompt_craft.js
- [ ] 5. ปรับ generatePrompt() รับ intensityLevel
- [ ] 6. เพิ่ม intensity state management
- [ ] 7. ปรับ handleGenerate() อ่านค่า intensity
- [ ] 8. เพิ่ม event listeners สำหรับ intensity selector
- [ ] 9. ทดสอบทุก Test Cases
- [ ] 10. อัพเดท README.md / CHANGELOG

---

**สร้างโดย:** Claude Code
**วันที่:** 2025-12-28
**เวอร์ชัน:** 1.0
