// public/login/script.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBXDPSHzYwDKJMKflRPaC-egd-r6dLzL6U",
  authDomain: "evlilikyolutr.firebaseapp.com",
  projectId: "evlilikyolutr",
  storageBucket: "evlilikyolutr.firebasestorage.app",
  messagingSenderId: "299542496680",
  appId: "1:299542496680:web:79967f42f243b64c4dc99d",
  measurementId: "G-RVZYMG4T3M"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Kayıt işlemi
const submitRegister = document.getElementById("submitRegister");
submitRegister.addEventListener("click", async () => {
  const nickname = document.getElementById("nickname").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;
  const repeat = document.getElementById("registerPasswordRepeat").value;
  const age = parseInt(document.getElementById("ageInput").value);
  const city = document.getElementById("city").value;
  const gender = document.querySelector('input[name="gender"]:checked')?.value;
  const lookingFor = document.querySelector('input[name="lookingFor"]:checked')?.value;

  if (!nickname || !email || !password || !repeat || !gender || !lookingFor || !city || isNaN(age)) {
    alert("Tüm alanları doldurunuz.");
    return;
  }

  if (password !== repeat) {
    alert("Şifreler uyuşmuyor.");
    return;
  }

  if (age < 18) {
    alert("18 yaşından küçükler kayıt olamaz.");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);

    await setDoc(doc(db, "users", userCredential.user.uid), {
      uid: userCredential.user.uid,
      displayName: nickname,
      email: email,
      age: age,
      city: city,
      gender: gender,
      lookingFor: lookingFor,
      membership: "standart",
      profileImage: "/images/avatar.png",
      bio: "",
      tokens: 0
    });

    alert("Kayıt başarılı. Lütfen e-posta adresinizi doğrulayın.");
  } catch (error) {
    alert("Hata: " + error.message);
  }
});

// Giriş işlemi
const loginBtn = document.getElementById("loginBtn");
loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    if (!userCredential.user.emailVerified) {
      alert("Lütfen e-posta adresinizi doğrulayın.");
      return;
    }
    location.href = "/home/home.html";
  } catch (error) {
    alert("Hata: " + error.message);
  }
});

// Google ile giriş
const googleLogin = document.getElementById("googleLogin");
googleLogin.addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      displayName: user.displayName || "Bilinmeyen",
      email: user.email,
      age: 18,
      city: "",
      gender: "",
      lookingFor: "",
      membership: "standart",
      profileImage: user.photoURL || "/images/avatar.png",
      bio: "",
      tokens: 0
    }, { merge: true });

    location.href = "/home/home.html";
  } catch (error) {
    alert("Google ile giriş başarısız: " + error.message);
  }
});
