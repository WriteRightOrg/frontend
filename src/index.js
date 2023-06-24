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

const mainbox = document.getElementById("mainbox");
var remy = 1;
const submitButton = document.getElementById("submit");
let correct = "";
var fixesglob = null;

function getText() {
  return document.getElementById("mainbox").innerHTML;
}

function getIndicesOf(searchStr, str, caseSensitive) {
  console.log(str, "searching for", searchStr, "within");
  var searchStrLen = searchStr.length;
  if (searchStrLen == 0) {
    return [];
  }
  var startIndex = 0,
    index,
    indices = [];
  if (!caseSensitive) {
    str = str.toLowerCase();
    searchStr = searchStr.toLowerCase();
  }
  while ((index = str.indexOf(searchStr, startIndex)) > -1) {
    indices.push(index);
    startIndex = index + searchStrLen;
  }
  return indices;
}

function underLine(word, occurance) {
  // find text in mainbox and replace with underlined text
  var text = getText();
  //   get indicies of word, and use the occurance as the index of the array indicies, and replace the word on that index
  var indicies = getIndicesOf(word, text, false);
  if (indicies.length == 0) {
    return false;
  }
  console.log(indicies, word, occurance);
  while (occurance > indicies.length - 1) {
    occurance = occurance - 1;
  }
  var index = indicies[occurance];
  console.warn(text.substring(0, index), "0, index");
  console.warn(word, "word");
  console.warn(text.substring(index + word.length));
  var newText =
    text.substring(0, index) +
    '<u class="ud" id="ud">' +
    word +
    "</u>" +
    text.substring(index + word.length);
  console.log(getText());
  document.getElementById("mainbox").innerHTML = newText;
  return true;
}

function removeUnderLine(goal, occurance) {
  // remove U tags around word with occurance index, remove <u class="ud" id="ud">, and </u> after
  var text = getText();
  var indicies = getIndicesOf(goal, text, false);
  if (getIndicesOf(goal + "</u>", text, false).length == 0) {
    return false;
  }
  // check if there is a u tag around the occurance of the word
  console.log(
    text.substring(
      indicies[occurance] + goal.length,
      indicies[occurance] + goal.length + 4
    )
  );
  if (
    text.substring(
      indicies[occurance] + goal.length,
      indicies[occurance] + goal.length + 4
    ) == "<u>"
  ) {
    return false;
  }
  var index = indicies[occurance];
  var newText =
    text.substring(0, index - 22) +
    goal +
    text.substring(index + goal.length + 4);

  document.getElementById("mainbox").innerHTML = newText;
  return true;
}

async function correctSentence(sentence) {
  const data = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `Given an paragraph, identify any punctuation, periods, capitalization, grammatical , and spelling errors. return each incorrect word rewritten correctly as well as an explaination for why they are wrong and the occurance of the word(the number of times the word has been written before the position of the errored word), and return the full corrected excerpt in the JSON format.
        

        Example Input : "Peter went to the vary good park? i cant spell vary good, I am gona go home vary fast now."

        Example Response:
        
          {
              "fixes": [
                  ["vary", "very", "Very is spelled incorrectly [detailed explanation]", 0],
                  ["?", ".", "You need to use a period because it is a statement not a question mark because [detailed explanation]", 0],
                  ["i", "I", "I should be capitalized because the signle-letter pronoun 'I' is always capitalized", 0],
                  ["cant", "can't", "You need an apostrophe because contractions require an apostrophe between the first and second segment", 0],
                  ["vary", "very", "Very is spelled incorrectly", 1],
                  [",", ".", "You need to use a period instead of a comma", 0]
                  ["gona", "going to", "gonna is an informal slang for going to", 0],
                  ["vary", "very", "Very is spelled incorrectly", 2],
              ],
              "corrected: "I can't spell good.",
          }
        

        Here is a more detailed example the of the lists within the fixes list:
        [word with issue, word without issue, detailed explantion, occurance of word in excerpt]
        occurance of word in excerpt is the number of times the word has been written before the position of the errored word so if the word that is being corrected is the first time the word has been written in the excerpt then the occurance of the word in the excerpt is 0, if it is the second time the word has been written in the excerpt then the occurance of the word in the excerpt is 1, if it is the third time the word has been written in the excerpt then the occurance of the word in the excerpt is 2 and so on.
        The occurance of the word helps convey its position in the text, make sure the calculations for occurance are consistant. Make sure to get it right.
          
        YOUR RESPONSE HAS TO FOLLOW EVERY SINGLE RULE
        [OUTPUT ONLY JSON]
        [ENSURE all issues are identified, every one. You are not allowed to miss any.]
        [ENSURE issues are not made up and have a factual issue]
        [Ensure words are in the correct form, as stated in the english dictionary]
        [ENSURE the JSON is formatted in the same format as the example.]
        [DO NOT return any opinion on how to improve the writing's engagement.]
        [ENSURE punctuation is proper.]
        [POPULATE [detailed explantion] with an actual detailed explanation do not leave any text that says [detailed explanation] and do not include any [ or ] symbols in the response.]
        [ENSURE corrections in the JSON are returned in the order they appear in the]
        [NO PROSE]`,
      },

      { role: "user", content: sentence },
    ],
  };

  const completion = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer `,
    },
    body: JSON.stringify(data),
  });

  const response = await completion.json();

  console.log("Received response", response.choices[0].message.content);
  return response;
}

submitButton.addEventListener("click", async function () {
  console.log("Submitting...");
  const sentence = mainbox.textContent;
  clearUnderline();

  if (sentence == correct) {
    console.log("shit was right!!!!");
  } else {
    await addMistake(sentence);
    let response = await correctSentence(sentence);

    response = JSON.parse(response.choices[0].message.content);
    correct = response["corrected"];
    console.log("Response", response);
    console.log(correct);
    let num = 0;
    fixesglob = response["fixes"];
    console.log(fixesglob, "fixessssssssssssssssss");
    for (let lsit in response["fixes"]) {
      console.warn("New iteration", num);
      console.log(getText());

      let word = lsit[0];
      word = response["fixes"][num];
      // console.log(word[0], "na")

      console.log(word, "print of word before logging all contents");
      console.log(word[0], word[1], word[2], word[3]);
      console.log(getText());
      underLine(word[0], word[3]);
      addBox(word[0], word[1], word[2], "Undeffed", num);
      num = num + 1;
    }
  }
});

function handleMainboxClick() {
  if (remy == 0) {
    remy = 1;
    clearUnderline();
  }
}

window.handleMainboxClick = handleMainboxClick;
function clearUnderline() {
  mainbox.innerHTML = mainbox.textContent;
}

function addBox(initial, replace, shortexp, lessonLink, numberd) {
  var content = `<div class="custombox" id="${numberd}">
              <div class="boxtitle">
                <h3>Grammatical Error</h3>
              </div>
              <div class="boxcontent">
                <p>${initial}  <i style="margin:10px;" class='fas fa-arrow-right' style='font-size:36px'></i>   
