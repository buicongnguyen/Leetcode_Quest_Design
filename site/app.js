const STORAGE_KEY = "leetcode-design-quest-progress-v1";
const THEME_KEY = "leetcode-design-quest-theme";

const state = {
  data: null,
  guides: null,
  difficulty: "All",
  includePremium: true,
  completed: loadCompleted(),
  activeQuest: null
};

const elements = {
  levels: document.querySelector("#levels"),
  empty: document.querySelector("#empty-state"),
  progressCount: document.querySelector("#progress-count"),
  progressBar: document.querySelector("#progress-bar"),
  questDialog: document.querySelector("#quest-dialog"),
  searchDialog: document.querySelector("#search-dialog"),
  searchInput: document.querySelector("#search-input"),
  searchResults: document.querySelector("#search-results"),
  themeToggle: document.querySelector("#theme-toggle")
};

function loadCompleted() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return new Set(Array.isArray(value) ? value.filter(Number.isInteger) : []);
  } catch {
    return new Set();
  }
}

function saveCompleted() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.completed]));
}

function allQuestions() {
  return state.data.levels.flatMap(level => level.questions.map(question => ({ ...question, level })));
}

function questUrls(slug) {
  return {
    global: `https://leetcode.com/problems/${slug}/`,
    china: `https://leetcode.cn/problems/${slug}/`
  };
}

function difficultyBadge(difficulty) {
  return `<span class="badge ${difficulty.toLowerCase()}">${difficulty}</span>`;
}

function renderRoutePreview() {
  document.querySelector("#route-preview").innerHTML = state.data.levels.map(level => `
    <div class="route-node">
      <b>0${level.number}</b>
      <div><strong>${level.shortTitle}</strong><small>${level.foundation}</small></div>
      <code>${level.questions.length} Q</code>
    </div>`).join("");
}

function renderAtlasTree() {
  const tree = document.querySelector("#atlas-tree");
  tree.insertAdjacentHTML("beforeend", state.data.levels.map(level => `
    <a href="#${level.id}">
      <span>0${level.number}</span>
      <strong>${level.shortTitle}</strong>
      <small>${level.questions.length}</small>
    </a>`).join(""));
  const links = [...tree.querySelectorAll("a")];
  links.forEach(link => link.addEventListener("click", () => {
    links.forEach(item => item.classList.toggle("active", item === link));
  }));
}

function renderLevels() {
  const visibleLevels = state.data.levels.map(level => ({
    ...level,
    totalQuestions: level.questions.length,
    questions: level.questions.filter(question =>
      (state.difficulty === "All" || question.difficulty === state.difficulty) &&
      (state.includePremium || !question.premium)
    )
  })).filter(level => level.questions.length);

  elements.levels.innerHTML = visibleLevels.map((level, index) => `
    <article class="level ${index === 0 ? "open" : ""}" id="${level.id}" data-level="${level.id}">
      <button class="level-header" type="button" aria-expanded="${index === 0}" aria-controls="body-${level.id}">
        <span class="level-number">L0${level.number}</span>
        <span class="level-heading"><h3>${level.title}</h3><p>${level.eyebrow}</p></span>
        <span class="level-meta">${level.questions.length === level.totalQuestions ? level.questions.length : `${level.questions.length} of ${level.totalQuestions}`} quests <i>＋</i></span>
      </button>
      <div class="level-body" id="body-${level.id}">
        <div class="level-intro">
          <p>${level.summary}</p>
          <dl><div><dt>FOUNDATION</dt><dd>${level.foundation}</dd></div><div><dt>KEY INVARIANT</dt><dd>${level.invariants[0]}</dd></div><div><dt>CHAPTER OUTCOME</dt><dd>${state.guides.chapters[String(level.number)].outcomes[0]}</dd></div></dl>
        </div>
        <div class="quest-list">
          ${level.questions.map(question => renderQuestCard(question)).join("")}
        </div>
      </div>
    </article>`).join("");

  elements.empty.hidden = visibleLevels.length > 0;
  bindLevelEvents();
}

function renderQuestCard(question) {
  const completed = state.completed.has(question.id);
  return `<article class="quest-card ${completed ? "completed" : ""}" tabindex="0" role="button" aria-label="Open ${question.title}" data-quest-id="${question.id}">
    <div class="quest-top"><span class="quest-id">LC ${question.id}</span>${difficultyBadge(question.difficulty)}<span class="badge role">${question.role}${question.premium ? " · Premium" : ""}</span></div>
    <div><h4>${question.title}</h4><p>${question.goal}</p></div>
    <div class="quest-foot"><span>${question.pattern}</span><button class="quest-open" type="button" tabindex="-1" aria-hidden="true">↗</button></div>
  </article>`;
}

function bindLevelEvents() {
  document.querySelectorAll(".level-header").forEach(button => button.addEventListener("click", () => {
    const level = button.closest(".level");
    const open = level.classList.toggle("open");
    button.setAttribute("aria-expanded", String(open));
  }));
  document.querySelectorAll(".quest-card").forEach(card => {
    const open = () => openQuest(Number(card.dataset.questId));
    card.addEventListener("click", open);
    card.addEventListener("keydown", event => {
      if (["Enter", " "].includes(event.key)) { event.preventDefault(); open(); }
    });
  });
}

