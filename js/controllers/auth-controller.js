import {
  renderRegisterScreen,
  renderLoginScreen,
  getRegisterFormData,
  setRegisterError,
  getLoginFormData,
  setLoginError,
  bindRegisterSubmit,
  bindLoginSubmit,
  bindLinkToLogin,
  bindLinkToRegister,
} from "../views/auth-view.js";
import { renderAppScreen, bindLogout, updateAppNav } from "../views/app-view.js";
import { register, login } from "../services/service.js";
import { navigate } from "../navigate.js";

// Handlers privados de submissão dos formulários.
// Sempre envolvidos em try/catch para tratar falhas de rede (fetch rejeita).

const handleRegister = async () => {
  const { email, password } = getRegisterFormData();
  setRegisterError("");
  try {
    const { ok } = await register(email, password);
    if (ok) {
      navigate("#/login");
      return;
    }
    setRegisterError("Erro ao registar. Verifique se o email já está em uso.");
  } catch {
    setRegisterError("Não foi possível ligar ao servidor.");
  }
};

const handleLogin = async () => {
  const { email, password } = getLoginFormData();
  setLoginError("");
  try {
    const result = await login(email, password);
    if (!result.ok) {
      setLoginError("Email ou password incorretos.");
      return;
    }
    localStorage.setItem("token", result.token);
    localStorage.setItem("user", JSON.stringify(result.user));
    navigate(result.user.role === "admin" ? "#/admin" : "#/app");
  } catch {
    setLoginError("Não foi possível ligar ao servidor.");
  }
};

// Cada show*() renderiza o ecrã e regista logo de seguida os listeners.
// bind*() depois de render*() porque o DOM anterior foi substituído.

export const showRegister = () => {
  renderRegisterScreen();
  bindRegisterSubmit(handleRegister);
  bindLinkToLogin(() => navigate("#/login"));
};

export const showLogin = () => {
  renderLoginScreen();
  bindLoginSubmit(handleLogin);
  bindLinkToRegister(() => navigate("#/register"));
};

// Monta a shell aplicacional e dispatcha o controller adequado.
// O dispatch é feito pelo hash atual (não só pelo role) para que um admin
// possa navegar entre #/app e #/admin sem o painel ficar preso no admin.
// Os guards isAuthenticated/isAdmin já garantem que as rotas só são
// alcançáveis pelos roles certos, pelo que aqui basta seguir o hash.

export const startApp = async (user) => {
  renderAppScreen();
  bindLogout(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("#/login");
  });

  const hash = window.location.hash;
  updateAppNav(user.role, hash);

  if (hash === "#/admin") {
    const { init } = await import("./admin-controller.js");
    await init();
    return;
  }

  const { init } = await import("./app-controller.js");
  await init();
};

// Helpers de sessão usados pelos guards do Router.

export const isAuthenticated = () => !!localStorage.getItem("token");

export const isAdmin = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user).role === "admin" : false;
};

// Versão sem Router (ex. 9 do enunciado): restaura sessão ou mostra login.
// Mantida para fidelidade pedagógica, embora a versão final com Router
// substitua esta lógica em app.js.

export const initAuth = () => {
  const stored = localStorage.getItem("user");
  if (stored) {
    startApp(JSON.parse(stored));
    return;
  }
  showLogin();
};
