# AI Usage Report – Assignment 3

**Student:** Abdulaziz Alkhatib (202372090)
**Course:** SWE 363 – Assignment 3: Advanced Functionality

> **Before submitting:** the lines marked `TODO (Abdulaziz)` are mine to write, in my own words. Delete this note when they are done.

## 1. Tools used and use cases

| Tool | Model | How I used it |
|---|---|---|
| Claude Code (VS Code extension) | Claude Fable 5.2 (`claude-fable-5-2`) | See the list below |

Claude Code was the only AI tool I used. I used it to:

- read the assignment brief and my Assignment 2 code, and copy that code into this repository as the starting point
- generate the Assignment 3 features, one commit per feature
- write and run browser tests for the features
- explain the state management and the design choices to me
- draft the README, the technical documentation and the structure of this report

The starting code from Assignment 2 was also AI-assisted. That use is declared in the Assignment 2 report.

## 2. Usage log

| ID | Tool (model) | Date | Purpose | Files affected | What you changed and how you verified it |
|----|--------------|------|---------|----------------|------------------------------------------|
| C01 | Claude Code (Claude Fable 5.2) | 2026-11-21 | Copy Assignment 2, implement all Assignment 3 features, test them, explain them, draft the documentation | `index.html`, `css/styles.css`, `js/script.js`, `README.md`, `docs/*` | TODO (Abdulaziz): what I asked about, what I changed, and how I checked it myself |
| A01 | Claude Code (Claude Fable 5.2) | 2026-11-21 | The AI-generated code and docs before my edits (`artifacts/A01-ai-generated.patch`): every commit on branch `feature/advanced-functionality` after `c34f1aa` | Same as C01 | TODO (Abdulaziz): my edits after this patch, or "no changes" with the reason |
| A02 | Claude Code (Claude Fable 5.2) | 2026-11-21 | Browser test scripts (Puppeteer) and screenshots (`artifacts/A02-tests/`) | None (kept outside the repository) | The AI ran them: 56 of 56 checks passed. TODO (Abdulaziz): what I tested by hand |

Each commit with AI-assisted code ends with `Assisted-by: Claude Code (Claude Fable 5.2)`.

## 3. How the AI output was verified

**By the AI, in headless Chrome (Puppeteer), 56 checks, all passing:**

- visitor name: save, reload, forget, and the contact form being filled in
- theme remembered after reload
- projects: every sort order, category and level together, messages, count, reset, choices remembered
- GitHub request: success, cache, request limit, server error, offline and retry, timeout, empty list
- every contact form rule, the counter and the focus behavior
- the timer and its three text formats
- storage blocked, invalid saved values, no console errors, no horizontal scroll at 320 px

The full list is in `technical-documentation.md`, section 7.

**Not verified by the AI:**

- the live GitHub API (the tests use fake answers)
- Safari and Firefox
- Lighthouse

**By me:**

- TODO (Abdulaziz): what I opened, clicked and checked myself, and in which browsers

**Problem found during testing:** the first version hid the name form with the `hidden` attribute, but the stylesheet's `form { display: flex }` rule would have kept it visible. The AI noticed this while reviewing its own code and added a `[hidden] { display: none !important; }` rule before the first test run.

## 4. Responsible use and modifications

- TODO (Abdulaziz): which parts of the AI output I reviewed, what I changed or rejected, and why
- TODO (Abdulaziz): how I made sure I understand the code (for example, the questions I asked in C01)

## 5. Benefits and challenges

- TODO (Abdulaziz): how the AI helped
- TODO (Abdulaziz): difficulties or limits I ran into

One limit worth recording: I asked for the state management "in React", but the project is plain JavaScript and the assignment asks for `index.html`, `css/` and `js/`. The AI kept plain JavaScript and built a small store that works like React state (`state` → `setState()` → `render()`).

## 6. Learning outcomes

- TODO (Abdulaziz): what I learned, in my own words

Topics this assignment covered, as a starting list:

- one state object with a single `setState()` function, and why the page is redrawn from the state
- `localStorage` for choices and `sessionStorage` for a cache, and the difference between them
- combining several filters with a sort
- `AbortController` for a request timeout, and one message per kind of failure
- debounce
- `setInterval` with `document.hidden`

## 7. Evidence

The AI Evidence ZIP `202372090-AbdulazizAlkhatib-assignment3-ai-evidence.zip` is submitted on Blackboard and not committed here. It contains:

- `conversations/`: the complete, unedited Claude Code transcript of C01 (`.jsonl`), and a readable `.md` copy of it
- `artifacts/`: A01 (AI-generated code before my edits) and A02 (test scripts and screenshots)

## 8. Declaration

> I declare that this report and the attached evidence document all of my AI use in this assignment, with complete and unedited conversations, and that I understand and can explain all the code I submitted. I understand that undeclared AI use or a false declaration will be treated as plagiarism according to KFUPM regulations.

**Name:** Abdulaziz Alkhatib
**ID:** 202372090
**Date:** TODO (Abdulaziz): the date I submit
