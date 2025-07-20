// public/login/script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "/firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const loginBtn = document.getElementById("loginBtn");
const showRegisterBtn = document.getElementById("showRegister");
const registerPanel = document.getElementById("registerPanel");
const submitRegisterBtn = document.getElementById("submitRegister");
const googleLoginBtn = document.getElementById("googleLogin");

// Giriş yapma işlemi
loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (!user.emailVerified) {
      alert("Lütfen e-posta adresinizi doğrulayın. Mail kutunuzu ve spam klasörünü kontrol edin.");
      await sendEmailVerification(user);
      await signOut(auth);
    } else {
      window.location.href = "/home/home.html";
    }
  } catch (error) {
    alert("Giriş başarısız: " + error.message);
  }
});

// Kayıt panelini göster
showRegisterBtn.addEventListener("click", () => {
  registerPanel.style.display = "block";
});

// Kayıt işlemi
submitRegisterBtn.addEventListener("click", async () => {
  const nickname = document.getElementById("nickname").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;
  const passwordRepeat = document.getElementById("registerPasswordRepeat").value;
  const age = document.getElementById("ageInput").value;
  const city = document.getElementById("city").value;
  const gender = document.querySelector('input[name="gender"]:checked')?.value;
  const lookingFor = document.querySelector('input[name="lookingFor"]:checked')?.value;

  if (password !== passwordRepeat) {
    alert("Şifreler eşleşmiyor!");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      displayName: nickname,
      email,
      age,
      city,
      gender,
      lookingFor,
      uid: user.uid,
      membership: "Standart Üye",
      profileImage: "",
      bio: "",
      tokens: 0
    });

    await sendEmailVerification(user);
    alert("Kayıt başarılı. Lütfen e-posta adresinizi doğrulamak için mail kutunuzu kontrol edin.");
    await signOut(auth);
  } catch (error) {
    alert("Kayıt başarısız: " + error.message);
  }
});

// Google ile giriş
googleLoginBtn.addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    if (!user.emailVerified) {
      alert("Google hesabınız doğrulanmamış. Lütfen e-posta adresinizi doğrulayın.");
      await signOut(auth);
      return;
    }

    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
      displayName: user.displayName || "Bilinmeyen",
      email: user.email,
      uid: user.uid,
      age: "",
      city: "",
      gender: "",
      lookingFor: "",
      membership: "Standart Üye",
      profileImage: user.photoURL || "",
      bio: "",
      tokens: 0
    }, { merge: true });

    window.location.href = "/home/home.html";
  } catch (error) {
    alert("Google ile giriş başarısız: " + error.message);
  }
});

// Giriş yapan kullanıcı doğrulanmışsa ana sayfaya yönlendir
onAuthStateChanged(auth, (user) => {
  if (user && user.emailVerified) {
    window.location.href = "/home/home.html";
  }
});
