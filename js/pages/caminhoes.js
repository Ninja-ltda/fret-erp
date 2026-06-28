window.PAGES.caminhoes = async function(el) {
  el.innerHTML = '<div class="d-flex justify-content-center align-items-center py-5"><div class="spinner-border text-primary me-3" role="status"></div><span class="text-muted">Carregando...</span></div>';

  try {
    const caminhoes = await API.caminhoes();

    el.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="page-title mb-0"><i class="bi bi-truck-front"></i> Frota Própria</h2>
        <button class="btn-primary-custom" onclick="caminhaoForm()"><i class="bi bi-plus-lg"></i> Novo Camião</button>
      </div>

      <!-- Cards dos camiões -->
      <div class="row g-3">
        ${caminhoes.length === 0 ? '<div class="col-12"><p class="text-muted">Nenhum camião cadastrado.</p></div>' : ''}
        ${caminhoes.map(c => `
          <div class="col-md-6 col-lg-4">
            <div class="card-moderno">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <span class="fs-3">🚛</span>
                    <div>
                      <strong class="fs-5">${c.placa}</strong>
                      <div class="text-muted small">${c.marca || ''} ${c.modelo || ''}</div>
                    </div>
                  </div>
                  <div class="row g-1 mt-2 small">
                    <div class="col-6"><span class="text-muted">Ano:</span> ${c.ano || '-'}</div>
                    <div class="col-6"><span class="text-muted">Cor:</span> ${c.cor || '-'}</div>
                    <div class="col-6"><span class="text-muted">Capacidade:</span> ${c.capacidade_kg ? (c.capacidade_kg/1000).toFixed(0)+'T' : '-'}</div>
                    <div class="col-6"><span class="text-muted">Km:</span> ${(c.km_atuais || 0).toLocaleString()} km</div>
                  </div>
                </div>
                <div>
                  <button class="btn-icon text-danger" title="Remover" onclick="removerCaminhao(${c.id})"><i class="bi bi-trash"></i></button>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (e) {
    el.innerHTML = `<div class="alert alert-danger m-4">${e.message}</div>`;
  }
};

window.caminhaoForm = function() {
  modalForm('Novo Camião (Frota Própria)', [
    { key: 'placa', label: 'Matrícula', value: '' },
    { key: 'marca', label: 'Marca', value: '' },
    { key: 'modelo', label: 'Modelo', value: '' },
    { key: 'ano', label: 'Ano', type: 'number', value: '' },
    { key: 'capacidade_kg', label: 'Capacidade (kg)', type: 'number', value: 18000 },
    { key: 'cor', label: 'Cor', value: '' },
    { key: 'km_atuais', label: 'Km Atuais', type: 'number', value: 0 },
    { key: 'observacoes', label: 'Observações', type: 'textarea', value: '' },
  ], async (data) => {
    await API.post('/caminhoes', data);
    toast('Camião cadastrado!');
    navigate('caminhoes');
  });
};

window.removerCaminhao = async function(id) {
  if (!confirm('Remover este camião da frota?')) return;
  await API.del(`/caminhoes/${id}`);
  toast('Camião removido!');
  navigate('caminhoes');
};