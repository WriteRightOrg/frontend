const mainbox = document.getElementById("mainbox");
const submitButton = document.getElementById("submit");
let correct = "";

function getText() {
  return document.getElementById("mainbox").innerHTML;
}

function getIndicesOf(searchStr, str, caseSensitive) {
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
        content: `Given an excerpt, identify any punctuation, capitalization, and grammatical mistakes, as well as an explanation for why they are wrong and return a corrected paragraph in the JSON format.
        
        Example Input : "i cant spell good."

        Example Response:
        {
            "i": ["I", "I should be capitalized because [detailed explaination]"],
            "cant": ["can't", "You need an apostrophe because [detailed explaination]"],
            "corrected: "I can't spell good.",
        }
        
        REGARDLESS OF YOUR RESPONSE IT MUST BE IN THE JSON FORMAT.
        DO NOT include any of the correct words in your response.
        DO NOT return any opinion on how to improve the writing's engagement.`,
      },

      { role: "user", content: sentence },
    ],
  };

  const completion = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Bearer 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",
    },
    body: JSON.stringify(data),
  });

  const response = await completion.json();

  //console.log("Received response", response.choices[0].message.content);
  return response;
}

submitButton.addEventListener("click", async function () {
  console.log("Submitting...");
  const sentence = mainbox.textContent;
  clearUnderline();

  if (sentence == correct) {
    console.log("shit was right!!!!");
  } else {
    let response = await correctSentence(sentence);

    response = JSON.parse(response.choices[0].message.content);
    correct = response["corrected"];
    console.log("Response", response);

    for (let word in response) {
      console.log(word);
      underLine(word, 0);
    }
  }
});

mainbox.addEventListener("keypress", clearUnderline);

function clearUnderline() {
  const temp = mainbox.textContent;
  mainbox.innerHTML = "";
  mainbox.innerHTML = temp;
}
