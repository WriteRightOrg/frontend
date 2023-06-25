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

let correct = "";
const lesson = document.getElementById("lesson");
const messages = [
  {
    role: "system",
    content: `Given a list of a student's past mistakes they've made when writing, decide what English concept should be taught to them. Your reasoning should address the student directly in the second person. Answer in the JSON format only
              {
              "concept":  [CONCEPT],
              "reasoning": [REASONING],
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
      Authorization: `Bearer ${OPENAI_API_KEY}`,
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
  response = JSON.parse(removeLines(response));
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
            "lesson": [LESSON],
        }`,
  });
  const response = await getCompletion();
  console.log(restructure(response["lesson"]));
  lesson.innerHTML += `
  <p style="margin-top: 20px">${restructure(response["lesson"])}</p>`;
}

function removeLines(str) {
  return str.replace(/(\r\n|\n|\r)/gm, "").trim();
}

async function handleSubmit() {
  console.log("Submit Clicked");
  console.log(JSON.stringify(removeLines(correct)));
  console.log(
    JSON.stringify(removeLines(document.getElementById("fix-box").textContent))
  );
  if (
    removeLines(document.getElementById("fix-box").textContent) ==
    removeLines(correct)
  ) {
    console.log("Correct!");
    sendNotif();
    await addToken();
    await writeTest();
  } else {
    console.log("Incorrect...");
    sendError();
  }
}

function sendError() {
  iziToast.error({
    title: "Hmm...",
    message: "That wasn't right, try again!",
  });
}

function sendNotif() {
  iziToast.success({
    title: "Great!",
    message: "Good job! Wait for your next question...",
  });
}

async function writeTest() {
  messages.push({
    role: "user",
    content: `Write a test question with an incorrect phrase and it's corrected answer to test the students conceptual understanding. Answer in the JSON format only
    Example:
        {
            "concept": [CONCEPT],
            "question": "Correct the following statement: 'I cant spell well'",
            "answer": "I can't spell well.",
        }`,
  });
  const response = await getCompletion();
  correct = response["answer"];

  const content = `
    <p id="question" style="margin-top: 20px">${response["question"]}</p>
    <div
    id="fix-box"
    spellcheck="false"
    class="be2"
    contenteditable="true"
  >
    Insert text here
    <div id="cursor"></div>
    </div>
    <button type="button" id="correct-button" onclick="handleSubmit()" class="btn btn-outline-success">Submit</button>
    `;
  if (!document.getElementById("fix-box")) {
    lesson.innerHTML += content;
  } else {
    document.getElementById("question").textContent = response["question"];
  }
}

function restructure(str) {
  // every time there is a number followed by a period in the teext, add a new line infront of that

  var re = /(\d+)\./g;
  var newstr = str.replace(re, "<br><br>$1.");
  return newstr;
}

async function getTokens() {
  const ref = doc(db, "users", currentUser.uid);
  const snap = await getDoc(ref);
  return snap.data()["tokens"];
}

async function addToken() {
  const tokens = await getTokens();
  const ref = doc(db, "users", currentUser.uid);
  await updateDoc(ref, {
    tokens: tokens + 1,
  });
}
async function updateTokenCount() {
  var ce = document.getElementById("tokencount");
  ce.innerHTML = "Tokens: " + (await getTokens());
}
window.messages = messages;
window.correct = correct;
window.handleSubmit = handleSubmit;
window.restructure = restructure;
await writeConcept();
await writeLesson();
await writeTest();
while (true) {
  await updateTokenCount();
  setTimeout(() => {
    // do something else
  }, 50);
}
