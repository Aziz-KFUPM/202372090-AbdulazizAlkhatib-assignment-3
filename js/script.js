// ---------------------------------------------------------------------------
// 1. Application state
// Everything the page has to remember lives in one object. The only way to
// change it is setState(), which saves it and then redraws the page, so the
// screen can never show something different from the state.
// ---------------------------------------------------------------------------
const STORAGE_KEY = "portfolio-state-v1";

// Only these keys are written to localStorage. The rest resets on reload.
const SAVED_KEYS = ["theme", "visitorName", "category", "level", "sort"];

const state = {
  theme: null, // "dark", "light", or null = follow the operating system
  visitorName: "", // "" = the visitor has not introduced themselves
  welcomeWord: "Welcome back", // changes to "Nice to meet you" right after saving a name
  category: "all", // project filter: "all", "web", "design" or "tools"
  level: "all", // project filter: "all", "beginner" or "advanced"
  sort: "newest", // project order: "newest", "oldest" or "name"
  query: "" // project search text (not saved)
};

// localStorage can throw when the browser blocks storage, so the page keeps working without it
function loadSavedState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    SAVED_KEYS.forEach(function (key) {
      if (key in saved) {
        state[key] = saved[key];
      }
    });
  } catch (error) {
    // Nothing saved, or the saved text is not valid JSON: keep the defaults
  }
}

// A saved value that the page no longer offers (or that someone edited by
// hand) falls back to the default instead of breaking the project list
function checkSavedChoices() {
  if (!(state.sort in SORTERS)) {
    state.sort = "newest";
  }
  if (!(state.level in LEVEL_MESSAGES)) {
    state.level = "all";
  }
  const categories = Array.from(filterButtons).map(function (button) {
    return button.dataset.filter;
  });
  if (!categories.includes(state.category)) {
    state.category = "all";
  }
  if (typeof state.visitorName !== "string") {
    state.visitorName = "";
  }
  if (state.theme !== "dark" && state.theme !== "light") {
    state.theme = null;
  }
}

function saveState() {
  const toSave = {};
  SAVED_KEYS.forEach(function (key) {
    toSave[key] = state[key];
  });
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (error) {
    // Storage is blocked: the change still shows, it just isn't remembered
  }
}

// Merge the changes into the state, remember them, and redraw
function setState(changes) {
  Object.assign(state, changes);
  saveState();
  render();
}

// Redraw every part of the page that depends on the state
function render() {
  renderTheme();
  renderVisitor();
  renderProjects();
}

// ---------------------------------------------------------------------------
// 2. Theme (dark/light)
// ---------------------------------------------------------------------------
const themeToggle = document.getElementById("theme-toggle");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

// No saved choice yet? Follow the operating system setting.
function currentTheme() {
  return state.theme || (prefersDark.matches ? "dark" : "light");
}

function renderTheme() {
  const theme = currentTheme();
  document.documentElement.setAttribute("data-theme", theme);
  themeToggle.textContent = theme === "dark" ? "Light" : "Dark";
}

themeToggle.addEventListener("click", function () {
  setState({ theme: currentTheme() === "dark" ? "light" : "dark" });
});

// ---------------------------------------------------------------------------
// 3. Greeting and visitor name
// ---------------------------------------------------------------------------
const greeting = document.getElementById("greeting");
const visitorForm = document.getElementById("visitor-form");
const visitorInput = document.getElementById("visitor-name");
const visitorWelcome = document.getElementById("visitor-welcome");
const visitorText = document.getElementById("visitor-text");
const visitorForget = document.getElementById("visitor-forget");

// Greeting by time of day
function timeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) {
    return "Good morning";
  }
  if (hour < 18) {
    return "Good afternoon";
  }
  return "Good evening";
}

greeting.textContent = timeGreeting() + ", I'm Abdulaziz";

// Known visitor: show the welcome line. Unknown visitor: show the name form.
function renderVisitor() {
  const known = state.visitorName !== "";
  visitorForm.hidden = known;
  visitorWelcome.hidden = !known;
  visitorText.textContent = known ? state.welcomeWord + ", " + state.visitorName + "!" : "";
}

visitorForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const name = visitorInput.value.trim();
  if (name === "") {
    visitorInput.focus();
    return;
  }
  setState({ visitorName: name, welcomeWord: "Nice to meet you" });
});

visitorForget.addEventListener("click", function () {
  visitorInput.value = "";
  setState({ visitorName: "", welcomeWord: "Welcome back" });
  visitorInput.focus();
});

// ---------------------------------------------------------------------------
// 4. Projects: search + category + level + sort, all combined
// ---------------------------------------------------------------------------
const searchInput = document.getElementById("project-search");
const filterButtons = document.querySelectorAll(".filter-btn");
const levelSelect = document.getElementById("project-level");
const sortSelect = document.getElementById("project-sort");
const resetButton = document.getElementById("projects-reset");
const projectsGrid = document.querySelector(".projects");
const projectCards = Array.from(projectsGrid.querySelectorAll(".card"));
const projectsCount = document.getElementById("projects-count");
const projectsEmpty = document.getElementById("projects-empty");
const levelMessage = document.getElementById("level-message");

