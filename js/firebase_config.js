/**
 * VIDIST Firebase Configuration
 *
 * สำหรับการเชื่อมต่อกับ Firebase project (Authentication + Firestore)
 *
 * ✅ อัพเดทแล้วด้วยค่าจริงจาก Firebase Console
 * Project: Vidist (vidist-507a9)
 */

// ⚠️ ไฟล์นี้เป็น placeholder — ไม่มี API key จริง
// ใส่ key จริงใน js/firebase_config.local.js (ไม่ commit) — ดู firebase_config.example.js
if (typeof window !== 'undefined' && !window.FIREBASE_CONFIG) {
    window.FIREBASE_CONFIG = {
        apiKey: "",
        authDomain: "vidist-507a9.firebaseapp.com",
        projectId: "vidist-507a9",
        storageBucket: "vidist-507a9.firebasestorage.app",
        messagingSenderId: "378407691521",
        appId: "1:378407691521:web:9da7b25c34e6a89cbfe700"
    };
    console.warn('⚠️ Firebase: ใช้ placeholder config — cloud sync จะไม่ทำงาน');
} else {
    console.log('Firebase Config loaded from local file ✅');
}