function openQuest(id) {
  const quest = allQuestions().find(item => item.id === id);
  if (!quest) return;
  state.activeQuest = quest;
  const guide = state.guides.quests[String(quest.id)];
  const urls = questUrls(quest.slug);
  document.querySelector("#dialog-level").textContent = `Level 0${quest.level.number} · ${quest.level.title}`;
  document.querySelector("#dialog-id").textContent = `LC ${quest.id}`;
  document.querySelector("#dialog-title").textContent = quest.title;
  document.querySelector("#dialog-badges").innerHTML = `${difficultyBadge(quest.difficulty)}<span class="badge role">${quest.role}</span>${quest.premium ? '<span class="badge role">Premium</span>' : ""}`;
  document.querySelector("#dialog-goal").textContent = quest.goal;
  document.querySelector("#dialog-pattern").textContent = quest.pattern;
  document.querySelector("#dialog-outcome").textContent = guide.outcomes[0];
  document.querySelector("#dialog-edge-case").textContent = guide.edgeCases[0];
  document.querySelector("#dialog-checkpoint").textContent = quest.checkpoint;
  document.querySelector("#dialog-overview").href = `learn/${quest.slug}.html`;
  document.querySelector("#dialog-thinking").href = `learn/${quest.slug}-thinking.html`;
  document.querySelector("#dialog-solution").href = `learn/${quest.slug}-solution.html`;
  document.querySelector("#dialog-global").href = urls.global;
  document.querySelector("#dialog-china").href = urls.china;
  syncCompleteButton();
  elements.questDialog.showModal();
}

function syncCompleteButton() {
  const done = state.completed.has(state.activeQuest.id);
  const button = document.querySelector("#dialog-complete");
  button.textContent = done ? "✓ Quest cleared" : "Mark as cleared";
  button.setAttribute("aria-pressed", String(done));
}

function toggleComplete() {
  const id = state.activeQuest.id;
  state.completed.has(id) ? state.completed.delete(id) : state.completed.add(id);
  saveCompleted();
  syncCompleteButton();
  updateProgress();
  renderLevels();
}

function updateProgress() {
  const total = allQuestions().length;
  const validIds = new Set(allQuestions().map(question => question.id));
  const complete = [...state.completed].filter(id => validIds.has(id)).length;
  elements.progressCount.textContent = `${complete} / ${total}`;
  elements.progressBar.style.width = `${total ? complete / total * 100 : 0}%`;
}

function openSearch() {
  elements.searchDialog.showModal();
  elements.searchInput.value = "";
  renderSearchResults("");
  requestAnimationFrame(() => elements.searchInput.focus());
}

function renderSearchResults(query) {
  const normalized = query.trim().toLowerCase();
  const results = allQuestions().filter(quest => !normalized || [quest.title, quest.pattern, quest.level.title, String(quest.id)].some(value => value.toLowerCase().includes(normalized))).slice(0, 10);
  elements.searchResults.innerHTML = results.length ? results.map(quest => `
    <button class="search-result" type="button" data-search-id="${quest.id}">
      <span>LC ${quest.id}</span><span><strong>${quest.title}</strong><br><small>${quest.level.shortTitle} · ${quest.pattern}</small></span>${difficultyBadge(quest.difficulty)}
    </button>`).join("") : '<p class="search-empty">No matching quests.</p>';
  document.querySelectorAll("[data-search-id]").forEach(button => button.addEventListener("click", () => {
    elements.searchDialog.close();
    openQuest(Number(button.dataset.searchId));
  }));
}

function setTheme(theme) {
  const safeTheme = ["light", "dark"].includes(theme) ? theme : "dark";
  document.documentElement.dataset.theme = safeTheme;
  localStorage.setItem(THEME_KEY, safeTheme);
  const isLight = safeTheme === "light";
  elements.themeToggle.setAttribute("aria-pressed", String(isLight));
  elements.themeToggle.setAttribute("aria-label", isLight ? "Use dark theme" : "Use light theme");
}

function bindStaticEvents() {
  document.querySelectorAll("[data-difficulty]").forEach(button => button.addEventListener("click", () => {
    state.difficulty = button.dataset.difficulty;
    document.querySelectorAll("[data-difficulty]").forEach(item => item.classList.toggle("active", item === button));
    renderLevels();
  }));
  document.querySelector("#premium-toggle").addEventListener("change", event => { state.includePremium = event.target.checked; renderLevels(); });
  document.querySelector("#search-open").addEventListener("click", openSearch);
  elements.searchInput.addEventListener("input", event => renderSearchResults(event.target.value));
  elements.themeToggle.addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
  document.querySelector(".dialog-close").addEventListener("click", () => elements.questDialog.close());
  document.querySelector("#dialog-complete").addEventListener("click", toggleComplete);
  document.querySelector("#continue-button").addEventListener("click", () => {
    const next = allQuestions().find(question => !state.completed.has(question.id)) || allQuestions()[0];
    openQuest(next.id);
  });
  for (const dialog of [elements.questDialog, elements.searchDialog]) {
    dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
  }
  document.addEventListener("keydown", event => {
    const typing = ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName);
    if (event.key === "/" && !typing && !elements.searchDialog.open) { event.preventDefault(); openSearch(); }
  });
}

async function init() {
  const [response, guideResponse] = await Promise.all([fetch("data/quests.json"), fetch("data/guides.json")]);
  if (!response.ok) throw new Error(`Quest data failed to load (${response.status})`);
  if (!guideResponse.ok) throw new Error(`Learning guides failed to load (${guideResponse.status})`);
  [state.data, state.guides] = await Promise.all([response.json(), guideResponse.json()]);
  const total = allQuestions().length;
  document.querySelector("#stat-levels").textContent = state.data.levels.length;
  document.querySelector("#stat-quests").textContent = total;
  renderRoutePreview();
  renderAtlasTree();
  renderLevels();
  updateProgress();
  bindStaticEvents();
  setTheme(localStorage.getItem(THEME_KEY) || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"));
}

init().catch(error => {
  elements.levels.innerHTML = `<p class="empty-state">The quest map could not load. ${error.message}</p>`;
});
