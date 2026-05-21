# Ficha 07 - Autenticação e Controlo de Acesso

Estende o SoundBase MVC da [ficha 06](../F06_Soundbase%20MVC/README.md) com:

- Servidor mock (`json-server-auth`) com autenticação JWT
- Camada de serviço (`js/services/service.js`) que centraliza toda a comunicação com a API
- Arquitetura SPA: o HTML é injetado em `#app` por `render*()` e os listeners ligados imediatamente a seguir por `bind*()`
- Controlo de acesso por role (`user` vs `admin`) com import dinâmico do controller correspondente
- Routing por hash com guards `isAuthenticated` e `isAdmin`

## Como correr

1. `npm install` na pasta da ficha.
2. `npm start` - arranca o `json-server-auth` na porta 3000 com as regras de `routes.json`. Confirmar `http://localhost:3000/tracks` no browser: deve devolver `401` sem token.
3. Em paralelo, abrir `index.html` via Live Server (tipicamente porta 5500).

Para testar o painel de administração: registar um utilizador via UI, parar o servidor, abrir `db.json`, mudar o `role` desse utilizador para `"admin"` e reiniciar o servidor. Há já um utilizador admin pré-criado (`teste3@gmail.com`).

## Estrutura

```
F07_Soundbase Auth/
├── index.html              - minimal; só contém <div id="app">
├── db.json                 - users + tracks
├── routes.json             - permissões: users 600, /tracks* -> /660/tracks$1
├── package.json            - script "start"
└── js/
    ├── app.js              - configuração do Router + restore da sessão
    ├── Router.js           - classe Router (hash routing + guards)
    ├── navigate.js         - helper navigate() partilhado
    ├── models/             - Track, Playlist
    ├── data/constants.js   - utilitários (formatDuration, formatPlays, GENRES, ...)
    ├── services/service.js - register, login, getTracks, addTrack, deleteTrack + authHeaders privado
    ├── views/
    │   ├── auth-view.js    - renderRegisterScreen, renderLoginScreen, get/set/bind*
    │   ├── app-view.js     - renderAppScreen, bindLogout + render/bind do catálogo
    │   └── admin-view.js   - renderAdminPanel, renderAdminTrackList, bindAddTrackSubmit, ...
    └── controllers/
        ├── auth-controller.js  - showLogin, showRegister, startApp, isAuthenticated, isAdmin
        ├── app-controller.js   - lógica do catálogo (consome getTracks)
        └── admin-controller.js - init() do painel admin
```

## Exercícios

- Servidor mock e `routes.json` (users 600, /tracks* 660)
- Camada de serviço com `authHeaders()` privado que lê o token de `localStorage`
- Migração de `app-controller` para `getTracks()`; `init` async
- `Track.fromObject` preserva `obj.id` e `obj.plays` vindos do servidor
- Ecrã de registo: `renderRegisterScreen`, `bindRegisterSubmit`, `handleRegister`
- Ecrã de login: `renderLoginScreen`, `bindLoginSubmit`, `handleLogin`; sessão guardada em `localStorage` (chaves `"token"` e `"user"`)
- `startApp(user)`: `renderAppScreen()` + `bindLogout()` + import dinâmico do controller pelo role
- Painel de administração: `renderAdminPanel`, `renderAdminTrackList`, `bindAddTrackSubmit`, `bindRemoveTrack` (delegação)
- Desafio: classe `Router` com `#routes` privado, `add(hash, handler, guard)` encadeável, `navigate(hash)`, `listen()` e `#handleRoute()` privado; rotas `#/login`, `#/register`, `#/app`, `#/admin`

## Dúvidas frequentes

**Onde fica o `#btn-logout`?**

`renderAppScreen()` injeta uma shell em `#app` com `<header>` (logo, nav e `#btn-logout`) e `<main id="app-main">`. Os render*() seguintes do soundbase ou do admin escrevem dentro do `#app-main`, deixando o header intacto. Por isso `bindLogout()` é chamado uma única vez dentro de `startApp` e sobrevive aos re-renders parciais.

**Porquê `localStorage` em vez de `sessionStorage`?**

`localStorage` persiste indefinidamente até ser explicitamente limpo (ou pelo logout, ou via DevTools). `sessionStorage` desaparece ao fechar o separador. O enunciado pede `localStorage` para que um refresh ou reabertura do browser mantenha a sessão. Em produção, a abordagem mais segura é cookies HTTP-only, mas isso requer cooperação do servidor que o `json-server-auth` não oferece.

**Porquê `import` dinâmico em `startApp`?**

`await import("./admin-controller.js")` só carrega o módulo no momento da chamada. Um utilizador comum nunca precisa do código do admin, e vice-versa - importar estaticamente os dois carregaria sempre tudo. Beneficia performance e separa explicitamente os dois fluxos.

**Porque é que `getTracks()` exige token, se `/tracks` é leitura?**

A regra `/660/tracks` aplica permissão `660`: o primeiro `6` (owner) e o segundo `6` (logged-in) significam read+write para utilizadores autenticados; o último `0` (público) bloqueia leitura sem token. Por isso o `service.js` envia `authHeaders()` também no `GET /tracks`.

**O método estático `Track.fromObject` consegue escrever em `#id`?**

Sim. Campos privados (`#id`, `#plays`) são acessíveis a qualquer código dentro da classe, inclusive métodos estáticos. `fromObject` é estático em `Track`, portanto pode tocar nos campos privados de qualquer instância de `Track`. É a técnica usada para construir a instância a partir de dados externos (API) preservando o `id` e os `plays` do servidor em vez de gerar um UUID novo.

**Hash routing (`#/admin`) ou `history.pushState` (`/admin`)?**

Hash routing porque o Live Server serve ficheiros estáticos. Com `history.pushState("/admin")`, um refresh em `/admin` daria 404. Com `#/admin`, o browser nunca envia o fragmento ao servidor (carrega sempre `index.html`) e o JavaScript reage ao evento `hashchange`.

## Para saber mais

- [json-server-auth - permissões e middleware](https://github.com/jeremyben/json-server-auth)
- [Web Storage API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [Dynamic imports - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import)
- [JSON Web Tokens - jwt.io](https://jwt.io/introduction)
- [hashchange event - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/hashchange_event)
