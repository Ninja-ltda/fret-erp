// FRET ERP — Configuração de API
// Em produção (GitHub Pages), aponta para o ngrok
// Em desenvolvimento local, usa caminho relativo
const API_URL = (window.location.hostname === 'ninja-ltda.github.io')
  ? 'https://festival-emu-busily.ngrok-free.dev/api'
  : '/api';

const API_KEY = '***';

const API = {
  base: API_URL,

  async get(path) {
    const r = await fetch(this.base + path, {
      headers: { 'x-api-key': API_KEY, 'ngrok-skip-browser-warning': '1' },
    });
    if (!r.ok) throw new Error(`GET ${path} failed`);
    return r.json();
  },

  async post(path, body) {
    const r = await fetch(this.base + path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'ngrok-skip-browser-warning': '1',
      },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(`POST ${path} failed`);
    return r.json();
  },

  async put(path, body) {
    const r = await fetch(this.base + path, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'ngrok-skip-browser-warning': '1',
      },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(`PUT ${path} failed`);
    return r.json();
  },

  async del(path) {
    const r = await fetch(this.base + path, {
      method: 'DELETE',
      headers: { 'x-api-key': API_KEY, 'ngrok-skip-browser-warning': '1' },
    });
    if (!r.ok) throw new Error(`DELETE ${path} failed`);
    return r.json();
  },

  dashboard: () => API.get('/dashboard'),
  motoristas: () => API.get('/motoristas'),
  caminhoes: () => API.get('/caminhoes'),
  rotas: () => API.get('/rotas'),
  postos: () => API.get('/postos'),
  financeiroGeral: () => API.get('/financeiro/geral'),
};