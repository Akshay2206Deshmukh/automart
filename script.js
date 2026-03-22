import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBhT0ag7_G567gV2uYvqKbXUARwWzDsDZg",
  authDomain: "automart-6d640.firebaseapp.com",
  projectId: "automart-6d640"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let cart = [];

/* USER */
onAuthStateChanged(auth, (user) => {
  document.getElementById("user").innerText =
    user ? user.email : "Not logged in";
});

/* LOGIN */
window.login = async () => {
  try {
    await signInWithEmailAndPassword(auth, email(), pass());
    alert("Login Successful");
  } catch (e) {
    alert(e.message);
  }
};

/* REGISTER */
window.register = async () => {
  try {
    await createUserWithEmailAndPassword(auth, email(), pass());
    alert("Registered");
  } catch (e) {
    alert(e.message);
  }
};

/* LOGOUT */
window.logout = () => signOut(auth);

/* ADD PART */
window.addPart = async () => {
  if (!val("partName") || !val("partPrice") || !val("shopName")) {
    alert("Fill all fields");
    return;
  }

  await addDoc(collection(db, "parts"), {
    name: val("partName"),
    price: Number(val("partPrice")),
    shop: val("shopName"),
    image: val("partImage")
  });

  alert("Added");
  loadParts();
};

/* LOAD */
async function loadParts() {
  const snap = await getDocs(collection(db, "parts"));
  let html = "";

  snap.forEach(doc => {
    const p = doc.data();

    html += `
    <div class="card">
      <img src="${p.image || 'https://via.placeholder.com/150'}">
      <h3>${p.name}</h3>
      <p>₹${p.price}</p>
      <button onclick="addToCart('${p.name}', ${p.price})">Add</button>
    </div>`;
  });

  document.getElementById("results").innerHTML = html;
}

/* CART */
window.addToCart = (name, price) => {
  cart.push({ name, price });
  renderCart();
};

function renderCart() {
  let total = 0;
  let html = "";

  cart.forEach((item, i) => {
    total += item.price;
    html += `${item.name} ₹${item.price}
    <button onclick="removeItem(${i})">❌</button><br>`;
  });

  document.getElementById("cartItems").innerHTML = html;
  document.getElementById("total").innerText = total;
}

window.removeItem = (i) => {
  cart.splice(i, 1);
  renderCart();
};

/* CHECKOUT */
window.checkout = () => {
  let total = cart.reduce((sum, i) => sum + i.price, 0);

  const rzp = new Razorpay({
    key: "rzp_test_xxxxx",
    amount: total * 100,
    currency: "INR",
    name: "AutoMart",
    handler: () => {
      alert("Payment Successful");
      cart = [];
      renderCart();
    }
  });

  rzp.open();
};

/* CART TOGGLE */
window.toggleCart = () => {
  document.getElementById("cart").classList.toggle("active");
};

/* CHATBOT */
window.toggleChat = () => {
  const c = document.getElementById("chat-body");
  c.style.display = c.style.display === "block" ? "none" : "block";
};

window.sendMessage = () => {
  const input = document.getElementById("chatInput");
  const msg = input.value;

  if (!msg) return;

  addMsg("You", msg);
  input.value = "";

  setTimeout(() => addMsg("Bot", reply(msg)), 500);
};

function addMsg(s, t) {
  document.getElementById("chat-messages").innerHTML +=
    `<p><b>${s}:</b> ${t}</p>`;
}

function reply(msg) {
  msg = msg.toLowerCase();

  if (msg.includes("price")) return "Prices ₹200–₹5000";
  if (msg.includes("best")) return "Brake pads & oil best";
  return "Ask about parts, price, cart 🤖";
}

/* HELPERS */
const val = id => document.getElementById(id).value;
const email = () => val("email");
const pass = () => val("password");

/* INIT */
loadParts();
