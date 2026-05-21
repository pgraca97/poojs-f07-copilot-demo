// Router baseado em hash com suporte a guards de rota.
// Guards são funções simples que devolvem true (permitir) ou false (redirecionar para o fallback).

class Router {
  #routes = {};
  #fallback = "#/login";

  // Regista uma rota.
  // handler - função (assíncrona) a executar quando a rota é ativada
  // guard   - opcional; se devolver false, redireciona para o fallback (#/login)
  add(hash, handler, guard = null) {
    this.#routes[hash] = { handler, guard };
    return this; // interface fluente - permite encadear chamadas
  }

  navigate(hash) {
    window.location.hash = hash;
  }

  async #handleRoute() {
    const hash = window.location.hash || this.#fallback;
    const route = this.#routes[hash] ?? this.#routes[this.#fallback];

    if (!route) return;

    // Verificar guard - redirecionar se a condição não for cumprida
    if (route.guard && !route.guard()) {
      this.navigate(this.#fallback);
      return;
    }

    await route.handler();
  }

  // Começa a escutar alterações de hash e trata a rota atual.
  // Em hashchange, a query string da rota anterior é limpa antes de despachar
  // o handler - cada rota é dona do seu próprio espaço de parâmetros. Quem
  // precisar de query params (app-controller via syncURL) volta a populá-los
  // depois. A 1.ª corrida é direta (sem strip) para preservar a query num
  // refresh, p. e. abrir ?genre=Pop&view=table#/app.
  listen() {
    window.addEventListener("hashchange", () => {
      if (window.location.search) {
        history.replaceState(null, "", window.location.pathname + window.location.hash);
      }
      this.#handleRoute();
    });
    this.#handleRoute();
  }
}

export default Router;
