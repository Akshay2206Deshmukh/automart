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

const firebaseConfig = {
  apiKey: "AIzaSyBhT0ag7_G567gV2uYvqKbXUARwWzDsDZg",
  authDomain: "automart-6d640.firebaseapp.com",
  projectId: "automart-6d640"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let cart = [];

// USER
onAuthStateChanged(auth, (user) => {
  document.getElementById("user").innerText =
    user ? "👤 " + user.email : "Not logged in";
});

// AUTH
window.register = async () => {
  await createUserWithEmailAndPassword(auth, email(), pass());
  alert("Registered");
};

window.login = async () => {
  await signInWithEmailAndPassword(auth, email(), pass());
  alert("Logged in");
};

window.logout = () => signOut(auth);

// ADD PART
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

// LOAD
async function loadParts() {
  const snap = await getDocs(collection(db, "parts"));
  let html = "";

  snap.forEach(doc => html += card(doc.data()));

  document.getElementById("results").innerHTML = html;
}

// CARD
function card(p) {
  return `
    <div class="card">
      <h3>${p.name}</h3>
      <p>₹${p.price}</p>
      <small>${p.shop}</small>
      <button onclick="addToCart('${p.name}', ${p.price})">Add</button>
    </div>
  `;
}

// CART
window.addToCart = (name, price) => {
  cart.push({ name, price });
  updateCart();
};

function updateCart() {
  let total = 0;
  let html = "";

  cart.forEach((item, i) => {
    total += item.price;
    html += `<p>${item.name} - ₹${item.price}
      <button onclick="removeItem(${i})">❌</button></p>`;
  });

  document.getElementById("cart").innerHTML = html;
  document.getElementById("total").innerText = total;
}

window.removeItem = (i) => {
  cart.splice(i, 1);
  updateCart();
};

window.checkout = () => {
  if (cart.length === 0) return alert("Cart empty ❌");
  alert("Order placed ✅");
  cart = [];
  updateCart();
};

// SEARCH
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

// HELPERS
const email = () => document.getElementById("email").value;
const pass = () => document.getElementById("password").value;

// INIT
loadParts();
