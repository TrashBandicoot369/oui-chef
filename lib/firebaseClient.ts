import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDxGmKhDxGmKhDxGmKhDxGmKhDxGmKhDxG", // Temporary placeholder
  authDomain: "chef-alex-events.firebaseapp.com",
  projectId: "chef-alex-events",
  storageBucket: "chef-alex-events.appspot.com",
  messagingSenderId: "123456789012", // Temporary placeholder
  appId: "1:123456789012:web:abcdef1234567890abcdef", // Temporary placeholder
}

console.log('Firebase config:', firebaseConfig)

export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
export const db = getFirestore(app) 