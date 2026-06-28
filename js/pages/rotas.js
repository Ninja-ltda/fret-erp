window.PAGES.rotas = async function(el) {
  el.innerHTML = loadingSpinner();

  try {
    const rotas = await API.rotas();

    // Group by status for the kanban-like view
    const planejadas = rotas.filter(r => r.status === 'planejada' || r.status === 'pendente');
    const andamento = rotas.filter(r => r.status === 'em_andamento' || r.status === 'aceite' || r.status === 'em_rota');
    const concluidas = rotas.filter(r => r.status === 'concluida' || r.status === 'concluido');

    el.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="page-title mb-0"><i class="bi bi-map"></i> Rotas & Operações</h2>
        <button class="btn-primary-custom" onclick="rotaForm()"><i class="bi bi-plus-lg"></i> Nova Rota</button>
      </div>

      <!-- STATUS BOARD -->
      <div class="row g-3 mb-4">
        <!-- Planejadas -->
        <div class="col-md-4">
          <div class="section-card">
            <h3><i class="bi bi-calendar-check" style="color:#1967d2"></i> Planejadas <span class="badge bg-primary ms-2">${planejadas.length}</span></h3>
            <div style="max-height:400px;overflow-y:auto">
              ${planejadas.length === 0 ? '<p class="text-muted small mt-2">Nenhuma rota planejada.</p>' : ''}
              ${planejadas.slice(0, 8).map(r => `
                <div class="card-rota-item" onclick="rotaDetalhe(${r.id})">
                  <div class="fw-bold">${r.nome}</div>
                  <small class="text-muted">${r.origem} → ${r.destino}</small>
                  <div><small>🚛 ${r.motorista_nome || 'Sem motorista'}</small></div>
                  <small class="text-muted">📅 ${formatDate(r.data_saida)} | ${r.distancia_km}km</small>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Em Andamento -->
        <div class="col-md-4">
          <div class="section-card">
            <h3><i class="bi bi-arrow-right-circle" style="color:#f0ad4e"></i> Em Curso <span class="badge bg-warning text-dark ms-2">${andamento.length}</span></h3>
            <div style="max-height:400px;overflow-y:auto">
              ${andamento.length === 0 ? '<p class="text-muted small mt-2">Nenhuma rota em andamento.</p>' : ''}
              ${andamento.slice(0, 8).map(r => `
                <div class="card-rota-item border-warning" onclick="rotaDetalhe(${r.id})">
                  <div class="fw-bold">${r.nome}</div>
                  <small class="text-muted">${r.origem} → ${r.destino}</small>
                  <div><strong>🚛 ${r.motorista_nome || '?'}</strong></div>
                  <div>${statusBadge(r.status || r.atribuicao_status)}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Concluídas -->
        <div class="col-md-4">
          <div class="section-card">
            <h3><i class="bi bi-check-circle" style="color:#28a745"></i> Concluídas <span class="badge bg-success ms-2">${concluidas.length}</span></h3>
            <div style="max-height:400px;overflow-y:auto">
              ${concluidas.length === 0 ? '<p class="text-muted small mt-2">Nenhuma rota concluída.</p>' : ''}
              ${concluidas.slice(0, 8).map(r => `
                <div class="card-rota-item border-success" onclick="rotaDetalhe(${r.id})">
                  <div class="fw-bold">${r.nome}</div>
                  <small class="text-muted">${r.origem} → ${r.destino}</small>
                  <div><small>🚛 ${r.motorista_nome || '-'}</small></div>
                  <small class="text-muted">${r.km_rodados || r.distancia_km}km</small>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- MAPA SIMULADO DAS ROTAS -->
      <div class="section-card">
        <h3><i class="bi bi-geo-alt"></i> Mapa de Rotas</h3>
        <div class="row">
          <div class="col-md-8">
            <div style="background:#f8f9fa;border-radius:12px;padding:20px;text-align:center;">
              <div style="font-size:2.5rem;margin-bottom:10px">🗺️</div>
              <p class="text-muted mb-0">Mapa interativo das rotas entre Portugal, Espanha, França, Bélgica e Holanda.</p>
              <p class="small text-muted mt-2">(Integração com Google Maps / Leaflet disponível)</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card-moderno" style="box-shadow:none;background:#f8f9fa">
              <div class="fw-bold mb-2">🌍 Zona de Operação</div>
              <ul class="list-unstyled mb-0 small">
                <li>🇵🇹 Portugal</li>
                <li>🇪🇸 Espanha</li>
                <li>🇫🇷 França</li>
                <li>🇧🇪 Bélgica</li>
                <li>🇳🇱 Holanda</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- TODAS AS ROTAS (Tabela) -->
      <div class="section-card">
        <h3><i class="bi bi-list"></i> Todas as Rotas</h3>
        <div class="table-responsive">
          <table class="table-moderna">
            <thead><tr>
              <th>Nome</th><th>Origem → Destino</th><th>Km</th><th>Data</th><th>Motorista</th><th>Camião</th><th>Status</th><th>Ações</th>
            </tr></thead>
            <tbody>
              ${rotas.length === 0 ? '<tr><td colspan="8" class="text-center text-muted py-4">Nenhuma rota cadastrada.</td></tr>' : ''}
              ${rotas.map(r => `
                <tr>
                  <td><strong>${r.nome}</strong></td>
                  <td>${r.origem} → ${r.destino}</td>
                  <td>${r.distancia_km}km</td>
                  <td>${formatDate(r.data_saida)}</td>
                  <td>${r.motorista_nome || '-'}</td>
                  <td>${r.caminhao_placa || '-'}</td>
                  <td>${statusBadge(r.status)}</td>
                  <td>
                    <button class="btn-icon" title="Atribuir" onclick="rotaAtribuir(${r.id},'${r.nome}')"><i class="bi bi-link"></i></button>
                    <button class="btn-icon" title="Mudar status" onclick="rotaStatus(${r.id})"><i class="bi bi-arrow-up-circle"></i></button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <style>
        .card-rota-item {
          background: #f8f9fa;
          border-radius: 10px;
          padding: 10px 14px;
          margin-bottom: 8px;
          border-left: 4px solid #1967d2;
          cursor: pointer;
          transition: all 0.15s;
        }
        .card-rota-item:hover { transform: translateX(3px); box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .card-rota-item.border-warning { border-left-color: #f0ad4e; }
        .card-rota-item.border-success { border-left-color: #28a745; }
      </style>
    `;
  } catch (e) {
    el.innerHTML = `<div class="alert alert-danger m-4">${e.message}</div>`;
  }
};

// FORM NOVA ROTA
window.rotaForm = async function() {
  const paises = [
    { value: 'PT', text: '🇵🇹 Portugal' },
    { value: 'ES', text: '🇪🇸 Espanha' },
    { value: 'FR', text: '🇫🇷 França' },
    { value: 'BE', text: '🇧🇪 Bélgica' },
    { value: 'NL', text: '🇳🇱 Holanda' },
  ];

  modalForm('Nova Rota', [
    { key: 'nome', label: 'Nome da Rota', value: '' },
    { key: 'origem', label: 'Origem (cidade/local)', value: '' },
    { key: 'pais_origem', label: 'País Origem', type: 'select', options: paises },
    { key: 'destino', label: 'Destino (cidade/local)', value: '' },
    { key: 'pais_destino', label: 'País Destino', type: 'select', options: paises },
    { key: 'distancia_km', label: 'Distância (km)', type: 'number', value: 0, step: '1' },
    { key: 'data_saida', label: 'Data de Saída', type: 'date', value: dataHoje() },
    { key: 'data_chegada_prevista', label: 'Previsão Chegada', type: 'date', value: '' },
    { key: 'observacoes', label: 'Observações', type: 'textarea', value: '' },
  ], async (data) => {
    await API.post('/rotas', data);
    toast('Rota criada!');
    navigate('rotas');
  });
};

// ATRIBUIR MOTORISTA/CAMIÃO A ROTA
window.rotaAtribuir = async function(rotaId, rotaNome) {
  const motoristas = await API.motoristas();
  const caminhoes = await API.caminhoes();

  modalForm(`Atribuir - ${rotaNome}`, [
    { key: 'rota_id', label: '', type: 'hidden', value: rotaId },
    { key: 'motorista_id', label: 'Motorista', type: 'select',
      options: [{ value: '', text: '— Sem motorista —' }, ...motoristas.map(m => ({ value: m.id, text: m.nome }))] },
    { key: 'caminhao_id', label: 'Camião', type: 'select',
      options: [{ value: '', text: '— Sem camião —' }, ...caminhoes.map(c => ({ value: c.id, text: `${c.placa} - ${c.marca||''} ${c.modelo||''}` }))] },
    { key: 'km_rodados', label: 'Km Rodados', type: 'number', value: 0, step: '1' },
    { key: 'valor_adiantamento', label: 'Adiantamento (€)', type: 'number', value: 0, step: '10' },
    { key: 'observacoes', label: 'Observações', type: 'textarea', value: '' },
  ], async (data) => {
    data.motorista_id = data.motorista_id ? parseInt(data.motorista_id) : null;
    data.caminhao_id = data.caminhao_id ? parseInt(data.caminhao_id) : null;
    await API.post('/rotas/atribuir', data);
    toast('Atribuição salva!');
    navigate('rotas');
  });
};

// AVANÇAR STATUS
window.rotaStatus = async function(rotaId) {
  modalForm('Mudar Status da Rota', [
    { key: 'status', label: 'Novo Status', type: 'select',
      options: [
        { value: 'planejada', text: '📋 Planejada' },
        { value: 'em_andamento', text: '🚛 Em Andamento' },
        { value: 'concluida', text: '✅ Concluída' },
        { value: 'cancelada', text: '❌ Cancelada' },
      ] },
    { key: 'data_chegada_real', label: 'Chegada Real', type: 'date', value: dataHoje() },
  ], async (data) => {
    await API.put(`/rotas/${rotaId}/status`, data);
    toast('Status atualizado!');
    navigate('rotas');
  });
};

window.rotaDetalhe = function(id) {
  // Por enquanto mostra no consola — depois expandimos se quiseres
  toast('Detalhe completo em breve.', 'info');
};