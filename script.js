/* ══════════════════════════════════════════
   AutoMart — app.js  (API-connected version)
   ══════════════════════════════════════════ */
'use strict';

const API_BASE = 'http://localhost:5000/api';

const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID",
};

let firebaseAuth, currentUser = null;

async function initFirebase() {
  firebase.initializeApp(firebaseConfig);
  firebaseAuth = firebase.auth();
  firebaseAuth.onAuthStateChanged(user => {
    currentUser = user;
    updateNavForAuth(user);
  });
}

function updateNavForAuth(user) {
  const loginBtn    = document.querySelector('button[onclick="showPage(\'login\')"]');
  const registerBtn = document.querySelector('button[onclick="showPage(\'register\')"]');
  if (!loginBtn || !registerBtn) return;
  if (user) {
    loginBtn.textContent    = 'My Account';
    loginBtn.onclick        = () => showPage('dashboard');
    registerBtn.textContent = 'Log Out';
    registerBtn.onclick     = handleLogout;
  } else {
    loginBtn.textContent    = 'Log In';
    loginBtn.onclick        = () => showPage('login');
    registerBtn.textContent = 'Register';
    registerBtn.onclick     = () => showPage('register');
  }
}

async function apiFetch(path, options = {}) {
  const token = currentUser ? await currentUser.getIdToken() : null;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res  = await fetch(`${API_BASE}${path}`, { ...options, headers: { ...headers, ...options.headers } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'API error');
  return data;
}

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  const target = document.getElementById('page-' + pageId);
  if (target) { target.classList.remove('hidden'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  if (pageId === 'search')    loadSearchPage();
  if (pageId === 'dashboard') loadDashboard();
}

window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 10);
});
function toggleMobileMenu() { document.getElementById('mobileMenu').classList.toggle('hidden'); }

function doHeroSearch() {
  const val = document.getElementById('heroSearch').value.trim();
  currentSearchTerm = val;
  showPage('search');
  if (val) { document.getElementById('searchInput').value = val; filterResults(); }
}
function quickSearch(term) {
  currentSearchTerm = term;
  document.getElementById('heroSearch').value = term;
  showPage('search');
  document.getElementById('searchInput').value = term;
  filterResults();
}
document.getElementById('heroSearch').addEventListener('keydown', e => { if (e.key === 'Enter') doHeroSearch(); });

let currentSearchTerm = '';

function loadSearchPage() { filterResults(); }

async function filterResults() {
  const q     = document.getElementById('searchInput').value.trim();
  const avail = document.getElementById('availFilter').value;
  const sort  = document.getElementById('sortSelect').value;
  showLoading(true);
  try {
    const params = new URLSearchParams();
    if (q)                    params.set('q', q);
    if (avail === 'instock')  params.set('availability', 'In Stock');
    if (sort && sort !== 'default') params.set('sort', sort);
    const data = await apiFetch(`/parts?${params.toString()}`);
    renderResults(data.parts || []);
  } catch (err) {
    console.warn('API unavailable, using local data:', err.message);
    renderResults(FALLBACK_PARTS);
  } finally {
    showLoading(false);
  }
}

function showLoading(state) {
  if (!state) return;
  document.getElementById('resultsGrid').innerHTML = Array.from({ length: 6 }, () => `
    <div class="result-card animate-pulse">
      <div class="h-4 bg-slate-100 rounded mb-3 w-2/3"></div>
      <div class="h-8 bg-slate-100 rounded mb-4 w-1/3"></div>
      <div class="h-3 bg-slate-100 rounded mb-2 w-1/2"></div>
      <div class="h-3 bg-slate-100 rounded mb-4 w-1/3"></div>
      <div class="h-8 bg-slate-100 rounded"></div>
    </div>`).join('');
}

function sortResults() { filterResults(); }

