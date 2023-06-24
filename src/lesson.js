import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  updateDoc,
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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
const db = getFirestore(app);

const currentUser = JSON.parse(localStorage.getItem("user"));
if (!currentUser) {
  window.location = "./login.html";
}
console.log("Current User", JSON.stringify(currentUser));

const lesson = document.getElementById("lesson");
const messages = [
  {
    role: "system",
    content: `Given a list of a student's past mistakes they've made when writing, decide what English concept should be taught to them. Your reasoning should address the student directly in the second person. Answer in the JSON format only
              {
              "concept":  [CONCEPT],
              "reasoning": [REASONING]
              }`,
  },

  {
    role: "user",
    content: (await getPreviousMistakes()).toString(),
  },
];

async function getPreviousMistakes() {
  const ref = doc(db, "users", currentUser.uid);
  const snap = await getDoc(ref);
  return snap.data()["previous_mistakes"];
}

async function getCompletion() {
  const data = {
    model: "gpt-3.5-turbo-16k",
    messages: messages,
  };

  const completion = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer `,
    },
    body: JSON.stringify(data),
  });

  let response = await completion.json();
  response = response.choices[0].message.content;
  console.log(response);
  messages.push({
    role: "assistant",
    content: response,
  });
  response = JSON.parse(response.replace(/(\r\n|\n|\r)/gm, ""));
  console.log(response);
  return response;
}

async function writeConcept() {
  const response = await getCompletion();
  lesson.innerHTML += `
    <h1>Today's Lesson: ${response["concept"]}</h1>
    <p>${response["reasoning"]}</p>`;
}

async function writeLesson() {
  messages.push({
    role: "user",
    content: `Write a short lesson on the concept you picked as if you were a teacher addressing a student. Answer in the JSON format only
        {
            "concept":  [CONCEPT],
            "lesson": [LESSON]
        }`,
  });
  const response = await getCompletion();
  lesson.innerHTML += `
  <p>${response["lesson"]}</p>`;
}

window.writeConcept = writeConcept;
window.writeLesson = writeLesson;
window.messages = messages;
