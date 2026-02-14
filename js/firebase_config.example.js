/**
 * VIDIST Firebase Configuration Template
 *
 * สำหรับการเชื่อมต่อกับ Firebase project (Authentication + Firestore)
 *
 * ⚠️ นี่คือไฟล์ TEMPLATE - คัดลอกเป็น firebase_config.js และใส่ค่าจริง
 *
 * ขั้นตอนการตั้งค่า:
 * 1. คัดลอกไฟล์นี้: cp js/firebase_config.example.js js/firebase_config.js
 * 2. ไปที่ https://console.firebase.google.com/
 * 3. สร้าง Firebase project ใหม่
 * 4. เปิดใช้งาน Authentication → Google Sign-In provider
 * 5. เปิดใช้งาน Firestore Database (production mode)
 * 6. ไปที่ Project Settings → General → Your apps → Web app
 * 7. คัดลอก config object
 * 8. แทนที่ค่า placeholder ด้านล่างด้วยค่าจริง
 */

const FIREBASE_CONFIG = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
};

// Export for use in cloud_sync.js
if (typeof window !== 'undefined') {
    window.FIREBASE_CONFIG = FIREBASE_CONFIG;
}

console.log('📋 Firebase Config loaded (using placeholder - update with real values)');