const LEVEL_MESSAGES = {
  all: "",
  beginner: "New to coding? These projects use only the basics: HTML, CSS and a little JavaScript.",
  advanced: "Looking for a challenge? These projects work with APIs, saved state and more complex logic."
};

// Each sort option is a compare function for Array.sort()
const SORTERS = {
  newest: function (a, b) {
    return b.dataset.date.localeCompare(a.dataset.date);
  },
  oldest: function (a, b) {
    return a.dataset.date.localeCompare(b.dataset.date);
  },
  name: function (a, b) {
    return cardTitle(a).localeCompare(cardTitle(b));
  }
};

let appliedSort = null; // the order the cards are in right now

function cardTitle(card) {
  return card.querySelector("h3").textContent;
}

// Wait until the visitor stops typing before running fn, so it doesn't run on every key
function debounce(fn, delay) {
  let timer;
  return function () {
    clearTimeout(timer);
    timer = setTimeout(fn, delay);
  };
}

function renderProjects() {
  // Step 1: put the cards in the chosen order (only when the order changed,
  // because moving a card replays its fade-in animation)
  if (appliedSort !== state.sort) {
    const sorted = projectCards.slice().sort(SORTERS[state.sort]);
    const fragment = document.createDocumentFragment();
    sorted.forEach(function (card) {
      fragment.appendChild(card);
    });
    projectsGrid.appendChild(fragment);
    appliedSort = state.sort;
  }

  // Step 2: a card is shown only if it passes all three checks
  const query = state.query.trim().toLowerCase();
  let visibleCount = 0;

  projectCards.forEach(function (card) {
    const matchesCategory = state.category === "all" || card.dataset.category === state.category;
    const matchesLevel = state.level === "all" || card.dataset.level === state.level;
    const matchesSearch = card.textContent.toLowerCase().includes(query);
    card.hidden = !(matchesCategory && matchesLevel && matchesSearch);
    if (!card.hidden) {
      visibleCount++;
    }
  });

  // Step 3: make the controls and messages match the state
  filterButtons.forEach(function (button) {
    button.setAttribute("aria-pressed", button.dataset.filter === state.category ? "true" : "false");
  });
  levelSelect.value = state.level;
  sortSelect.value = state.sort;

  levelMessage.textContent = LEVEL_MESSAGES[state.level];
  levelMessage.hidden = state.level === "all";

  projectsCount.textContent = "Showing " + visibleCount + " of " + projectCards.length + " projects.";
  projectsEmpty.hidden = visibleCount > 0;

  // The reset button only appears when there is something to reset
  const filtered = state.category !== "all" || state.level !== "all" || query !== "";
  resetButton.hidden = !filtered;
}

filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    setState({ category: button.dataset.filter });
  });
});

levelSelect.addEventListener("change", function () {
  setState({ level: levelSelect.value });
});

sortSelect.addEventListener("change", function () {
  setState({ sort: sortSelect.value });
});

searchInput.addEventListener("input", debounce(function () {
  setState({ query: searchInput.value });
}, 200));

resetButton.addEventListener("click", function () {
  searchInput.value = "";
  setState({ category: "all", level: "all", query: "" });
});

// ---------------------------------------------------------------------------
// 5. Latest GitHub repositories (public API)
// ---------------------------------------------------------------------------
const reposStatus = document.getElementById("repos-status");
const reposList = document.getElementById("repos-list");
const reposRetry = document.getElementById("repos-retry");
const REPOS_URL = "https://api.github.com/users/Aziz-KFUPM/repos?sort=updated&per_page=6";
const REPOS_CACHE_KEY = "repos-cache-v1";
const REPOS_CACHE_MINUTES = 10;
const REPOS_TIMEOUT_MS = 8000;

function showReposMessage(text, type) {
  reposStatus.textContent = text;
  reposStatus.className = type;
}

// Build one list item. textContent (not innerHTML) keeps API text from being read as HTML.
function createRepoItem(repo) {
  const item = document.createElement("li");
  item.className = "repo";

  const link = document.createElement("a");
  link.href = repo.html_url;
  link.textContent = repo.name;
  link.target = "_blank";
  link.rel = "noopener";

  const description = document.createElement("p");
  description.textContent = repo.description || "No description yet.";

  // Only mention the language and the stars when the repository has them
  const details = document.createElement("small");
  const parts = [];
  if (repo.language) {
    parts.push(repo.language);
  }
  if (repo.stargazers_count > 0) {
    parts.push("★ " + repo.stargazers_count);
  }
  parts.push("Updated " + new Date(repo.updated_at).toLocaleDateString());
  details.textContent = parts.join(" · ");

  item.append(link, description, details);
  return item;
}

