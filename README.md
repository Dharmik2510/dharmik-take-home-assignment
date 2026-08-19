
# Character Sheet (dharmik-take-home-assignment)

Welcome, and thanks for taking the time to work on this exercise!

You’ll be building a small web app that creates a character sheet for a tabletop RPG (like D&D or Pathfinder).

We ask that you spend **around 2 hours actively coding** on the assignment. You’ll have a **4-hour submission window** to give you extra time for setup, reading through the requirements, and submitting your solution.

It’s okay if you don’t finish all requirements — we care more about your **approach, problem-solving, and code structure** than about a fully polished end result. Work through the requirements from top to bottom as best you can, but feel free to skip ahead if you get stuck.

Here’s a short video showing a partial implementation to help you get started: [https://www.loom.com/share/3afa00385d2d4fbc9720b88360036a54](https://www.loom.com/share/3afa00385d2d4fbc9720b88360036a54)

## ⏰ Timebox

- Plan to spend about **2 hours coding**.
- You’ll have a **4-hour window** in Codesubmit to account for setup, reading, and submission.
- You may make **multiple commits/pushes** as you go.
- Once you click **Submit Code** in Codesubmit, your work is finalized and can no longer be updated.

## 🤖 AI Usage

- We allow and even encourage the use of AI tools (e.g. ChatGPT, Copilot, etc.) to support your workflow.
- However, you should be prepared to explain and justify your code and design decisions in a follow-up interview.
- Think of AI as a coding partner — not a substitute for your own understanding.

## 🚀 Setup

This project is hosted on **Codesubmit.io**.

1.  Clone the repository using the link provided in your Codesubmit assignment page.

2.  Install dependencies:

    `npm install`

3.  Start the app:

    `npm start`

## 📦 Submitting your code

-   Push your changes to the repository as you work.

-   When you’re done, return to the Codesubmit page and click **Submit Code**.

-   Submitting locks your work — no further changes will be accepted.

- After submitting, you’ll also have the **option to upload a short screen recording or walkthrough** of your code. We **highly encourage** this as it helps us better understand your approach, trade-offs, and thought process.  

## 💡 Other Notes

-   Focus on functionality over styling.

-   Please include **comments, explanations, and context** anywhere in your code where it helps clarify your thinking or justify assumptions. We value transparency — understanding *why* you made certain decisions is just as important as *what* you built.

-   Typescript has been added to this project but is optional. You are not required to use it. It has been added for those who prefer developing with Typescript over Javascript.

-   If you get stuck, stub things out or leave comments explaining what you’d do next.

## 📝 Requirements

We’ve listed requirements in priority order. Complete as much as you can within the timebox.

### 1. Attributes

-   Create state and controls for each of the 6 attributes (`ATTRIBUTE_LIST`).

-   Allow increment/decrement independently.


### 2. Classes

-   Display available classes (`CLASS_LIST`).

-   Visually indicate when the character meets a class’s minimum requirements.

-   Clicking a class should show its required stats.


### 3. Ability Modifiers

-   Add a calculated modifier for each attribute:

    -   Formula: `+1 for every 2 points above 10` (negative below 10).

    -   Example: 12 → +1, 14 → +2, 7 → -2.


### 4. Skills

-   Skills are defined in `SKILL_LIST`.

-   Characters start with `10 + (4 * Intelligence Modifier)` points to distribute.

-   Points:

    -   Minimum 0 per skill

    -   No max (except total available points)

-   Total skill value = `points spent + related attribute modifier`.

-   Display each skill row, e.g.:

    `Acrobatics  -  points: 3  [+]  [-] | modifier (Dex): 2 | total: 5`


### 5. Persistence

-   Save the character(s) to an API so they can be retrieved when the app starts next time:

    - Saving:  `POST https://recruiting.verylongdomaintotestwith.ca/api/{{github_username}}/character`

    - Retrieving:  `GET https://recruiting.verylongdomaintotestwith.ca/api/{{github_username}}/character`
 
-   Include `Content-Type: application/json`. You must include a content-type header of application/json for the post to be accepted

-   Any JSON payload is accepted; the most recent version is returned.

-   For example, if your github username is mjohnston, you would use https://recruiting.verylongdomaintotestwith.ca/api/{mjohnston}/character (include the curly braces) 

### 6. Attribute Cap

-   Total attribute points across all 6 must not exceed **70**.

-   Prevent incrementing if the cap is reached.


### 7. Multiple Characters

-   Support editing multiple characters at once, with the same rules above.


### 8. Skill Checks

-   Add per-character skill checks:

    -   Pick a skill (dropdown).

    -   Enter a DC (difficulty class).

    -   Click **Roll** → random number 1–20.

    -   Success if `(roll + skill total) ≥ DC`.

    -   Display roll result and success/failure.


### 9. Party Skill Check

-   Similar to above, but the character with the **highest total** in the chosen skill attempts the action.

-   Show which character was chosen.