// Cada ecrã de autenticação é injetado dinamicamente em #app.
// Os controllers chamam render*() seguido imediatamente de bind*() porque
// o DOM anterior é substituído e os listeners antigos são automaticamente destruídos.

const $ = (id) => document.getElementById(id);

// Registo

export const renderRegisterScreen = () => {
  $("app").innerHTML = `
    <div class="screen auth-screen">
      <form id="register-form" class="auth-box">
        <h1>SoundBase</h1>
        <h2>Sign Up</h2>
        <input type="email"    id="register-email"    placeholder="Email"    autocomplete="email" required />
        <input type="password" id="register-password" placeholder="Password" autocomplete="new-password" required />
        <button type="submit" id="btn-register">Sign Up</button>
        <p id="register-error" class="error-msg"></p>
        <p class="auth-link">Already have an account. <span id="link-to-login">Log in</span></p>
      </form>
    </div>
  `;
};

export const getRegisterFormData = () => ({
  email: $("register-email").value.trim(),
  password: $("register-password").value,
});

export const setRegisterError = (message) => {
  $("register-error").textContent = message;
};

export const bindRegisterSubmit = (handler) => {
  $("register-form").addEventListener("submit", (e) => {
    e.preventDefault();
    handler();
  });
};

export const bindLinkToLogin = (handler) => {
  $("link-to-login").addEventListener("click", handler);
};

// Login

export const renderLoginScreen = () => {
  $("app").innerHTML = `
    <div class="screen auth-screen">
      <form id="login-form" class="auth-box">
        <h1>SoundBase</h1>
        <h2>Log in</h2>
        <input type="email"    id="login-email"    placeholder="Email"    autocomplete="email" required />
        <input type="password" id="login-password" placeholder="Password" autocomplete="current-password" required />
        <button type="submit" id="btn-login">Log in</button>
        <p id="login-error" class="error-msg"></p>
        <p class="auth-link">Create an account. <span id="link-to-register">Sign up</span></p>
      </form>
    </div>
  `;
};

export const getLoginFormData = () => ({
  email: $("login-email").value.trim(),
  password: $("login-password").value,
});

export const setLoginError = (message) => {
  $("login-error").textContent = message;
};

export const bindLoginSubmit = (handler) => {
  $("login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    handler();
  });
};

export const bindLinkToRegister = (handler) => {
  $("link-to-register").addEventListener("click", handler);
};
