/**
 * VIDIST Firebase Configuration — EXAMPLE TEMPLATE
 *
 * วิธีใช้:
 * 1. Copy ไฟล์นี้เป็น  js/firebase_config.local.js
 * 2. ใส่ API key จริงที่ได้จาก Google Cloud Console (key ที่ restrict แล้ว)
 * 3. ห้าม commit  firebase_config.local.js  (อยู่ใน .gitignore แล้ว)
 *
 * การ restrict API key:
 * - ไปที่ https://console.cloud.google.com/apis/credentials
 * - เลือก key → Edit → Application restrictions: HTTP referrers
 * - ใส่: https://iarcanar.github.io/*
 * - API restrictions: เลือกเฉพาะ Firebase APIs
 */

const FIREBASE_CONFIG = {
    apiKey: "YOUR_NEW_RESTRICTED_API_KEY_HERE",
    authDomain: "vidist-507a9.firebaseapp.com",
    projectId: "vidist-507a9",
    storageBucket: "vidist-507a9.firebasestorage.app",
    messagingSenderId: "378407691521",
    appId: "1:378407691521:web:9da7b25c34e6a89cbfe700"
};

if (typeof window !== 'undefined') {
    window.FIREBASE_CONFIG = FIREBASE_CONFIG;
}
