/**
 * VIDIST Firebase Configuration
 *
 * สำหรับการเชื่อมต่อกับ Firebase project (Authentication + Firestore)
 *
 * ✅ อัพเดทแล้วด้วยค่าจริงจาก Firebase Console
 * Project: Vidist (vidist-507a9)
 */

const FIREBASE_CONFIG = {
    apiKey: "FIREBASE_KEY_REMOVED",
    authDomain: "vidist-507a9.firebaseapp.com",
    projectId: "vidist-507a9",
    storageBucket: "vidist-507a9.firebasestorage.app",
    messagingSenderId: "378407691521",
    appId: "1:378407691521:web:9da7b25c34e6a89cbfe700"
};

// Export for use in cloud_sync.js
if (typeof window !== 'undefined') {
    window.FIREBASE_CONFIG = FIREBASE_CONFIG;
}

console.log('📋 Firebase Config loaded ✅');
