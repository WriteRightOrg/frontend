console.log("Loaded auth.js");

const firebaseConfig = {
  apiKey: "AIzaSyAl2Mpvpshv2Nlo3tQ84MDbuV3gy_XtKvo",
  authDomain: "writeright-de7ff.firebaseapp.com",
  projectId: "writeright-de7ff",
  storageBucket: "writeright-de7ff.appspot.com",
  messagingSenderId: "156869202749",
  appId: "1:156869202749:web:6637c77cf272223cb42b54",
  measurementId: "G-GDF38BC12R",
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth()

const signInButton = document.getElementById("sign-in")
const email = document.getElementById("email")
const password = document.getElementById("password")

signInButton.addEventListener("click", async function() {
  console.log("Signing in with credentials", email.value, password.value);
  await firebase.auth().signInWithEmailAndPassword(email.value, password.value)
  console.log("Success")
});

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    console.log("redireicting")
    window.location = 'index.html';
  }
})