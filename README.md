# Ficha 07 - Autenticação e Controlo de Acesso

Estende o SoundBase MVC da [ficha 06](../F06_Soundbase%20MVC/README.md) com:

- Servidor mock (`json-server-auth`) com autenticação JWT
- Camada de serviço (`js/data/service.js`) que centraliza toda a comunicação com a API
- Arquitetura SPA: o HTML é injetado em `#app` por `render*()` e os listeners ligados imediatamente a seguir por `bind*()`
- Controlo de acesso por role (`user` vs `admin`) com import dinâmico do controller correspondente
- Routing por hash com guards `isAuthenticated` e `isAdmin`

## Como correr

1. `npm install` na pasta da ficha.
2. `npm start` - arranca o `json-server-auth` na porta 3000 com as regras de `routes.json`. Confirmar `http://localhost:3000/tracks` no browser: deve devolver `401` sem token.
3. Em paralelo, abrir `index.html` via Live Server (tipicamente porta 5500).

Para testar o painel de administração: registar um utilizador via UI, abrir `db.json`, mudar o `role` desse utilizador para `"admin"` e fazer logout + login. O `json-server` recarrega o ficheiro automaticamente. Ver "Dúvidas frequentes" para o porquê do logout/login.

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
    ├── data/
    │   ├── constants.js     - utilitários (formatDuration, formatPlays, GENRES, ...)
    │   └── service.js       - register, login, getTracks, addTrack, deleteTrack + authHeaders privado
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

**O que é o `json-server` e o `json-server-auth`?**

`json-server` é uma ferramenta que pega num ficheiro JSON e expõe-no como uma API REST: cada chave de topo (`users`, `tracks`, ...) ganha automaticamente endpoints `GET /tracks`, `POST /tracks`, `GET /tracks/:id`, `PUT`, `PATCH` e `DELETE`. Permite trabalhar com uma API realista sem ter de escrever backend nenhum.

`json-server-auth` é um middleware que se monta por cima e acrescenta autenticação JWT:

- Expõe automaticamente `POST /register` e `POST /login`, que devolvem um `accessToken`.
- Permite definir regras de acesso em `routes.json` usando uma notação numérica (ver pergunta seguinte).

Em produção usar-se-ia algo como Express, Fastify ou Hono com uma base de dados real. Aqui o objectivo é focar no cliente sem distrações.

**Como ler as permissões em `routes.json`?**

Cada dígito representa um nível de acesso, no estilo do `chmod` em Unix:

- `4` leitura
- `2` escrita
- `6` leitura + escrita
- `0` bloqueado

A regra tem três dígitos, na ordem: **owner**, **autenticado**, **público**.

| Regra | Owner | Autenticado | Público | Significado                            |
|-------|-------|-------------|---------|----------------------------------------|
| `600` | rw    | -           | -       | Apenas o dono lê e escreve             |
| `640` | rw    | r           | -       | Autenticados leem; só o dono escreve   |
| `660` | rw    | rw          | -       | Qualquer autenticado lê e escreve      |
| `644` | rw    | r           | r       | Público lê; só o dono escreve          |
| `664` | rw    | rw          | r       | Público lê; autenticados escrevem      |

