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

/* USER STATE */
onAuthStateChanged(auth, (user) => {
  document.getElementById("user").innerText =
    user ? user.email : "Not logged in";
});

/* AUTH */
window.login = async () => {
  try {
    await signInWithEmailAndPassword(auth, email(), pass());
    alert("Login Successful ✅");
  } catch (e) {
    alert(e.message);
  }
};

window.register = async () => {
  try {
    await createUserWithEmailAndPassword(auth, email(), pass());
    alert("Registered ✅");
  } catch (e) {
    alert(e.message);
  }
};

window.logout = () => signOut(auth);

/* ADD PART */
window.addPart = async () => {
  try {
    await addDoc(collection(db, "parts"), {
      name: val("partName"),
      price: Number(val("partPrice")),
      shop: val("shopName"),
      image: val("partImage")
    });

    alert("Part Added ✅");
    loadParts();
  } catch (e) {
    alert(e.message);
  }
};

/* LOAD */
async function loadParts() {
  const snap = await getDocs(collection(db, "parts"));
  let html = "";

  snap.forEach(d => {
    const p = d.data();
    html += `
    <div class="card">
      <img src="${p.image || 'https://via.placeholder.com/150'}">
      <h3>${p.name}</h3>
      <p>₹${p.price}</p>
      <div>⭐⭐⭐⭐☆</div>
      <button onclick="addToCart('${p.name}',${p.price})">Add</button>
    </div>`;
  });

  document.getElementById("results").innerHTML = html;
}

/* CART */
window.addToCart = (name, price) => {
  cart.push({name, price});
  renderCart();
};

function renderCart(){
  let total=0, html="";
  cart.forEach((item,i)=>{
    total+=item.price;
    html+=`${item.name} ₹${item.price} 
    <button onclick="removeItem(${i})">❌</button><br>`;
  });
  document.getElementById("cartItems").innerHTML=html;
  document.getElementById("total").innerText=total;
}

window.removeItem = (i)=>{
  cart.splice(i,1);
  renderCart();
};

window.checkout = () => {
  let total = cart.reduce((sum,i)=>sum+i.price,0);

  const rzp = new Razorpay({
    key:"rzp_test_xxxxx",
    amount: total*100,
    currency:"INR",
    name:"AutoMart",
    handler: ()=>{
      alert("Payment Successful 🎉");
      cart=[];
      renderCart();
    }
  });

  rzp.open();
};

window.toggleCart = () => {
  document.getElementById("cartDrawer").classList.toggle("active");
};

/* SEARCH */
document.getElementById("search").addEventListener("input", async (e)=>{
  const q=e.target.value.toLowerCase();
  const snap=await getDocs(collection(db,"parts"));
  let html="";
  snap.forEach(d=>{
    const p=d.data();
    if(p.name.toLowerCase().includes(q)){
      html+=`<div class="card"><h3>${p.name}</h3></div>`;
    }
  });
  document.getElementById("results").innerHTML=html;
});

/* CHATBOT */
window.toggleChat = ()=>{
  const b=document.getElementById("chat-body");
  b.style.display=b.style.display==="block"?"none":"block";
};

window.sendMessage = ()=>{
  const input=document.getElementById("chatInput");
  const msg=input.value;
  addMsg("You",msg);
  input.value="";
  setTimeout(()=>addMsg("Bot",reply(msg)),500);
};

function addMsg(s,t){
  document.getElementById("chat-messages").innerHTML+=`<p><b>${s}:</b> ${t}</p>`;
}

function reply(msg){
  msg=msg.toLowerCase();
  if(msg.includes("price")) return "Prices range ₹200–₹5000";
  if(msg.includes("best")) return "Brake pads & filters are trending";
  return "Ask about parts, price, or cart 🤖";
}

const val=id=>document.getElementById(id).value;
const email=()=>val("email");
const pass=()=>val("password");

loadParts();
