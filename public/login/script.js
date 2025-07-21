import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { firebaseConfig } from "/firebaseConfig.js";
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  // Kayıt panelini aç
  document.getElementById("showRegister")?.addEventListener("click", () => {
    document.getElementById("registerPanel").style.display = "block";
  });

  // Şifre sıfırlama
  document.getElementById("forgotPassword")?.addEventListener("click", async () => {
    const email = prompt("Lütfen şifresini sıfırlamak istediğiniz e-posta adresini girin:");
    if (email) {
      try {
        await sendPasswordResetEmail(auth, email);
        alert("📩 Şifre sıfırlama e-postası gönderildi.");
      } catch (error) {
        alert("❌ Hata: " + error.message);
      }
    }
  });

  // Kayıt
  document.getElementById("submitRegister")?.addEventListener("click", async () => {
    const nickname = document.getElementById("nickname").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const age = document.getElementById("ageInput").value;
    const gender = document.querySelector('input[name="gender"]:checked')?.value;
    const lookingFor = document.querySelector('input[name="lookingFor"]:checked')?.value;
    const city = document.getElementById("city").value;

    if (password !== confirmPassword) {
      alert("❌ Şifreler eşleşmiyor.");
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
        url: "https://evlilikyolutr.netlify.app/login/verify-success.html"
      });

      alert("✅ Kayıt başarılı! E-posta adresinize doğrulama bağlantısı gönderildi.\n📩 Lütfen gelen kutunuzu ve spam klasörünü kontrol edin.");
      await signOut(auth);
    } catch (error) {
      alert("🚫 Kayıt başarısız: " + error.message);
    }
  });

  // Giriş
  document.getElementById("loginBtn")?.addEventListener("click", async () => {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await user.reload();
      const refreshedUser = auth.currentUser;

      if (!refreshedUser.emailVerified) {
        alert("📩 Lütfen e-posta adresinizi doğrulayın. Gelen kutunuzu ve spam klasörünü kontrol edin.");
        await sendEmailVerification(refreshedUser, {
          url: "https://evlilikyolutr.netlify.app/login/verify-success.html"
        });
        await signOut(auth);
        return;
      }

      window.location.href = "/home/home.html";
    } catch (error) {
      alert("❌ Giriş başarısız: " + error.message);
    }
  });

  // Google ile giriş
  document.getElementById("googleLoginBtn")?.addEventListener("click", async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await user.reload();

      if (!user.emailVerified) {
        await sendEmailVerification(user, {
          url: "https://evlilikyolutr.netlify.app/login/verify-success.html"
        });

        alert("📩 İlk kez Google ile giriş yaptınız. E-posta adresinize doğrulama bağlantısı gönderildi.\nLütfen doğruladıktan sonra tekrar giriş yapınız.");
        await signOut(auth);
        return;
      }

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

      window.location.href = "/home/home.html";
    } catch (error) {
      alert("❌ Google ile giriş başarısız: " + error.message);
    }
  });

});