// 🔥 FIREBASE IMPORTS
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getAuth, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getStorage, ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// 🔥 CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyBhT0ag7_G567gV2uYvqKbXUARwWzDsDZg",
  authDomain: "automart-6d640.firebaseapp.com",
  projectId: "automart-6d640"
};

// 🚀 INIT
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// =============================
// 👤 USER STATE
// =============================
onAuthStateChanged(auth, user => {
  document.getElementById("user").innerText =
    user ? "👤 " + user.email : "Not logged in";
});

// =============================
// 🔐 AUTH
// =============================
window.login = async () => {
  try {
    await signInWithEmailAndPassword(auth, email(), pass());
    alert("✅ Logged in");
  } catch (e) {
    alert("❌ " + e.message);
  }
};

window.register = async () => {
  try {
    await createUserWithEmailAndPassword(auth, email(), pass());
    alert("✅ Registered");
  } catch (e) {
    alert("❌ " + e.message);
  }
};

window.logout = () => signOut(auth);

// =============================
// 🛒 CART
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

  cart.forEach((item, i) => {
    total += item.price;

    html += `
      <div class="card">
        <h3>${item.name}</h3>
        <p>₹${item.price}</p>
        <button onclick="removeFromCart(${i})">❌ Remove</button>
      </div>
    `;
  });

  document.getElementById("cartItems").innerHTML =
    html || "<p>No items in cart</p>";

  document.getElementById("total").innerText = "Total: ₹" + total;
}

// =============================
// 💳 CHECKOUT
// =============================
window.checkout = () => {
  if (cart.length === 0) return alert("Cart empty!");

  let html = "";
  let total = 0;

  cart.forEach(item => {
    total += item.price;
    html += `<p>${item.name} - ₹${item.price}</p>`;
  });

  document.getElementById("orderDetails").innerHTML = html;
  document.getElementById("finalTotal").innerText = "Total: ₹" + total;
  document.getElementById("checkoutBox").style.display = "block";
};

window.closeCheckout = () => {
  document.getElementById("checkoutBox").style.display = "none";
};

window.confirmOrder = () => {
  alert("🎉 Payment Successful!");
  cart = [];
  renderCart();
  closeCheckout();
};

// =============================
// ➕ ADD PART WITH IMAGE
// =============================
window.addPart = async () => {
  if (!auth.currentUser) return alert("Login first");

  const name = partName.value;
  const price = Number(partPrice.value);
  const shop = shopName.value;
  const file = partImage.files[0];

  if (!name || !price || !shop) {
    return alert("Fill all fields");
  }

  let imageUrl = "";

  if (file) {
    const storageRef = ref(storage, "parts/" + Date.now() + file.name);
    await uploadBytes(storageRef, file);
    imageUrl = await getDownloadURL(storageRef);
  }

  await addDoc(collection(db, "parts"), {
    name,
    price,
    shop,
    image: imageUrl
  });

  alert("✅ Part added");

  // clear inputs
  partName.value = "";
  partPrice.value = "";
  shopName.value = "";
  partImage.value = "";

  loadParts();
};

// =============================
// 🔍 SEARCH
// =============================
window.searchParts = async () => {
  const q = search.value.toLowerCase();
  const snap = await getDocs(collection(db, "parts"));

  let html = "";

  snap.forEach(doc => {
    const p = doc.data();
    if (p.name.toLowerCase().includes(q)) html += card(p);
  });

  document.getElementById("results").innerHTML =
    html || "<p>No results</p>";
};

// =============================
// 📦 LOAD PARTS
// =============================
async function loadParts() {
  const snap = await getDocs(collection(db, "parts"));

  let html = "";
  snap.forEach(doc => html += card(doc.data()));

  document.getElementById("results").innerHTML = html;
}

// =============================
// 🎨 CARD UI
// =============================
function card(p) {
  return `
    <div class="card">
      <img src="${p.image || 'https://via.placeholder.com/200'}">
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
loadParts();