function renderResults(data) {
  const grid    = document.getElementById('resultsGrid');
  const empty   = document.getElementById('emptyState');
  const countEl = document.getElementById('resultCount');
  grid.innerHTML = '';
  if (!data.length) {
    empty.classList.remove('hidden');
    countEl.innerHTML = 'Showing <span class="font-semibold text-dark">0</span> results';
    return;
  }
  empty.classList.add('hidden');
  countEl.innerHTML = `Showing <span class="font-semibold text-dark">${data.length}</span> result${data.length !== 1 ? 's' : ''}`;
  data.forEach((p, i) => {
    const badgeClass = p.availability === 'In Stock' ? 'badge-instock' : p.availability === 'Limited' ? 'badge-limited' : 'badge-outstock';
    const stars = '★'.repeat(Math.round(p.rating || 0)) + '☆'.repeat(5 - Math.round(p.rating || 0));
    const id    = p.id || p.partId;
    const card  = document.createElement('div');
    card.className = 'result-card';
    card.style.animationDelay = `${i * 0.05}s`;
    card.innerHTML = `
      <div class="flex items-start justify-between gap-2 mb-3">
        <div class="flex-1 min-w-0">
          <span class="text-xs font-medium text-slate-400 uppercase tracking-wide">${p.category || 'Part'} · ${p.vehicle || 'All'}</span>
          <h3 class="font-display font-bold text-base text-dark mt-0.5 leading-snug truncate">${p.name}</h3>
        </div>
        <span class="${badgeClass}">${p.availability}</span>
      </div>
      <div class="flex items-baseline gap-1 mb-4">
        <span class="font-display font-extrabold text-2xl text-brand-600">₹${Number(p.price).toLocaleString('en-IN')}</span>
        <span class="text-xs text-slate-400">/ unit</span>
      </div>
      <div class="space-y-2 mb-4">
        <div class="flex items-center gap-2 text-sm text-slate-600"><i class="fa-solid fa-store w-4 text-slate-400 text-xs"></i><span class="font-medium">${p.shopName || 'AutoMart Shop'}</span></div>
        <div class="flex items-center gap-2 text-sm text-slate-500"><i class="fa-solid fa-location-dot w-4 text-slate-400 text-xs"></i><span>${p.distance ? p.distance + ' km away' : p.shopAddress || 'Address not set'}</span></div>
        ${p.rating ? `<div class="flex items-center gap-2 text-xs text-amber-500"><span>${stars}</span><span class="text-slate-400">${p.rating}</span></div>` : ''}
      </div>
      <div class="flex gap-2 pt-3 border-t border-slate-50">
        <button class="flex-1 py-2 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors" onclick="event.stopPropagation();showToast('Calling shop…','info')"><i class="fa-solid fa-phone mr-1.5"></i>Call Shop</button>
        <button class="flex-1 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors shadow-sm" onclick="event.stopPropagation();showToast('Added to cart!','success')"><i class="fa-solid fa-cart-plus mr-1.5"></i>Add to Cart</button>
      </div>`;
    grid.appendChild(card);
  });
}

function togglePass(inputId, eyeId) {
  const inp = document.getElementById(inputId); const icon = document.getElementById(eyeId);
  inp.type  = inp.type === 'password' ? 'text' : 'password';
  icon.className = inp.type === 'text' ? 'fa-solid fa-eye-slash text-xs' : 'fa-solid fa-eye text-xs';
}

async function handleLogin() {
  const email    = document.querySelector('#page-login input[type="email"]').value.trim();
  const password = document.getElementById('loginPass').value;
  if (!email || !password) { showToast('Please fill in all fields.', 'error'); return; }
  try {
    await firebaseAuth.signInWithEmailAndPassword(email, password);
    showToast('Welcome back! 👋', 'success');
    setTimeout(() => showPage('home'), 800);
  } catch (err) {
    const msg = err.code === 'auth/wrong-password' ? 'Incorrect password.'
              : err.code === 'auth/user-not-found'  ? 'No account with this email.'
              : 'Login failed. Please try again.';
    showToast(msg, 'error');
  }
}

