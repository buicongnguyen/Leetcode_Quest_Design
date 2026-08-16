const THEME_KEY = "leetcode-design-quest-theme";
const SIDEBAR_SCROLL_KEY = "leetcode-design-reader-sidebar-scroll";
const CODE_LANGUAGE_KEY = "leetcode-design-reader-code-language";
const PRACTICE_STATE_KEY = "leetcode-design-reader-practice-v2";
const ATLAS_PROGRESS_KEY = "leetcode-design-quest-progress-v1";
const menu = document.querySelector("#reader-menu");
const readerSidebar = document.querySelector("#reader-sidebar");
const searchDialog = document.querySelector("#reader-search");
const searchInput = document.querySelector("#reader-search-input");
const searchResults = document.querySelector("#reader-search-results");
const themeButton = document.querySelector("#reader-theme");
let searchIndex = [];
let sidebarSaveTimer;

function saveSidebarPosition() {
  try {
    sessionStorage.setItem(SIDEBAR_SCROLL_KEY, String(readerSidebar.scrollTop));
  } catch {
    // Navigation still works when browser storage is unavailable.
  }
}

function restoreSidebarPosition() {
  let savedPosition = null;
  try {
    const stored = sessionStorage.getItem(SIDEBAR_SCROLL_KEY);
    const parsed = Number(stored);
    if (stored !== null && Number.isFinite(parsed) && parsed >= 0) savedPosition = parsed;
  } catch {
    // Fall back to positioning the active page in view.
  }

  requestAnimationFrame(() => {
    if (savedPosition !== null) {
      readerSidebar.scrollTop = savedPosition;
      return;
    }
    const activePage = readerSidebar.querySelector("a.active");
    if (activePage) readerSidebar.scrollTop = Math.max(0, activePage.offsetTop - readerSidebar.clientHeight / 3);
  });
}

function setTheme(value) {
  const theme = ["light", "dark"].includes(value) ? value : "dark";
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
  const light = theme === "light";
  themeButton.setAttribute("aria-pressed", String(light));
  themeButton.setAttribute("aria-label", light ? "Use dark theme" : "Use light theme");
}

function buildOutline() {
  const headings = [...document.querySelectorAll(".reader-article h2[id]")];
  const outline = document.querySelector("#article-outline");
  outline.innerHTML = headings.map(heading => `<a href="#${heading.id}">${heading.textContent}</a>`).join("");
  if (!headings.length) return;
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      outline.querySelectorAll("a").forEach(link => link.classList.toggle("active", link.hash === `#${entry.target.id}`));
    }
  }, { rootMargin: "-15% 0px -75%" });
  headings.forEach(heading => observer.observe(heading));
}

function activateCodeLanguage(group, language, moveFocus = false) {
  const tabs = [...group.querySelectorAll('[role="tab"]')];
  const panels = [...group.querySelectorAll('[role="tabpanel"]')];
  const selected = tabs.find(tab => tab.dataset.codeLanguage === language) || tabs[0];
  if (!selected) return;
  tabs.forEach(tab => {
    const active = tab === selected;
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  panels.forEach(panel => { panel.hidden = panel.dataset.codePanel !== selected.dataset.codeLanguage; });
  localStorage.setItem(CODE_LANGUAGE_KEY, selected.dataset.codeLanguage);
  if (moveFocus) selected.focus();
}

function setupCodeWorkbenches() {
  const savedLanguage = localStorage.getItem(CODE_LANGUAGE_KEY) || "python";
  document.querySelectorAll("[data-code-tabs]").forEach(group => {
    const tabs = [...group.querySelectorAll('[role="tab"]')];
    activateCodeLanguage(group, savedLanguage);
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activateCodeLanguage(group, tab.dataset.codeLanguage));
      tab.addEventListener("keydown", event => {
        let nextIndex = null;
        if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = tabs.length - 1;
        if (nextIndex === null) return;
        event.preventDefault();
        activateCodeLanguage(group, tabs[nextIndex].dataset.codeLanguage, true);
      });
    });
    group.querySelector("[data-copy-code]")?.addEventListener("click", async event => {
      const button = event.currentTarget;
      const activeCode = group.querySelector('[role="tabpanel"]:not([hidden]) code');
      if (!activeCode) return;
      try {
        await navigator.clipboard.writeText(activeCode.textContent);
        button.textContent = "Copied";
        setTimeout(() => { button.textContent = "Copy code"; }, 1400);
      } catch {
        button.textContent = "Select and copy";
      }
    });
  });
}

