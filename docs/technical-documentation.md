# Technical Documentation – Assignment 3

Portfolio website of Abdulaziz Alkhatib (202372090), SWE 363.

## 1. Overview

The site is one HTML page, one stylesheet and one script. There are no frameworks, libraries or build steps.

| File | Role |
|---|---|
| `index.html` | Structure and content. Project cards carry their data in `data-` attributes |
| `css/styles.css` | Theme colors (CSS variables), layout, animations, responsive rules |
| `js/script.js` | All behavior, in eight numbered sections |
| `assets/images/` | Five small SVG files (four placeholders and the favicon) |

Sections of `js/script.js`:

1. Application state
2. Theme
3. Greeting and visitor name
4. Projects (search, category, level, sort)
5. GitHub repositories (API)
6. Contact form
7. Time-on-site counter
8. Scroll animation

The last lines of the file start the page: load the saved state, check it, draw the page, and request the repositories.

## 2. State management

### The idea

Everything the page has to remember lives in one object called `state`. Nothing else in the code stores a filter, a name or a theme.

```
visitor action  →  setState({ ... })  →  saveState()  →  render()
                   change the object     localStorage    redraw from the object
```

- **`state`** holds the current values.
- **`setState(changes)`** is the only function that changes it. It merges the changes, saves, and redraws.
- **`render()`** calls `renderTheme()`, `renderVisitor()`, `renderProjects()` and `prefillContactName()`. Each one reads `state` and makes the page match it.

Event listeners never touch the page directly. A click on **Web** only calls `setState({ category: "web" })`. Because the page is always redrawn from the state, the buttons, the cards, the count and the messages cannot disagree with each other.

### What is in the state

| Key | Values | Saved? | Used by |
|---|---|---|---|
| `theme` | `"dark"`, `"light"`, or `null` (follow the operating system) | Yes | Theme button, page colors |
| `visitorName` | Text, or `""` when unknown | Yes | Welcome line, contact form name |
| `category` | `"all"`, `"web"`, `"design"`, `"tools"` | Yes | Project filter buttons |
| `level` | `"all"`, `"beginner"`, `"advanced"` | Yes | Level menu and level message |
| `sort` | `"newest"`, `"oldest"`, `"name"` | Yes | Sort menu, card order |
| `query` | Search text | No | Project search |
| `welcomeWord` | `"Welcome back"` or `"Nice to meet you"` | No | Welcome line |

The search text is not saved, because a returning visitor who sees a nearly empty project list would not know why. `welcomeWord` is not saved because it describes this visit only.

### Saving and loading

- The saved keys are listed in `SAVED_KEYS` and written as one JSON text under the `localStorage` key `portfolio-state-v1`.
- `loadSavedState()` runs once at start and copies the saved keys into `state`.
- `checkSavedChoices()` then replaces any value the page does not offer (for example a sort order that was removed, or text edited by hand) with its default.
- Every `localStorage` call is inside `try`/`catch`. If the browser blocks storage, the site works the same; it just forgets on reload.

### State that is not in the store

| Value | Where | Why it is separate |
|---|---|---|
| Repository list | `sessionStorage` cache | It is downloaded data, not a visitor choice |
| `secondsOnSite` | A variable in section 7 | It changes every second and only the footer uses it. Sending it through `setState` would save and redraw the whole page each second |
| Form field values and errors | The form elements | The browser already stores what is typed |

## 3. Features

### 3.1 Visitor name

- An unknown visitor sees a small form. A known visitor sees a welcome line and a **Not you?** button. `renderVisitor()` shows one and hides the other.
- The name is trimmed. An empty name is not saved, and the field gets focus again.
- The text is written with `textContent`, so a name that contains HTML is shown as plain text.
- The welcome line says "Nice to meet you" right after saving and "Welcome back" on later visits.
- The contact form's name field is filled with the saved name when it is empty.

### 3.2 Projects: filter and sort together

Each card carries its data:

```html
<article class="card" data-category="web" data-level="advanced" data-date="2026-10-20">
```

`renderProjects()` runs three steps:

1. **Sort.** `SORTERS` has one compare function per sort option. The cards are sorted and moved in the page in one operation through a `DocumentFragment`. This step is skipped when the order has not changed.
2. **Filter.** A card is shown only when it matches the category **and** the level **and** the search text.
3. **Feedback.** The pressed button, both menus, the level message, the "Showing 2 of 4 projects" line, the empty message and the **Reset filters** button are all set from the state. The reset button only appears when a filter is active.

Dates are stored as `YYYY-MM-DD`, so comparing them as text gives the correct date order.

The search waits 200 ms after the last key press before filtering (`debounce`).

### 3.3 GitHub repositories (API)

**Request:** `GET https://api.github.com/users/Aziz-KFUPM/repos?sort=updated&per_page=6`. No key is needed.

`loadRepos()` follows these steps:

1. Read the cache. If a list was saved less than 10 minutes ago, show it and stop.
2. Otherwise show the spinner and call `fetchRepos()`.
3. `fetchRepos()` cancels the request after 8 seconds with an `AbortController`.
4. On success, save a small copy of the list in the cache and show it.
5. On failure, show a message and the **Try again** button.

