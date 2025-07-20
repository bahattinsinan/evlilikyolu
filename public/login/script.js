import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase config
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

// 🚀 Giriş
document.querySelector(".btn-primary").addEventListener("click", async () => {
  const email = document.querySelector("input[type='email']").value;
  const password = document.querySelector("input[type='password']").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (!user.emailVerified) {
      alert("Lütfen e-postanı doğrula. Mail kutunu kontrol et.");
      return;
    }

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      if (!userData.avatarSecildiMi) {
        location.href = "/profile/avatar.html";
      } else {
        location.href = "/home/home.html";
      }
    }
  } catch (error) {
    alert("Giriş yapılamadı: " + error.message);
  }
});

// 🧾 Kayıt (Kayıdı Tamamla butonu)
document.querySelector("#registerPanel .btn-primary").addEventListener("click", async () => {
  const inputs = document.querySelectorAll("#registerPanel input");
  const nickname = inputs[0].value;
  const email = inputs[1].value;
  const password = inputs[2].value;
  const confirm = inputs[3].value;
  const age = inputs[4].value;
  const city = inputs[7].value;

  if (password !== confirm) return alert("Şifreler eşleşmiyor");

  const gender = document.querySelectorAll(".gender-options")[0].querySelector(".selected")?.textContent || "";
  const lookingFor = document.querySelectorAll(".gender-options")[1].querySelector(".selected")?.textContent || "";

  if (!gender || !lookingFor) return alert("Lütfen cinsiyet ve aradığı cinsiyeti seç");

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await sendEmailVerification(user);

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      displayName: nickname,
      email,
      age,
      gender,
      lookingFor,
      city,
      membership: "standart",
      tokens: 0,
      avatarSecildiMi: false,
      createdAt: new Date().toISOString()
    });

    alert("Kayıt başarılı! Lütfen e-postanı doğrula.");
  } catch (error) {
    alert("Kayıt hatası: " + error.message);
  }
});

// 🔁 Cinsiyet seçme kutucukları
document.querySelectorAll(".gender-options button").forEach(btn => {
  btn.addEventListener("click", () => {
    btn.parentElement.querySelectorAll("button").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
  });
});

// 🔑 Şifremi Unuttum
document.querySelectorAll(".btn-secondary")[1].addEventListener("click", async () => {
  const email = prompt("Şifreni sıfırlamak için e-posta adresini gir:");
  if (!email) return;

  try {
    await sendPasswordResetEmail(auth, email);
    alert("Şifre sıfırlama bağlantısı e-postana gönderildi.");
  } catch (error) {
    alert("Hata: " + error.message);
  }
});

// 🔐 Google ile Giriş
document.querySelectorAll(".btn-secondary")[2].addEventListener("click", async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        displayName: user.displayName || "",
        email: user.email,
        age: "",
        gender: "",
        lookingFor: "",
        city: "",
        membership: "standart",
        tokens: 0,
        avatarSecildiMi: false,
        createdAt: new Date().toISOString()
      });
    }

    location.href = "/profile/avatar.html";
  } catch (error) {
    alert("Google ile giriş başarısız: " + error.message);
  }
});
