# VIDIST - แพลตฟอร์มสร้างวิดีโอด้วย AI (v3.3.0)

**VIDIST** คือเว็บแอปพลิเคชันสำหรับสร้างวิดีโอด้วย AI ที่เน้นความสวยงามในสไตล์ Cyberpunk และรองรับโมเดลวิดีโอที่ทันสมัยที่สุดในปัจจุบันผ่าน Wavespeed API, Gemini 2.0 Flash และ Grok (x.ai)

---

## 🌐 Live Demo

**Access VIDIST online:** https://iarcanar.github.io/Vidist/

**หมายเหตุสำคัญ:**
- API keys จะถูกเก็บแยกตาม domain (localStorage)
- ต้องใส่ Wavespeed, Gemini, Grok และ imgbb API keys ใหม่เมื่อใช้ครั้งแรก
- **🔄 การ Sync ประวัติจาก Local → GitHub Pages:**
  1. เปิดโปรเจ็คใน Local → คลิก **⋮** → **Export** → บันทึกเป็น JSON
  2. เปิด https://iarcanar.github.io/Vidist/ → คลิก **Import Now** → เลือกไฟล์ JSON
  3. เลือก **Merge** (รวมไม่ซ้ำ) หรือ **Replace All** (แทนที่ทั้งหมด)
  4. ✅ ประวัติจะแสดงครบ และยังคงอยู่หลัง Refresh!
- รองรับ Mobile browsers อย่างสมบูรณ์ด้วย responsive UI (Android/iOS)
- ทำงานได้ดีบน Chrome, Safari, Firefox, Edge

---

## ✨ ฟีเจอร์เด่น

- 🔄 **Export/Import History** (v3.1.0): Sync ประวัติระหว่าง Local และ GitHub Pages ได้แล้ว!
  - Export ประวัติเป็น JSON จาก Local
  - Import บน GitHub Pages ด้วย 1 คลิก
  - แบนเนอร์ auto-detect แนะนำการ migrate
  - Merge (ไม่ซ้ำ) หรือ Replace All
- 💖 **Keep: Prompt Collection**: บันทึก Prompt ที่ชอบ (Grid 3 คอลัมน์, Copy/Reuse/Delete, auto-save, ตรวจจับซ้ำ, 3-line preview)
- 🎞️ **โมเดลวิดีโอหลากหลาย**: รองรับ Wavespeed (Wan 2.5, Wan 2.6), Kling Video O1 และ Grok (x.ai)
- 🎭 **โหมดสร้างสรรค์**:
  - **T2V (Text-to-Video)**: สร้างวิดีโอจากข้อความ (รองรับ Wan 2.5)
  - **I2V (Image-to-Video)**: สร้างวิดีโอจากรูปภาพ (รองรับทุกโมเดล)
  - **Video Extend**: ต่อความยาววิดีโอเดิมด้วย AI
- 🧠 **AI Prompt Craft**: ระบบช่วยแต่ง Prompt ให้สวยงามและสมจริงด้วย Gemini 2.0 Flash
- 🖼️ **Image Edit**: แก้ไขรูปภาพด้วย Gemini 2.5 Flash, WAN 2.6 หรือ Grok Imagine Image (imgbb permanent storage)
- 📥 **ระบบบันทึกวิดีโอ (Multi-Layer Storage)**: LRU Cache + IndexedDB + imgbb (permanent URLs)
- ⚡ **Red Mode + Intensity Levels**: โหมดพิเศษ 4 ระดับ (I, II, III, Grok)
- 🎤 **Custom Dialog Override**: กำหนด Dialog & Sound Effect เอง
- 📋 **Clipboard Paste (Ctrl+V)**: วางภาพจาก Clipboard
- 📱 **Mobile-Optimized UI**: Responsive design ที่ทำงานสมบูรณ์บนมือถือทุกขนาด
- 🔍 **Advanced History Search**: ค้นหาโดยข้อความ, ความละเอียด (480p/720p/1080p), ระยะเวลา (3s/5s/10s), ประเภท (image/video/edit)
- 🗑️ **Delete Videos**: ลบประวัติออกจากทั้ง localStorage และ Wavespeed server
- 🔄 **Version Auto-Update**: ระบบ CI/CD อัตโนมัติ