Por isso `"users": 600` significa que cada utilizador só pode mexer nos seus próprios dados, e `"/tracks*": "/660/tracks$1"` exige token mesmo para leitura. Documentação completa em [json-server-auth - Permissions](https://github.com/jeremyben/json-server-auth#permissions).

**Porquê `getTracks()` exige token, se `/tracks` é leitura?**

A regra escolhida foi `660`: o dígito do público é `0`. Esta ficha exige que o utilizador esteja autenticado antes de ver o catálogo, e essa decisão faz-se logo nas permissões do servidor. Se a leitura pudesse ser feita sem login, a regra seria `664` ou `644` e o `service.js` não precisava de enviar token em `GET /tracks`.

**O que é `async`/`await`?**

`async`/`await` é açúcar sintáctico para trabalhar com Promises de forma sequencial:

- Uma função declarada com `async` devolve sempre uma Promise.
- `await` pausa a execução dentro de uma função `async` até a Promise resolver, e devolve o valor resolvido.

Sem `async`/`await`:

```js
const login = (email, password) => {
  return fetch(`${API}/login`, { ... })
    .then((res) => res.json())
    .then((data) => ({ ok: true, token: data.accessToken, user: data.user }));
};
```

Com `async`/`await`:

```js
const login = async (email, password) => {
  const res = await fetch(`${API}/login`, { ... });
  const data = await res.json();
  return { ok: true, token: data.accessToken, user: data.user };
};
```

Lê-se quase como código síncrono. `await` só pode aparecer dentro de funções `async`.

**Porquê dois `await` no `login` e nenhum no `getTracks`?**

São duas Promises diferentes:

```js
// service.js -> login
const res = await fetch(...);   // 1: espera os headers HTTP chegarem
if (!res.ok) return { ok: false };
const data = await res.json();  // 2: espera o body ser lido e parseado
```

`res.json()` é assíncrono porque o body pode ainda estar a ser transmitido. Em `login` usamos `await` porque precisamos do objecto `data` dentro da função (para mapear `accessToken` -> `token`).

Em `getTracks`, em contrapartida:

```js
const res = await fetch(...);
if (!res.ok) return [];
return res.json();              // devolve a Promise sem fazer await
```

Como não há nenhuma transformação a fazer, devolve-se a Promise tal e qual. Quem chama é que faz o `await`:

```js
// app-controller.js -> init
const raw = await getTracks();
```

Funciona porque uma função `async` que devolve uma Promise unwrap-se automaticamente: o `await` lá fora resolve a Promise interna. As duas formas são equivalentes; a regra é fazer `await` só quando se precisa de manipular o valor antes de o devolver.

**Porquê `try/catch` à volta de `fetch`?**

`fetch` só rejeita a Promise em **falhas de rede**: DNS, sem ligação, CORS bloqueado, servidor inacessível. Respostas HTTP 4xx ou 5xx são respostas válidas e **não** disparam o `catch`. O padrão é:

```js
try {
  const res = await fetch(...);
  if (!res.ok) return { ok: false };  // 4xx/5xx tratado aqui
  return { ok: true, ... };
} catch {
  // só cai aqui se a rede falhou completamente
}
```

Existe ainda um terceiro bloco, `finally`, que corre sempre - independentemente de ter havido erro ou não. É útil para garantir limpeza (desactivar um spinner, re-habilitar um botão). Não foi usado nesta ficha porque cada handler já trata explicitamente os ramos de sucesso e erro.

**Validação de inputs: na view ou no controller?**

A convenção desta arquitectura é:

- A **view** devolve dados brutos. `getRegisterFormData()` faz apenas `.value.trim()` no email e `.value` na password, e nada mais.
- O **HTML** filtra o básico via `type="email"` e `required` (o browser bloqueia submissões vazias ou com formato de email inválido).
- O **controller** é que decide as regras de negócio - password com pelo menos 6 caracteres, email já registado, etc. Quando algo falha, chama `setRegisterError(message)` para a view mostrar o erro.

Manter a view "burra" facilita testar e reutilizar. Se amanhã o registo passar a aceitar também um campo `username`, só o controller é que sabe que regras aplicar.

**Porquê o helper `$` é chamado em runtime?**

```js
const $ = (id) => document.getElementById(id);
```

A função é definida no topo do módulo, mas **executada** dentro de cada `render*()`, `get*()` e `bind*()`. Não há nenhum cache. Razões:

1. Quando o módulo carrega, `#app` está vazio. Nenhum dos elementos referenciados existe ainda - chamar `$("register-form")` aí em cima devolveria `null`.
2. Cada vez que se renderiza um novo ecrã, o DOM anterior é substituído. Se tivéssemos guardado `const form = $("register-form")` na primeira renderização, essa referência ficaria a apontar para um nó já fora da árvore após o re-render.
3. `document.getElementById` é rapidíssimo; não há ganho real em cachear.

A função existe apenas para encurtar o código. É o equivalente sintáctico ao `$` da jQuery, sem a biblioteca por trás.

**Hash routing (`#/admin`) ou `history.pushState` (`/admin`)?**

Hash routing porque o Live Server serve ficheiros estáticos. Com `history.pushState("/admin")`, um refresh em `/admin` daria 404. Com `#/admin`, o browser nunca envia o fragmento ao servidor (carrega sempre `index.html`) e o JavaScript reage ao evento `hashchange`.

**Como funciona o `Router` e porquê o helper `navigate()`?**

A classe `Router` mantém um mapa privado `#routes` do tipo `hash -> { handler, guard }`. Quando o evento `hashchange` dispara (ou no arranque, dentro de `listen()`):

1. Lê o `window.location.hash` actual.
2. Procura a rota correspondente. Se não existe, redirecciona para o fallback (`#/login`).
3. Se a rota tem um guard, chama-o. Se devolver `false`, redirecciona para o fallback.
4. Executa o handler (que pode ser `async`).

Os guards `isAuthenticated` e `isAdmin` lêem o `localStorage`. Como `add()` devolve `this`, podem-se encadear as rotas (interface fluente).

O helper `navigate()` existe sobretudo por **desacoplamento**: os controllers fazem `navigate("#/login")` sem importar a classe `Router`. Como o `Router` está a escutar `hashchange`, basta mexer no hash para a rota dispatchar.

**Como é limpa a query string entre rotas?**

A regra do SPA é: **cada rota é dona do seu próprio espaço de parâmetros**. Quando se sai de `#/app?genre=Pop&view=table` para `#/admin`, a query da rota anterior já não pertence à nova - tem de ser apagada.

A limpeza acontece dentro de `Router.listen()`, em cada `hashchange`:

```js
listen() {
  window.addEventListener("hashchange", () => {
    if (window.location.search) {
      history.replaceState(null, "", window.location.pathname + window.location.hash);
    }
    this.#handleRoute();
  });
  this.#handleRoute(); // 1.ª corrida não limpa - preserva a query num refresh
}
```

Centralizar no `Router` apanha **todas** as formas de mudar de rota: clicar nos `<a href="#/admin">` da nav, usar `navigate()` num controller, back/forward do browser, ou editar a URL à mão. Se a limpeza fosse só no `navigate()`, qualquer mudança de hash que não passasse por lá - p. e. clicar no link da nav - deixava a query órfã na barra do browser.

A 1.ª corrida (no arranque, ou num refresh) é direta, sem strip: o utilizador pode abrir `?genre=Pop&view=table#/app` e o `readURL()` do `app-controller` ainda lê os parâmetros. Depois, o `syncURL()` volta a escrever a query a partir do estado interno. Sem este detalhe, deep links partilhados perderiam o estado.

**Trade-off:** este modelo torna a query *local à rota*. Não é possível ter parâmetros "globais" que sobrevivam a uma transição de rota (p. e. um `?lang=pt` partilhado entre `#/app`, `#/admin` e `#/login`). Num SPA pequeno como este, a regra simples é o que se quer; numa app maior, com filtros partilhados ou preferências de UI globais, poder-se-ia distinguir parâmetros "de rota" de parâmetros "globais" e só limpar os primeiros.

**Onde fica o `#btn-logout`?**

`renderAppScreen()` injecta uma shell em `#app` com `<header>` (logo, nav e `#btn-logout`) e `<main id="app-main">`. Os `render*()` seguintes do soundbase ou do admin escrevem dentro do `#app-main`, deixando o header intacto. Por isso `bindLogout()` é chamado uma única vez dentro de `startApp` e sobrevive aos re-renders parciais.

**Porquê `localStorage` em vez de `sessionStorage`?**

`localStorage` persiste indefinidamente até ser explicitamente limpo (ou pelo logout, ou via DevTools). `sessionStorage` desaparece ao fechar o separador. O enunciado pede `localStorage` para que um refresh ou reabertura do browser mantenha a sessão. Em produção, a abordagem mais segura é cookies HTTP-only, mas isso requer cooperação do servidor que o `json-server-auth` não oferece.

**Porquê `import` dinâmico em `startApp`?**

`await import("./admin-controller.js")` só carrega o módulo no momento da chamada. Um utilizador comum nunca precisa do código do admin, e vice-versa - importar estaticamente os dois carregaria sempre tudo. Beneficia performance e separa explicitamente os dois fluxos.

**Porquê `Track.fromObject` precisa de mexer em `#id` e `#plays`?**

Os objectos vindos do servidor já têm um `id` (atribuído pelo `json-server`) e um número de `plays` que reflectem o estado persistido. Se chamássemos só o construtor, o `id` seria substituído por um `crypto.randomUUID()` novo e o `plays` voltava a zero - perderíamos a ligação com o servidor.

A solução é `fromObject` ler `obj.id` e `obj.plays` e escrevê-los directamente nos campos privados:

```js
static fromObject(obj) {
  const t = new Track(obj.title, obj.artist, obj.duration, obj.genre);
  if (obj.id !== undefined) t.#id = obj.id;
  if (obj.plays !== undefined) t.#plays = obj.plays;
  return t;
}
```

Funciona porque `fromObject` é um método **estático da classe `Track`** - e métodos da classe (estáticos ou de instância) têm acesso aos campos privados de qualquer instância de `Track`. A privacidade dos campos é ao nível da classe, não da instância.

**Como tornar um utilizador admin?**

`json-server-auth` regista sempre com `role: "user"`. Para promover alguém a admin:

1. Registar o utilizador pela UI.
2. Abrir `db.json` e mudar o campo `role` desse utilizador para `"admin"`.
3. Gravar o ficheiro. O `json-server` recarrega automaticamente (não é preciso reiniciar).
4. **Fazer logout e login outra vez no browser.**

Porquê o logout/login: o `role` está copiado em dois sítios estáticos que não actualizam sozinhos:

- A chave `user` no `localStorage`, gravada no momento do login.
- O próprio JWT, em que o `role` foi codificado quando o token foi emitido.

Editar o `db.json` mexe na base de dados mas não em nenhum destes dois. Como alternativa mais elaborada, poderia adicionar-se uma função `getUser(id)` ao `service.js` que re-busca os dados frescos no arranque da app e actualiza o `localStorage`.

## Para saber mais

- [json-server-auth - permissões e middleware](https://github.com/jeremyben/json-server-auth)
- [Web Storage API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [Dynamic imports - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import)
- [JSON Web Tokens - jwt.io](https://jwt.io/introduction)
- [hashchange event - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/hashchange_event)
