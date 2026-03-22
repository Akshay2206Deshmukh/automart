import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
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

const ADMIN_EMAIL = "your-email@gmail.com";

let cart = [];

// USER
onAuthStateChanged(auth, (user) => {
  const userText = document.getElementById("user");

  if (user) {
    if (user.email === ADMIN_EMAIL) {
      userText.innerText = "👑 Admin: " + user.email;
      window.isAdmin = true;
    } else {
      userText.innerText = "👤 " + user.email;
      window.isAdmin = false;
    }
  } else {
    userText.innerText = "Not logged in";
    window.isAdmin = false;
  }
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

  const name = document.getElementById("partName").value;
  const price = Number(document.getElementById("partPrice").value);
  const shop = document.getElementById("shopName").value;
  const image = document.getElementById("partImage").value;

  navigator.geolocation.getCurrentPosition(async (pos) => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    await addDoc(collection(db, "parts"), {
      name,
      price,
      shop,
      image,
      lat,
      lng
    });

    alert("Added");
    loadParts();
    loadMapParts();
  });
};

// LOAD
async function loadParts() {
  const snap = await getDocs(collection(db, "parts"));
  let html = "";

  snap.forEach(docSnap => {
    html += card(docSnap.data(), docSnap.id);
  });

  document.getElementById("results").innerHTML = html;
}

// CARD
function card(p, id) {
  return `
    <div class="card">
      <img src="${p.image || ''}">
      <h3>${p.name}</h3>
      <p>₹${p.price}</p>
      <small>${p.shop}</small>

      <button onclick="addToCart('${p.name}', ${p.price})">Add</button>

      ${window.isAdmin ? `<button onclick="deletePart('${id}')">🗑 Delete</button>` : ""}
    </div>
  `;
}

// DELETE
window.deletePart = async (id) => {
  if (!window.isAdmin) return alert("Only admin");

  await deleteDoc(doc(db, "parts", id));
  alert("Deleted");
  loadParts();
};

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
    html += `<p>${item.name} - ₹${item.price}</p>`;
  });

  document.getElementById("cart").innerHTML = html;
  document.getElementById("total").innerText = total;
};

window.checkout = () => {
  if (!auth.currentUser) return alert("Login first");
  if (cart.length === 0) return alert("Cart empty");

  alert("Payment Successful 🎉");
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
    if (p.name.toLowerCase().includes(q)) {
      html += card(p, doc.id);
    }
  });

  document.getElementById("results").innerHTML = html;
};

// MAP
async function loadMapParts() {
  const snap = await getDocs(collection(db, "parts"));

  snap.forEach(doc => {
    const p = doc.data();

    if (p.lat && p.lng) {
      new google.maps.Marker({
        position: { lat: p.lat, lng: p.lng },
        map: window.map
      });
    }
  });
}

window.loadMapParts = loadMapParts;

// HELPERS
const email = () => document.getElementById("email").value;
const pass = () => document.getElementById("password").value;

// INIT
loadParts();
