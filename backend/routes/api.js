const express = require('express');
const { getDatabase } = require('../database');
const router = express.Router();

// ---------- MOTORISTAS ----------
router.get('/motoristas', (req, res) => {
  const db = getDatabase();
  const data = db.prepare('SELECT * FROM motoristas WHERE ativo = 1 ORDER BY nome').all();
  res.json(data);
});

router.post('/motoristas', (req, res) => {
  const db = getDatabase();
  const { nome, email, telefone, salario_fixo, carta, observacoes } = req.body;
  const stmt = db.prepare('INSERT INTO motoristas (nome,email,telefone,salario_fixo,carta,observacoes) VALUES (?,?,?,?,?,?)');
  const result = stmt.run(nome, email||null, telefone||null, salario_fixo||800, carta||'C+E', observacoes||null);
  res.json({ id: result.lastInsertRowid });
});

router.put('/motoristas/:id', (req, res) => {
  const db = getDatabase();
  const { nome, email, telefone, salario_fixo, carta, observacoes, ativo } = req.body;
  db.prepare('UPDATE motoristas SET nome=?,email=?,telefone=?,salario_fixo=?,carta=?,observacoes=?,ativo=? WHERE id=?')
    .run(nome, email||null, telefone||null, salario_fixo, carta, observacoes||null, ativo??1, req.params.id);
  res.json({ ok: true });
});

