import {
  formatDuration,
  formatPlays,
  GENRES,
  VIEWS,
  SORTS,
} from "../data/constants.js";

// As views consultam o DOM em runtime (não no carregamento do módulo) porque
// os IDs só existem depois de renderAppScreen() injetar a shell em #app.
const $ = (id) => document.getElementById(id);

// Shell principal injetada após o login. Contém header com #btn-logout e
// dois sub-painéis (#soundbase-app e #admin-panel). O header sobrevive aos
// re-renders parciais, pelo que bindLogout() só precisa de ser chamado uma vez.
export const renderAppScreen = () => {
  $("app").innerHTML = `
    <header class="app-header">
      <h1 id="app-title">SoundBase</h1>
      <nav id="app-nav" class="hidden">
        <a href="#/app" id="nav-app">Catalog</a>
        <a href="#/admin" id="nav-admin">Administration</a>
      </nav>
      <button id="btn-logout">Logout</button>
    </header>

    <main id="app-main">
      <section id="soundbase-app" class="hidden">
        <div class="toolbar">
          <div class="toolbar-row toolbar-row-top">
            <div id="view-controls"></div>
            <div id="search-controls">
              <input type="text" id="search-input" placeholder="Search by title or artist…" />
              <button id="btn-search">Search</button>
            </div>
          </div>
          <div class="toolbar-row toolbar-row-bottom">
            <div id="filter-controls"></div>
            <select id="sort-controls"></select>
          </div>
        </div>

        <div id="catalogue-grid"></div>
        <div id="catalogue-table-container" class="hidden"></div>

        <div id="playlist-info" class="hidden"></div>
        <div id="recently-played" class="hidden"></div>
      </section>

      <section id="admin-panel" class="hidden"></section>
    </main>

    <div id="modal-overlay" class="hidden">
      <div id="modal-content"></div>
    </div>
  `;
};

export const bindLogout = (handler) => {
  $("btn-logout").addEventListener("click", handler);
};

// Alternância dos painéis

export const showSoundbasePanel = () => {
  $("soundbase-app").classList.remove("hidden");
  $("admin-panel").classList.add("hidden");
};

export const showAdminPanelSection = () => {
  $("admin-panel").classList.remove("hidden");
  $("soundbase-app").classList.add("hidden");
};

// Atualiza o nav do header consoante o role e a rota ativa.
// O Catálogo está sempre disponível para utilizadores autenticados;
// o link de Administração só é mostrado a admins.
export const updateAppNav = (role, activeHash) => {
  const nav = $("app-nav");
  nav.classList.remove("hidden");

  const navAdmin = nav.querySelector("#nav-admin");
  navAdmin.classList.toggle("hidden", role !== "admin");

  nav.querySelector("#nav-app").classList.toggle("active", activeHash === "#/app");
  navAdmin.classList.toggle("active", activeHash === "#/admin");
};

// Cartões

const renderCard = (track) => `
  <div class="track-card" data-id="${track.id}">
    <div class="card-header">
      <h3>${track.title}</h3>
      <span class="genre-tag">${track.genre}</span>
    </div>
    <p class="artist">${track.artist}</p>
    <p class="meta">${formatDuration(track.duration)} · ${formatPlays(track.plays)} plays</p>
    <div class="card-actions">
      <button class="btn-play"    data-id="${track.id}" aria-label="Play ${track.title}">▶ Play</button>
      <button class="btn-details" data-id="${track.id}" aria-label="Details for ${track.title}">Details</button>
      <button class="btn-add"     data-id="${track.id}" aria-label="Add ${track.title} to playlist">Add</button>
    </div>
  </div>
`;

export const renderCards = (tracks) => {
  $("catalogue-grid").innerHTML = tracks.map((t) => renderCard(t)).join("");
};

// Tabela

const renderRow = (track) => `
  <tr data-id="${track.id}">
    <td>${track.title}</td>
    <td>${track.artist}</td>
    <td>${track.genre}</td>
    <td>${formatDuration(track.duration)}</td>
    <td>${formatPlays(track.plays)}</td>
  </tr>
`;

