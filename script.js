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

/* AUTH */
window.login = async () => {
  await signInWithEmailAndPassword(auth,email(),pass());
  alert("Logged in");
};

window.register = async () => {
  await createUserWithEmailAndPassword(auth,email(),pass());
  alert("Registered");
};

window.logout = () => signOut(auth);

/* ADD PART */
window.addPart = async () => {
  await addDoc(collection(db,"parts"),{
    name: val("partName"),
    price: Number(val("partPrice")),
    shop: val("shopName"),
    image: val("partImage")
  });
  loadParts();
};

/* LOAD */
async function loadParts(){
  const snap = await getDocs(collection(db,"parts"));
  let html="";
  snap.forEach(d=>{
    const p=d.data();
    html+=`
    <div class="card">
      <img src="${p.image || ''}">
      <h3>${p.name}</h3>
      <p>₹${p.price}</p>
      <button onclick="addToCart('${p.name}',${p.price})">Add</button>
    </div>`;
  });
  document.getElementById("results").innerHTML=html;
}

/* CART */
window.addToCart = (n,p)=>{
  cart.push({n,p});
  renderCart();
};

function renderCart(){
  let total=0,html="";
  cart.forEach((i,idx)=>{
    total+=i.p;
    html+=`${i.n} ₹${i.p} <button onclick="removeItem(${idx})">❌</button><br>`;
  });
  document.getElementById("cartItems").innerHTML=html;
  document.getElementById("total").innerText=total;
}

window.removeItem = (i)=>{
  cart.splice(i,1);
  renderCart();
};

/* PAYMENT */
window.checkout = ()=>{
  let total = cart.reduce((s,i)=>s+i.p,0);
  new Razorpay({
    key:"rzp_test_xxxxx",
    amount:total*100,
    handler:()=>{
      alert("Payment success");
      cart=[];
      renderCart();
    }
  }).open();
};

window.toggleCart = ()=>{
  document.getElementById("cart").classList.toggle("active");
};

/* CHATBOT */
window.toggleChat = ()=>{
  let c=document.getElementById("chat-body");
  c.style.display=c.style.display==="block"?"none":"block";
};

window.sendMessage = ()=>{
  let msg=document.getElementById("chatInput").value;
  document.getElementById("chat-messages").innerHTML+=`<p>You: ${msg}</p>`;
  document.getElementById("chat-messages").innerHTML+=`<p>Bot: Try brake pads 🔧</p>`;
};

/* HELPERS */
const val=id=>document.getElementById(id).value;
const email=()=>val("email");
const pass=()=>val("password");

loadParts();
