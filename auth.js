import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAl2Mpvpshv2Nlo3tQ84MDbuV3gy_XtKvo",
  authDomain: "writeright-de7ff.firebaseapp.com",
  projectId: "writeright-de7ff",
  storageBucket: "writeright-de7ff.appspot.com",
  messagingSenderId: "156869202749",
  appId: "1:156869202749:web:6637c77cf272223cb42b54",
  measurementId: "G-GDF38BC12R",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();

console.log("Loaded auth.js");
console.log(app);

const signInButton = document.getElementById("sign-in");
const email = document.getElementById("email");
const password = document.getElementById("password");

signInButton.addEventListener("click", async function () {
  console.log("Signing in with credentials", email.value, password.value);
  await signInWithEmailAndPassword(auth, email.value, password.value);
  console.log("Success");
});

auth.onAuthStateChanged(function (user) {
  if (user) {
    console.log("Redirecting with user", auth.currentUser.uid);
    localStorage.setItem("user", JSON.stringify(user));
    window.location = "index.html";
  }
});
