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

// USER STATE
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
    </div>
  `;
}

// HELPERS
const email = () => document.getElementById("email").value;
const pass = () => document.getElementById("password").value;

// INIT
loadParts();

// CHECKOUT
window.checkout = () => {
  alert("Checkout coming soon 🚀");
};
