// public/home/home.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBXDPSHzYwDKJMKflRPaC-egd-r6dLzL6U",
  authDomain: "evlilikyolutr.firebaseapp.com",
  projectId: "evlilikyolutr",
  storageBucket: "evlilikyolutr.firebasestorage.app",
  messagingSenderId: "299542496680",
  appId: "1:299542496680:web:79967f42f243b64c4dc99d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Oturum değiştiğinde online listesinden çıkar
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const logoutBtn = document.querySelector(".logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await deleteDoc(doc(db, "onlineUsers", user.uid));
      await signOut(auth);
      alert("Çıkış yapıldı.");
      location.href = "/login/login.html";
    });
  }

  // Alt menü butonları
  document.querySelector("button[onclick*='home']")?.addEventListener("click", () => {
    location.href = "/home/home.html";
  });

  document.querySelector("button[onclick*='messages']")?.addEventListener("click", () => {
    location.href = "/messages/index.html"; // mesaj kutusu açılır
  });

  document.querySelector("button[onclick*='gifts']")?.addEventListener("click", () => {
    alert("🎁 Hediye göndermek için jeton almalısınız.\n\n50 Jeton: 50 TL\n100 Jeton: 75 TL\n250 Jeton: 150 TL\n\nIBAN: TR91 0001 0040 0452 2812 1550 07\nAlıcı: NEJLA KOÇ\nBanka: Ziraat Bankası");
  });

  document.querySelector("button[onclick*='profile']")?.addEventListener("click", () => {
    location.href = "/profile/profile.html";
  });
});
