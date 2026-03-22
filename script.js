import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  where
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

// DOM Elements
const elements = {
  user: document.getElementById("user"),
  search: document.getElementById("search"),
  results: document.getElementById("results"),
  cart: document.getElementById("cart"),
  total: document.getElementById("total"),
  authModal: document.getElementById("authModal"),
  modalTitle: document.getElementById("modalTitle")
};

// State
let cart = [];
let currentUser = null;
let isRegisterMode = false;
let parts = [];

// Initialize app
document.addEventListener('DOMContentLoaded', initApp);

// App Initialization
async function initApp() {
  hideLoader();
  setupEventListeners();
  await loadParts();
  initMap();
  animateStats();
}

// Hide loading screen
function hideLoader() {
  const loader = document.querySelector('.loader');
  setTimeout(() => loader.classList.add('hidden'), 1500);
}

// Event Listeners
function setupEventListeners() {
  // Auth state
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    updateUserDisplay(user);
  });

  // Search on Enter
  elements.search.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchParts();
  });

  // Smooth scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
      });
    });
  });
}

// Update user display
function updateUserDisplay(user) {
  elements.user.textContent = user ? `👤 ${user.email}` : 'Guest';
}

// AUTH FUNCTIONS
window.login = async () => {
  try {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      showNotification('Please enter email and password', 'error');
      return;
    }

    await signInWithEmailAndPassword(auth, email, password);
    closeModal();
    showNotification('Welcome back! 🎉', 'success');
  } catch (error) {
    showNotification('Login failed: ' + error.message, 'error');
  }
};

window.register = async () => {
  try {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      showNotification('Please enter email and password', 'error');
      return;
    }

    if (password.length < 6) {
      showNotification('Password must be at least 6 characters', 'error');
      return;
    }

    await createUserWithEmailAndPassword(auth, email, password);
    closeModal();
    showNotification('Account created successfully! 🎉', 'success');
  } catch (error) {
    showNotification('Registration failed: ' + error.message, 'error');
  }
};

window.logout = async () => {
  try {
    await signOut(auth);
    showNotification('Logged out successfully 👋', 'success');
    cart = [];
    updateCart();
  } catch (error) {
    showNotification('Logout failed', 'error');
  }
};

window.toggleAuthMode = () => {
  isRegisterMode = !isRegisterMode;
  elements.modalTitle.textContent = isRegisterMode ? 'Create Account' : 'Login to AutoMart';
  document.querySelector('.modal-body button').textContent = isRegisterMode ? 'Register' : 'Login';
};

// Modal Controls
function openModal() {
  elements.authModal.classList.add('active');
}

function closeModal() {
  elements.authModal.classList.remove('active');
  document.getElementById("email").value = '';
  document.getElementById("password").value = '';
}

window.closeModal = closeModal;

// PARTS FUNCTIONS
window.addPart = async () => {
  if (!currentUser) {
    showNotification('Please login first', 'error');
    openModal();
    return;
  }

  const name = document.getElementById("partName").value.trim();
  const price = parseFloat(document.getElementById("partPrice").value);
  const shop = document.getElementById("shopName").value.trim();
  const imageFile = document.getElementById("partImage").files[0];

  if (!name || !price || !shop) {
    showNotification('Please fill all fields', 'error');
    return;
  }

  if (price <= 0) {
    showNotification('Price must be greater than 0', 'error');
    return;
  }

  try {
    await addDoc(collection(db, "parts"), {
      name,
      price,
      shop,
      seller: currentUser.email,
      timestamp: new Date(),
      image: imageFile ? URL.createObjectURL(imageFile) : null
    });

    // Reset form
    document.getElementById("partName").value = '';
    document.getElementById("partPrice").value = '';
    document.getElementById("shopName").value = '';
    document.getElementById("partImage").value = '';

    loadParts();
    showNotification('Part added successfully! 🚀', 'success');
  } catch (error) {
    showNotification('Failed to add part: ' + error.message, 'error');
  }
};

// CART FUNCTIONS
window.addToCart = (name, price) => {
  cart.push({ id: Date.now(), name, price, quantity: 1 });
  updateCart();
  showNotification(`${name} added to cart! 🛒`, 'success');
};

