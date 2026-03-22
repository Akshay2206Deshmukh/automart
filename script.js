import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBhT0ag7_G567gV2uYvqKbXUARwWzDsDZg",
  authDomain: "automart-6d640.firebaseapp.com",
  projectId: "automart-6d640"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let cart = [];

// --- UTILS ---
const val = id => document.getElementById(id).value;
const email = () => val("email");
const pass = () => val("password");

// --- AUTHENTICATION ---
document.getElementById('loginBtn')?.addEventListener('click', async () => {
  try {
    await signInWithEmailAndPassword(auth, email(), pass());
    alert("Logged in successfully!");
    document.getElementById("user").textContent = email();
  } catch (error) {
    alert("Login failed: " + error.message);
  }
});

document.getElementById('registerBtn')?.addEventListener('click', async () => {
  try {
    await createUserWithEmailAndPassword(auth, email(), pass());
    alert("Registered successfully!");
  } catch (error) {
    alert("Registration failed: " + error.message);
  }
});

// --- FIRESTORE DATABASE ---
document.getElementById('addPartBtn')?.addEventListener('click', async () => {
  try {
    await addDoc(collection(db, "parts"), {
      name: val("partName"),
      price: Number(val("partPrice")),
      shop: val("shopName"),
      image: val("partImage")
    });
    alert("Part added!");
    loadParts(); // Refresh grid
  } catch (error) {
    alert("Error adding part: " + error.message);
  }
});

async function loadParts() {
  const snap = await getDocs(collection(db, "parts"));
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = ""; // Clear existing
  
  snap.forEach(doc => {
    const p = doc.data();
    // Using DOM creation for better security, avoiding raw innerHTML for dynamic data where possible
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.image || 'https://via.placeholder.com/150'}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>₹${p.price}</p>
      <button class="add-to-cart-btn" data-name="${p.name}" data-price="${p.price}">Add to Cart</button>
    `;
    resultsDiv.appendChild(card);
  });

  // Attach event listeners to newly created cart buttons
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      addToCart(e.target.dataset.name, Number(e.target.dataset.price));
    });
  });
}

// --- CART LOGIC ---
function addToCart(name, price) {
  cart.push({ name, price });
  renderCart();
}

function renderCart() {
  const cartItemsDiv = document.getElementById("cartItems");
  cartItemsDiv.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price;
    const itemDiv = document.createElement('div');
    itemDiv.innerHTML = `${item.name} - ₹${item.price} <button class="remove-btn" data-index="${index}">❌</button>`;
    cartItemsDiv.appendChild(itemDiv);
  });

  document.getElementById("total").innerText = total;

  // Add listeners to remove buttons
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      cart.splice(e.target.dataset.index, 1);
      renderCart();
    });
  });
}

document.getElementById('toggleCartBtn')?.addEventListener('click', () => {
  document.getElementById("cart").classList.toggle("active");
});

// --- CHATBOT (XSS SECURED) ---
document.getElementById('chat-header')?.addEventListener('click', () => {
  const chatBody = document.getElementById("chat-body");
  chatBody.style.display = chatBody.style.display === "block" ? "none" : "block";
});

// Replace inline sendMessage()
document.querySelector('#chat-body button')?.addEventListener('click', () => {
  const inputEl = document.getElementById("chatInput");
  const msg = inputEl.value;
  if (!msg) return;

  const chatMessages = document.getElementById("chat-messages");
  
  // Securely add user message using textContent
  const userMsg = document.createElement('p');
  userMsg.textContent = `You: ${msg}`;
  chatMessages.appendChild(userMsg);

  // Securely add bot response
  const botMsg = document.createElement('p');
  botMsg.textContent = `Bot: Try brake pads 🔧`;
  chatMessages.appendChild(botMsg);

  inputEl.value = ""; // Clear input
});

// Initialize the page
loadParts();