| Situation | What the visitor sees |
|---|---|
| Loading | A spinner and "Loading repositories..." |
| Success | Up to six repositories: name, description, language, stars, last update |
| No repositories | "No public repositories yet. Check back soon!" |
| HTTP 403 or 429 | "GitHub's request limit was reached. Wait a few minutes, then click Try again." |
| No answer in 8 seconds | "GitHub took too long to answer, then click Try again." |
| Other HTTP error | "GitHub couldn't answer right now, then click Try again." |
| No connection | "Couldn't load repositories right now. Check your internet connection, then click Try again." |

Failed answers are never cached. All text from the API is inserted with `textContent`, so it cannot run as HTML.

### 3.4 Contact form

`getError(field)` checks one field and returns the first rule that fails:

| Order | Rule | Message |
|---|---|---|
| 1 | Not empty (all fields) | "This field is required." |
| 2 | Name has at least 2 characters | "Please enter your name (at least 2 characters)." |
| 3 | Email matches `text@text.text` with no spaces | "Please enter a valid email, like name@example.com." |
| 4 | Message has at least 10 characters | "Please write a message of at least 10 characters." |
| 5 | Message has at most 500 characters | "Please shorten your message to 500 characters or fewer." |

- On submit, every field is checked. If any fails, focus moves to the first invalid field and nothing is submitted.
- A field that is marked invalid is checked again on every key press, so its error disappears as soon as it is fixed.
- A counter under the message shows its length ("42 / 500") and turns red past the limit.
- There is no backend. A valid form shows a success message and is cleared.

### 3.5 Time-on-site counter

- `setInterval` runs once per second. It adds a second only when `document.hidden` is false, so time in a background tab is not counted.
- `formatDuration()` picks the format by size: "42 seconds", "2 min 05 s", "1 h 02 min".

### 3.6 Theme

`state.theme` starts as `null`, which means "follow the operating system". The first click on the button stores `"dark"` or `"light"`.

## 4. Performance

| Step | Effect |
|---|---|
| Repository list cached for 10 minutes in `sessionStorage` | Reloads make no API request. Measured: 5 page loads, 1 request |
| Only six fields per repository are cached | The cache is a small part of GitHub's full answer |
| Request timeout of 8 seconds | The spinner cannot stay forever |
| Search is debounced by 200 ms | Filtering runs once per pause, not once per key |
| Cards are re-ordered only when the sort changes | No needless page updates or animation replays |
| `DocumentFragment` for cards and repositories | The page is updated once, not once per item |
| The timer pauses in background tabs | No work while nobody is looking |
| `defer` on the script | The page is not blocked while the script downloads |
| Images are SVG, about 250 bytes each, with `width`, `height` and `loading="lazy"` | Almost no image weight, and no layout shift |
| No libraries or web fonts | The whole site is about 35 KB before compression |
| The Assignment 2 theme code was replaced by the shared state store | No duplicate storage code |

Lighthouse has not been run on this version yet. To run it: open the site in Chrome, open DevTools, choose the **Lighthouse** tab, and click **Analyze page load**.

## 5. Accessibility

- The level message, project count, welcome line, repository status and form status use `role="status"` or sit beside a control, so screen readers announce changes.
- Filter buttons use `aria-pressed`. Invalid fields use `aria-invalid` and `aria-describedby`.
- Every control has a label and a visible focus outline.
- All animations stop when the operating system asks for reduced motion.
- The new elements reuse the existing color variables. Their contrast was checked in Assignment 2 (4.5:1 or more in both themes).

## 6. Browser compatibility

Every JavaScript and CSS feature used is supported by current Chrome, Edge, Firefox and Safari. The newest ones are `AbortController`, `String.padStart` and `async`/`await`, all available since 2019 or earlier.

| Checked | How |
|---|---|
| Chrome (desktop, 1280 px) | Automated checks and screenshots |
| Chrome (phone size, 320 and 375 px) | Automated check for horizontal scrolling, and screenshots |
| Safari, Firefox | Not yet tested |

## 7. Testing

The checks run in headless Chrome through Puppeteer. The GitHub API is replaced by fake answers, so every failure can be produced on demand. The scripts are in the AI evidence ZIP, not in this repository.

**Result: 56 of 56 checks pass.**

| Area | What is checked |
|---|---|
| Visitor name | Form on first visit, empty name refused, name trimmed, both welcome texts, reload, **Not you?**, contact form filled in |
| Theme | Toggle, button label, remembered after reload |
| Projects | All three sort orders, category, category + level, both level messages, count, empty message, reset button, choices remembered after reload |
| API | Success, missing description/language/stars, HTML in API text, cache (1 request for 5 loads), 403, 500, offline, **Try again**, timeout, empty list, failures not cached |
| Contact form | Every rule, focus on the first invalid field, live re-check, counter, success, reset |
| Timer | Counts up, all three formats |
| Robustness | Storage blocked, invalid saved values, no console errors, no horizontal scroll at 320 px |

**Not tested:** the live GitHub API (the automated checks use fake answers), Safari and Firefox, and Lighthouse.

## 8. Known limits

- The four projects are placeholders with example dates and levels.
- The contact form does not send anything.
- The visitor name is stored only in the visitor's own browser. It is a greeting, not a login.
- GitHub allows 60 requests per hour per visitor without a login. The cache makes this limit hard to reach.