export const renderTable = (tracks) => {
  $("catalogue-table-container").innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Title</th><th>Artist</th><th>Genre</th><th>Duration</th><th>Plays</th>
        </tr>
      </thead>
      <tbody>
        ${tracks.map((t) => renderRow(t)).join("")}
      </tbody>
    </table>
  `;
};

// Vista ativa

export const setActiveView = (view) => {
  $("catalogue-grid").classList.toggle("hidden", view !== "cards");
  $("catalogue-table-container").classList.toggle("hidden", view === "cards");
};

// Modal

const renderModal = (track) => `
  <div class="modal-card">
    <button class="btn-close" aria-label="Close modal">✕</button>
    <h2>${track.title}</h2>
    <p>Artist: ${track.artist}</p>
    <p>Genre: ${track.genre}</p>
    <p>Duration: ${formatDuration(track.duration)}</p>
    <p>Plays: ${formatPlays(track.plays)}</p>
    <p>Liked: ${track.liked ? "Yes" : "No"}</p>
  </div>
`;

export const showModal = (track) => {
  $("modal-content").innerHTML = renderModal(track);
  $("modal-overlay").classList.remove("hidden");
};

export const hideModal = () => {
  $("modal-overlay").classList.add("hidden");
};

// Playlist e estado vazio

export const renderPlaylist = (playlist) => {
  const el = $("playlist-info");
  el.classList.toggle("hidden", playlist.size === 0);
  el.innerHTML = playlist.getInfo();
};

export const renderEmptyState = (message, view) => {
  const emptyHTML = `<div class="empty-state"><p>${message}</p></div>`;

  if (view === "cards") {
    $("catalogue-grid").innerHTML = emptyHTML;
    $("catalogue-table-container").innerHTML = "";
    return;
  }

  $("catalogue-table-container").innerHTML = emptyHTML;
  $("catalogue-grid").innerHTML = "";
};

// Botão ativo

export const setActiveButton = (container, activeBtn) => {
  container.querySelector("button.active")?.classList.remove("active");
  activeBtn.classList.add("active");
};

// Filtros, vista e ordenação

export const renderFilterButtons = (activeFilter) => {
  $("filter-controls").innerHTML = `
    <button class="btn-filter ${activeFilter === "all" ? "active" : ""}" data-genre="all">All</button>
    ${GENRES.map(
      (g) => `
      <button class="btn-filter ${activeFilter === g ? "active" : ""}" data-genre="${g}">${g}</button>
    `,
    ).join("")}
  `;
};

export const renderViewButtons = (activeView) => {
  $("view-controls").innerHTML = VIEWS.map(
    (v) => `
    <button class="btn-view ${v === activeView ? "active" : ""}" data-view="${v}">
      ${v.charAt(0).toUpperCase() + v.slice(1)}
    </button>
  `,
  ).join("");
};

export const renderSortOptions = (activeSort) => {
  $("sort-controls").innerHTML = `
    <option value="default">Default order</option>
    ${Object.entries(SORTS)
      .map(
        ([val, label]) => `
      <option value="${val}" ${val === activeSort ? "selected" : ""}>${label}</option>
    `,
      )
      .join("")}
  `;
};

// Pesquisa

const getSearchQuery = () => $("search-input").value.trim().toLowerCase();

// Ligação de eventos
// Cada bind* recebe um callback do Controller, invoca-o com um valor limpo
// e nunca acede ao estado da aplicação.

export const bindFilterChange = (handler) => {
  $("filter-controls").addEventListener("click", (e) => {
    if (!e.target.classList.contains("btn-filter")) return;
    setActiveButton($("filter-controls"), e.target);
    handler(e.target.dataset.genre);
  });
};

export const bindViewChange = (handler) => {
  $("view-controls").addEventListener("click", (e) => {
    if (!e.target.classList.contains("btn-view")) return;
    setActiveButton($("view-controls"), e.target);
    handler(e.target.dataset.view);
  });
};

export const bindSortChange = (handler) => {
  $("sort-controls").addEventListener("change", (e) => {
    handler(e.target.value);
  });
};

export const bindSearchSubmit = (handler) => {
  $("btn-search").addEventListener("click", () => handler(getSearchQuery()));
};

export const bindSearchInput = (handler) => {
  const input = $("search-input");
  input.addEventListener("input", (e) => {
    if (!e.currentTarget.value) handler("");
  });
  input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    handler(getSearchQuery());
  });
};

export const bindCardActions = (handler) => {
  $("catalogue-grid").addEventListener("click", (e) => {
    const id = e.target.dataset?.id;
    if (!id) return;
    if (e.target.classList.contains("btn-details"))
      handler({ action: "details", id });
    if (e.target.classList.contains("btn-play"))
      handler({ action: "play", id });
    if (e.target.classList.contains("btn-add")) handler({ action: "add", id });
  });
};

export const bindModalClose = (handler) => {
  $("modal-overlay").addEventListener("click", (e) => {
    if (
      e.target === e.currentTarget ||
      e.target.classList.contains("btn-close")
    )
      handler();
  });
};

// Reproduzidas recentemente (Desafio)

export const renderRecentlyPlayed = (tracks) => {
  const el = $("recently-played");
  if (tracks.length === 0) {
    el.classList.add("hidden");
    return;
  }
  el.classList.remove("hidden");
  el.innerHTML = `
    <h3>Recently Played</h3>
    <ul>${tracks.map((t) => `<li>${t.title} - ${t.artist}</li>`).join("")}</ul>
  `;
};
