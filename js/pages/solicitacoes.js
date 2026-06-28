window.PAGES.solicitacoes = async function(el) {
  el.innerHTML = '<div class="d-flex justify-content-center align-items-center py-5"><div class="spinner-border text-primary me-3"></div><span class="text-muted">Carregando...</span></div>';

  try {
    const sols = await API.get('/solicitacoes');

    const urgMap = { baixa: '🟢 Baixa', normal: '🟡 Normal', alta: '🟠 Alta', urgente: '🔴 Urgente' };
    const stMap  = { pendente: 'status-pendente', analise: 'status-em_andamento', aceite: 'status-concluida', recusada: 'status-cancelada' };

    el.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="page-title mb-0"><i class="bi bi-inbox"></i> Solicitações de Transporte</h2>
        <button class="btn-primary-custom" onclick="solForm()"><i class="bi bi-plus-lg"></i> Nova Solicitação</button>
      </div>

      <div class="section-card p-0">
        <div class="table-responsive">
          <table class="table-moderna">
            <thead><tr>
              <th>Cliente</th><th>Origem → Destino</th><th>Tipo/Veículos</th><th>Valor Est.</th><th>Urgência</th><th>Status</th><th>Ações</th>
            </tr></thead>
            <tbody>
              ${sols.length===0?'<tr><td colspan="7" class="text-center text-muted py-4">Nenhuma solicitação no momento.</td></tr>':''}
              ${sols.map(s => `
                <tr>
                  <td>
                    <strong>${s.cliente}</strong>
                    <br><small class="text-muted">${s.email||''} ${s.telefone?'· '+s.telefone:''}</small>
                  </td>
                  <td>${s.origem} → ${s.destino}<br><small class="text-muted">${s.pais_origem||'?'} → ${s.pais_destino||'?'}</small></td>
                  <td>${s.tipo_veiculo||'-'} ×${s.quantidade}</td>
                  <td>${s.valor_estimado?formatMoney(s.valor_estimado):'-'}</td>
                  <td>${urgMap[s.urgencia]||'🟡 Normal'}</td>
                  <td><span class="status-badge ${stMap[s.status]}">${s.status}</span></td>
                  <td>
                    <button class="btn-icon text-success" title="Aceitar" onclick="solStatus(${s.id},'aceite')"><i class="bi bi-check-lg"></i></button>
                    <button class="btn-icon text-danger" title="Recusar" onclick="solStatus(${s.id},'recusada')"><i class="bi bi-x-lg"></i></button>
                    <button class="btn-icon" title="Analisar" onclick="solStatus(${s.id},'analise')"><i class="bi bi-search"></i></button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="section-card mt-3">
        <h5>Legenda de status</h5>
        <div class="d-flex gap-3 small">
          <span><span class="status-badge status-pendente">pendente</span> = Novo pedido, aguardando avaliação</span>
          <span><span class="status-badge status-em_andamento">analise</span> = Em análise</span>
          <span><span class="status-badge status-concluida">aceite</span> = Aceite, será convertido em rota</span>
          <span><span class="status-badge status-cancelada">recusada</span> = Recusado</span>
        </div>
      </div>
    `;
  } catch (e) {
    el.innerHTML = `<div class="alert alert-danger m-4">${e.message}</div>`;
  }
};

window.solForm = function() {
  modalForm('Nova Solicitação de Transporte', [
    { key:'cliente', label:'Nome do Cliente', value:'' },
    { key:'email', label:'Email', value:'' },
    { key:'telefone', label:'Telefone', value:'' },
    { key:'origem', label:'Origem', value:'' },
    { key:'pais_origem', label:'País Origem', value:'' },
    { key:'destino', label:'Destino', value:'' },
    { key:'pais_destino', label:'País Destino', value:'' },
    { key:'tipo_veiculo', label:'Tipo de Veículo', value:'' },
    { key:'quantidade', label:'Quantidade', type:'number', value:1, min:1 },
    { key:'valor_estimado', label:'Valor Estimado (€)', type:'number', value:0 },
    { key:'urgencia', label:'Urgência', type:'select', options:[
      {value:'baixa',text:'🟢 Baixa'},{value:'normal',text:'🟡 Normal'},{value:'alta',text:'🟠 Alta'},{value:'urgente',text:'🔴 Urgente'}
    ]},
    { key:'observacoes', label:'Observações', type:'textarea', value:'' },
  ], async (data) => {
    await API.post('/solicitacoes', data);
    toast('Solicitação registada!');
    navigate('solicitacoes');
  });
};

window.solStatus = async function(id, status) {
  if (status==='recusada' && !confirm('Tem certeza que deseja recusar esta solicitação?')) return;
  await API.put(`/solicitacoes/${id}/status`, { status });
  toast(status==='aceite'?'Solicitação aceite!' : 'Status atualizado!');
  navigate('solicitacoes');
};