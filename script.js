// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBhT0ag7_G567gV2uYvqKbXUARwWzDsDZg",
  authDomain: "automart-6d640.firebaseapp.com",
  projectId: "automart-6d640",
  storageBucket: "automart-6d640.appspot.com",
  messagingSenderId: "397090205144",
  appId: "1:397090205144:web:e01bbffd00a11a5d0696ad"
};

// Init Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// USER STATUS
auth.onAuthStateChanged(user => {
  userStatus.innerText = user ? "✅ " + user.email : "❌ Not logged in";
});

// AUTH
function register() {
  auth.createUserWithEmailAndPassword(email.value, password.value)
    .then(() => alert("Registered"))
    .catch(e => alert(e.message));
}

function login() {
  auth.signInWithEmailAndPassword(email.value, password.value)
    .then(() => alert("Logged in"))
    .catch(e => alert(e.message));
}

function logout() {
  auth.signOut().then(() => alert("Logged out"));
}

// LOCATION + MAP
let userLat = 0, userLng = 0;
let map, markers = [];

function getLocation() {
  navigator.geolocation.getCurrentPosition(pos => {
    userLat = pos.coords.latitude;
    userLng = pos.coords.longitude;

    locationStatus.innerText = "📍 Location detected";
    initMap();
  });
}

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: userLat, lng: userLng },
    zoom: 12
  });

  new google.maps.Marker({
    position: { lat: userLat, lng: userLng },
    map,
    title: "You"
  });
}

// ADD PART
function addPart() {
  if (!auth.currentUser) return alert("Login first");

  db.collection("parts").add({
    name: partName.value,
    price: Number(partPrice.value),
    shop: shopName.value,
    owner: auth.currentUser.email,
    lat: userLat,
    lng: userLng
  }).then(() => alert("Part Added"));
}

// DISTANCE FUNCTION
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat/2)**2 +
    Math.cos(lat1*Math.PI/180) *
    Math.cos(lat2*Math.PI/180) *
    Math.sin(dLon/2)**2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

// CLEAR MARKERS
function clearMarkers() {
  markers.forEach(m => m.setMap(null));
  markers = [];
}

// SEARCH + SORT + MAP
function searchParts() {
  results.innerHTML = "Loading...";
  clearMarkers();

  db.collection("parts").get().then(snapshot => {
    let parts = [];

    snapshot.forEach(doc => {
      let p = doc.data();

      if (p.name.toLowerCase().includes(search.value.toLowerCase())) {
        let dist = (userLat && p.lat)
          ? calculateDistance(userLat, userLng, p.lat, p.lng)
          : 0;

        parts.push({ ...p, dist });
      }
    });

    // SORT
    parts.sort((a,b) => a.dist - b.dist);

    results.innerHTML = "";

    parts.forEach(p => {
      results.innerHTML += `
        <div class="card">
          <h3>${p.name}</h3>
          <p>₹${p.price}</p>
          <p>${p.shop}</p>
          <p>📍 ${p.dist.toFixed(2)} km</p>
        </div>
      `;

      if (map && p.lat) {
        let marker = new google.maps.Marker({
          position: { lat: p.lat, lng: p.lng },
          map,
          title: p.name
        });

        markers.push(marker);
      }
    });
  });
}

// GLOBAL
window.register = register;
window.login = login;
window.logout = logout;
window.getLocation = getLocation;
window.addPart = addPart;
window.searchParts = searchParts;