// The list is kept in sessionStorage for a few minutes, so reloading the page
// doesn't ask GitHub again (faster, and it saves the 60 requests/hour limit)
function readReposCache() {
  try {
    const cache = JSON.parse(sessionStorage.getItem(REPOS_CACHE_KEY));
    const ageMinutes = (Date.now() - cache.savedAt) / 60000;
    return ageMinutes < REPOS_CACHE_MINUTES && Array.isArray(cache.repos) ? cache.repos : null;
  } catch (error) {
    return null; // nothing cached, or storage is blocked
  }
}

function writeReposCache(repos) {
  // Keep only the fields the page shows, not GitHub's whole answer
  const small = repos.map(function (repo) {
    return {
      name: repo.name,
      html_url: repo.html_url,
      description: repo.description,
      language: repo.language,
      stargazers_count: repo.stargazers_count,
      updated_at: repo.updated_at
    };
  });
  try {
    sessionStorage.setItem(REPOS_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), repos: small }));
  } catch (error) {
    // Storage is blocked: the next page load simply asks GitHub again
  }
}

async function fetchRepos() {
  // Give up after a few seconds instead of leaving the spinner on forever
  const controller = new AbortController();
  const timeout = setTimeout(function () {
    controller.abort();
  }, REPOS_TIMEOUT_MS);

  try {
    const response = await fetch(REPOS_URL, { signal: controller.signal });
    if (!response.ok) {
      throw new Error("HTTP " + response.status);
    }
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

function showRepos(repos) {
  if (repos.length === 0) {
    showReposMessage("No public repositories yet. Check back soon!", "");
    return;
  }
  // Build the whole list off-screen and add it to the page in one step
  const fragment = document.createDocumentFragment();
  repos.forEach(function (repo) {
    fragment.appendChild(createRepoItem(repo));
  });
  reposList.appendChild(fragment);
  showReposMessage("", "");
}

// Pick the friendly message that matches what went wrong
function reposErrorMessage(error) {
  if (error.message === "HTTP 403" || error.message === "HTTP 429") {
    // GitHub's hourly limit for visitors without a login was reached
    return "GitHub's request limit was reached. Wait a few minutes";
  }
  if (error.name === "AbortError") {
    return "GitHub took too long to answer";
  }
  if (error.message.startsWith("HTTP ")) {
    return "GitHub couldn't answer right now";
  }
  return "Couldn't load repositories right now. Check your internet connection";
}

async function loadRepos() {
  reposRetry.hidden = true;
  reposList.textContent = "";

  const cached = readReposCache();
  if (cached) {
    showRepos(cached);
    return;
  }

  showReposMessage("Loading repositories...", "loading");
  try {
    const repos = await fetchRepos();
    writeReposCache(repos);
    showRepos(repos);
  } catch (error) {
    showReposMessage(reposErrorMessage(error) + ", then click Try again.", "error");
    reposRetry.hidden = false;
  }
}

reposRetry.addEventListener("click", loadRepos);

// Contact form validation (no backend)
const form = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");

// Return the error message for one field, or "" if its value is fine
function getError(field) {
  const value = field.value.trim();
  if (field.name === "name" && value.length < 2) {
    return "Please enter your name (at least 2 characters).";
  }
  if (field.name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "Please enter a valid email, like name@example.com.";
  }
  if (field.name === "message" && value.length < 10) {
    return "Please write a message of at least 10 characters.";
  }
  return "";
}

// Show the message under the field (or clear it) and mark the field for screen readers
function showError(field, message) {
  document.getElementById(field.id + "-error").textContent = message;
  field.setAttribute("aria-invalid", message ? "true" : "false");
}

function showFormStatus(text, type) {
  formStatus.textContent = text;
  formStatus.className = "";
  void formStatus.offsetWidth; // forces a reflow so the slide-in animation plays again
  formStatus.className = type;
}

form.addEventListener("submit", function (event) {
  event.preventDefault();
  let firstInvalid = null;

  [form.elements.name, form.elements.email, form.elements.message].forEach(function (field) {
    const message = getError(field);
    showError(field, message);
    if (message && !firstInvalid) {
      firstInvalid = field;
    }
  });

  if (firstInvalid) {
    showFormStatus("Please fix the highlighted fields and try again.", "error");
    firstInvalid.focus();
    return;
  }

  showFormStatus("Thanks, " + form.elements.name.value.trim() + "! Your message was received.", "success");
  form.reset();
});

// While typing, update the error of a field that is already marked invalid
form.addEventListener("input", function (event) {
  if (event.target.getAttribute("aria-invalid") === "true") {
    showError(event.target, getError(event.target));
  }
});

// Fade sections in as they scroll into view (older browsers just show them)
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -50px 0px" });

  document.querySelectorAll(".section").forEach(function (section) {
    section.classList.add("reveal");
    observer.observe(section);
  });
}

// ---------------------------------------------------------------------------
// Start: read what was saved on the last visit, then draw the page once
// ---------------------------------------------------------------------------
loadSavedState();
checkSavedChoices();
render();
loadRepos();
