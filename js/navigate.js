// Helper de navegação isolado: os controllers usam navigate() sem
// conhecerem o Router. Como o Router escuta hashchange, alterar
// window.location.hash dispara a rota correspondente.
//
// Antes de mudar o hash, limpamos a query string da URL anterior.
// Cada rota começa com URL limpa - se o app-controller precisar de
// query params (filtros, view, etc.), o syncURL volta a populá-los.

export const navigate = (hash) => {
  if (window.location.search) {
    history.replaceState(null, "", window.location.pathname);
  }
  window.location.hash = hash;
};
