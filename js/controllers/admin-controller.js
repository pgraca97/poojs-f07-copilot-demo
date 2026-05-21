import {
  renderAdminPanel,
  renderAdminTrackList,
  getAddTrackFormData,
  clearAddTrackForm,
  bindAddTrackSubmit,
  bindRemoveTrack,
} from "../views/admin-view.js";
import { showAdminPanelSection } from "../views/app-view.js";
import { getTracks, addTrack, deleteTrack } from "../services/service.js";

export const init = async () => {
  renderAdminPanel();
  showAdminPanelSection();

  renderAdminTrackList(await getTracks());

  bindAddTrackSubmit(async () => {
    const data = getAddTrackFormData();
    if (!data.title || !data.artist || !data.genre || isNaN(data.duration)) return;

    const { ok } = await addTrack(data);
    if (!ok) return;

    renderAdminTrackList(await getTracks());
    clearAddTrackForm();
  });

  bindRemoveTrack(async (id, row) => {
    const { ok } = await deleteTrack(id);
    if (ok) row.remove();
  });
};
