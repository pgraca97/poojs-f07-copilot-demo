import {
  renderAdminPanel,
  renderAdminTrackList,
  getAddTrackFormData,
  clearAddTrackForm,
  bindAddTrackSubmit,
  bindRemoveTrack,
} from "../views/admin-view.js";
import { showAdminPanelSection } from "../views/app-view.js";
import { getTracks, addTrack, deleteTrack } from "../data/service.js";

export const init = async () => {
  renderAdminPanel();
  showAdminPanelSection();

  renderAdminTrackList(await getTracks());

  bindAddTrackSubmit(async () => {
    try {
      const data = getAddTrackFormData();
      if (!data.title || !data.artist || !data.genre || isNaN(data.duration))
        return;

      const { ok } = await addTrack(data);
      if (!ok) {
        alert("Failed to add track. Please try again.");
        return;
      }

      renderAdminTrackList(await getTracks());
      clearAddTrackForm();
    } catch (error) {
      alert("An error occurred while adding the track. Please try again.");
      console.error(error);
    }
  });

  bindRemoveTrack(async (id, row) => {
    const { ok } = await deleteTrack(id);
    if (ok) row.remove();
  });
};
