import { app } from "/firebaseConfig.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const db = getFirestore(app);
const auth = getAuth();

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const usersRef = collection(db, "users");
  const userQuery = query(usersRef, where("uid", "==", user.uid));
  const userDocSnap = await getDocs(userQuery);

  const userData = userDocSnap.docs[0]?.data() || {
    displayName: user.displayName || "Google Üyesi",
    profileImage: user.photoURL || "/images/default-avatar.png",
    age: ""
  };

  // ✅ Online kullanıcı olarak Firestore'a ekle
  await setDoc(doc(db, "onlineUsers", user.uid), {
    uid: user.uid,
    displayName: userData.displayName,
    profileImage: userData.profileImage,
    age: userData.age,
    timestamp: serverTimestamp()
  });

  // ❗️Profil bilgilerini DOM'a yazmak istiyorsan burada işlem yapabilirsin
});

// ✅ Çıkış yapanı online'dan sil
window.logout = async function () {
  const user = auth.currentUser;
  if (user) {
    await deleteDoc(doc(db, "onlineUsers", user.uid));
    await signOut(auth);
    alert("Çıkış yapıldı.");
    location.href = "/login/login.html";
  }
};
