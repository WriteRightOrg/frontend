## Inspiration

Talking to English educators in our community, we found that they feel technologies like Grammarly might seem like boons to education but are curses. While students can correct their papers in just a few clicks, they are losing the ability to properly develop and utilize their English skills. We wondered if there was a way we could strike a balance between helping students quickly and easily fix grammatical issues whilst ensuring their English skills do not suffer.

## What it does

WriteRight is a web app that provides grammar, punctuation, and spelling corrections to users. Rather than allowing for unlimited auto-fixes, WriteRight uses a token system where users can earn tokens by completing lessons custom written for them based on what skills they need to work on. They can then use these tokens to make WriteRight fix their writing with just a click, but not before WriteRight ensures that the student has an understanding of the mistake they have made.

## How we built it

We built the application using HTML, CSS, and Javascript. We decided not to use a backend like Flask as we wanted to make the application as efficient as possible. We created a system that allowed for a seamless transition. To power our grammar checker we used OpenAI's GPT models. We used prompt engineering to get ChatGPT to create responses that fit a specific JSON format that can be interpreted by our application.

To highlight issues we used JavaScript and used substring selectors to inject HTML into the website. We also used HTML injection when we inserted correction boxes on the right side of the screen. We assigned specific IDs to each element so we could change the visibility of each depending on the changes the user makes.

To store and manage tokens we used Firestore from Firebase, the tokens are linked to unique login accounts. The data for each account is stored in cookies so the account is accessible on both the index and lesson pages.

We put everything together using html structures, and javascript functions. We also used CSS to make the site visually appealing. But we wanted to specifically focus on our concepts of token management in regards to creating a more captivating learning experience.

## Challenges we ran into

- Firebase Authentication in JavaScript was rather difficult as we have mostly worked with frameworks like React

- Prompt engineering and parsing data from ChatGPT, which is not always reliable, was quite difficult

- Figuring out how to balance tokens so that students will still be inclined to use the app, teachers can ensure students are still learning, and the app can sustain itself

## Accomplishments that we're proud of

- We are proud of how we connect social sciences that keep people engaged on apps to our program. We believe this will benefit us in the future as we will have a strong base.

- We are proud that we could think of and create a program that is so well thought out and extensive as this one. We believe this project is one of our most significant personal achievements given the timeframe of this hackathon.

## What we learned

- We learned a lot about HTML, JavaScript, and CSS.

- We also learned a lot about the social sciences behind how apps retain users by using smartly placed advertisements and rewards.

- We learned how to properly engineer gpt prompts to get specific responses and ensure our response processing is clear.

## What's next for WriteRight

- Reach out to professionals as well as institutions such as schools that would be interested in distributing our app as a replacement for existing writing assistants

- Add support for different devices (Chrome Extensions, Mobile, etc)

- Build out the website to be more user-friendly