function loadPracticeStates() {
  try {
    const value = JSON.parse(localStorage.getItem(PRACTICE_STATE_KEY) || "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

function savePracticeState(questId, value) {
  const states = loadPracticeStates();
  if (value === "not-started") delete states[questId];
  else states[questId] = value;
  localStorage.setItem(PRACTICE_STATE_KEY, JSON.stringify(states));

  let completed = [];
  try {
    const parsed = JSON.parse(localStorage.getItem(ATLAS_PROGRESS_KEY) || "[]");
    if (Array.isArray(parsed)) completed = parsed.filter(Number.isInteger);
  } catch {
    completed = [];
  }
  const completedIds = new Set(completed);
  if (["solved", "reviewed"].includes(value)) completedIds.add(Number(questId));
  else completedIds.delete(Number(questId));
  localStorage.setItem(ATLAS_PROGRESS_KEY, JSON.stringify([...completedIds]));
}

function setupPracticeStatuses() {
  const labels = { "not-started": "Not started", attempted: "Attempted", solved: "Solved", reviewed: "Reviewed" };
  const states = loadPracticeStates();
  document.querySelectorAll("[data-practice-status]").forEach(group => {
    const questId = group.dataset.questId;
    const label = group.querySelector("[data-practice-label]");
    const live = group.querySelector("[data-practice-live]");
    const buttons = [...group.querySelectorAll("[data-practice-value]")];
    const render = value => {
      const safeValue = labels[value] ? value : "not-started";
      label.textContent = labels[safeValue];
      group.dataset.currentPractice = safeValue;
      buttons.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.practiceValue === safeValue)));
      return safeValue;
    };
    render(states[questId] || "not-started");
    buttons.forEach(button => button.addEventListener("click", () => {
      const value = render(button.dataset.practiceValue);
      savePracticeState(questId, value);
      live.textContent = `Practice state changed to ${labels[value]}.`;
    }));
  });
}

function setupTraceLabs() {
  document.querySelectorAll("[data-trace-lab]").forEach(lab => {
    const steps = [...lab.querySelectorAll("[data-trace-step]")];
    const label = lab.querySelector("[data-trace-position]");
    const previous = lab.querySelector("[data-trace-previous]");
    const next = lab.querySelector("[data-trace-next]");
    const reset = lab.querySelector("[data-trace-reset]");
    let index = 0;
    const render = value => {
      index = Math.max(0, Math.min(steps.length - 1, value));
      steps.forEach((step, stepIndex) => { step.hidden = stepIndex !== index; });
      label.textContent = `Step ${index + 1} of ${steps.length}`;
      previous.disabled = index === 0;
      next.disabled = index === steps.length - 1;
    };
    previous.addEventListener("click", () => render(index - 1));
    next.addEventListener("click", () => render(index + 1));
    reset.addEventListener("click", () => render(0));
    lab.addEventListener("keydown", event => {
      if (event.key === "ArrowLeft") { event.preventDefault(); render(index - 1); }
      if (event.key === "ArrowRight") { event.preventDefault(); render(index + 1); }
    });
    render(0);
  });
}

function renderSearch(query) {
  const value = query.trim().toLowerCase();
  const matches = searchIndex.filter(item => !value || `${item.title} ${item.section} ${item.text}`.toLowerCase().includes(value)).slice(0, 12);
  searchResults.innerHTML = matches.length ? matches.map(item => `<a class="search-item" href="${item.href}"><span>${item.section}</span><strong>${item.title}</strong></a>`).join("") : '<p class="search-empty">No matching pages.</p>';
}

async function openSearch() {
  if (!searchIndex.length) searchIndex = await fetch("search-index.json").then(response => response.json());
  searchInput.value = "";
  renderSearch("");
  searchDialog.showModal();
  requestAnimationFrame(() => searchInput.focus());
}

menu.addEventListener("click", () => {
  const open = document.body.classList.toggle("menu-open");
  menu.setAttribute("aria-expanded", String(open));
});
readerSidebar.addEventListener("scroll", () => {
  clearTimeout(sidebarSaveTimer);
  sidebarSaveTimer = setTimeout(saveSidebarPosition, 80);
}, { passive: true });
document.querySelectorAll(".book-tree a").forEach(link => link.addEventListener("click", saveSidebarPosition));
window.addEventListener("pagehide", saveSidebarPosition);
document.querySelector("#reader-search-open").addEventListener("click", openSearch);
searchInput.addEventListener("input", event => renderSearch(event.target.value));
themeButton.addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
searchDialog.addEventListener("click", event => { if (event.target === searchDialog) searchDialog.close(); });
document.addEventListener("keydown", event => {
  const typing = ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName);
  if (event.key === "/" && !typing && !searchDialog.open) { event.preventDefault(); openSearch(); }
  if (event.key === "Escape" && document.body.classList.contains("menu-open")) { document.body.classList.remove("menu-open"); menu.setAttribute("aria-expanded", "false"); }
});

buildOutline();
restoreSidebarPosition();
setupCodeWorkbenches();
setupPracticeStatuses();
setupTraceLabs();
setTheme(localStorage.getItem(THEME_KEY) || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"));
