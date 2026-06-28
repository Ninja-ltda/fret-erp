const Database = require('better-sqlite3');
const path = require('path');
const DB_PATH = path.join(__dirname, '..', 'data', 'fret.db');
let db;

function getDatabase() {
  if (!db) {
    db = new Database(DB_PATH, { verbose: null });
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema();
  }
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS motoristas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT,
      telefone TEXT,
      salario_fixo REAL NOT NULL DEFAULT 1150.00,
      carta TEXT DEFAULT 'C+E',
      observacoes TEXT,
      ativo INTEGER NOT NULL DEFAULT 1,
      criado_em TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS caminhoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      placa TEXT NOT NULL UNIQUE,
      marca TEXT,
      modelo TEXT,
      ano INTEGER,
      capacidade_kg INTEGER,
      cor TEXT,
      km_atuais INTEGER DEFAULT 0,
      manutencao_em_dia INTEGER DEFAULT 1,
      observacoes TEXT,
      ativo INTEGER NOT NULL DEFAULT 1,
      criado_em TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS cargas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rota_id INTEGER NOT NULL REFERENCES rotas(id) ON DELETE CASCADE,
      tipo_veiculo TEXT NOT NULL,
      marca TEXT,
      modelo TEXT,
      matricula TEXT,
      proprietario TEXT,
      valor_declarado REAL,
      observacoes TEXT,
      criado_em TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS rotas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      origem TEXT NOT NULL,
      destino TEXT NOT NULL,
      distancia_km REAL NOT NULL,
      pais_origem TEXT,
      pais_destino TEXT,
      data_saida TEXT,
      data_chegada_prevista TEXT,
      data_chegada_real TEXT,
      tipo_trajeto TEXT DEFAULT 'internacional' CHECK(tipo_trajeto IN ('internacional','nacional')),
      status TEXT NOT NULL DEFAULT 'planejada' CHECK(status IN ('planejada','em_andamento','concluida','cancelada')),
      observacoes TEXT,
      criado_em TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS rotas_itinerario (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rota_id INTEGER NOT NULL REFERENCES rotas(id) ON DELETE CASCADE,
      ordem INTEGER NOT NULL,
      local TEXT NOT NULL,
      tipo TEXT NOT NULL DEFAULT 'parada' CHECK(tipo IN ('carga','descarga','abastecimento','descanso','parada')),
      observacoes TEXT,
      distancia_km REAL
    );

    CREATE TABLE IF NOT EXISTS rotas_atribuicao (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rota_id INTEGER NOT NULL REFERENCES rotas(id) ON DELETE CASCADE,
      motorista_id INTEGER REFERENCES motoristas(id),
      caminhao_id INTEGER REFERENCES caminhoes(id),
      km_rodados REAL DEFAULT 0,
      valor_adiantamento REAL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pendente' CHECK(status IN ('pendente','aceite','em_rota','concluido','cancelado')),
      observacoes TEXT,
      criado_em TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS postos_combustivel (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      localizacao TEXT NOT NULL,
      pais TEXT,
      empresa TEXT NOT NULL CHECK(empresa IN ('IDS','DKV','Repsol','BP','outro')),
      latitude REAL,
      longitude REAL,
      telefone TEXT,
      email TEXT,
      site TEXT,
      observacoes TEXT,
      ativo INTEGER NOT NULL DEFAULT 1,
      criado_em TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS abastecimentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      atribuicao_id INTEGER NOT NULL REFERENCES rotas_atribuicao(id) ON DELETE CASCADE,
      posto_id INTEGER NOT NULL REFERENCES postos_combustivel(id),
      litros REAL NOT NULL,
      valor_total REAL NOT NULL,
      tipo_combustivel TEXT DEFAULT 'diesel',
      data TEXT DEFAULT (datetime('now','localtime')),
      observacoes TEXT
    );

    CREATE TABLE IF NOT EXISTS preferencias_motorista (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      motorista_id INTEGER NOT NULL REFERENCES motoristas(id) ON DELETE CASCADE,
      tipo TEXT NOT NULL CHECK(tipo IN ('rota','posto','horario','descanso','geral')),
      descricao TEXT NOT NULL,
      prioridade INTEGER DEFAULT 1,
      criado_em TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS descontos_motorista (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      motorista_id INTEGER NOT NULL REFERENCES motoristas(id),
      atribuicao_id INTEGER REFERENCES rotas_atribuicao(id),
      valor REAL NOT NULL,
      motivo TEXT NOT NULL,
      data TEXT DEFAULT (datetime('now','localtime')),
      observacoes TEXT
    );

    CREATE TABLE IF NOT EXISTS solicitacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente TEXT NOT NULL,
      email TEXT,
      telefone TEXT,
      origem TEXT NOT NULL,
      destino TEXT NOT NULL,
      pais_origem TEXT,
      pais_destino TEXT,
      tipo_veiculo TEXT,
      quantidade INTEGER DEFAULT 1,
      valor_estimado REAL,
      urgencia TEXT DEFAULT 'normal' CHECK(urgencia IN ('baixa','normal','alta','urgente')),
      status TEXT NOT NULL DEFAULT 'pendente' CHECK(status IN ('pendente','analise','aceite','recusada')),
      observacoes TEXT,
      criado_em TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE VIEW IF NOT EXISTS v_calculo_salarial AS
    SELECT
      m.id AS motorista_id, m.nome, m.salario_fixo,
      COALESCE(SUM(ra.km_rodados), 0) AS km_total,
      COALESCE(SUM(ra.km_rodados), 0) * 0.13 AS km_valor,
      COALESCE((SELECT SUM(valor) FROM descontos_motorista dm WHERE dm.motorista_id = m.id), 0) AS total_descontos,
      COALESCE(SUM(ra.valor_adiantamento), 0) AS total_adiantamentos,
      COALESCE(SUM(ra.km_rodados), 0) * 0.13 + m.salario_fixo
        - COALESCE((SELECT SUM(valor) FROM descontos_motorista dm WHERE dm.motorista_id = m.id), 0) AS total_receber
    FROM motoristas m
    LEFT JOIN rotas_atribuicao ra ON ra.motorista_id = m.id AND ra.status = 'concluido'
    GROUP BY m.id;
  `);
}

module.exports = { getDatabase };