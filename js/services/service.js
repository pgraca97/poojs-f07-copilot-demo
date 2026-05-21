// Toda a comunicação com o servidor mock centralizada aqui.
// Os controllers nunca constroem pedidos fetch nem acedem diretamente aos headers ou ao token.

const API = 'http://localhost:3000';

const authHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
});

const jsonHeaders = () => ({ 'Content-Type': 'application/json' });

// Autenticação

export const register = async (email, password) => {
  const res = await fetch(`${API}/register`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ email, password, role: 'user' }),
  });
  return { ok: res.status === 201 };
};

export const login = async (email, password) => {
  const res = await fetch(`${API}/login`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) return { ok: false };
  const data = await res.json();
  // O servidor devolve accessToken; mapeamos para token para que os controllers
  // não dependam do formato da resposta.
  return { ok: true, token: data.accessToken, user: data.user };
};

// Faixas (a regra /660/tracks exige token mesmo na leitura)

export const getTracks = async () => {
  const res = await fetch(`${API}/tracks`, { headers: authHeaders() });
  if (!res.ok) return [];
  return res.json();
};

export const addTrack = async (data) => {
  const res = await fetch(`${API}/tracks`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return { ok: res.ok };
};

export const deleteTrack = async (id) => {
  const res = await fetch(`${API}/tracks/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return { ok: res.ok };
};
