window.PAGES.motoristas = async function(el) {
  el.innerHTML = '<div class="d-flex justify-content-center align-items-center py-5"><div class="spinner-border text-primary me-3"></div><span class="text-muted">Carregando...</span></div>';

  try {
    const motoristas = await API.motoristas();
    const fin = await API.financeiroGeral();

    // Buscar valores por motorista
    const resultados = await Promise.all(motoristas.map(async m => {
      const rotas = await API.rotas();
      const relevantes = rotas.filter(r =>
        r.motorista_nome === m.nome && r.atribuicao_status === 'concluido'
      );
      const km = relevantes.reduce((a, r) => a + (r.km_rodados || 0), 0);
      const adiantamentos = relevantes.reduce((a, r) => a + (r.valor_adiantamento || 0), 0);
      const descontos = (await API.get('/descontos/' + m.id).catch(() => [])).reduce((a, d) => a + d.valor, 0);
      const kmValor = km * 0.13;
      const total = m.salario_fixo + kmValor - descontos;
      return { ...m, km, kmValor, adiantamentos, descontos, total };
    }));

    el.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="page-title mb-0"><i class="bi bi-people"></i> Motoristas</h2>
        <button class="btn-primary-custom" onclick="motoristaForm()"><i class="bi bi-plus-lg"></i> Novo</button>
      </div>

      <div class="section-card p-0">
        <div class="table-responsive">
          <table class="table-moderna">
            <thead><tr>
              <th>Nome</th><th>Contacto</th><th>Salário Base</th><th style="color:#28a745">Valores Recebidos (km)</th><th style="color:#dc3545">Valores Enviados</th><th>Pref.</th><th>Ações</th>
            </tr></thead>
            <tbody>
              ${resultados.length===0?'<tr><td colspan="7" class="text-center text-muted py-4">Nenhum motorista.</td></tr>':''}
              ${resultados.map(m => `
                <tr>
                  <td><strong>${m.nome}</strong></td>
                  <td><small>${m.telefone||'-'}<br>${m.email||''}</small></td>
                  <td><strong>${formatMoney(m.salario_fixo)}</strong></td>
                  <td>
                    <div style="color:#28a745;font-weight:600">${formatMoney(m.kmValor)}</div>
                    <div class="small text-muted">${m.km.toLocaleString()} km</div>
                  </td>
                  <td>
                    ${m.adiantamentos > 0 ? `<div style="color:#e67e22;font-weight:600">${formatMoney(m.adiantamentos)}</div><div class="small text-muted">Adiantamentos</div>` : ''}
                    ${m.descontos > 0 ? `<div style="color:#dc3545;font-weight:600">-${formatMoney(m.descontos)}</div><div class="small text-muted">Descontos</div>` : ''}
                    ${m.adiantamentos===0 && m.descontos===0 ? '<span class="text-muted small">-</span>' : ''}
                  </td>
                  <td>
                    <button class="btn-icon" title="Preferências" onclick="verPreferencias(${m.id},'${m.nome}')"><i class="bi bi-heart"></i></button>
                  </td>
                  <td>
                    <button class="btn-icon" title="Editar" onclick="motoristaForm(${m.id})"><i class="bi bi-pencil"></i></button>
                    <button class="btn-icon text-danger" title="Remover" onclick="removerMotorista(${m.id})"><i class="bi bi-trash"></i></button>
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

window.motoristaForm = async function(id) {
  let d = { nome:'', email:'', telefone:'', salario_fixo:1150, carta:'C+E', observacoes:'' };
  if (id) { const l = await API.motoristas(); d = l.find(m => m.id===id) || d; }
  modalForm(id?'Editar Motorista':'Novo Motorista', [
    { key:'nome', label:'Nome', value:d.nome },
    { key:'email', label:'Email', value:d.email||'' },
    { key:'telefone', label:'Telefone', value:d.telefone||'' },
    { key:'salario_fixo', label:'Salário Fixo (€)', type:'number', value:d.salario_fixo, step:'10' },
    { key:'carta', label:'Carta', value:d.carta||'C+E' },
    { key:'observacoes', label:'Observações', type:'textarea', value:d.observacoes||'' },
  ], async (data) => {
    if (id) await API.put('/motoristas/'+id, { ...data, ativo:1 });
    else await API.post('/motoristas', data);
    toast(id?'Atualizado!':'Cadastrado!');
    navigate('motoristas');
  });
};

window.removerMotorista = async function(id) {
  if (!confirm('Remover este motorista?')) return;
  await API.del('/motoristas/'+id);
  toast('Removido!'); navigate('motoristas');
};

window.verPreferencias = async function(motoristaId, nome) {
  const prefs = await API.get('/preferencias/'+motoristaId);
  const tipos = ['rota','posto','horario','descanso','geral'].map(t=>({value:t,text:t.charAt(0).toUpperCase()+t.slice(1)}));
  modalForm('Preferências - '+nome, [
    { key:'tipo', label:'Tipo', type:'select', options:tipos },
    { key:'descricao', label:'Descrição', value:'' },
    { key:'prioridade', label:'Prioridade', type:'number', value:1, min:1 },
  ], async (data) => {
    await API.post('/preferencias', { motorista_id:motoristaId, ...data });
    toast('Preferência adicionada!'); navigate('motoristas');
  });
};