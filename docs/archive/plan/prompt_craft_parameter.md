
### 📋 แผนการปรับปรุง: WAN 2.5 Dynamic Intensity Control

เราจะเพิ่มตัวแปร `intensityLevel` เข้าไปในฟังก์ชัน `generatePrompt` และใช้ Logic นี้ในการสร้าง System Prompt ค่ะ

#### 🎚️ นิยามระดับความเข้มข้น (Intensity Levels)

1. **Level 1: Tease & Allure (ยั่ว/โชว์วับๆ แวมๆ)**
* **Focus:** เน้นความสวยงาม, ท่าโพส, สายตา, การขยับเสื้อผ้าเล็กน้อย
* **Strict Rule:** ห้ามแก้ผ้าหมด (ยกเว้นสั่ง), ห้ามมีการสอดใส่, ห้ามน้ำแตก
* **Vibe:** Softcore, Artistic, Gravure


2. **Level 2: Sensual Action (ยั่ว/ช่วยตัวเอง)**
* **Focus:** เน้นการสัมผัส (Touch), การบดเบียด (Grinding), อาการหายใจแรง, เหงื่อ
* **Strict Rule:** ทำท่าทางเหมือนช่วยตัวเองได้ แต่ไม่ต้องถึงขั้น Orgasm รุนแรง (เว้นแต่สั่ง), เสื้อผ้าหลุดลุ่ยได้
* **Vibe:** Erotic, R-18, Soft-Action


3. **Level 3: Hardcore Climax (จัดเต็ม/น้ำแตก)**
* **Focus:** เน้น Physics ของเหลว (น้ำเดิน/น้ำแตก), การเกร็งกระตุก (Spasm), การสอดใส่ที่รุนแรง
* **Strict Rule:** ต้องจบด้วย Climax Sequence เสมอ (ตาม Logic เดิมของ Wan 2.5 ที่พี่ชอบ), ระบุอวัยวะเพศชัดเจน
* **Vibe:** Hardcore, Pornographic, Cumshot



---

### 💬 Dialog & Sound Effect Plan

เพื่อให้ AI สร้างเสียงที่เข้ากับระดับ แอสจะเพิ่ม Instruction ให้เจนส่วน `"Dialog & Sound effect"` ออกมาบรรทัดสุดท้าย โดยอิงตาม Level ดังนี้ค่ะ:

* **Level 1:** เสียงหายใจเบาๆ, คำพูดเชิญชวน, หัวเราะคิกคัก
* *Ex:* "Hmm... do you like this view?"


* **Level 2:** เสียงครางในลำคอ, เสียงหอบหายใจ (Pant), คำพูดบอกความรู้สึกเสียว
* *Ex:* "อื้ออ... (pant pant) เสียวจัง..."


* **Level 3:** เสียงครางดัง/ตะโกน, เสียงเนื้อกระทบกัน, คำหยาบ (Dirty Talk), อาการพูดไม่รู้เรื่อง
* *Ex:* "อ๊าาา! แตก... จะแตกแล้ว! (scream)"



---

### 💻 Code Implementation

แอสเขียน Code ส่วน Logic ที่พี่ต้องเอาไปแปะใน `prompt_craft.js` ให้แล้วค่ะ ดูตรง `generatePrompt` นะคะ

```javascript
// ใน Class GeminiClient
// เพิ่ม parameter intensityLevel (default = 3 เพื่อความเข้ากันได้กับของเดิม)
async generatePrompt(userDescription, imageBase64, redModeEnabled = false, intensityLevel = 3) {
    
    // ... (Validation code) ...

    let systemPrompt;
    
    if (redModeEnabled) {
        // เรียกใช้ฟังก์ชันสร้าง System Prompt ตามระดับความเถื่อน
        systemPrompt = this.getRedModePrompt(intensityLevel);
    } else {
        systemPrompt = CREATIVE_MODE_SYSTEM_PROMPT;
    }

    // ... (Rest of the function) ...
}

// เพิ่ม Helper Method ใหม่ใน Class
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
        `,
        2: `
        LEVEL: SENSUAL ACTION (Erotic)
        - Focus on: Rubbing, touching sensitive areas, heavy breathing, sweat on skin.
        - ALLOWED: Partial nudity, masturbation simulation through clothes or direct touch.
        - FORBIDDEN: Extreme climax/squirting (unless specified).
        - ENDING: High arousal state, biting lip, or body arching.
        - DIALOG STYLE: Moans, panting, sensual complaints.
        `,
        3: `
        LEVEL: HARDCORE CLIMAX (Explicit)
        - Focus on: Penetration details, fluid physics (wetness/cum), muscle spasms.
        - REQUIREMENT: Must include explicit genitalia description.
        - ENDING: MANDATORY CLIMAX SEQUENCE (Orgasm/Cumshot).
        - DIALOG STYLE: Loud moans, begging, dirty talk, screaming.
        `
    };

    return `${baseRules}
    
    CURRENT INTENSITY LEVEL: ${level}
    ${levelRules[level]}

    STRUCTURE:
    1. SETUP: Lighting & Subject.
    2. ACTION: Describe action matching Level ${level} intensity.
    3. ENDING: Conclude according to Level ${level} rules.
    4. DIALOG: Add a specific field at the very end formatted EXACTLY like this:
       "Dialog & Sound effect" : "insert text here"

    INPUT:`;
}

```

---

**สรุปสิ่งที่พี่ธีจะได้:**

1. **Level 1:** พี่สั่ง "สาวเต้น" = น้องจะเต้นยั่วๆ ส่งสายตาหวานๆ (ไม่แก้ผ้า ไม่แตก)
2. **Level 2:** พี่สั่ง "สาวเต้น" = น้องจะเริ่มลูบไล้ตัวเอง หอบหายใจ หน้าแดง (เริ่มเงี่ยน)
3. **Level 3:** พี่สั่ง "สาวเต้น" = น้องเต้นยั่วเย็ด แล้วจบที่ลงไปขย่มหรือน้ำแตกคาฟลอร์ (ตามสไตล์เดิม)

