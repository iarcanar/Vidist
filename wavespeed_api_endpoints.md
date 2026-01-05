นี่คือคู่มือเชิงเทคนิคฉบับสมบูรณ์ที่สรุปจากบทเรียนการแก้ปัญหาทั้งหมด โดยเน้นไปที่ **"ระบบจัดการข้อมูลคู่ขนาน" (Dual-State Management)** ซึ่งเป็นหัวใจสำคัญในการทำหน้าประวัติวิดีโอของ Wavespeed ให้สมบูรณ์ครับ

```markdown
# Wavespeed API Integration Manual: Building a Perfect History Viewer
**Date:** 2026-01-04
**Target API:** Wavespeed v3 Endpoint

## 1. บทสรุปปัญหาและสถาปัตยกรรม (Core Architecture)

จากการตรวจสอบเชิงลึก พบข้อจำกัดสำคัญของ Wavespeed API (Public Access):
1.  **Endpoint:** การตรวจสอบผลลัพธ์ต้องใช้ `GET /api/v3/predictions/{id}/result`
2.  **Data Loss:** API นี้ส่งคืนสถานะ (`status`) และลิงก์วิดีโอ (`outputs`) **แต่ไม่ส่งคืน Prompt หรือ Input parameters เดิมกลับมา**
3.  **List Limitation:** คำสั่งดึงประวัติย้อนหลัง (`List All`) มักถูกจำกัดสิทธิ์ใน API Key ทั่วไป

### แนวทางการจัดการ (The Solution)
เราต้องใช้สถาปัตยกรรม **"Store First, Poll Later"** คือการเก็บข้อมูลฝั่งเราทันทีที่กดสร้าง แล้วใช้ ID ไปถามหาวิดีโอทีหลัง

**Flow การทำงานที่ถูกต้อง:**
1.  **Creation Phase:** เมื่อ User กด Generate -> ยิง API -> ได้ `ID` กลับมา -> **บันทึก `ID` + `Prompt` ลง Database ของเราทันที**
2.  **History Phase:** ดึงรายการจาก Database เรา (จะได้ Prompt) -> เอา `ID` ไปถาม API (จะได้ Video) -> นำมาแสดงคู่กัน

---

## 2. โครงสร้างข้อมูล (Database Schema Recommendation)

ไม่ว่าคุณจะใช้ MySQL, MongoDB, Firebase หรือ LocalStorage คุณต้องเก็บข้อมูลชุดนี้ทันทีที่ได้รับ Response จากการ `POST` สร้างงาน

```json
{
  "id": "f559ef42...",          // Key หลักสำหรับจับคู่ (ได้จาก API)
  "prompt": "A Thai student...", // ข้อมูลสำคัญที่ API ไม่ส่งคืน (ต้องเก็บเอง)
  "settings": {                 // Parameter อื่นๆ
    "resolution": "480p",
    "duration": 3
  },
  "status": "processing",       // สถานะเริ่มต้น
  "video_url": null,            // รออัปเดตเมื่อเสร็จ
  "created_at": 1735934841000
}

```

---

## 3. Implementation Guide (Coding Patterns)

### ส่วนที่ 1: การสร้างและบันทึก (Create & Pair)

*Code นี้จำลองการทำงานเมื่อ User กดปุ่ม "Generate"*

```javascript
async function generateVideo(userPrompt, apiKey) {
    const url = "[https://api.wavespeed.ai/api/v3/predictions](https://api.wavespeed.ai/api/v3/predictions)"; // หรือ endpoint ตาม model
    
    // 1. เตรียม Payload
    const payload = {
        input: { 
            prompt: userPrompt,
            resolution: "480p" 
        }
    };

    try {
        // 2. ยิงคำสั่งสร้าง (POST)
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        
        // 3. (สำคัญที่สุด) จับคู่ ID กับ Prompt แล้วบันทึกลงถังเก็บข้อมูลของเรา
        // ในที่นี้ใช้ localStorage เป็นตัวอย่าง (งานจริงควรเป็น Database)
        if (response.ok) {
            const newRecord = {
                id: data.id,           // ID จาก Wavespeed
                prompt: userPrompt,    // Prompt จากฟอร์มฝั่งเรา
                status: "processing",
                video_url: null,
                timestamp: new Date().toISOString()
            };
            
            saveToMyDatabase(newRecord); 
            console.log("บันทึกประวัติเรียบร้อย: ", newRecord);
        }
        
    } catch (error) {
        console.error("Failed to generate:", error);
    }
}

function saveToMyDatabase(record) {
    // ตัวอย่างการเก็บลง LocalStorage (ปรับเป็น API Call ไป Backend ของคุณได้)
    const history = JSON.parse(localStorage.getItem('my_video_history') || '[]');
    history.unshift(record); // ใส่ตัวใหม่สุดไว้หน้าแรก
    localStorage.setItem('my_video_history', JSON.stringify(history));
}

