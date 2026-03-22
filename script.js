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
let allParts = [];

// USER
onAuthStateChanged(auth, (user) => {
  document.getElementById("user").innerText =
    user ? "👤 " + user.email : "Not logged in";
});

// AUTH
window.register = async () => {
  await createUserWithEmailAndPassword(auth, email(), pass());
  alert("Registered ✅");
};

window.login = async () => {
  await signInWithEmailAndPassword(auth, email(), pass());
  alert("Logged in ✅");
};

window.logout = () => signOut(auth);

// ADD PART WITH LOCATION
window.addPart = async () => {
  if (!auth.currentUser) return alert("Login first ❌");

  const name = document.getElementById("partName").value;
  const price = Number(document.getElementById("partPrice").value);
  const shop = document.getElementById("shopName").value;

  navigator.geolocation.getCurrentPosition(async (pos) => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    await addDoc(collection(db, "parts"), {
      name,
      price,
      shop,
      lat,
      lng
    });

    alert("Part added with location 📍");
    loadParts();
    loadMapParts();
  });
};

// LOAD PRODUCTS
async function loadParts() {
  const snap = await getDocs(collection(db, "parts"));
  let html = "";
  allParts = [];

  snap.forEach(doc => {
    const data = doc.data();
    allParts.push(data);
    html += card(data);
  });

  document.getElementById("results").innerHTML = html;
}

// CARD
function card(p) {
  return `
    <div class="card">
      <h3>${p.name}</h3>
      <p>₹${p.price}</p>
      <small>${p.shop}</small>
      <button onclick="addToCart('${p.name}', ${p.price})">Add to Cart</button>
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

// 💳 FAKE PAYMENT SYSTEM (DEMO READY)
window.checkout = () => {
  if (!auth.currentUser) return alert("Login required ❌");

  if (cart.length === 0) return alert("Cart empty ❌");

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  // Fake payment popup
  const confirmPay = confirm(`Pay ₹${total} ?`);

  if (confirmPay) {
    alert("✅ Payment Successful!");
    cart = [];
    updateCart();
  } else {
    alert("❌ Payment Cancelled");
  }
};

// 🔍 SMART SEARCH + AI SUGGESTION
window.searchParts = async () => {
  const q = document.getElementById("search").value.toLowerCase();

  let html = "";
  let suggestions = [];

  allParts.forEach(p => {
    if (p.name.toLowerCase().includes(q)) {
      html += card(p);
    } else {
      suggestions.push(p);
    }
  });

  // If no result → show AI suggestion
  if (!html) {
    html = `<p style="text-align:center;">No exact match 😢<br>Showing suggestions 👇</p>`;

    suggestions.slice(0, 3).forEach(p => {
      html += card(p);
    });
  }

  document.getElementById("results").innerHTML = html;
};

// MAP MARKERS
async function loadMapParts() {
  const snap = await getDocs(collection(db, "parts"));

  snap.forEach(doc => {
    const p = doc.data();

    if (p.lat && p.lng) {
      new google.maps.Marker({
        position: { lat: p.lat, lng: p.lng },
        map: window.map,
        title: p.name
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
