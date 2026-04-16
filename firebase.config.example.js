/**
 * CoinQuest — Firebase Configuration Example
 *
 * This file is for reference only. The actual config is loaded from
 * environment variables (see .env.example).
 *
 * DO NOT put your real Firebase credentials in this file.
 * DO NOT commit your .env.local file.
 *
 * To get these values:
 * 1. Go to https://console.firebase.google.com
 * 2. Create or open your project
 * 3. Go to Project Settings → Your Apps → Web App
 * 4. Copy the firebaseConfig object values below
 */

const firebaseConfig = {
  // Found in: Project Settings → Your Apps → SDK setup → firebaseConfig
  apiKey: 'AIzaSy...your_api_key_here',

  // Usually: <project-id>.firebaseapp.com
  authDomain: 'your-project-id.firebaseapp.com',

  // Your Firebase project ID (e.g. "coinquest-abc12")
  projectId: 'your-project-id',

  // Usually: <project-id>.appspot.com  OR  <project-id>.firebasestorage.app
  storageBucket: 'your-project-id.appspot.com',

  // The numeric sender ID (not the API key)
  messagingSenderId: '123456789012',

  // App ID: 1:SENDER_ID:web:XXXX
  appId: '1:123456789012:web:abcdef1234567890',

  // Optional — only needed if Firebase Analytics is enabled
  measurementId: 'G-XXXXXXXXXX',
}

module.exports = firebaseConfig
