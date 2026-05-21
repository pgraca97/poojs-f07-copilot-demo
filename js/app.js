import Router from "./Router.js";
import {
  showLogin,
  showRegister,
  startApp,
  isAuthenticated,
  isAdmin,
} from "./controllers/auth-controller.js";
import { navigate } from "./navigate.js";

const router = new Router();

// Ambas as rotas autenticadas chamam startApp(user) - o dispatch entre
// app-controller e admin-controller acontece dentro de startApp consoante
// o hash atual (e os guards isAuthenticated/isAdmin restringem o acesso).
router
  .add("#/login",    () => showLogin())
  .add("#/register", () => showRegister())
  .add("#/app",   async () => {
    const u = JSON.parse(localStorage.getItem("user"));
    await startApp(u);
  }, isAuthenticated)
  .add("#/admin", async () => {
    const u = JSON.parse(localStorage.getItem("user"));
    await startApp(u);
  }, isAdmin);

// Resolver o hash inicial sem destruir a query string: se o hash atual já
// corresponde ao target, deixamos passar tal-e-qual para preservar params
// (?view=table&genre=Pop ...) num refresh. Só fazemos navigate quando há
// mesmo uma transição de rota - aí navigate() limpa a query da rota anterior.
const stored = localStorage.getItem("user");
const target = stored
  ? (JSON.parse(stored).role === "admin" ? "#/admin" : "#/app")
  : "#/login";

if (window.location.hash !== target) navigate(target);

router.listen();

// Versão sem Router (ex. 9 do enunciado) - substitui o bloco acima:
// import { initAuth } from "./controllers/auth-controller.js";
// initAuth();
