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

const firebaseConfig = {
  apiKey: "AIzaSyBhT0ag7_G567gV2uYvqKbXUARwWzDsDZg",
  authDomain: "automart-6d640.firebaseapp.com",
  projectId: "automart-6d640"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// USER
onAuthStateChanged(auth, user => {
  document.getElementById("user").innerText =
    user ? "👤 " + user.email : "Not logged in";
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

function addToCart(name, price) {
  cart.push({ name, price });
  renderCart();
}

function renderCart() {
  let html = "", total = 0;
  cart.forEach((i, index) => {
    total += i.price;
    html += `<div class="card">
      <h3>${i.name}</h3>
      <p>₹${i.price}</p>
      <button onclick="removeFromCart(${index})">Remove</button>
    </div>`;
  });
  document.getElementById("cartItems").innerHTML = html;
  document.getElementById("total").innerText = "Total: ₹" + total;
}

function removeFromCart(i) {
  cart.splice(i,1);
  renderCart();
}

// CHECKOUT
window.checkout = () => {
  let html = "", total = 0;
  cart.forEach(i => {
    total += i.price;
    html += `<p>${i.name} - ₹${i.price}</p>`;
  });
  document.getElementById("orderDetails").innerHTML = html;
  document.getElementById("finalTotal").innerText = "₹" + total;
  document.getElementById("checkoutBox").style.display = "block";
};

window.closeCheckout = () =>
  document.getElementById("checkoutBox").style.display = "none";

window.confirmOrder = () => {
  alert("Payment Successful!");
  cart = [];
  renderCart();
  closeCheckout();
};

// ADD PART WITH IMAGE
window.addPart = async () => {
  const file = document.getElementById("partImage").files[0];
  const storageRef = ref(storage, "img/" + file.name);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  await addDoc(collection(db, "parts"), {
    name: partName.value,
    price: Number(partPrice.value),
    shop: shopName.value,
    image: url
  });

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
      <img src="${p.image}">
      <h3>${p.name}</h3>
      <p>₹${p.price}</p>
      <small>${p.shop}</small>
      <button onclick="addToCart('${p.name}', ${p.price})">Add</button>
    </div>`;
}

const email = () => email.value;
const pass = () => password.value;

loadParts();
