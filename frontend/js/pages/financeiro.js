window.PAGES.financeiro = async function(el) {
  el.innerHTML = loadingSpinner();

  try {
    const motoristas = await API.motoristas();
    const fin = await API.financeiroGeral();

    // Buscar cálculo de cada motorista (via view)
    const calcPromises = motoristas.map(async m => {
      const km = await API.get(`/rotas`).then(rotas => {
        // Calcula do lado do cliente com base nas atribuições
        const totalKm = rotas
          .filter(r => r.motorista_nome === m.nome && r.atribuicao_status === 'concluido')
          .reduce((acc, r) => acc + (r.km_rodados || 0), 0);
        const descontos = await API.get(`/descontos/${m.id}`).catch(() => []);
        const totalDesc = descontos.reduce((a, d) => a + d.valor, 0);
        const kmValor = totalKm * 0.13;
        return { km: totalKm, kmValor, descontos: totalDesc, total: m.salario_fixo + kmValor - totalDesc };
      }).catch(() => ({ km: 0, kmValor: 0, descontos: 0, total: m.salario_fixo }));
      return { ...m, ...km };
    });

    const resultados = await Promise.all(calcPromises);

    el.innerHTML = `
      <h2 class="page-title"><i class="bi bi-cash-coin"></i> Financeiro</h2>

      <!-- RESUMO GERAL -->
      <div class="row g-3 mb-4">
        <div class="col-md-4">
          <div class="card-moderno text-center">
            <div class="card-label">Custo Total Km (€0,13)</div>
            <div class="card-number" style="color:#28a745">${formatMoney(fin.valor_km_total)}</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card-moderno text-center">
            <div class="card-label">Total Adiantamentos</div>
            <div class="card-number" style="color:#dc3545">${formatMoney(fin.total_adiantamentos)}</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card-moderno text-center">
            <div class="card-label">Km Totais</div>
            <div class="card-number">${(fin.km_total_geral / 1000).toFixed(1)}k</div>
          </div>
        </div>
      </div>

      <!-- TABELA MOTORISTAS -->
      <div class="section-card">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h3 class="mb-0"><i class="bi bi-calculator"></i> Cálculo Salarial por Motorista</h3>
        </div>
        <div class="table-responsive">
          <table class="table-moderna">
            <thead><tr>
              <th>Motorista</th><th>Salário Base</th><th>Km Total</th><th>Valor Km (€0,13)</th><th>Descontos</th><th>Total a Receber</th><th>Ações</th>
            </tr></thead>
            <tbody>
              ${resultados.length === 0 ? '<tr><td colspan="7" class="text-center text-muted py-4">Nenhum motorista.</td></tr>' : ''}
              ${resultados.map(m => `
                <tr>
                  <td><strong>${m.nome}</strong></td>
                  <td>${formatMoney(m.salario_fixo)}</td>
                  <td>${m.km} km</td>
                  <td>${formatMoney(m.kmValor)}</td>
                  <td class="text-danger">-${formatMoney(m.descontos)}</td>
                  <td><strong style="color:#28a745">${formatMoney(m.total)}</strong></td>
                  <td>
                    <button class="btn-icon" title="Adicionar Desconto" onclick="descontoForm(${m.id},'${m.nome}')">
                      <i class="bi bi-dash-circle text-danger"></i>
                    </button>
                    <button class="btn-icon" title="Abastecimentos" onclick="abastecimentoForm()">
                      <i class="bi bi-fuel-pump"></i>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- SEÇÃO DE ABASTECIMENTO -->
      <div class="row g-3 mt-2">
        <div class="col-md-6">
          <div class="section-card">
            <h3><i class="bi bi-fuel-pump"></i> Custos Abastecimento</h3>
            <p class="text-muted small">Registe os abastecimentos na página de Rotas → atribua uma rota primeiro, depois adicione os abastecimentos.</p>
            <button class="btn-ghost btn-sm" onclick="abastecimentoForm()">Registar Abastecimento</button>
          </div>
        </div>
        <div class="col-md-6">
          <div class="section-card">
            <h3><i class="bi bi-piggy-bank"></i> Resumo Rápido</h3>
            <div class="row text-center g-2 mt-2">
              <div class="col-6">
                <div class="p-2" style="background:#f8f9fa;border-radius:10px">
                  <div class="small text-muted">Salários Base</div>
                  <strong>${formatMoney(resultados.reduce((a,m) => a + m.salario_fixo, 0))}</strong>
                </div>
              </div>
              <div class="col-6">
                <div class="p-2" style="background:#f8f9fa;border-radius:10px">
                  <div class="small text-muted">Km a Pagar</div>
                  <strong>${formatMoney(resultados.reduce((a,m) => a + m.kmValor, 0))}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (e) {
    el.innerHTML = `<div class="alert alert-danger m-4">${e.message}</div>`;
  }
};

window.descontoForm = async function(motoristaId, nome) {
  modalForm(`Desconto - ${nome}`, [
    { key: 'motorista_id', label: '', type: 'hidden', value: motoristaId },
    { key: 'valor', label: 'Valor do Desconto (€)', type: 'number', value: 0, step: '1' },
    { key: 'motivo', label: 'Motivo', value: '' },
    { key: 'observacoes', label: 'Observações', type: 'textarea', value: '' },
  ], async (data) => {
    await API.post('/descontos', data);
    toast('Desconto registado!');
    navigate('financeiro');
  });
};

window.abastecimentoForm = async function() {
  const postos = await API.postos();

  modalForm('Registar Abastecimento', [
    { key: 'atribuicao_id', label: 'ID da Atribuição (rota)', type: 'number', value: 0 },
    { key: 'posto_id', label: 'Posto', type: 'select',
      options: postos.map(p => ({ value: p.id, text: `${p.nome} - ${p.empresa}` })) },
    { key: 'litros', label: 'Litros', type: 'number', value: 0, step: '0.1' },
    { key: 'valor_total', label: 'Valor Total (€)', type: 'number', value: 0, step: '0.01' },
    { key: 'tipo_combustivel', label: 'Tipo', type: 'select',
      options: [{ value: 'diesel', text: 'Diesel' }, { value: 'gasolina', text: 'Gasolina' }, { value: 'adblue', text: 'AdBlue' }] },
    { key: 'observacoes', label: 'Observações', type: 'textarea', value: '' },
  ], async (data) => {
    data.posto_id = parseInt(data.posto_id);
    await API.post('/abastecimentos', data);
    toast('Abastecimento registado!');
    navigate('financeiro');
  });
};