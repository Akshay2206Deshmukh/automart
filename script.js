// =============================
// 🔥 FIREBASE IMPORTS
// =============================
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

// =============================
// 🔥 FIREBASE CONFIG
// =============================
const firebaseConfig = {
  apiKey: "AIzaSyBhT0ag7_G567gV2uYvqKbXUARwWzDsDZg",
  authDomain: "automart-6d640.firebaseapp.com",
  projectId: "automart-6d640",
  storageBucket: "automart-6d640.appspot.com",
  messagingSenderId: "397090205144",
  appId: "1:397090205144:web:e01bbffd00a11a5d0696ad"
};

// =============================
// 🚀 INIT
// =============================
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// =============================
// 👤 USER STATE
// =============================
onAuthStateChanged(auth, (user) => {
  const userDiv = document.getElementById("user");

  if (user) {
    userDiv.innerText = "👤 " + user.email;
  } else {
    userDiv.innerText = "Not logged in";
  }
});

// =============================
// 🔐 AUTH FUNCTIONS
// =============================

// REGISTER
window.register = async function () {
  const email = document.getElementById("email")?.value;
  const password = document.getElementById("password")?.value;

  if (!email || !password) {
    alert("Enter email & password");
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("✅ Registered!");
  } catch (err) {
    alert("❌ " + err.message);
  }
};

// LOGIN
window.login = async function () {
  const email = document.getElementById("email")?.value;
  const password = document.getElementById("password")?.value;

  if (!email || !password) {
    alert("Enter email & password");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("✅ Logged in!");
  } catch (err) {
    alert("❌ " + err.message);
  }
};

// LOGOUT
window.logout = function () {
  signOut(auth);
};

// =============================
// ➕ ADD PART
// =============================
window.addPart = async function () {
  const user = auth.currentUser;

  if (!user) {
    alert("❌ Please login first!");
    return;
  }

  const name = document.getElementById("partName").value.trim();
  const price = document.getElementById("partPrice").value;
  const shop = document.getElementById("shopName").value.trim();

  if (!name || !price || !shop) {
    alert("❌ Fill all fields!");
    return;
  }

  try {
    await addDoc(collection(db, "parts"), {
      name,
      price: Number(price),
      shop,
      owner: user.email
    });

    alert("✅ Part added!");

    // Clear inputs
    document.getElementById("partName").value = "";
    document.getElementById("partPrice").value = "";
    document.getElementById("shopName").value = "";

    // 🔥 Reload data instantly
    loadParts();

  } catch (err) {
    alert("❌ " + err.message);
  }
};

// =============================
// 🔍 SEARCH PARTS
// =============================
window.searchParts = async function () {
  const query = document.getElementById("search").value.toLowerCase();
  const snapshot = await getDocs(collection(db, "parts"));

  let html = "";

  snapshot.forEach((doc) => {
    const p = doc.data();

    if (p.name.toLowerCase().includes(query)) {
      html += createCard(p);
    }
  });

  document.getElementById("results").innerHTML =
    html || "<p style='text-align:center'>No parts found</p>";
};

// =============================
// 📦 LOAD ALL PARTS
// =============================
async function loadParts() {
  const snapshot = await getDocs(collection(db, "parts"));

  let html = "";

  snapshot.forEach((doc) => {
    const p = doc.data();
    html += createCard(p);
  });

  document.getElementById("results").innerHTML =
    html || "<p style='text-align:center'>No parts available</p>";
}

// =============================
// 🎨 CARD TEMPLATE
// =============================
function createCard(p) {
  return `
    <div class="product-card">
      <div class="product-image">⚙️</div>
      <div class="product-name">${p.name}</div>
      <div class="product-price">₹${p.price}</div>
      <div class="product-shop">${p.shop}</div>
    </div>
  `;
}

// =============================
// 🚀 AUTO LOAD ON START
// =============================
loadParts();
