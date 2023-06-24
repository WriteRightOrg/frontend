const mainbox = document.getElementById("mainbox");
var remy = 1;
const submitButton = document.getElementById("submit");
let correct = "";
// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
// import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js"
// const auth = getAuth()

// console.log(auth.currentUser.uid)
// const user = auth.currentUser;
// // Access Firestore
// const db = firebase.firestore();

// // Now you can use the Firestore instance to perform database operations
// // For example, you can query a collection
// db.collection("users")
//   .get()
//   .then(function(querySnapshot) {
//     querySnapshot.forEach(function(doc) {
//       console.log(doc.id, "=>", doc.data());
//     });
//   })
//   .catch(function(error) {
//     console.log("Error getting documents: ", error);
//   });
  
function getText() {
  return document.getElementById("mainbox").innerHTML;
}

function getIndicesOf(searchStr, str, caseSensitive) {
  console.log(str, "searching for", searchStr, "within")
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
  console.log(indicies);
  var index = indicies[occurance];
  console.warn(text.substring(0, index), "0, index")
  console.warn(word, "word")
  console.warn(text.substring(index+word.length))
  var newText =
    text.substring(0, index) +
    '<u class="ud" id="ud">' +
    word +
    "</u>" +
    text.substring(index + word.length);

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
        content: `Given an excerpt, identify any punctuation, periods, capitalization, and grammatical errors, return each incorrect word rewritten correctly as well as an explaination for why they are wrong and the occurance of the word(the number of times the word has been written before the position of the errored word), and return the full corrected excerpt in the JSON format.
        
        Example Input : "Peter went to the vary good park? i cant spell vary good,"

        Example Response:
        
          {
              "fixes": [
                  ["vary", "very", "Very is spelled incorrectly [detailed explanation]", 0],
                  ["?", ".", "You need to use a period because it is a statement not a question mark because [detailed explanation]", 0],
                  ["i", "I", "I should be capitalized because [detailed explanation]", 0],
                  ["cant", "can't", "You need an apostrophe because [detailed explanation]", 0],
                  ["vary", "very", "Very is spelled incorrectly [detailed explanation]", 1],
                  [",", ".", "You need to use a period instead of a comma [detailed explanation]", 0]
              ],
              "corrected: "I can't spell good.",
          }
        

        YOUR RESPONSE HAS TO FOLLOW EVERY SINGLE RULE
        [OUTPUT ONLY JSON]
        [DO NOT include any of the correct words in your response.[]
        [DO NOT return any opinion on how to improve the writing's engagement.]
        [ENSURE punctuation is proper.]
        [POPULATE [detailed explantion] with an actual detailed explanation]
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
        Authorization: `Bearer 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`,
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
    //await addMistake(sentence)
    let response = await correctSentence(sentence);

    response = JSON.parse(response.choices[0].message.content);
    correct = response["corrected"];
    console.log("Response", response);
    console.log(correct)
    let num = 0;
    for (let lsit in response["fixes"]) {
      num = num+1;
      let word = lsit[0]
      word = response["fixes"][num]
      // console.log(word[0], "na")
      
      // console.log(word);
      console.log(word[0], word[1], word[2], word[3])
      console.log(getText())
      underLine(word[0],word[3]);
      addBox(word[0], word[1], word[2], "Undeffed")
      
    }
  }
});

function handleMainboxClick() {
  if (remy==0) {
    remy = 1;
    clearUnderline();
  }
}

window.handleMainboxClick = handleMainboxClick

function clearUnderline() {
  mainbox.innerHTML = mainbox.textContent;
}

function addBox(initial, replace, shortexp, lessonLink, numberd) {
  var content = `<div class="custombox">
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
              <button type="button" class="btn btn-outline-success">Fix</button>
            </div>
            `;
  document.getElementById("injectable").innerHTML =
    document.getElementById("injectable").innerHTML + content;
}

async function addMistake(mistake) {
  const ref =  db.collection("users").doc(firebase.auth().currentUser.uid);
  const snap = await ref.get() 
  const previous_mistakes = snap.data().previous_mistakes;
  previous_mistakes.push(mistake)
  return await ref.set({
    "previous_mistakes": previous_mistakes
  });

}


// var ce = document.getElementById("mainbox")
// ce.addEventListener('paste', function (e) {
//   e.preventDefault()
//   var text = e.clipboardData.getData('text/plain')
//   document.execCommand('insertText', false, text)
// })

function test() {
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
  console.log(auth.currentUser)
}