window.removeFromCart = (index) => {
  cart.splice(index, 1);
  updateCart();
  showNotification('Item removed from cart', 'info');
};

function updateCart() {
  let html = '';
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price * item.quantity;
    html += `
      <div class="cart-item">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p>₹${item.price} x ${item.quantity}</p>
        </div>
        <div class="cart-item-actions">
          <button onclick="removeFromCart(${index})" class="btn-danger btn-sm">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  });

  elements.cart.innerHTML = html || '<p class="empty-cart">Your cart is empty 😢</p>';
  elements.total.textContent = total.toLocaleString();
}

window.checkout = () => {
  if (cart.length === 0) {
    showNotification('Your cart is empty', 'error');
    return;
  }

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  showNotification(`Order placed successfully! Total: ₹${total.toLocaleString()} ✅`, 'success');
  cart = [];
  updateCart();
};

// SEARCH & FILTER
window.searchParts = async () => {
  const query = elements.search.value.toLowerCase().trim();
  
  if (!query) {
    loadParts();
    return;
  }

  try {
    const q = query(collection(db, "parts"), 
      where('name', '>=', query), 
      where('name', '<=', query + '\uf8ff')
    );
    const snapshot = await getDocs(q);
    renderParts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  } catch (error) {
    showNotification('Search failed', 'error');
  }
};

window.sortLow = async () => {
  try {
    const q = query(collection(db, "parts"), orderBy("price", "asc"));
    const snapshot = await getDocs(q);
    renderParts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  } catch (error) {
    showNotification('Sort failed', 'error');
  }
};

// Load all parts
async function loadParts() {
  try {
    const snapshot = await getDocs(collection(db, "parts"));
    parts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderParts(parts);
  } catch (error) {
    console.error('Error loading parts:', error);
  }
}

function renderParts(partList) {
  const html = partList.map(part => createPartCard(part)).join('');
  elements.results.innerHTML = html || '<div class="no-results"><i class="fas fa-search"></i><p>No parts found</p></div>';
}

// Create part card
function createPartCard(part) {
  return `
    <div class="product-card" data-price="${part.price}">
      <div class="card-image">
        <i class="fas fa-car-battery product-icon"></i>
      </div>
      <div class="card-content">
        <h3 class="card-title">${part.name}</h3>
        <div class="card-price">₹${part.price.toLocaleString()}</div>
        <p class="card-shop">${part.shop}</p>
        <div class="card-footer">
          <small class="seller">${part.seller || 'Verified Seller'}</small>
          ${currentUser ? 
            `<button class="btn-primary btn-sm" onclick="addToCart('${part.name}', ${part.price})">
              <i class="fas fa-cart-plus"></i> Add to Cart
            </button>` : 
            `<button class="btn-outline btn-sm" onclick="openModal()">
              <i class="fas fa-sign-in-alt"></i> Login to Buy
            </button>`
          }
        </div>
      </div>
    </div>
  `;
}

// Utility Functions
function showNotification(message, type = 'info') {
  // Create notification
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
    ${message}
  `;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => notification.classList.add('show'), 100);
  
  // Auto remove
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

// Scroll functions
window.scrollToProducts = () => {
  document.getElementById('productsSection').scrollIntoView({ behavior: 'smooth' });
};

window.scrollToAddPart = () => {
  document.getElementById('addPartSection').scrollIntoView({ behavior: 'smooth' });
};

// Animate stats numbers
function animateStats() {
  const stats = document.querySelectorAll('.stat-number');
  stats.forEach(stat => {
    const target = parseInt(stat.dataset.target);
    const increment = target / 100;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        stat.textContent = target.toLocaleString();
        clearInterval(timer);
      } else {
        stat.textContent = Math.floor(current).toLocaleString();
      }
    }, 30);
  });
}

// Google Maps
function initMap() {
  const loc = { lat: 19.2183, lng: 72.9781 };
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 12,
    center: loc,
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }]
      }
    ]
  });

  new google.maps.Marker({
    position: loc,
    map: map,
    title: "AutoMart HQ",
    icon: {
      url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill="#667eea" stroke="white" stroke-width="3"/>
          <path d="M20 12 L24 20 L16 20 Z" fill="#764ba2"/>
        </svg>
      `)
    }
  });
}
