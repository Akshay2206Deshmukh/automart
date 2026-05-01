/* ══════════════════════════════════════════
   AutoMart — app.js
   ══════════════════════════════════════════ */

'use strict';

/* ─────────────── DATA ─────────────── */

const PARTS_DATA = [
  { id:1, name:'Brembo Brake Pads', category:'Brakes', price:1850, shop:'AutoZone Pro', distance:1.2, availability:'In Stock',  vehicle:'Car',        rating:4.8 },
  { id:2, name:'Bosch Oil Filter',   category:'Filters', price:320,  shop:'SpeedParts Hub', distance:0.8, availability:'In Stock',  vehicle:'Car',        rating:4.6 },
  { id:3, name:'Philips LED Headlight Kit', category:'Lighting', price:2400, shop:'BrightAuto', distance:2.1, availability:'Limited', vehicle:'Car', rating:4.9 },
  { id:4, name:'Clutch Plate (Hero Honda)', category:'Engine', price:950, shop:'Two Wheeler World', distance:1.5, availability:'In Stock', vehicle:'Motorcycle', rating:4.4 },
  { id:5, name:'NGK Spark Plug Set', category:'Engine', price:480, shop:'AutoZone Pro', distance:1.2, availability:'In Stock', vehicle:'Car', rating:4.7 },
  { id:6, name:'Denso Air Filter', category:'Filters', price:640, shop:'SpeedParts Hub', distance:0.8, availability:'Out of Stock', vehicle:'Car', rating:4.3 },
  { id:7, name:'Rear Shock Absorber', category:'Suspension', price:3200, shop:'Prime Auto Parts', distance:3.4, availability:'In Stock', vehicle:'Car', rating:4.5 },
  { id:8, name:'Amaron Car Battery 55Ah', category:'Electrical', price:5500, shop:'BrightAuto', distance:2.1, availability:'In Stock', vehicle:'Car', rating:4.8 },
  { id:9, name:'Wiper Blade Set (Bosch)', category:'Body', price:580, shop:'QuickFix Spares', distance:0.5, availability:'In Stock', vehicle:'Car', rating:4.2 },
];

let shopInventory = [];
let currentSearchTerm = '';
let currentSort = 'default';
let currentAvailFilter = 'all';

/* ─────────────── PAGE ROUTING ─────────────── */

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => {
    p.classList.add('hidden');
  });
  const target = document.getElementById('page-' + pageId);
  if (target) {
    target.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  if (pageId === 'search') renderResults(PARTS_DATA);
  if (pageId === 'dashboard') renderInventoryTable();
}

/* ─────────────── NAVBAR ─────────────── */

window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  nav.classList.toggle('scrolled', window.scrollY > 10);
});

function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  menu.classList.toggle('hidden');
}

/* ─────────────── HERO SEARCH ─────────────── */

function doHeroSearch() {
  const val = document.getElementById('heroSearch').value.trim();
  currentSearchTerm = val;
  showPage('search');
  if (val) {
    document.getElementById('searchInput').value = val;
    filterResults();
  }
}

function quickSearch(term) {
  currentSearchTerm = term;
  document.getElementById('heroSearch').value = term;
  showPage('search');
  document.getElementById('searchInput').value = term;
  filterResults();
}

document.getElementById('heroSearch').addEventListener('keydown', e => {
  if (e.key === 'Enter') doHeroSearch();
});

/* ─────────────── SEARCH & FILTER ─────────────── */

function filterResults() {
  const searchVal = (document.getElementById('searchInput').value || '').toLowerCase();
  const availVal  = document.getElementById('availFilter').value;
  let filtered = PARTS_DATA.filter(p => {
    const matchSearch = !searchVal ||
      p.name.toLowerCase().includes(searchVal) ||
      p.category.toLowerCase().includes(searchVal) ||
      p.shop.toLowerCase().includes(searchVal) ||
      p.vehicle.toLowerCase().includes(searchVal);
    const matchAvail = availVal === 'all' || p.availability === 'In Stock';
    return matchSearch && matchAvail;
  });
  currentSort = document.getElementById('sortSelect').value;
  filtered = sortData(filtered, currentSort);
  renderResults(filtered);
}

function sortResults() {
  currentSort = document.getElementById('sortSelect').value;
  filterResults();
}