${replace}</p>
              </div>
              <div class="boxcontent">
                <p>${shortexp} <a href="${lessonLink}"><i>Lesson Link</i></a></p>
              </div>
              <button type="button" id="${numberd}-button" onclick="fix(this.id, true)" class="btn btn-outline-success">Fix</button>
            </div>
            `;
  var nocontent = `<div class="custombox" id="${numberd}">
              <div class="boxtitle">
                <h3>Grammatical Error</h3>
              </div>
              <div class="boxcontent">
                <p>
                  ${initial}
                </p>
              </div>
              <div class="boxcontent">
                <p>
                  ${shortexp} <a href="${lessonLink}"><i>Lesson Link</i></a>
                </p>
              </div>
              <div
                style="
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  margin-bottom: 2px;
                "
              >
                <input
                  placeholder="Enter Correction"
                  id="${numberd}-input"
                  type="text"
                  class="form-control"
                  style="width: 50%"
                />
              </div>

              <button
                id="${numberd}-button"
                onclick="fix(this.id, false)"
                type="button"
                class="btn btn-outline-success"
              >
                submit
              </button>
            </div>`;

  if (numberd > 2) {
    document.getElementById("injectable").innerHTML =
      document.getElementById("injectable").innerHTML + nocontent;
  } else {
    document.getElementById("injectable").innerHTML =
      document.getElementById("injectable").innerHTML + content;
  }
}

function sendNotif() {
  iziToast.success({
    title: "Success",
    message: "Please wait for your response!",
  });
}
window.sendNotif = sendNotif;

async function addMistake(mistake) {
  const ref = doc(db, "users", currentUser.uid);
  const snap = await getDoc(ref);
  const previous_mistakes = snap.data().previous_mistakes;
  previous_mistakes.push(mistake);
  return await setDoc(ref, {
    previous_mistakes: previous_mistakes,
  });
}

function fix(ids, auto) {
  ids = ids.split("-")[0];
  if (auto) {
    let clist = fixesglob[ids];
    console.log(clist);
    let inde = 0;
    inde = clist[3];
    // get index of clist[0] in mainbox and replace it with clist[1]
    while (getIndicesOf(clist[0], getText(), false).length < inde) {
      inde = inde - 1;
    }
    removeUnderLine(clist[0], inde);
    inde = clist[3];
    // get index of clist[0] in mainbox and replace it with clist[1]
    while (getIndicesOf(clist[0], getText(), false).length < inde) {
      inde = inde - 1;
    }
    let index = getIndicesOf(clist[0], getText(), false)[inde];

    // replace the word
    let newtext = getText().substring(0, index);
    newtext = newtext + clist[1] + getText().substring(index + clist[0].length);

    mainbox.innerHTML = newtext;

    document.getElementById(ids).style.display = "none";
  } else {
    let clist = fixesglob[ids];
    console.log(clist);

    if (document.getElementById(ids + "-input").value == "") {
      iziToast.error({
        title: "Error",
        message: "Please enter a correction!",
      });
      return;
    } else if (document.getElementById(ids + "-input").value == clist[1]) {
      // remove underline, replace word, remove box
      let inde = 0;
      inde = clist[3];
      // get index of clist[0] in mainbox and replace it with clist[1]
      while (getIndicesOf(clist[0], getText(), false).length < inde) {
        inde = inde - 1;
      }
      removeUnderLine(clist[0], inde);
      inde = clist[3];
      // get index of clist[0] in mainbox and replace it with clist[1]
      while (getIndicesOf(clist[0], getText(), false).length < inde) {
        inde = inde - 1;
      }
      let index = getIndicesOf(clist[0], getText(), false)[inde];

      // replace the word
      let newtext = getText().substring(0, index);
      newtext =
        newtext + clist[1] + getText().substring(index + clist[0].length);

      mainbox.innerHTML = newtext;

      document.getElementById(ids).style.display = "none";
    }
  }
}
window.fix = fix;

window.getText = getText;
// var ce = document.getElementById("mainbox")
// ce.addEventListener('paste', function (e) {
//   e.preventDefault()
//   var text = e.clipboardData.getData('text/plain')
//   document.execCommand('insertText', false, text)
// })
