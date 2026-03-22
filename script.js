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
// 🔥 CONFIG
// =============================
const firebaseConfig = {
  apiKey: "AIzaSyBhT0ag7_G567gV2uYvqKbXUARwWzDsDZg",
  authDomain: "automart-6d640.firebaseapp.com",
  projectId: "automart-6d640"
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
  document.getElementById("user").innerText =
    user ? "👤 " + user.email : "Not logged in";
});

// =============================
// 🔐 AUTH
// =============================
window.register = async () => {
  await createUserWithEmailAndPassword(auth, email(), pass());
  alert("Registered");
};

window.login = async () => {
  await signInWithEmailAndPassword(auth, email(), pass());
  alert("Logged in");
};

window.logout = () => signOut(auth);

// =============================
// 🛒 CART SYSTEM
// =============================
let cart = [];

function addToCart(name, price) {
  cart.push({ name, price });
  renderCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}

function renderCart() {
  let html = "";
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price;

    html += `
      <div class="card">
        <h3>${item.name}</h3>
        <p>₹${item.price}</p>
        <button onclick="removeFromCart(${index})">❌ Remove</button>
      </div>
    `;
  });

  document.getElementById("cartItems").innerHTML = html;
  document.getElementById("total").innerText = "Total: ₹" + total;
}

// =============================
// ➕ ADD PART
// =============================
window.addPart = async () => {
  if (!auth.currentUser) return alert("Login first");

  await addDoc(collection(db, "parts"), {
    name: document.getElementById("partName").value,
    price: Number(document.getElementById("partPrice").value),
    shop: document.getElementById("shopName").value
  });

  alert("Added");
  loadParts();
};

// =============================
// 🔍 SEARCH
// =============================
window.searchParts = async () => {
  const q = document.getElementById("search").value.toLowerCase();
  const snap = await getDocs(collection(db, "parts"));

  let html = "";
  snap.forEach(doc => {
    const p = doc.data();
    if (p.name.toLowerCase().includes(q)) html += card(p);
  });

  document.getElementById("results").innerHTML = html;
};

// =============================
// 📦 LOAD
// =============================
async function loadParts() {
  const snap = await getDocs(collection(db, "parts"));
  let html = "";

  snap.forEach(doc => html += card(doc.data()));

  document.getElementById("results").innerHTML = html;
}

// =============================
// 🎨 CARD
// =============================
function card(p) {
  return `
    <div class="card">
      <h3>${p.name}</h3>
      <p>₹${p.price}</p>
      <small>${p.shop}</small>
      <button onclick="addToCart('${p.name}', ${p.price})">
        🛒 Add to Cart
      </button>
    </div>
  `;
}

// =============================
// 🔧 HELPERS
// =============================
const email = () => document.getElementById("email").value;
const pass = () => document.getElementById("password").value;

// =============================
// 🚀 AUTO LOAD
// =============================
loadParts();
