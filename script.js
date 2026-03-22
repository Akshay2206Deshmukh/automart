import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getAuth, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getStorage, ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyBhT0ag7_G567gV2uYvqKbXUARwWzDsDZg",
  authDomain: "automart-6d640.firebaseapp.com",
  projectId: "automart-6d640"
};

// INIT
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// USER
onAuthStateChanged(auth, user => {
  document.getElementById("user").innerText =
    user ? user.email : "Not logged in";
});

// AUTH
window.login = async () => {
  await signInWithEmailAndPassword(auth, email(), pass());
};

window.register = async () => {
  await createUserWithEmailAndPassword(auth, email(), pass());
};

window.logout = () => signOut(auth);

// CART
let cart = [];

window.addToCart = (name, price) => {
  cart.push({ name, price });
  renderCart();
};

function renderCart() {
  let html = "", total = 0;

  cart.forEach((item, i) => {
    total += item.price;
    html += `<div class="card">${item.name} ₹${item.price}
    <button onclick="removeFromCart(${i})">X</button></div>`;
  });

  document.getElementById("cartItems").innerHTML = html;
  document.getElementById("total").innerText = "Total: ₹" + total;
}

window.removeFromCart = i => {
  cart.splice(i, 1);
  renderCart();
};

// ADD PART
window.addPart = async () => {
  const file = document.getElementById("partImage").files[0];

  let imageUrl = "";
  if (file) {
    const storageRef = ref(storage, file.name);
    await uploadBytes(storageRef, file);
    imageUrl = await getDownloadURL(storageRef);
  }

  await addDoc(collection(db, "parts"), {
    name: partName.value,
    price: Number(partPrice.value),
    shop: shopName.value,
    image: imageUrl
  });

  loadParts();
};

// LOAD PARTS
async function loadParts() {
  const snap = await getDocs(collection(db, "parts"));

  let html = "";
  snap.forEach(doc => {
    const p = doc.data();

    html += `
    <div class="card">
      <img src="${p.image || ''}">
      <h3>${p.name}</h3>
      <p>₹${p.price}</p>
      <small>${p.shop}</small>
      <button onclick="addToCart('${p.name}', ${p.price})">Add</button>
      <button onclick="deletePart('${doc.id}')">Delete</button>
    </div>`;
  });

  document.getElementById("results").innerHTML = html;
}

// DELETE
window.deletePart = async id => {
  await deleteDoc(doc(db, "parts", id));
  loadParts();
};

// SEARCH
window.searchParts = async () => {
  const q = search.value.toLowerCase();
  const snap = await getDocs(collection(db, "parts"));

  let html = "";
  snap.forEach(doc => {
    const p = doc.data();
    if (p.name.toLowerCase().includes(q)) {
      html += `<div class="card">${p.name}</div>`;
    }
  });

  document.getElementById("results").innerHTML = html;
};

// HELPERS
const email = () => document.getElementById("email").value;
const pass = () => document.getElementById("password").value;

// INIT
loadParts();