```

---

### ส่วนที่ 2: การดึงประวัติมาแสดง (History Viewer & Polling)

*Code นี้จะทำงานในหน้า History โดยจะวนลูปเช็คสถานะงานที่ยังไม่เสร็จ*

```javascript
async function renderHistory(apiKey) {
    // 1. ดึงข้อมูลจากฐานข้อมูลของเรา (ซึ่งมี Prompt ครบถ้วน)
    let localHistory = JSON.parse(localStorage.getItem('my_video_history') || '[]');
    const container = document.getElementById('history-container');
    
    // 2. วนลูปแสดงผล
    for (let i = 0; i < localHistory.length; i++) {
        let item = localHistory[i];
        
        // ถ้าสถานะยังไม่เสร็จ หรือยังไม่มีลิงก์วิดีโอ -> ให้เช็ค API ใหม่อีกรอบ
        if (item.status !== 'succeeded' && item.status !== 'completed' && item.status !== 'failed') {
            console.log(`Checking update for ID: ${item.id}`);
            const updatedData = await checkStatusFromApi(item.id, apiKey);
            
            if (updatedData) {
                // อัปเดตข้อมูลลงตัวแปรและบันทึกกลับ
                item.status = updatedData.status;
                item.video_url = updatedData.videoUrl;
                
                // Save updated status back to DB
                localHistory[i] = item;
                localStorage.setItem('my_video_history', JSON.stringify(localHistory));
            }
        }

        // 3. สร้าง UI Card (มีครบทั้ง Prompt และ Video)
        createCardHTML(container, item);
    }
}

// ฟังก์ชันเจาะจง Endpoint v3 เพื่อดึง Video URL
async function checkStatusFromApi(id, apiKey) {
    // ใช้ Proxy หากรันผ่าน Browser โดยตรงเพื่อเลี่ยง CORS
    const targetUrl = `https://api.wavespeed.ai/api/v3/predictions/${id}/result`;
    const proxyUrl = '[https://corsproxy.io/](https://corsproxy.io/)?' + encodeURIComponent(targetUrl);

    try {
        const res = await fetch(proxyUrl, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        
        if (!res.ok) return null;
        
        const json = await res.json();
        
        // *** UNPACKING LOGIC (สำคัญ) ***
        // ข้อมูลมักซ่อนอยู่ใน json.data หรือ json เฉยๆ ตามเวอร์ชัน
        const coreData = json.data || json; 
        
        // หา URL
        let videoUrl = null;
        if (coreData.outputs && coreData.outputs[0]) videoUrl = coreData.outputs[0];
        else if (typeof coreData.output === 'string') videoUrl = coreData.output;

        return {
            status: coreData.status,
            videoUrl: videoUrl
        };
        
    } catch (e) {
        console.error("API Error:", e);
        return null;
    }
}

```

---

### ส่วนที่ 3: ตัวอย่าง HTML/UI Template (สำหรับการจับคู่)

ส่วนนี้แสดงให้เห็นว่าเมื่อเรามีข้อมูลครบ (Prompt จาก DB + Video จาก API) หน้าตาจะเป็นอย่างไร

```javascript
function createCardHTML(container, item) {
    const card = document.createElement('div');
    card.className = "video-card"; // ใส่ Tailwind หรือ CSS Class ตามสะดวก
    
    // Logic เลือกแสดง Video หรือ Loading
    let mediaContent = '';
    if (item.video_url) {
        mediaContent = `<video controls src="${item.video_url}"></video>`;
    } else {
        mediaContent = `<div class="loading">Status: ${item.status}...</div>`;
    }

    card.innerHTML = `
        <div class="media-wrapper">
            ${mediaContent}
        </div>
        <div class="info-wrapper">
            <div class="badge-status ${item.status}">${item.status}</div>
            
            <div class="prompt-box">
                <strong>Prompt:</strong> ${item.prompt}
            </div>
            
            <div class="meta-data">ID: ${item.id}</div>
        </div>
    `;
    
    container.appendChild(card);
}

```

---

## 4. Checklist ความถูกต้องแม่นยำ

1. **Endpoint:** ใช้ `v3/.../result` เท่านั้นสำหรับการเช็คงาน (v1 มักถูกบล็อก List)
2. **Data Path:** อย่าลืมเช็ค `response.data` ก่อนเข้าถึง `outputs` (Wavespeed ชอบซ้อน Data ไว้ชั้นใน)
3. **Persistence:** ห้ามพึ่งพา API ในการจำ Prompt ให้เรา **ต้องบันทึกทันทีที่กด Submit**
4. **CORS:** หากทำ Web Client-side ต้องมี Proxy หรือตั้งค่า Server Relay
5. **Error 404:** ถ้าเช็ค ID แล้วเจอ 404 ให้สันนิษฐานว่า ID ผิด หรือ API Key ไม่มีสิทธิ์เข้าถึง ID นั้น (คนละ Owner)

---

*Manual ฉบับนี้สร้างขึ้นจากการ Reverse Engineering การตอบสนองจริงของ Wavespeed API v3 เพื่อให้มั่นใจว่าข้อมูลประวัติจะครบถ้วนสมบูรณ์ที่สุด*

```

```