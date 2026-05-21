import Track from "../models/Track.js";
import Playlist from "../models/Playlist.js";
import { GENRES, VIEWS, SORTS } from "../data/constants.js";
import { getTracks } from "../data/service.js";
import {
  showSoundbasePanel,
  renderCards,
  renderTable,
  showModal,
  hideModal,
  renderPlaylist,
  renderEmptyState,
  setActiveView,
  renderRecentlyPlayed,
  renderFilterButtons,
  renderViewButtons,
  renderSortOptions,
  bindFilterChange,
  bindViewChange,
  bindSortChange,
  bindSearchSubmit,
  bindSearchInput,
  bindCardActions,
  bindModalClose,
} from "../views/app-view.js";

// Estado

let tracks = [];
let myPlaylist;
let currentFilter = "all";
let currentView = "cards";
let currentSort = "default";
let currentSearch = "";
let recentlyPlayed = [];

// Filtro, pesquisa e ordenação

const getFilteredTracks = () => {
  let result = tracks.filter(
    (t) => currentFilter === "all" || t.genre === currentFilter,
  );

  if (currentSearch) {
    result = result.filter(
      (t) =>
        t.title.toLowerCase().includes(currentSearch) ||
        t.artist.toLowerCase().includes(currentSearch),
    );
  }

  return result.toSorted((a, b) => {
    if (currentSort === "title-asc") return a.title.localeCompare(b.title);
    if (currentSort === "plays-desc") return b.plays - a.plays;
    if (currentSort === "duration-desc") return b.duration - a.duration;
    return 0;
  });
};

const render = () => {
  const filtered = getFilteredTracks();
  setActiveView(currentView);
  if (filtered.length === 0) {
    renderEmptyState("No tracks found.", currentView);
    return;
  }
  currentView === "cards" ? renderCards(filtered) : renderTable(filtered);
};

// Desafio: reproduzidas recentemente

const addToRecentlyPlayed = (track) => {
  if (recentlyPlayed[0]?.id === track.id) return;
  recentlyPlayed = [track, ...recentlyPlayed].slice(0, 5);
  renderRecentlyPlayed(recentlyPlayed);
};

// Desafio: parâmetros de URL

const syncURL = () => {
  const params = new URLSearchParams();
  if (currentFilter !== "all") params.set("genre", currentFilter);
  if (currentSearch) params.set("q", currentSearch);
  if (currentView !== "cards") params.set("view", currentView);
  if (currentSort !== "default") params.set("sort", currentSort);
  const query = params.toString() ? `?${params}` : "";
  // URL absoluta com pathname: uma URL relativa do tipo "#/app" mantém
  // a query antiga; incluir o pathname força o browser a substituir a query
  // por completo, mesmo quando esta passa a ser vazia.
  history.replaceState(
    null,
    "",
    `${window.location.pathname}${query}${window.location.hash}`,
  );
};

const readURL = () => {
  const params = new URLSearchParams(window.location.search);
  const genre = params.get("genre");
  const view = params.get("view");
  const sort = params.get("sort");

  if (genre && GENRES.includes(genre)) currentFilter = genre;
  if (view && VIEWS.includes(view)) currentView = view;
  if (params.has("q")) currentSearch = params.get("q");
  if (sort && Object.keys(SORTS).includes(sort)) currentSort = sort;
};

// Ponto de entrada

export const init = async () => {
  showSoundbasePanel();

  readURL();
  renderFilterButtons(currentFilter);
  renderViewButtons(currentView);
  renderSortOptions(currentSort);

  const raw = await getTracks();
  tracks = raw.map((obj) => Track.fromObject(obj));

  myPlaylist = new Playlist("My Playlist", "soundbase_user");

  syncURL();

  bindFilterChange((genre) => {
    currentFilter = genre;
    syncURL();
    render();
  });
  bindViewChange((view) => {
    currentView = view;
    syncURL();
    render();
  });
  bindSortChange((sort) => {
    currentSort = sort;
    syncURL();
    render();
  });
  bindSearchSubmit((query) => {
    currentSearch = query;
    syncURL();
    render();
  });
  bindSearchInput((query) => {
    currentSearch = query;
    syncURL();
    render();
  });

  bindCardActions(({ action, id }) => {
    const track = tracks.find((t) => String(t.id) === String(id));
    if (!track) return;

    if (action === "details") showModal(track);

    if (action === "play") {
      track.play();
      addToRecentlyPlayed(track);
    }

    if (action === "add") {
      let shouldAdd = true;
      if (myPlaylist.has(track)) {
        shouldAdd = confirm(
          `A faixa "${track.title}" já está na playlist. Adicionar duplicado?`,
        );
      }
      if (shouldAdd) {
        myPlaylist.add(track);
        renderPlaylist(myPlaylist);
      }
    }
  });

  bindModalClose(hideModal);
  render();
  renderPlaylist(myPlaylist);
};
