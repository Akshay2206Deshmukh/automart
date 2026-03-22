body {
  margin: 0;
  font-family: 'Segoe UI';
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: white;
}

.navbar {
  display: flex;
  justify-content: space-between;
  padding: 15px;
  background: black;
}

.navbar input {
  padding: 10px;
  border-radius: 20px;
}

.auth {
  text-align: center;
  margin-top: 30px;
}

.auth-box {
  background: rgba(255,255,255,0.05);
  padding: 20px;
  width: 300px;
  margin: auto;
  border-radius: 10px;
}

.auth-box input {
  width: 100%;
  margin: 10px 0;
  padding: 10px;
}

.auth-buttons {
  display: flex;
  justify-content: space-between;
}

.hero {
  text-align: center;
  padding: 40px;
}

#map {
  height: 400px;
  width: 90%;
  margin: auto;
  border-radius: 10px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px,1fr));
  gap: 20px;
  padding: 20px;
}

.card {
  background: rgba(255,255,255,0.05);
  padding: 20px;
  border-radius: 10px;
  text-align: center;
}

.card img {
  width: 100%;
  height: 150px;
}

.cart {
  position: fixed;
  right: -300px;
  top: 0;
  width: 300px;
  height: 100%;
  background: #111;
  padding: 20px;
  transition: 0.3s;
}

.cart.active {
  right: 0;
}

.cartBtn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: green;
  padding: 15px;
  border-radius: 50%;
}

.add {
  text-align: center;
  padding: 40px;
}

.add input {
  display: block;
  margin: 10px auto;
  padding: 10px;
}

/* CHATBOT */
#chatbot {
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: 280px;
}

#chat-header {
  background: #22c55e;
  padding: 10px;
  cursor: pointer;
}

#chat-body {
  display: none;
  background: #111;
  height: 300px;
}

#chat-messages {
  height: 220px;
  overflow-y: auto;
}