async function handleRegister() {
  const name     = document.querySelector('#page-register input[placeholder="John Doe"]').value.trim();
  const email    = document.querySelector('#page-register input[type="email"]').value.trim();
  const phone    = document.querySelector('#page-register input[type="tel"]').value.trim();
  const password = document.getElementById('regPass').value;
  const role     = document.getElementById('typeShop').classList.contains('active') ? 'shop' : 'buyer';
  const terms    = document.getElementById('terms').checked;
  if (!name || !email || !password) { showToast('Please fill in all required fields.', 'error'); return; }
  if (!terms) { showToast('Please accept the Terms of Service.', 'error'); return; }
  try {
    const body = { name, email, password, phone, role };
    if (role === 'shop') {
      body.shopName    = document.querySelector('#shopFields input[placeholder="Auto Parts Hub"]')?.value.trim() || '';
      body.shopAddress = document.querySelector('#shopFields input[placeholder="Full address"]')?.value.trim() || '';
    }
    await apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) });
    await firebaseAuth.signInWithEmailAndPassword(email, password);
    showToast(`Welcome to AutoMart, ${name}! 🎉`, 'success');
    setTimeout(() => showPage('home'), 900);
  } catch (err) { showToast(err.message || 'Registration failed.', 'error'); }
}

async function handleLogout() {
  await firebaseAuth.signOut();
  showToast('Logged out successfully.', 'info');
  showPage('home');
}

function setAccountType(type) {
  const buyerBtn   = document.getElementById('typeBuyer');
  const shopBtn    = document.getElementById('typeShop');
  const shopFields = document.getElementById('shopFields');
  if (type === 'buyer') { buyerBtn.classList.add('active'); shopBtn.classList.remove('active'); shopFields.classList.add('hidden'); }
  else { shopBtn.classList.add('active'); buyerBtn.classList.remove('active'); shopFields.classList.remove('hidden'); }
}

async function loadDashboard() {
  if (!currentUser) { showToast('Please log in to access the dashboard.', 'error'); showPage('login'); return; }
  try {
    const data = await apiFetch('/shops/dashboard/me');
    const { stats, parts } = data;
    document.getElementById('totalParts').textContent    = stats.total;
    document.getElementById('inStockCount').textContent  = stats.inStock;
    document.getElementById('outStockCount').textContent = stats.outStock;
    document.getElementById('avgPrice').textContent      = `₹${stats.avgPrice.toLocaleString('en-IN')}`;
    shopInventory = parts;
    renderInventoryTable();
  } catch (err) {
    console.warn('Dashboard API error, using local state:', err.message);
    updateDashboardStats();
    renderInventoryTable();
  }
}

let shopInventory = [];
let inventoryFilter = '';

async function addPart() {
  const name  = document.getElementById('partName').value.trim();
  const price = parseFloat(document.getElementById('partPrice').value);
  const cat   = document.getElementById('partCat').value;
  const vehicle = document.getElementById('partVehicle').value;
  const qty   = parseInt(document.getElementById('partQty').value) || 0;
  const avail = document.querySelector('input[name="avail"]:checked').value;
  const desc  = document.getElementById('partDesc').value.trim();
  if (!name)           { showToast('Please enter a part name.', 'error'); return; }
  if (!price || price <= 0) { showToast('Please enter a valid price.', 'error'); return; }
  try {
    if (currentUser) {
      const data = await apiFetch('/parts', { method: 'POST', body: JSON.stringify({ name, price, category: cat, vehicle, availability: avail, quantity: qty, description: desc }) });
      shopInventory.unshift(data.part);
    } else {
      shopInventory.unshift({ id: Date.now(), name, price, category: cat, vehicle, quantity: qty, availability: avail, description: desc });
    }
    updateDashboardStats(); renderInventoryTable(); clearPartForm();
    showToast(`"${name}" added to inventory!`, 'success');
  } catch (err) { showToast(err.message || 'Failed to add part.', 'error'); }
}

async function deletePart(id) {
  try {
    if (currentUser && typeof id === 'string' && isNaN(id)) await apiFetch(`/parts/${id}`, { method: 'DELETE' });
    shopInventory = shopInventory.filter(p => String(p.id || p.partId) !== String(id));
    updateDashboardStats(); renderInventoryTable();
    showToast('Part removed.', 'info');
  } catch (err) { showToast(err.message || 'Failed to delete part.', 'error'); }
}

function clearPartForm() {
  document.getElementById('partName').value  = '';
  document.getElementById('partPrice').value = '';
  document.getElementById('partQty').value   = '';
  document.getElementById('partDesc').value  = '';
  document.querySelector('input[name="avail"][value="In Stock"]').checked = true;
}