function sortData(data, sort) {
  const sorted = [...data];
  if (sort === 'price-asc')  sorted.sort((a,b) => a.price - b.price);
  if (sort === 'price-desc') sorted.sort((a,b) => b.price - a.price);
  if (sort === 'distance')   sorted.sort((a,b) => a.distance - b.distance);
  return sorted;
}

/* ─────────────── RENDER RESULTS ─────────────── */

function renderResults(data) {
  const grid      = document.getElementById('resultsGrid');
  const empty     = document.getElementById('emptyState');
  const countEl   = document.getElementById('resultCount');
  grid.innerHTML  = '';

  if (!data.length) {
    empty.classList.remove('hidden');
    countEl.innerHTML = 'Showing <span class="font-semibold text-dark">0</span> results';
    return;
  }
  empty.classList.add('hidden');
  countEl.innerHTML = `Showing <span class="font-semibold text-dark">${data.length}</span> result${data.length !== 1 ? 's' : ''}`;

  data.forEach((p, i) => {
    const badgeClass = p.availability === 'In Stock' ? 'badge-instock'
                     : p.availability === 'Limited'  ? 'badge-limited'
                     : 'badge-outstock';
    const stars = '★'.repeat(Math.round(p.rating)) + '☆'.repeat(5 - Math.round(p.rating));

    const card = document.createElement('div');
    card.className = 'result-card';
    card.style.animationDelay = `${i * 0.05}s`;
    card.innerHTML = `
      <div class="flex items-start justify-between gap-2 mb-3">
        <div class="flex-1 min-w-0">
          <span class="text-xs font-medium text-slate-400 uppercase tracking-wide">${p.category} · ${p.vehicle}</span>
          <h3 class="font-display font-bold text-base text-dark mt-0.5 leading-snug truncate">${p.name}</h3>
        </div>
        <span class="${badgeClass}">${p.availability}</span>
      </div>

      <div class="flex items-baseline gap-1 mb-4">
        <span class="font-display font-extrabold text-2xl text-brand-600">₹${p.price.toLocaleString('en-IN')}</span>
        <span class="text-xs text-slate-400">/ unit</span>
      </div>

      <div class="space-y-2 mb-4">
        <div class="flex items-center gap-2 text-sm text-slate-600">
          <i class="fa-solid fa-store w-4 text-slate-400 text-xs"></i>
          <span class="font-medium">${p.shop}</span>
        </div>
        <div class="flex items-center gap-2 text-sm text-slate-500">
          <i class="fa-solid fa-location-dot w-4 text-slate-400 text-xs"></i>
          <span>${p.distance} km away</span>
        </div>
        <div class="flex items-center gap-2 text-xs text-amber-500">
          <span>${stars}</span>
          <span class="text-slate-400">${p.rating}</span>
        </div>
      </div>

      <div class="flex gap-2 pt-3 border-t border-slate-50">
        <button class="flex-1 py-2 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
          onclick="event.stopPropagation(); showToast('Calling shop…', 'info')">
          <i class="fa-solid fa-phone mr-1.5"></i>Call Shop
        </button>
        <button class="flex-1 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors shadow-sm shadow-brand-200"
          onclick="event.stopPropagation(); showToast('Added to cart!', 'success')">
          <i class="fa-solid fa-cart-plus mr-1.5"></i>Add to Cart
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

/* ─────────────── AUTH ─────────────── */

function togglePass(inputId, eyeId) {
  const inp  = document.getElementById(inputId);
  const icon = document.getElementById(eyeId);
  if (inp.type === 'password') {
    inp.type  = 'text';
    icon.className = 'fa-solid fa-eye-slash text-xs';
  } else {
    inp.type  = 'password';
    icon.className = 'fa-solid fa-eye text-xs';
  }
}

function handleLogin() {
  showToast('Logged in successfully!', 'success');
  setTimeout(() => showPage('home'), 800);
}

function handleRegister() {
  showToast('Account created! Welcome to AutoMart 🎉', 'success');
  setTimeout(() => showPage('home'), 900);
}

function setAccountType(type) {
  const buyerBtn  = document.getElementById('typeBuyer');
  const shopBtn   = document.getElementById('typeShop');
  const shopFields = document.getElementById('shopFields');
  if (type === 'buyer') {
    buyerBtn.classList.add('active');
    shopBtn.classList.remove('active');
    shopFields.classList.add('hidden');
  } else {
    shopBtn.classList.add('active');
    buyerBtn.classList.remove('active');
    shopFields.classList.remove('hidden');
  }
}

/* ─────────────── DASHBOARD ─────────────── */

function addPart() {
  const name  = document.getElementById('partName').value.trim();
  const price = parseFloat(document.getElementById('partPrice').value);
  const cat   = document.getElementById('partCat').value;
  const vehicle = document.getElementById('partVehicle').value;
  const qty   = parseInt(document.getElementById('partQty').value) || 0;
  const avail = document.querySelector('input[name="avail"]:checked').value;
  const desc  = document.getElementById('partDesc').value.trim();

  if (!name) { showToast('Please enter a part name.', 'error'); return; }
  if (!price || price <= 0) { showToast('Please enter a valid price.', 'error'); return; }

  const newPart = {
    id: Date.now(),
    name, price, category: cat, vehicle, quantity: qty, availability: avail, description: desc
  };

  shopInventory.unshift(newPart);
  updateDashboardStats();
  renderInventoryTable();
  clearPartForm();
  showToast(`"${name}" added to inventory!`, 'success');
}

function deletePart(id) {
  shopInventory = shopInventory.filter(p => p.id !== id);
  updateDashboardStats();
  renderInventoryTable();
  showToast('Part removed.', 'info');
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

  animateCounter('totalParts',  total,   '');
  animateCounter('inStockCount', inStock, '');
  animateCounter('outStockCount', outStock, '');
  document.getElementById('avgPrice').textContent = `₹${avg.toLocaleString('en-IN')}`;
}

function animateCounter(id, target, suffix) {
  const el = document.getElementById(id);
  const start = parseInt(el.textContent) || 0;
  const diff  = target - start;
  const steps = 20;
  let current = 0;
  const timer = setInterval(() => {
    current++;
    el.textContent = Math.round(start + diff * (current / steps)) + suffix;
    if (current >= steps) clearInterval(timer);
  }, 20);
}

let inventoryFilter = '';
function filterInventory(val) {
  inventoryFilter = val.toLowerCase();
  renderInventoryTable();
}

function renderInventoryTable() {
  const tbody = document.getElementById('partsTableBody');
  const empty = document.getElementById('emptyInventory');
  tbody.innerHTML = '';

  const filtered = shopInventory.filter(p =>
    !inventoryFilter ||
    p.name.toLowerCase().includes(inventoryFilter) ||
    p.category.toLowerCase().includes(inventoryFilter)
  );

  if (!filtered.length) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  filtered.forEach(p => {
    const badgeClass = p.availability === 'In Stock' ? 'badge-instock' : 'badge-outstock';
    const tr = document.createElement('tr');
    tr.className = 'parts-row';
    tr.innerHTML = `
      <td class="px-6 py-4">
        <div class="font-medium text-sm text-dark leading-snug">${p.name}</div>
        <div class="text-xs text-slate-400 mt-0.5">${p.vehicle} · Qty: ${p.quantity}</div>
      </td>
      <td class="px-3 py-4">
        <span class="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">${p.category}</span>
      </td>
      <td class="px-3 py-4 text-right">
        <span class="font-display font-bold text-sm text-dark">₹${p.price.toLocaleString('en-IN')}</span>
      </td>
      <td class="px-3 py-4 text-center">
        <span class="${badgeClass}">${p.availability}</span>
      </td>
      <td class="px-6 py-4 text-center">
        <button onclick="deletePart(${p.id})" class="delete-btn" title="Delete">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/* ─────────────── TOAST ─────────────── */

let toastTimer = null;
function showToast(msg, type = 'success') {
  const toast   = document.getElementById('toast');
  const toastMsg  = document.getElementById('toastMsg');
  const toastIcon = document.getElementById('toastIcon');

  const icons = {
    success: 'fa-circle-check text-emerald-400',
    error:   'fa-circle-xmark text-red-400',
    info:    'fa-circle-info text-blue-400',
  };
  toastMsg.textContent  = msg;
  toastIcon.className   = `fa-solid ${icons[type] || icons.success}`;
  toast.classList.remove('hidden');
  toast.classList.add('show');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.add('hidden'), 300);
  }, 3000);
}

/* ─────────────── INIT ─────────────── */

showPage('home');
updateDashboardStats();