---

## 🛠️ วิธีการใช้งาน

### 1. การตั้งค่า API
1. คลิกที่ไอคอนเฟือง (Settings) เพื่อเปิดส่วนการตั้งค่า
2. ใส่ **Wavespeed API Key** เพื่อใช้สร้างวิดีโอ
3. ใส่ **Gemini API Key** เพื่อใช้ระบบช่วยแต่ง Prompt
4. ระบบจะแสดงยอดเงินคงเหลือ (Balance) แบบ Real-time

### 2. การสร้างวิดีโอ
1. **เลือกโมเดล**: เลือกโมเดลที่ต้องการ (เช่น Wan 2.6)
2. **ใส่ Prompt**: พิมพ์สิ่งที่ต้องการเห็น (ใช้ "Craft" เพื่อให้ AI ช่วยเกลา)
3. **อัปโหลดรูปภาพ**: สำหรับ I2V ลากรูปภาพหรือกด **Ctrl+V**
4. **ตั้งค่าเพิ่มเติม**: เลือก Resolution (720p/1080p) และระยะเวลา
5. **กด Generate**: รอระบบประมวลผล

### 3. การใช้ AI Prompt Craft
1. **อัปโหลดรูปภาพ**: ลากหรือวางรูปภาพ
2. **ใส่คำอธิบาย**: พิมพ์สิ่งที่ต้องการให้เกิด
3. **เลือกโหมด**:
   - 🎨 **Creative Mode**: Safe & creative
   - 🔴 **Red Mode**: Unfiltered
4. **เลือกระดับ** (Red Mode): I, II, III, หรือ Grok
5. **กำหนด Dialog** (ทำเครื่องหมาย ◎ OVERRIDE): ป้อน Dialog & Sound Effect เอง
6. **กด Craft**: รอให้ AI สร้าง Prompt

### 4. การจัดการประวัติ (History)
- วิดีโอที่สร้างเสร็จปรากฏในส่วน **History**
- คลิก Thumbnail เพื่อดูแบบเต็มจอ
- ปุ่ม **Download** เพื่อเซฟวิดีโอ
- ปุ่ม **Hide** เพื่อซ่อนเนื้อหา (sensitive content)
- ปุ่ม **Delete** เพื่อลบออกจากทั้ง localStorage และ server
- 🔍 **ระบบ Filter & Search**:
  - ค้นหาโดยข้อความ: "cat", "sunset"
  - ค้นหาโดย Resolution: "480", "480p", "720p", "1080p"
  - ค้นหาโดย Duration: "3s", "5s", "10s"
  - ค้นหาโดย Type: "image", "video", "edit"
- 📤 **Export/Import** (เมนู **⋮**):
  - **Export**: บันทึกประวัติเป็นไฟล์ JSON (สำหรับ backup หรือ migrate)
  - **Import**: นำเข้าประวัติจากไฟล์ JSON
  - **Merge Mode**: รวมประวัติไม่ซ้ำกัน (ตรวจสอบด้วย video ID)
  - **Replace Mode**: แทนที่ประวัติทั้งหมด
  - **Use Case**: Sync ประวัติจาก Local → GitHub Pages

---

## 💾 ระบบการเก็บข้อมูล (Storage)

### Local Storage (Browser)
1. **localStorage**: เก็บประวัติวิดีโอ, API keys, settings (แยกตาม origin/domain)
2. **Memory Cache (LRU)**: เก็บวิดีโอล่าสุดในแรม (ไม่เกิน 200MB)
3. **IndexedDB**: บันทึกวิดีโอลงเครื่อง (Grok videos มี bulletproof persistence)
4. **Auto-Clean**: ล้างไฟล์เก่า 24 ชั่วโมงโดยอัตโนมัติ