function updateDashboardStats() {
  const total    = shopInventory.length;
  const inStock  = shopInventory.filter(p => p.availability === 'In Stock').length;
  const outStock = shopInventory.filter(p => p.availability === 'Out of Stock').length;
  const avg      = total ? Math.round(shopInventory.reduce((s, p) => s + p.price, 0) / total) : 0;
  document.getElementById('totalParts').textContent    = total;
  document.getElementById('inStockCount').textContent  = inStock;
  document.getElementById('outStockCount').textContent = outStock;
  document.getElementById('avgPrice').textContent      = `₹${avg.toLocaleString('en-IN')}`;
}

function filterInventory(val) { inventoryFilter = val.toLowerCase(); renderInventoryTable(); }

function renderInventoryTable() {
  const tbody = document.getElementById('partsTableBody');
  const empty = document.getElementById('emptyInventory');
  tbody.innerHTML = '';
  const filtered = shopInventory.filter(p => !inventoryFilter || p.name.toLowerCase().includes(inventoryFilter) || (p.category && p.category.toLowerCase().includes(inventoryFilter)));
  if (!filtered.length) { empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');
  filtered.forEach(p => {
    const id         = p.id || p.partId;
    const badgeClass = p.availability === 'In Stock' ? 'badge-instock' : 'badge-outstock';
    const tr         = document.createElement('tr');
    tr.className     = 'parts-row';
    tr.innerHTML = `
      <td class="px-6 py-4"><div class="font-medium text-sm text-dark leading-snug">${p.name}</div><div class="text-xs text-slate-400 mt-0.5">${p.vehicle || ''} · Qty: ${p.quantity || 0}</div></td>
      <td class="px-3 py-4"><span class="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">${p.category || '—'}</span></td>
      <td class="px-3 py-4 text-right"><span class="font-display font-bold text-sm text-dark">₹${Number(p.price).toLocaleString('en-IN')}</span></td>
      <td class="px-3 py-4 text-center"><span class="${badgeClass}">${p.availability}</span></td>
      <td class="px-6 py-4 text-center"><button onclick="deletePart('${id}')" class="delete-btn" title="Delete"><i class="fa-solid fa-trash"></i></button></td>`;
    tbody.appendChild(tr);
  });
}

let toastTimer = null;
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  const icons = { success: 'fa-circle-check text-emerald-400', error: 'fa-circle-xmark text-red-400', info: 'fa-circle-info text-blue-400' };
  document.getElementById('toastMsg').textContent = msg;
  document.getElementById('toastIcon').className  = `fa-solid ${icons[type] || icons.success}`;
  toast.classList.remove('hidden'); toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.classList.add('hidden'), 300); }, 3000);
}

const FALLBACK_PARTS = [
  { id:1, name:'Brembo Brake Pads',         category:'Brakes',    price:1850, shopName:'AutoZone Pro',   distance:1.2, availability:'In Stock',     vehicle:'Car', rating:4.8 },
  { id:2, name:'Bosch Oil Filter',           category:'Filters',   price:320,  shopName:'SpeedParts Hub', distance:0.8, availability:'In Stock',     vehicle:'Car', rating:4.6 },
  { id:3, name:'Philips LED Headlight Kit',  category:'Lighting',  price:2400, shopName:'BrightAuto',    distance:2.1, availability:'Limited',      vehicle:'Car', rating:4.9 },
  { id:4, name:'NGK Spark Plug Set',         category:'Engine',    price:480,  shopName:'AutoZone Pro',   distance:1.2, availability:'In Stock',     vehicle:'Car', rating:4.7 },
  { id:5, name:'Denso Air Filter',           category:'Filters',   price:640,  shopName:'SpeedParts Hub', distance:0.8, availability:'Out of Stock', vehicle:'Car', rating:4.3 },
  { id:6, name:'Amaron Battery 55Ah',        category:'Electrical',price:5500, shopName:'BrightAuto',    distance:2.1, availability:'In Stock',     vehicle:'Car', rating:4.8 },
];

if (firebaseConfig.apiKey !== 'YOUR_API_KEY') {
  initFirebase().catch(console.error);
} else {
  console.warn('⚠️ Fill in firebaseConfig in app.js to enable Auth.');
}

showPage('home');
