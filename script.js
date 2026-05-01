'use strict';

/* ================= UI FUNCTIONS ================= */

// PAGE SWITCH
window.showPage = function(page) {
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  document.getElementById("page-" + page).classList.remove("hidden");
};

// MOBILE MENU
window.toggleMobileMenu = function() {
  document.getElementById("mobileMenu").classList.toggle("hidden");
};

// PASSWORD TOGGLE
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

// ACCOUNT TYPE SWITCH
window.setAccountType = function(type) {
  document.getElementById("typeBuyer").classList.remove("active");
  document.getElementById("typeShop").classList.remove("active");

  document.getElementById(type === "buyer" ? "typeBuyer" : "typeShop").classList.add("active");

  document.getElementById("shopFields").classList.toggle("hidden", type !== "shop");
};

/* ================= FIREBASE SETUP ================= */

const firebaseConfig = {
  apiKey: "AIzaSyBhT0ag7_G567gV2uYvqKbXUARwWzDsDZg",
  authDomain: "automart-6d640.firebaseapp.com",
  projectId: "automart-6d640",
  storageBucket: "automart-6d640.firebasestorage.app",
  messagingSenderId: "397090205144",
  appId: "1:397090205144:web:e01bbffd00a11a5d0696ad"
};

// INIT FIREBASE
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/* ================= AUTH ================= */

// REGISTER
window.handleRegister = async function() {
  const email = document.querySelector("#page-register input[type='email']").value;
  const password = document.getElementById("regPass").value;

  if (!email || !password) {
    alert("Please fill all fields");
    return;
  }

  try {
    await firebase.auth().createUserWithEmailAndPassword(email, password);
    alert("Account created successfully!");
    showPage('home');
  } catch (error) {
    alert(error.message);
  }
};

// LOGIN
window.handleLogin = async function() {
  const email = document.querySelector("#page-login input[type='email']").value;
  const password = document.getElementById("loginPass").value;

  if (!email || !password) {
    alert("Please fill all fields");
    return;
  }

  try {
    await firebase.auth().signInWithEmailAndPassword(email, password);
    alert("Login successful!");
    showPage('home');
  } catch (error) {
    alert(error.message);
  }
};

/* ================= DATABASE ================= */

let partsData = [];

// LOAD PARTS
async function loadParts() {
  const snapshot = await db.collection("parts").get();
  partsData = [];
  snapshot.forEach(doc => partsData.push(doc.data()));
  renderResults(partsData);
}

// SEARCH
window.filterResults = function () {
  const text = document.getElementById("searchInput").value.toLowerCase();
  const filtered = partsData.filter(p =>
    p.name.toLowerCase().includes(text)
  );
  renderResults(filtered);
};

// DISPLAY RESULTS
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
    grid.innerHTML += `
      <div class="bg-white rounded-xl p-4 shadow hover:shadow-lg transition">
        <h3 class="font-bold">${p.name}</h3>
        <p class="text-brand-600">₹${p.price}</p>
        <p>${p.availability}</p>
      </div>
    `;
  });
}

// ADD PART
window.addPart = async function () {
  const name = document.getElementById("partName").value;
  const price = parseFloat(document.getElementById("partPrice").value);
  const category = document.getElementById("partCat").value;
  const availability = document.querySelector("input[name='avail']:checked").value;

  if (!name || !price) {
    alert("Fill required fields");
    return;
  }

  await db.collection("parts").add({
    name,
    price,
    category,
    availability
  });

  alert("Part Added!");
  loadParts();
};

/* ================= INIT ================= */

window.onload = function() {
  loadParts();
};