### Cloud Storage (Permanent)
- **imgbb**: เก็บรูปภาพที่แก้ไขด้วย Gemini แบบถาวร (unlimited storage)
- **Wavespeed Server**: เก็บวิดีโอที่สร้างด้วย Wavespeed API
- **Grok Server**: เก็บวิดีโอที่สร้างด้วย Grok API

### ⚠️ สำคัญ: localStorage แยกตาม Domain
- **Local**: `file:///` หรือ `http://localhost` มี localStorage ของตัวเอง
- **GitHub Pages**: `https://iarcanar.github.io` มี localStorage **คนละตัว**
- **วิธีแก้**: ใช้ Export/Import เพื่อ sync ประวัติระหว่าง 2 domain (ทำครั้งเดียว)

---

## 📄 ข้อมูลทางเทคนิค

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (No framework)
- **API**: Wavespeed API V3, Gemini 2.0 Flash, Grok (x.ai), imgbb
- **Deployment**: GitHub Pages (CI/CD with GitHub Actions)
- **Current Version**: v3.1.0 (Build 01302026)

### Latest Updates (v3.1.0) - January 30, 2026
- 🔄 **GitHub Pages History Sync Fix** (CRITICAL)
  - แก้ปัญหาประวัติวิดีโอไม่แสดงบน GitHub Pages
  - เพิ่มปุ่ม **Import** ในเมนู kebab (⋮)
  - แบนเนอร์ auto-detect การเข้า GitHub Pages ครั้งแรก
  - Smart import: Merge (ไม่ซ้ำ) หรือ Replace All
  - แก้ปัญหา localStorage cross-origin isolation
  - One-time migration: Export จาก Local → Import บน GitHub Pages
  - 208 บรรทัดเพิ่ม (6 ฟังก์ชัน + HTML banner)

### Major Updates (v3.0.0) - January 30, 2026
- 🚀 **Gemini imgbb Upload Revolution**
  - รูปภาพที่แก้ไขด้วย Gemini ถูก upload ไปที่ imgbb อัตโนมัติ
  - เก็บแบบถาวร (permanent URLs) แทน base64 ใน localStorage
  - ไม่มี quota errors อีกต่อไป (40 bytes URL vs 200KB base64)
  - รองรับ 1000+ Gemini edits
  - Graceful fallback (ใช้ base64 ถ้า upload ล้มเหลว)

### Grok Integration (v2.12.0 - v2.12.20)
- 🎬 **Grok API (x.ai)**: I2V + Image Edit + Files API
- 💾 **Bulletproof Persistence**: IndexedDB backup, zero data loss
- 🎬 **Modal Playback**: CORS bypass, blob download
- 🚫 **Content Filter Detection**: หยุด polling ทันทีเพื่อประหยัดเงิน

### Version History
- **v3.1.0**: Export/Import History (GitHub Pages sync fix)
- **v3.0.0**: Gemini imgbb Upload Revolution
- **v2.12.x**: Grok API Integration + Bulletproof Persistence
- **v2.8.x**: Mobile UX Polish + Image Edit Floating Visual
- **v2.7.x**: History Management System + Search/Filter

**Last Updated**: January 30, 2026

---

## 📚 เอกสารสำคัญ

### สำหรับนักพัฒนา (Developers)
- **[AI_DEVELOPMENT_PROTOCOL.md](AI_DEVELOPMENT_PROTOCOL.md)** - Protocol สำหรับ AI assistants
  - Version update rules
  - Commit message format
  - Pre-commit hook enforcement
  - Changelog entry format

### สำหรับ Version Management
- **[js/version.js](js/version.js)** - Single source of truth สำหรับ version
  - Semantic versioning (Major.Minor.Patch)
  - Build metadata (gitMMDDYYYY format)
  - Changelog entries
  - Never hardcode versions in HTML!

### สำหรับ Version Automation
- **.git/hooks/pre-commit** - Git hook to enforce version updates
  - Blocks commit if index.html changed but version.js not updated
  - Shows clear error message with instructions

### Version Control
```
Rules:
□ Always update js/version.js when modifying index.html
□ Increment patch for any change (bug fix, feature, CSS)
□ Add changelog entry to features array
□ Pre-commit hook will BLOCK commits that violate this
```

