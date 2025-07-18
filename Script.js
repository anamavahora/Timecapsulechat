// --- 1) Initialize Firebase (replace with your config) ---
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// --- 2) Elements ---
const loginScreen = document.getElementById('login-screen');
const chatScreen  = document.getElementById('chat-screen');
const btnGoogle   = document.getElementById('btn-google');
const btnLogout   = document.getElementById('btn-logout');
const capsuleForm = document.getElementById('capsule-form');
const msgInput    = document.getElementById('msg');
const dateInput   = document.getElementById('unlock-date');
const listEl      = document.getElementById('capsules-list');

// --- 3) Auth Flow ---
btnGoogle.onclick = () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider);
};

btnLogout.onclick = () => auth.signOut();

auth.onAuthStateChanged(user => {
  if (user) {
    loginScreen.classList.add('hidden');
    chatScreen.classList.remove('hidden');
    loadCapsules();
  } else {
    chatScreen.classList.add('hidden');
    loginScreen.classList.remove('hidden');
    listEl.innerHTML = '';
  }
});

// --- 4) Load unlocked capsules ---
function loadCapsules() {
  const today = new Date().toISOString().slice(0,10);
  db.collection('capsules')
    .where('owner', '==', auth.currentUser.uid)
    .where('unlockDate', '<=', today)
    .orderBy('unlockDate', 'desc')
    .get()
    .then(snap => {
      listEl.innerHTML = '';
      snap.forEach(doc => {
        const { text, unlockDate } = doc.data();
        const div = document.createElement('div');
        div.classList.add('capsule');
        div.innerHTML = `<small>Unlocked: ${unlockDate}</small><p>${text}</p>`;
        listEl.appendChild(div);
      });
    });
}

// --- 5) Send a new capsule ---
capsuleForm.onsubmit = e => {
  e.preventDefault();
  const text = msgInput.value.trim();
  const unlockDate = dateInput.value;
  if (!text || !unlockDate) return;

  db.collection('capsules').add({
    owner: auth.currentUser.uid,
    text,
    unlockDate,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    msgInput.value = '';
    dateInput.value = '';
    loadCapsules();
  });
};
