import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCMK2TsF-BbZXzGuzUUrCXgk0L8f_ZToxA",
  authDomain: "jalu-ed332.firebaseapp.com",
  projectId: "jalu-ed332",
  storageBucket: "jalu-ed332.firebasestorage.app",
  messagingSenderId: "887453248750",
  appId: "1:887453248750:web:304530295d8b4c1fca97ff",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);