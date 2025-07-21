import {
  getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, collection, query, where, orderBy, getDocs, onSnapshot, setDoc, doc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { app } from "/firebaseConfig.js";

const auth = getAuth(app);
const db = getFirestore(app);

// 🔔 Bildirim sayısı
onAuthStateChanged(auth, (user) => {
  if (!user) return;
  const notifQuery = query(
    collection(db, "notifications"),
    where("to", "==", user.uid),
    where("seen", "==", false)
  );
  onSnapshot(notifQuery, (snapshot) => {
    const count = snapshot.size;
    const badge = document.getElementById("notifCount");
    badge.style.display = count > 0 ? "inline-block" : "none";
    badge.textContent = count;
  });
});

// 🔴 Online kullanıcıyı Firestore'a ekle
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userDoc = await getDocs(query(collection(db, "users"), where("uid", "==", user.uid)));
    const userData = userDoc.docs[0]?.data() || {};
    await setDoc(doc(db, "onlineUsers", user.uid), {
      uid: user.uid,
      displayName: userData.displayName || "Üye",
      profileImage: userData.profileImage || "/images/default-avatar.png",
      age: userData.age || "",
      timestamp: serverTimestamp()
    });
  }
});

// 🟢 Online kullanıcıları yükle
async function loadOnlineUsers() {
  const q = query(collection(db, "onlineUsers"));
  const snapshot = await getDocs(q);
  const listDiv = document.getElementById("onlineUsers");
  listDiv.innerHTML = "";
  snapshot.forEach((doc) => {
    const user = doc.data();
    const card = document.createElement("div");
    card.className = "user-card";
    const imageUrl = user.profileImage && user.profileImage.trim() !== "" ? user.profileImage : "/images/default-avatar.png";
    card.innerHTML = `
      <a href="/profile/profile-view.html?uid=${user.uid}" style="text-decoration: none; color: inherit; display: flex; flex-direction: column; align-items: center;">
        <img src="${imageUrl}" alt="avatar">
        <h4 style="margin: 5px 0 2px 0;">${user.displayName || "Üye"}</h4>
        <div style="font-size: 14px; color: #fff;">${user.age ? user.age + " yaş" : ""}</div>
      </a>`;
    listDiv.appendChild(card);
  });
}
loadOnlineUsers();

// 🟡 Paylaşımlar
const shareQuery = query(collection(db, "shares"), orderBy("createdAt", "desc"));
const sharedPostsDiv = document.getElementById("sharedPosts");

onSnapshot(shareQuery, (snapshot) => {
  sharedPostsDiv.innerHTML = "";
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000);
  snapshot.forEach((doc) => {
    const post = doc.data();
    if (!post.createdAt || post.createdAt.toDate() < threeDaysAgo) return;
    const postDiv = document.createElement("div");
    postDiv.style.background = "rgba(0,0,0,0.6)";
    postDiv.style.padding = "15px";
    postDiv.style.borderRadius = "10px";
    postDiv.style.maxWidth = "400px";
    postDiv.style.width = "90%";
    postDiv.style.color = "white";
    postDiv.style.textAlign = "left";
    postDiv.innerHTML = `
      <a href="/profile/profile-view.html?uid=${post.uid}" style="color:white; text-decoration:none;">
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
          <img src="${post.profileImage}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;">
          <div>
            <strong>${post.displayName}</strong><br/>
            <small>${post.age ? post.age + " yaş" : ""}</small>
          </div>
        </div>
      </a>
      <p style="margin:10px 0;">${post.text}</p>
      <div style="display:flex; justify-content:space-around;">
        <button onclick="showGoldPopup()" style="background: #ff69b4; color:white; border:none; border-radius:8px; padding:5px 10px;">Mesaj Gönder</button>
        <button onclick="showGiftPopup()" style="background: gold; color:black; border:none; border-radius:8px; padding:5px 10px;">Hediye Gönder</button>
      </div>
    `;
    sharedPostsDiv.appendChild(postDiv);
  });
});

async function submitShare() {
  const user = auth.currentUser;
  if (!user) {
    alert("Paylaşım yapabilmek için giriş yapmalısınız.");
    return;
  }
  const input = document.getElementById("shareText");
  const text = input.value.trim();
  if (!text) return alert("Lütfen bir şeyler yazın.");
  await setDoc(doc(collection(db, "shares")), {
    uid: user.uid,
    text,
    createdAt: serverTimestamp(),
    displayName: user.displayName || "Üye",
    profileImage: user.photoURL || "/images/default-avatar.png",
    age: "", // yaş istersen buraya eklenebilir
  });
  input.value = "";
}

// 🟣 Premium Mesaj Gönderme Popup
window.showGoldPopup = function () {
  const popup = document.getElementById("goldPopup");
  popup.style.display = "block";
};

window.closeGoldPopup = function () {
  const popup = document.getElementById("goldPopup");
  popup.style.display = "none";
};

window.showGoldIban = function () {
  const select = document.getElementById("goldSelect");
  const iban = document.getElementById("goldIban");
  iban.style.display = select.value ? "block" : "none";
};

// 🟠 Hediye Gönderme Popup
window.showGiftPopup = function () {
  const popup = document.getElementById("giftPopup");
  popup.style.display = "block";
};

window.closeGiftPopup = function () {
  const popup = document.getElementById("giftPopup");
  popup.style.display = "none";
};

window.showGiftIban = function () {
  const select = document.getElementById("giftSelect");
  const iban = document.getElementById("giftIban");
  iban.style.display = select.value ? "block" : "none";
};

// Sayfa geçiş
window.goTo = function (target) {
  if (target === "home") location.href = "/home/home.html";
  else if (target === "profile") location.href = "/profile/profile.html";
  else if (target === "messages") location.href = "/messages/messages.html";
  else if (target === "notifications") location.href = "/notifications/notifications.html";
  else if (target === "gifts") location.href = "/gifts/gifts.html";
};

window.logout = function () {
  signOut(auth).then(() => {
    location.href = "/login/login.html";
  });
};
