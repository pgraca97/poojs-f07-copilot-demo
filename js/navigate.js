// Helper de navegação isolado: os controllers usam navigate() sem
// conhecerem o Router. Como o Router escuta hashchange, alterar
// window.location.hash dispara a rota correspondente.
//
// A limpeza da query string acontece no Router, em hashchange, e não aqui.
// Assim, qualquer transição de rota (anchor <a href="#/...">, back/forward
// do browser, edição manual da URL, ou esta chamada) parte de URL limpa.

export const navigate = (hash) => {
  window.location.hash = hash;
};
