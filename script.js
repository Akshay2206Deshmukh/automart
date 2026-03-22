import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBhT0ag7",
  authDomain: "automart.firebaseapp.com",
  projectId: "automart"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let cart = [];
const ADMIN = "your-email@gmail.com";

/* AUTH */
onAuthStateChanged(auth, (user) => {
  document.getElementById("user").innerText =
    user ? user.email : "Not logged in";
});

window.login = () => signInWithEmailAndPassword(auth, email(), pass());
window.register = () => createUserWithEmailAndPassword(auth, email(), pass());
window.logout = () => signOut(auth);

/* ADD PART */
window.addPart = async () => {
  const part = {
    name: val("partName"),
    price: Number(val("partPrice")),
    shop: val("shopName"),
    image: val("partImage")
  };

  await addDoc(collection(db, "parts"), part);
  loadParts();
};

/* LOAD */
async function loadParts() {
  const snap = await getDocs(collection(db, "parts"));
  let html = "";

  snap.forEach(d => {
    const p = d.data();

    html += `
    <div class="card">
      <img src="${p.image}">
      <h3>${p.name}</h3>
      <p>₹${p.price}</p>
      <small>${p.shop}</small>

      <button onclick="addToCart('${p.name}',${p.price})">Add</button>
      ${auth.currentUser?.email===ADMIN ? `<button onclick="deletePart('${d.id}')">Delete</button>`:''}
    </div>`;
  });

  document.getElementById("results").innerHTML = html;
}

/* DELETE */
window.deletePart = async (id) => {
  await deleteDoc(doc(db,"parts",id));
  loadParts();
};

/* CART */
window.addToCart = (name, price) => {
  cart.push({name, price});
  renderCart();
};

function renderCart(){
  let total=0, html="";
  cart.forEach(i=>{
    total+=i.price;
    html+=`<p>${i.name} - ₹${i.price}</p>`;
  });
  document.getElementById("cartItems").innerHTML=html;
  document.getElementById("total").innerText=total;
}

window.toggleCart = () => {
  document.getElementById("cartDrawer").classList.toggle("active");
};

window.checkout = () => {
  alert("🎉 Payment Success");
  cart=[];
  renderCart();
};

/* SEARCH LIVE */
document.getElementById("search").addEventListener("input", async (e)=>{
  const q = e.target.value.toLowerCase();
  const snap = await getDocs(collection(db,"parts"));
  let html="";

  snap.forEach(d=>{
    const p=d.data();
    if(p.name.toLowerCase().includes(q)){
      html+=`<div class="card"><h3>${p.name}</h3></div>`;
    }
  });

  document.getElementById("results").innerHTML=html;
});

/* HELPERS */
const val = id => document.getElementById(id).value;
const email = () => val("email");
const pass = () => val("password");

loadParts();
