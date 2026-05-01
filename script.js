// 🔥 PAGE SWITCHING
window.showPage = function(page) {
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  document.getElementById("page-" + page).classList.remove("hidden");
};

// 🔥 MOBILE MENU
window.toggleMobileMenu = function() {
  document.getElementById("mobileMenu").classList.toggle("hidden");
};

// 🔥 PASSWORD TOGGLE
window.togglePass = function(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);

  if (input.type === "password") {
    input.type = "text";
    icon.classList.replace("fa-eye", "fa-eye-slash");
  } else {
    input.type = "password";
    icon.classList.replace("fa-eye-slash", "fa-eye");
  }
};

// 🔥 DUMMY LOGIN (for now)
window.handleLogin = function() {
  alert("Login feature coming soon");
};

// 🔥 DUMMY REGISTER
window.handleRegister = function() {
  alert("Register feature coming soon");
};

// 🔥 ACCOUNT TYPE TOGGLE
window.setAccountType = function(type) {
  document.getElementById("typeBuyer").classList.remove("active");
  document.getElementById("typeShop").classList.remove("active");

  document.getElementById(type === "buyer" ? "typeBuyer" : "typeShop").classList.add("active");

  document.getElementById("shopFields").classList.toggle("hidden", type !== "shop");
};
'use strict';

// 🔥 FIREBASE IMPORTS
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🔑 YOUR REAL CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyBhT0ag7_G567gV2uYvqKbXUARwWzDsDZg",
  authDomain: "automart-6d640.firebaseapp.com",
  projectId: "automart-6d640",
  storageBucket: "automart-6d640.firebasestorage.app",
  messagingSenderId: "397090205144",
  appId: "1:397090205144:web:e01bbffd00a11a5d0696ad"
};

// 🚀 INIT FIREBASE
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// GLOBAL DATA
let partsData = [];

// 📥 LOAD DATA FROM FIREBASE
async function loadParts() {
  const snapshot = await getDocs(collection(db, "parts"));
  partsData = [];
  snapshot.forEach(doc => {
    partsData.push({ id: doc.id, ...doc.data() });
  });
  renderResults(partsData);
}

// 🔎 SEARCH
window.filterResults = function () {
  const text = document.getElementById("searchInput").value.toLowerCase();
  let filtered = partsData.filter(p =>
    p.name.toLowerCase().includes(text)
  );
  renderResults(filtered);
};

// 🎨 DISPLAY RESULTS
function renderResults(data) {
  const grid = document.getElementById("resultsGrid");
  const empty = document.getElementById("emptyState");
  const count = document.getElementById("resultCount");

  grid.innerHTML = "";

  if (!data.length) {
    empty.classList.remove("hidden");
    count.innerHTML = "0 results";
    return;
  }

  empty.classList.add("hidden");
  count.innerHTML = `Showing ${data.length} results`;

  data.forEach(p => {
    const card = `
      <div class="bg-white rounded-xl p-4 shadow hover:shadow-lg transition">
        <h3 class="font-bold">${p.name}</h3>
        <p class="text-brand-600">₹${p.price}</p>
        <p>${p.availability}</p>
      </div>
    `;
    grid.innerHTML += card;
  });
}

// ➕ ADD PART
window.addPart = async function () {
  const name = document.getElementById("partName").value;
  const price = parseFloat(document.getElementById("partPrice").value);
  const category = document.getElementById("partCat").value;
  const availability = document.querySelector("input[name='avail']:checked").value;

  if (!name || !price) {
    alert("Fill required fields");
    return;
  }

  await addDoc(collection(db, "parts"), {
    name,
    price,
    category,
    availability
  });

  alert("Part Added!");
  loadParts();
};

// 🚀 INIT
window.onload = () => {
  loadParts();
};