router.delete('/motoristas/:id', (req, res) => {
  const db = getDatabase();
  db.prepare('UPDATE motoristas SET ativo=0 WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ---------- CAMIÕES (frota própria) ----------
router.get('/caminhoes', (req, res) => {
  const db = getDatabase();
  const data = db.prepare('SELECT * FROM caminhoes WHERE ativo = 1 ORDER BY placa').all();
  res.json(data);
});

router.post('/caminhoes', (req, res) => {
  const db = getDatabase();
  const { placa, marca, modelo, ano, capacidade_kg, cor, km_atuais, observacoes } = req.body;
  const stmt = db.prepare('INSERT INTO caminhoes (placa,marca,modelo,ano,capacidade_kg,cor,km_atuais,observacoes) VALUES (?,?,?,?,?,?,?,?)');
  const result = stmt.run(placa, marca||null, modelo||null, ano||null, capacidade_kg||null, cor||null, km_atuais||0, observacoes||null);
  res.json({ id: result.lastInsertRowid });
});

router.put('/caminhoes/:id', (req, res) => {
  const db = getDatabase();
  const { placa, marca, modelo, ano, capacidade_kg, cor, km_atuais, ativo } = req.body;
  db.prepare('UPDATE caminhoes SET placa=?,marca=?,modelo=?,ano=?,capacidade_kg=?,cor=?,km_atuais=?,ativo=? WHERE id=?')
    .run(placa, marca||null, modelo||null, ano||null, capacidade_kg||null, cor||null, km_atuais||0, ativo??1, req.params.id);
  res.json({ ok: true });
});

router.delete('/caminhoes/:id', (req, res) => {
  const db = getDatabase();
  db.prepare('UPDATE caminhoes SET ativo=0 WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ---------- CARGAS (veículos transportados - terceiros) ----------
router.get('/cargas/rota/:rota_id', (req, res) => {
  const db = getDatabase();
  const data = db.prepare('SELECT * FROM cargas WHERE rota_id = ? ORDER BY criado_em').all(req.params.rota_id);
  res.json(data);
});

router.post('/cargas', (req, res) => {
  const db = getDatabase();
  const { rota_id, tipo_veiculo, marca, modelo, matricula, proprietario, valor_declarado, observacoes } = req.body;
  const stmt = db.prepare('INSERT INTO cargas (rota_id,tipo_veiculo,marca,modelo,matricula,proprietario,valor_declarado,observacoes) VALUES (?,?,?,?,?,?,?,?)');
  const result = stmt.run(rota_id, tipo_veiculo, marca||null, modelo||null, matricula||null, proprietario||null, valor_declarado||null, observacoes||null);
  res.json({ id: result.lastInsertRowid });
});

// ---------- ROTAS ----------
router.get('/rotas', (req, res) => {
  const db = getDatabase();
  const rotas = db.prepare(`
    SELECT r.*, m.nome AS motorista_nome, c.placa AS caminhao_placa,
           ra.km_rodados, ra.valor_adiantamento, ra.status AS atribuicao_status
    FROM rotas r
    LEFT JOIN rotas_atribuicao ra ON ra.rota_id = r.id
    LEFT JOIN motoristas m ON m.id = ra.motorista_id
    LEFT JOIN caminhoes c ON c.id = ra.caminhao_id
    ORDER BY r.data_saida DESC
  `).all();
  res.json(rotas);
});

router.post('/rotas', (req, res) => {
  const db = getDatabase();
  const { nome, origem, destino, distancia_km, pais_origem, pais_destino, data_saida, data_chegada_prevista, observacoes } = req.body;
  const stmt = db.prepare('INSERT INTO rotas (nome,origem,destino,distancia_km,pais_origem,pais_destino,data_saida,data_chegada_prevista,observacoes) VALUES (?,?,?,?,?,?,?,?,?)');
  const result = stmt.run(nome, origem, destino, distancia_km, pais_origem, pais_destino, data_saida||null, data_chegada_prevista||null, observacoes||null);
  res.json({ id: result.lastInsertRowid });
});

router.put('/rotas/:id/status', (req, res) => {
  const db = getDatabase();
  const { status, data_chegada_real } = req.body;
  db.prepare('UPDATE rotas SET status=?, data_chegada_real=? WHERE id=?')
    .run(status, data_chegada_real||null, req.params.id);
  res.json({ ok: true });
});

// ---------- ATRIBUICAO (ligar rota + motorista + caminhão) ----------
router.post('/rotas/atribuir', (req, res) => {
  const db = getDatabase();
  const { rota_id, motorista_id, caminhao_id, km_rodados, valor_adiantamento, observacoes } = req.body;
  const stmt = db.prepare('INSERT INTO rotas_atribuicao (rota_id,motorista_id,caminhao_id,km_rodados,valor_adiantamento,observacoes) VALUES (?,?,?,?,?,?)');
  const result = stmt.run(rota_id, motorista_id||null, caminhao_id||null, km_rodados||0, valor_adiantamento||0, observacoes||null);
  res.json({ id: result.lastInsertRowid });
});

router.put('/rotas/atribuir/:id/status', (req, res) => {
  const db = getDatabase();
  const { status, km_rodados } = req.body;
  db.prepare('UPDATE rotas_atribuicao SET status=?, km_rodados=COALESCE(?,km_rodados) WHERE id=?')
    .run(status, km_rodados||null, req.params.id);
  res.json({ ok: true });
});

// ---------- POSTOS ----------
router.get('/postos', (req, res) => {
  const db = getDatabase();
  const data = db.prepare('SELECT * FROM postos_combustivel WHERE ativo = 1 ORDER BY nome').all();
  res.json(data);
});

router.post('/postos', (req, res) => {
  const db = getDatabase();
  const { nome, localizacao, pais, empresa, latitude, longitude, telefone, email, site, observacoes } = req.body;
  const stmt = db.prepare('INSERT INTO postos_combustivel (nome,localizacao,pais,empresa,latitude,longitude,telefone,email,site,observacoes) VALUES (?,?,?,?,?,?,?,?,?,?)');
  const result = stmt.run(nome, localizacao, pais||null, empresa, latitude||null, longitude||null, telefone||null, email||null, site||null, observacoes||null);
  res.json({ id: result.lastInsertRowid });
});

// ---------- ABASTECIMENTOS ----------
router.get('/abastecimentos/rota/:atribuicao_id', (req, res) => {
  const db = getDatabase();
  const data = db.prepare(`
    SELECT a.*, p.nome AS posto_nome, p.empresa AS posto_empresa
    FROM abastecimentos a
    JOIN postos_combustivel p ON p.id = a.posto_id
    WHERE a.atribuicao_id = ?
    ORDER BY a.data
  `).all(req.params.atribuicao_id);
  res.json(data);
});

router.post('/abastecimentos', (req, res) => {
  const db = getDatabase();
  const { atribuicao_id, posto_id, litros, valor_total, tipo_combustivel, observacoes } = req.body;
  const stmt = db.prepare('INSERT INTO abastecimentos (atribuicao_id,posto_id,litros,valor_total,tipo_combustivel,observacoes) VALUES (?,?,?,?,?,?)');
  const result = stmt.run(atribuicao_id, posto_id, litros, valor_total, tipo_combustivel||'diesel', observacoes||null);
  res.json({ id: result.lastInsertRowid });
});

// ---------- PREFERENCIAS ----------
router.get('/preferencias/:motorista_id', (req, res) => {
  const db = getDatabase();
  const data = db.prepare('SELECT * FROM preferencias_motorista WHERE motorista_id = ? ORDER BY prioridade').all(req.params.motorista_id);
  res.json(data);
});

router.post('/preferencias', (req, res) => {
  const db = getDatabase();
  const { motorista_id, tipo, descricao, prioridade } = req.body;
  const stmt = db.prepare('INSERT INTO preferencias_motorista (motorista_id,tipo,descricao,prioridade) VALUES (?,?,?,?)');
  const result = stmt.run(motorista_id, tipo, descricao, prioridade||1);
  res.json({ id: result.lastInsertRowid });
});

// ---------- DESCONTOS ----------
router.get('/descontos/:motorista_id', (req, res) => {
  const db = getDatabase();
  const data = db.prepare('SELECT * FROM descontos_motorista WHERE motorista_id = ? ORDER BY data DESC').all(req.params.motorista_id);
  res.json(data);
});

router.post('/descontos', (req, res) => {
  const db = getDatabase();
  const { motorista_id, atribuicao_id, valor, motivo, observacoes } = req.body;
  const stmt = db.prepare('INSERT INTO descontos_motorista (motorista_id,atribuicao_id,valor,motivo,observacoes) VALUES (?,?,?,?,?)');
  const result = stmt.run(motorista_id, atribuicao_id||null, valor, motivo, observacoes||null);
  res.json({ id: result.lastInsertRowid });
});

// ---------- DASHBOARD ----------
router.get('/dashboard', (req, res) => {
  const db = getDatabase();

  const rotas_ativas = db.prepare("SELECT COUNT(*) AS c FROM rotas WHERE status IN ('planejada','em_andamento')").get().c;
  const rotas_concluidas = db.prepare("SELECT COUNT(*) AS c FROM rotas WHERE status = 'concluida'").get().c;
  const total_motoristas = db.prepare("SELECT COUNT(*) AS c FROM motoristas WHERE ativo = 1").get().c;
  const total_caminhoes = db.prepare("SELECT COUNT(*) AS c FROM caminhoes WHERE ativo = 1").get().c;
  const km_total_mes = db.prepare(`
    SELECT COALESCE(SUM(km_rodados),0) AS km
    FROM rotas_atribuicao
    WHERE status = 'concluido'
    AND strftime('%Y-%m', criado_em) = strftime('%Y-%m', 'now')
  `).get().km;

  const ultimas_rotas = db.prepare(`
    SELECT r.id, r.nome, r.origem, r.destino, r.status, r.data_saida,
           m.nome AS motorista_nome
    FROM rotas r
    LEFT JOIN rotas_atribuicao ra ON ra.rota_id = r.id
    LEFT JOIN motoristas m ON m.id = ra.motorista_id
    ORDER BY r.data_saida DESC NULLS LAST
    LIMIT 5
  `).all();

  const motoristas_ativos_rota = db.prepare(`
    SELECT m.nome, r.nome AS rota, r.destino, r.status
    FROM motoristas m
    JOIN rotas_atribuicao ra ON ra.motorista_id = m.id
    JOIN rotas r ON r.id = ra.rota_id
    WHERE ra.status IN ('aceite','em_rota')
    ORDER BY r.data_saida
  `).all();

  res.json({
    rotas_ativas,
    rotas_concluidas,
    total_motoristas,
    total_caminhoes,
    km_total_mes,
    ultimas_rotas,
    motoristas_ativos_rota
  });
});

// ---------- RESUMO FINANCEIRO ----------
router.get('/financeiro/geral', (req, res) => {
  const db = getDatabase();
  const data = db.prepare(`
    SELECT
      COALESCE(SUM(km_rodados),0) AS km_total_geral,
      COALESCE(SUM(km_rodados),0) * 0.13 AS valor_km_total,
      COALESCE(SUM(valor_adiantamento),0) AS total_adiantamentos
    FROM rotas_atribuicao
    WHERE status = 'concluido'
  `).get();
  res.json(data);
});

// ---------- MAPA (geolocalização completa: rotas + postos) ----------
router.get('/mapa/completo', (req, res) => {
  const db = getDatabase();

  const cityCoords = {
    'Porto': [41.1579, -8.6291], 'Lisboa': [38.7223, -9.1393],
    'Bruxelas': [50.8503, 4.3517], 'Paris': [48.8566, 2.3522],
    'Lyon': [45.7640, 4.8357], 'Roterdão': [51.9244, 4.4777],
    'Barcelona': [41.3874, 2.1686], 'Madrid': [40.4168, -3.7038],
    'Vigo': [42.2314, -8.7124], 'Bordéus': [44.8378, -0.5792],
    'Bilbau': [43.2630, -2.9350], 'Toulouse': [43.6047, 1.4442],
    'Antuérpia': [51.2194, 4.4025],
  };

  const rotas = db.prepare(`
    SELECT r.id, r.nome, r.origem, r.destino, r.status, r.distancia_km,
           m.nome AS motorista_nome, c.placa AS caminhao_placa
    FROM rotas r
    LEFT JOIN rotas_atribuicao ra ON ra.rota_id = r.id
    LEFT JOIN motoristas m ON m.id = ra.motorista_id
    LEFT JOIN caminhoes c ON c.id = ra.caminhao_id
    WHERE r.status IN ('em_andamento','planejada')
    ORDER BY r.data_saida DESC LIMIT 10
  `).all();

  const geoRotas = rotas.map(r => ({
    id: r.id, nome: r.nome, origem: r.origem, destino: r.destino,
    status: r.status, distancia_km: r.distancia_km,
    motorista: r.motorista_nome, caminhao: r.caminhao_placa,
    origemCoord: cityCoords[r.origem] || null,
    destinoCoord: cityCoords[r.destino] || null,
  }));

  const postos = db.prepare(`
    SELECT id, nome, localizacao, pais, empresa, latitude, longitude, telefone, email, site
    FROM postos_combustivel WHERE ativo = 1 AND latitude IS NOT NULL
    ORDER BY pais, empresa
  `).all();

  res.json({ geoRotas, postos });
});

// ---------- SOLICITAÇÕES ----------
router.get('/solicitacoes', (req, res) => {
  const db = getDatabase();
  const data = db.prepare('SELECT * FROM solicitacoes ORDER BY criado_em DESC').all();
  res.json(data);
});

router.post('/solicitacoes', (req, res) => {
  const db = getDatabase();
  const { cliente, email, telefone, origem, destino, pais_origem, pais_destino, tipo_veiculo, quantidade, valor_estimado, urgencia, observacoes } = req.body;
  const stmt = db.prepare('INSERT INTO solicitacoes (cliente,email,telefone,origem,destino,pais_origem,pais_destino,tipo_veiculo,quantidade,valor_estimado,urgencia,observacoes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)');
  const result = stmt.run(cliente, email||null, telefone||null, origem, destino, pais_origem||null, pais_destino||null, tipo_veiculo||null, quantidade||1, valor_estimado||null, urgencia||'normal', observacoes||null);
  res.json({ id: result.lastInsertRowid });
});

router.put('/solicitacoes/:id/status', (req, res) => {
  const db = getDatabase();
  const { status } = req.body;
  db.prepare('UPDATE solicitacoes SET status=? WHERE id=?').run(status, req.params.id);
  res.json({ ok: true });
});

// ---------- PAGAMENTOS POR MOTORISTA (km × €0.13) ----------
router.get('/motoristas/pagamentos', (req, res) => {
  const db = getDatabase();
  const data = db.prepare(`
    SELECT
      m.id, m.nome,
      COALESCE(SUM(ra.km_rodados), 0) AS km_total,
      ROUND(COALESCE(SUM(ra.km_rodados), 0) * 0.13, 2) AS valor_receber,
      ROUND(COALESCE(SUM(ra.valor_adiantamento), 0), 2) AS adiantamentos
    FROM motoristas m
    LEFT JOIN rotas_atribuicao ra ON ra.motorista_id = m.id AND ra.status = 'concluido'
    WHERE m.ativo = 1
    GROUP BY m.id
    ORDER BY valor_receber DESC
  `).all();
  res.json(data);
});

module.exports = router;