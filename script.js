// Firebase imports (IMPORTANT)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// 🔥 YOUR FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyBhT0ag7_G567gV2uYvqKbXUARwWzDsDZg",
  authDomain: "automart-6d640.firebaseapp.com",
  projectId: "automart-6d640",
  storageBucket: "automart-6d640.appspot.com",
  messagingSenderId: "397090205144",
  appId: "1:397090205144:web:e01bbffd00a11a5d0696ad"
};

// 🚀 Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// =========================
// 🔐 AUTH FUNCTIONS
// =========================

// REGISTER
window.register = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("✅ Registered successfully!");
  } catch (err) {
    alert("❌ " + err.message);
  }
};

// LOGIN
window.login = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("✅ Login successful!");
  } catch (err) {
    alert("❌ " + err.message);
  }
};

// LOGOUT
window.logout = function () {
  signOut(auth);
};

// SHOW USER STATUS
onAuthStateChanged(auth, (user) => {
  const userDiv = document.getElementById("user");

  if (user) {
    userDiv.innerText = "👤 " + user.email;
  } else {
    userDiv.innerText = "Not logged in";
  }
});

// =========================
// ➕ ADD DATA
// =========================
window.addSampleData = async function () {
  try {
    await addDoc(collection(db, "parts"), {
      name: "Brake Pads",
      price: 1200
    });
    alert("✅ Data added!");
  } catch (err) {
    alert("❌ " + err.message);
  }
};

// =========================
// 🔍 SEARCH PARTS (CARD UI)
// =========================
window.searchParts = async function () {
  const query = document.getElementById("search").value.toLowerCase();
  const snapshot = await getDocs(collection(db, "parts"));

  let html = "";

  snapshot.forEach((doc) => {
    const data = doc.data();

    if (data.name.toLowerCase().includes(query)) {
      html += `
        <div class="card">
          <h3>${data.name}</h3>
          <p>Price: ₹${data.price}</p>
        </div>
      `;
    }
  });

  document.getElementById("results").innerHTML =
    html || "<p>No parts found</p>";
};
