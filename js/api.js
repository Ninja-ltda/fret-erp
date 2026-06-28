const API = {
  base: '/api',

  async get(path) {
    const r = await fetch(this.base + path);
    if (!r.ok) throw new Error(`GET ${path} failed`);
    return r.json();
  },

  async post(path, body) {
    const r = await fetch(this.base + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(`POST ${path} failed`);
    return r.json();
  },

  async put(path, body) {
    const r = await fetch(this.base + path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(`PUT ${path} failed`);
    return r.json();
  },

  async del(path) {
    const r = await fetch(this.base + path, { method: 'DELETE' });
    if (!r.ok) throw new Error(`DELETE ${path} failed`);
    return r.json();
  },

  // Shortcuts
  dashboard: () => API.get('/dashboard'),
  motoristas: () => API.get('/motoristas'),
  caminhoes: () => API.get('/caminhoes'),
  rotas: () => API.get('/rotas'),
  postos: () => API.get('/postos'),
  financeiroGeral: () => API.get('/financeiro/geral'),
};