---

## 🐛 ปัญหาที่แก้ไขล่าสุด

### v3.1.0 - GitHub Pages History Sync Fix
- **ปัญหา**: ประวัติวิดีโอไม่แสดงบน GitHub Pages หลัง push (แต่ใน Local ทำงานปกติ)
- **สาเหตุ**: localStorage เก็บข้อมูลแยกตาม origin
  - Local: `file:///` มี localStorage ของตัวเอง
  - GitHub Pages: `https://iarcanar.github.io` มี localStorage **คนละตัว**
  - เมื่อ push → GitHub Pages เริ่มต้นด้วย localStorage ว่างเปล่า
- **แก้ไข**: เพิ่มระบบ Export/Import
  - ปุ่ม Import ในเมนู kebab (⋮)
  - แบนเนอร์ auto-detect เมื่อเข้า GitHub Pages ครั้งแรก
  - Smart import: Merge (ไม่ซ้ำ) หรือ Replace All
  - 6 ฟังก์ชันใหม่ + HTML banner (208 บรรทัด)
- **ผลลัพธ์**: Export จาก Local → Import บน GitHub Pages → ประวัติแสดงครบ!

### v3.0.0 - Gemini Image Storage Quota Fix
- **ปัญหา**: รูปภาพที่แก้ไขด้วย Gemini หายหลัง F5 (localStorage quota exceeded)
- **สาเหตุ**: base64 ใหญ่มาก (200-500KB ต่อรูป) เกิน quota 5-10MB
- **แก้ไข**: Upload ไปที่ imgbb แทน → เก็บแค่ URL (40 bytes)
- **ผลลัพธ์**: รูป 1000+ รูปก็ไม่เกิน quota, permanent storage, ไม่หายอีกเลย

### v2.12.14 - Grok Video Data Loss
- **ปัญหา**: วิดีโอ Grok หาย (แม้สร้างสำเร็จแล้ว) - ห้ามให้หายเพราะเสียเงิน!
- **แก้ไข**: 5-Layer Defense - IndexedDB backup, metadata store, auto-recovery
- **ผลลัพธ์**: Zero data loss, Grok videos ไม่หายแม้แต่อันเดียว

---

## 🚀 Installation & Development

```bash
# Clone repository
git clone https://github.com/iarcanar/Vidist.git
cd Vidist

# Open with Live Server
# 1. Install "Live Server" extension in VS Code
# 2. Right-click index.html → "Open with Live Server"
# 3. Press F12 → Toggle Device Toolbar (Ctrl+Shift+M)
# 4. Select device: iPhone 12 Pro, etc.

# For mobile testing at 390x844 (iPhone dimensions)
# Open DevTools → Toggle Device Toolbar → Select "iPhone 12 Pro"
```

---

## 📋 Pre-commit Hook Setup

The project includes a Git pre-commit hook that enforces version updates:

```bash
# Hook location: .git/hooks/pre-commit
# Automatically runs before every commit
# Blocks commit if:
#   - index.html is modified
#   - But js/version.js is NOT modified
```

**To bypass (emergency only):**
```bash
git commit --no-verify -m "Your message"
```

---

## 🤝 Contributing

When making changes to the codebase:

1. Read [AI_DEVELOPMENT_PROTOCOL.md](AI_DEVELOPMENT_PROTOCOL.md)
2. If modifying `index.html`, you MUST also update `js/version.js`
3. Increment patch version number
4. Add changelog entry
5. Commit will be blocked if version not updated

---

## 📞 Support

- 🐛 **Report Bugs**: GitHub Issues
- 💬 **Questions**: Check existing issues first
- 📝 **Documentation**: Read comments in code

---

## 📄 License & Credits

© 2025-2026 VIDIST Team - *Create your reality, frame by frame.*

**Technologies Used:**
- Wavespeed API (Video Generation)
- Gemini 2.0 Flash (Prompt Enhancement)
- Tailwind CSS (Styling)
- Vanilla JavaScript (No dependencies)
