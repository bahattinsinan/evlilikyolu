import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
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

// PANEL GEÇİŞİ
document.getElementById("showRegister").addEventListener("click", () => {
  document.getElementById("registerPanel").style.display = "block";
});

// KAYIT
document.getElementById("submitRegister").addEventListener("click", async () => {
  const nickname = document.getElementById("nickname").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value;
  const passwordRepeat = document.getElementById("registerPasswordRepeat").value;
  const age = parseInt(document.getElementById("ageInput").value);
  const gender = document.querySelector('input[name="gender"]:checked')?.value;
  const lookingFor = document.querySelector('input[name="lookingFor"]:checked')?.value;
  const city = document.getElementById("city").value.trim();

  if (!nickname || !email || !password || !passwordRepeat || !gender || !lookingFor || !city || !age) {
    return alert("Tüm alanları eksiksiz doldurmalısınız.");
  }

  if (password !== passwordRepeat) {
    return alert("Şifreler eşleşmiyor.");
  }

  if (age < 18) {
    return alert("18 yaşından küçükler kayıt olamaz.");
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      displayName: nickname,
      email: email,
      age: age,
      gender: gender,
      lookingFor: lookingFor,
      city: city,
      bio: "",
      profileImage: "/images/default-avatar.png",
      membership: "Standart Üye",
      tokens: 0
    });

    await sendEmailVerification(user);
    alert("Kayıt başarılı. Lütfen e-posta adresinize gelen doğrulama bağlantısını tıklayın.");
    signOut(auth);
  } catch (error) {
    alert("Hata: " + error.message);
  }
});

// GİRİŞ
document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    if (!userCredential.user.emailVerified) {
      alert("Lütfen e-posta adresinizi doğrulayın.");
      signOut(auth);
      return;
    }
    window.location.href = "/home/home.html";
  } catch (error) {
    alert("Giriş başarısız: " + error.message);
  }
});

// GOOGLE İLE GİRİŞ
document.getElementById("googleLogin").addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      displayName: user.displayName || "Bilinmeyen",
      email: user.email,
      age: "",
      gender: "",
      lookingFor: "",
      city: "",
      bio: "",
      profileImage: "/images/default-avatar.png",
      membership: "Standart Üye",
      tokens: 0
    }, { merge: true });

    window.location.href = "/home/home.html";
  } catch (error) {
    alert("Google ile giriş başarısız: " + error.message);
  }
});
