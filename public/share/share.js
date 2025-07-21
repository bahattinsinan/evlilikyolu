// 🔄 share.js - Ne Düşünüyorsun sistemi (GÜNCEL TAM DOSYA)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc, serverTimestamp, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { firebaseConfig } from "/firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const yasakliKelimeler = [
  "amk", "aq", "orospu", "sik", "piç", "ananı", "göt", "bok", "salak", "aptal",
  "gerizekalı", "şerefsiz", "kahpe", "yarrak", "pezevenk", "mal", "oç", "sürtük", "domal", "yavşak"
];

function kelimeFiltrele(input) {
  const regex = new RegExp(`\\b(${yasakliKelimeler.join("|")})\\b`, "gi");
  return !regex.test(input);
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Lütfen önce giriş yapın");
    window.location.href = "/login/login.html";
    return;
  }

  const uid = user.uid;
  const shareBtn = document.getElementById("shareBtn");
  const inputBox = document.getElementById("shareInput");
  const shareList = document.getElementById("shareList");

  shareBtn.addEventListener("click", async () => {
    const text = inputBox.value.trim();

    if (text === "") {
      alert("Lütfen bir şeyler yazın.");
      return;
    }

    if (!kelimeFiltrele(text)) {
      alert("Paylaşımınız uygunsuz kelimeler içeriyor.");
      return;
    }

    try {
      await addDoc(collection(db, "shares"), {
        uid,
        text,
        timestamp: serverTimestamp()
      });
      inputBox.value = "";
      loadShares();
    } catch (error) {
      alert("⚠️ Paylaşım yapılamadı: " + error.message);
    }
  });

  async function loadShares() {
    shareList.innerHTML = "";
    const q = query(collection(db, "shares"));
    const snapshot = await getDocs(q);
    const now = new Date();

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const postTime = data.timestamp?.toDate();
      const elapsed = postTime ? (now - postTime) / (1000 * 60 * 60) : null;

      if (elapsed && elapsed > 24) {
        await deleteDoc(doc(db, "shares", docSnap.id));
        continue;
      }

      const userDoc = await getDoc(doc(db, "users", data.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
      const imageUrl = userData.profileImage && userData.profileImage.trim() !== "" ? userData.profileImage : "/images/default-avatar.png";

      const card = document.createElement("div");
      card.className = "share-card";
      card.innerHTML = `
        <div class="share-header" onclick="goToProfile('${data.uid}')" style="cursor:pointer">
          <img src="${imageUrl}" alt="avatar" style="width:40px;height:40px;border-radius:50%;margin-right:8px;vertical-align:middle;">
          <strong>${userData.displayName || "Üye"}</strong> <small>(${userData.age || "?"} yaş)</small>
        </div>
        <p style="margin-top:10px">${data.text}</p>
        <div class="share-actions">
          <button onclick="sendGift()">🎁 Hediye Gönder</button>
          <button onclick="sendMessage()">✉️ Mesaj Gönder</button>
        </div>
      `;
      shareList.appendChild(card);
    }
  }

  loadShares();
});

window.sendGift = () => {
  alert("Yeterli jeton yok. Paket seçenekleri:\n\n- 50 Jeton: 50 TL\n- 100 Jeton: 75 TL\n- 250 Jeton: 150 TL\n\nIBAN: TR91 0001 0040 0452 2812 1550 07\nNEJLA KOÇ – Ziraat Bankası");
};

window.sendMessage = () => {
  alert("Mesaj göndermek için premium üye olmalısınız.\n\n- 1 Ay: 100 TL\n- 3 Ay: 250 TL\n- 6 Ay: 500 TL\n- 1 Yıl: 800 TL\n\nIBAN: TR83 0006 2000 2310 0006 8172 69\nÖZKAN KOÇ – Garanti BBVA");
};

window.goToProfile = (uid) => {
  window.location.href = `/profile/profile-view.html?uid=${uid}`;
};
