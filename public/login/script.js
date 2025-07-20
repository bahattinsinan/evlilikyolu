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
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc
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
const forgotPasswordBtn = document.getElementById("forgotPassword");

// Giriş yapma
loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (!user.emailVerified) {
      alert("📩 Lütfen e-posta adresinizi doğrulayın. Mail kutunuzu ve spam klasörünü kontrol edin.");
      await sendEmailVerification(user);
      await signOut(auth);
      return;
    }

    window.location.href = "/home/home.html";
  } catch (error) {
    alert("Giriş başarısız: " + error.message);
  }
});

// Kayıt paneli göster
showRegisterBtn.addEventListener("click", () => {
  registerPanel.style.display = "block";
});

// Kayıt işlemi
submitRegisterBtn.addEventListener("click", async () => {
  const nickname = document.getElementById("nickname").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value;
  const passwordRepeat = document.getElementById("registerPasswordRepeat").value;
  const age = parseInt(document.getElementById("ageInput").value);
  const city = document.getElementById("city").value.trim();
  const gender = document.querySelector('input[name="gender"]:checked')?.value;
  const lookingFor = document.querySelector('input[name="lookingFor"]:checked')?.value;

  if (!nickname || !email || !password || !age || !city || !gender || !lookingFor) {
    alert("❗ Lütfen tüm alanları doldurun.");
    return;
  }

  if (age < 18) {
    alert("❌ 18 yaşından küçükler kayıt olamaz.");
    return;
  }

  if (password !== passwordRepeat) {
    alert("❌ Şifreler uyuşmuyor.");
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
      profileImage: "/images/default-avatar.png",
      bio: "",
      tokens: 0
    });

    await sendEmailVerification(user, {
  url: "https://evlilikyolutr.firebaseapp.com/login/verify-success.html"
 });
    alert("✅ Kayıt başarılı! E-posta adresinize doğrulama bağlantısı gönderildi.\n\n📩 Lütfen gelen kutunuzu ve spam klasörünü kontrol edin.");
    await signOut(auth);
  } catch (error) {
    alert("🚫 Kayıt başarısız: " + error.message);
  }
});

// Google ile giriş
googleLoginBtn.addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, "users", user.uid), {
        displayName: user.displayName || "Bilinmeyen",
        email: user.email,
        uid: user.uid,
        age: "",
        city: "",
        gender: "",
        lookingFor: "",
        membership: "Standart Üye",
        profileImage: user.photoURL || "/images/default-avatar.png",
        bio: "",
        tokens: 0
      });
    }

    // Google hesabı zaten verified kabul edilir
    window.location.href = "/home/home.html";
  } catch (error) {
    alert("❌ Google ile giriş başarısız: " + error.message);
  }
});

// Şifremi unuttum
forgotPasswordBtn.addEventListener("click", async () => {
  const email = prompt("📧 Lütfen şifre sıfırlama bağlantısı göndermek için e-posta adresinizi yazın:");
  if (!email) {
    alert("E-posta adresi girilmedi.");
    return;
  }

  try {
    const methods = await fetchSignInMethodsForEmail(auth, email);
    if (methods.length === 0) {
      alert("❌ Bu e-posta adresi ile kayıtlı bir kullanıcı bulunamadı.");
      return;
    }

    await sendPasswordResetEmail(auth, email);
    alert("📩 Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.");
  } catch (error) {
    alert("⚠️ Şifre sıfırlama başarısız: " + error.message);
  }
});

// Google login veya mail verified kullanıcıyı yönlendir
onAuthStateChanged(auth, (user) => {
  if (!user) return;

  const isGoogleUser = user.providerData.some(
    (provider) => provider.providerId === "google.com"
  );

  if (user.emailVerified || isGoogleUser) {
    window.location.href = "/home/home.html";
  }
});

//
