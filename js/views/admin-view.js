import { formatDuration } from "../data/constants.js";

const $ = (id) => document.getElementById(id);

// Injeta o painel de administração dentro de #admin-panel (sub-secção
// da shell criada por renderAppScreen). Mantemos o header e #btn-logout
// intactos porque vivem fora desta sub-árvore.
export const renderAdminPanel = () => {
  $("admin-panel").innerHTML = `
    <h2>Painel de Administração</h2>

    <form id="add-track-form">
      <h3>Adicionar Faixa</h3>
      <input type="text"   id="add-title"    placeholder="Title"    required />
      <input type="text"   id="add-artist"   placeholder="Artist"   required />
      <input type="text"   id="add-genre"    placeholder="Genre"    required />
      <input type="number" id="add-duration" placeholder="Duration (s)" required />
      <button type="submit" id="btn-add-track">Add Track</button>
    </form>

    <section>
      <h3>Faixas</h3>
      <table>
        <thead>
          <tr>
            <th>Title</th><th>Artist</th><th>Genre</th><th>Duration</th><th>Actions</th>
          </tr>
        </thead>
        <tbody id="admin-track-list"></tbody>
      </table>
    </section>
  `;
};

export const renderAdminTrackList = (tracks) => {
  $("admin-track-list").innerHTML = tracks
    .map(
      (t) => `
        <tr>
          <td>${t.title}</td>
          <td>${t.artist}</td>
          <td>${t.genre}</td>
          <td>${formatDuration(t.duration)}</td>
          <td><button class="btn-remove" data-id="${t.id}">Remove</button></td>
        </tr>`,
    )
    .join("");
};

export const getAddTrackFormData = () => ({
  title: $("add-title").value.trim(),
  artist: $("add-artist").value.trim(),
  genre: $("add-genre").value.trim(),
  duration: parseInt($("add-duration").value, 10),
  plays: 0,
});

export const clearAddTrackForm = () => {
  ["add-title", "add-artist", "add-genre", "add-duration"].forEach(
    (id) => ($(id).value = ""),
  );
};

export const bindAddTrackSubmit = (handler) => {
  $("add-track-form").addEventListener("submit", (e) => {
    e.preventDefault();
    handler();
  });
};

export const bindRemoveTrack = (handler) => {
  $("admin-track-list").addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-remove");
    if (!btn) return;
    handler(btn.dataset.id, btn.closest("tr"));
  });
};
