window.PAGES.postos = async function(el) {
  el.innerHTML = '<div class="d-flex justify-content-center align-items-center py-5"><div class="spinner-border text-primary me-3"></div><span class="text-muted">Carregando...</span></div>';

  try {
    const postos = await API.postos();

    const empresaBadge = {
      'IDS': 'bg-purple','DKV': 'bg-primary','Repsol': 'bg-warning','BP': 'bg-success','outro': 'bg-secondary'
    };

    el.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="page-title mb-0"><i class="bi bi-fuel-pump"></i> Postos de Combustível</h2>
        <button class="btn-primary-custom" onclick="postoForm()"><i class="bi bi-plus-lg"></i> Novo Posto</button>
      </div>

      <div class="section-card">
        <h3><i class="bi bi-handshake"></i> Convénios Ativos</h3>
        <div class="row g-3 mt-2 mb-3">
          <div class="col-4 col-md-3"><div class="card-moderno text-center p-3"><div style="font-size:2rem">⛽</div><strong>IDS</strong><div class="text-success small">Convénio Ativo</div></div></div>
          <div class="col-4 col-md-3"><div class="card-moderno text-center p-3"><div style="font-size:2rem">⛽</div><strong>DKV</strong><div class="text-success small">Convénio Ativo</div></div></div>
          <div class="col-4 col-md-3"><div class="card-moderno text-center p-3"><div style="font-size:2rem">⛽</div><strong>Repsol</strong><div class="text-success small">Convénio Ativo</div></div></div>
        </div>
      </div>

      <div class="section-card p-0 mt-3">
        <div class="table-responsive">
          <table class="table-moderna">
            <thead><tr>
              <th>Nome</th><th>Localização</th><th>País</th><th>Empresa</th><th>Contactos</th><th>Ações</th>
            </tr></thead>
            <tbody>
              ${postos.length===0?'<tr><td colspan="6" class="text-center text-muted py-4">Nenhum posto cadastrado.</td></tr>':''}
              ${postos.map(p => `
                <tr>
                  <td><strong>${p.nome}</strong></td>
                  <td>${p.localizacao}</td>
                  <td>${p.pais||'-'}</td>
                  <td><span class="badge ${empresaBadge[p.empresa]||'bg-secondary'}">${p.empresa}</span></td>
                  <td style="max-width:250px">
                    ${p.telefone?`<div><i class="bi bi-telephone small"></i> ${p.telefone}</div>`:''}
                    ${p.email?`<div><i class="bi bi-envelope small"></i> <a href="mailto:${p.email}">${p.email}</a></div>`:''}
                    ${p.site?`<div><i class="bi bi-globe small"></i> <a href="https://${p.site}" target="_blank">${p.site}</a></div>`:''}
                  </td>
                  <td>
                    <button class="btn-icon text-danger" title="Remover" onclick="removerPosto(${p.id})"><i class="bi bi-trash"></i></button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (e) {
    el.innerHTML = `<div class="alert alert-danger m-4">${e.message}</div>`;
  }
};

window.postoForm = function() {
  modalForm('Novo Posto', [
    { key:'nome', label:'Nome do Posto', value:'' },
    { key:'localizacao', label:'Localização', value:'' },
    { key:'pais', label:'País', value:'' },
    { key:'empresa', label:'Empresa', type:'select',
      options:[{v:'IDS',t:'IDS'},{v:'DKV',t:'DKV'},{v:'Repsol',t:'Repsol'},{v:'BP',t:'BP'},{v:'outro',t:'Outro'}].map(o=>({value:o.v,text:o.t})) },
    { key:'telefone', label:'Telefone', value:'' },
    { key:'email', label:'Email', value:'' },
    { key:'site', label:'Site (ex: posto.pt)', value:'' },
    { key:'latitude', label:'Latitude', type:'number', value:'', step:'0.0001' },
    { key:'longitude', label:'Longitude', type:'number', value:'', step:'0.0001' },
    { key:'observacoes', label:'Observações', type:'textarea', value:'' },
  ], async (data) => {
    data.latitude = data.latitude ? parseFloat(data.latitude) : null;
    data.longitude = data.longitude ? parseFloat(data.longitude) : null;
    await API.post('/postos', data);
    toast('Posto cadastrado!');
    navigate('postos');
  });
};

window.removerPosto = async function(id) {
  if (!confirm('Remover este posto?')) return;
  await API.del(`/postos/${id}`);
  toast('Posto removido!');
  navigate('postos');
};