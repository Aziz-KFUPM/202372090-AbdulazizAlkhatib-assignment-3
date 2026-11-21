# Abdulaziz Alkhatib – Portfolio (SWE 363, Assignment 3)

A personal portfolio website built with plain HTML, CSS and JavaScript, with no frameworks, libraries or build tools. Assignment 3 builds on [Assignment 2](https://github.com/Aziz-KFUPM/202372090-AbdulazizAlkhatib-assignment-2) by adding state that the site remembers, project filtering and sorting that work together, a faster and more careful GitHub API integration, stricter form checks and a visit timer.

## Features

### New in Assignment 3

| Area | Feature | What you do | What happens |
|---|---|---|---|
| State | Visitor name | Type your name under the introduction and click **Save** | The site greets you by name, remembers you on your next visit, and fills in the contact form's name for you. **Not you?** forgets the name |
| State | Remembered choices | Pick a theme, a project category, a level or a sort order | The same choices are still selected when you come back |
| Complex logic | Filter and sort together | Combine **search**, **category**, **Your level** and **Sort by** | Only the projects that match every choice are shown, in the order you picked. A line says how many are showing, and **Reset filters** appears when something is filtered |
| Complex logic | Level message | Choose **Beginner** or **Advanced** | A short message for that level appears above the matching projects |
| Complex logic | Contact form rules | Click **Send** | Each field is checked step by step: not empty, valid format, long enough, not too long. A live counter shows the message length |
| Complex logic | Visit timer | Stay on the page | The footer shows how long you have been here. It pauses while the tab is in the background |
| API | GitHub repositories | Open the page | The latest public repositories load from the GitHub API, now with star counts. Each kind of failure (request limit, slow answer, GitHub problem, no connection) shows its own message and a **Try again** button |
| Performance | Caching | Reload the page | The repository list is reused for 10 minutes instead of being downloaded again |

### From Assignments 1 and 2

- A greeting that changes with the time of day
- A dark/light theme that follows the operating system until you pick one
- Sections that fade in on scroll, cards that lift on hover, and no motion when the operating system asks for reduced motion
- A responsive, mobile-first layout using Flexbox and Grid

## Run it locally

You only need a modern browser. Python is only needed for option B.

1. Clone the repository:
   ```bash
   git clone https://github.com/Aziz-KFUPM/202372090-AbdulazizAlkhatib-assignment-3.git
   cd 202372090-AbdulazizAlkhatib-assignment-3
   ```
2. Open the site in one of two ways:
   - **Option A:** double-click `index.html`.
   - **Option B (recommended):** start a small local server, then open <http://localhost:8000>:
     ```bash
     python3 -m http.server 8000
     ```
     The VS Code **Live Server** extension also works.
3. The **Latest on GitHub** section needs an internet connection. Without one, it shows an error message and a **Try again** button, and the rest of the page still works.

There is nothing to install and nothing to build.

## How to use the site

- **Your name:** type it under the introduction and click **Save**. Click **Not you?** to remove it.
- **Projects:** type in the search box, click a category, choose a level, and choose a sort order. They all apply at the same time. Click **Reset filters** to see every project again.
- **Latest on GitHub:** loads by itself. If you see an error, wait a moment and click **Try again**.
- **Contact:** the form does not send email, because there is no backend. It checks your input and confirms when everything is valid. Messages can be 10 to 500 characters long.
- **Theme:** the button in the top-right corner switches between dark and light.

**What the site remembers:** your name, theme, project category, level and sort order are saved in your own browser (`localStorage`). Nothing is sent to a server. To start fresh, click **Not you?** and **Reset filters**, or clear the site data in your browser settings.

## Project structure

```
├── index.html                       Page structure
├── css/styles.css                   Theme colors, layout, animations, responsive rules
├── js/script.js                     All interactivity, in eight numbered sections
├── assets/images/                   Project placeholders and favicon (SVG)
├── docs/
│   ├── ai-usage-report.md           AI tools, usage log and declaration
│   └── technical-documentation.md   How each feature works, state, performance, testing
└── README.md
```

## Quality checks

- **Automated browser checks:** 56 checks in headless Chrome cover every new feature, every API failure, blocked storage and a 320 px wide phone screen. All pass.
- **Not yet done:** a Lighthouse run for this version, and manual checks in Safari and Firefox.

Details are in [docs/technical-documentation.md](docs/technical-documentation.md).

## Deploying to GitHub Pages (optional)

1. On GitHub, open **Settings → Pages**.
2. Under **Source**, choose **Deploy from a branch**, then branch `main` and folder `/ (root)`, and save.
3. After about a minute, the site is live at `https://aziz-kfupm.github.io/202372090-AbdulazizAlkhatib-assignment-3/`.

## AI use

I used **Claude Code (Claude Fable 5.2)** to:

- plan and generate the Assignment 3 features, one commit per feature
- test them in a headless browser
- explain the state management and design choices to me
- draft this documentation

Commits that contain AI-assisted code say so with an `Assisted-by:` line. The full usage log and declaration are in [docs/ai-usage-report.md](docs/ai-usage-report.md).

## Author

Abdulaziz Alkhatib, 202372090, SWE 363, KFUPM
