window.PAGES.dashboard = async function(el) {
  el.innerHTML = '<div class="d-flex justify-content-center align-items-center py-5"><div class="spinner-border text-primary me-3"></div><span class="text-muted">Carregando dados...</span></div>';

  try {
    const [data, fin, pag] = await Promise.all([
      API.dashboard(),
      API.financeiroGeral(),
      API.motoristasPagamentos()
    ]);

    el.innerHTML = `
      <h2 class="page-title"><i class="bi bi-speedometer2"></i> Painel</h2>

      <!-- CARDS — 2 por linha no mobile, 4 no desktop -->
      <div class="row g-2 mb-3">
        <div class="col-6 col-md-3">
          <div class="card-moderno d-flex align-items-center p-2 p-md-3">
            <div class="card-icon me-2"><i class="bi bi-map"></i></div>
            <div style="overflow:hidden"><div class="card-number" style="font-size:clamp(1.2rem,4vw,2.2rem)">${data.rotas_ativas}</div><div class="card-label" style="font-size:0.7rem">Rotas Ativas</div></div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card-moderno d-flex align-items-center p-2 p-md-3">
            <div class="card-icon me-2" style="color:#28a745"><i class="bi bi-check-circle"></i></div>
            <div style="overflow:hidden"><div class="card-number" style="font-size:clamp(1.2rem,4vw,2.2rem)">${data.rotas_concluidas}</div><div class="card-label" style="font-size:0.7rem">Concluídas</div></div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card-moderno d-flex align-items-center p-2 p-md-3">
            <div class="card-icon me-2"><i class="bi bi-people"></i></div>
            <div style="overflow:hidden"><div class="card-number" style="font-size:clamp(1.2rem,4vw,2.2rem)">${data.total_motoristas}</div><div class="card-label" style="font-size:0.7rem">Motoristas</div></div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card-moderno d-flex align-items-center p-2 p-md-3">
            <div class="card-icon me-2"><i class="bi bi-truck-front"></i></div>
            <div style="overflow:hidden"><div class="card-number" style="font-size:clamp(1.2rem,4vw,2.2rem)">${data.total_caminhoes}</div><div class="card-label" style="font-size:0.7rem">Camiões</div></div>
          </div>
        </div>
      </div>

      <div class="row g-3 mb-3">
        <div class="col-md-7">
          <div class="section-card"><h3><i class="bi bi-bar-chart"></i> KMs Mensais</h3><div style="height:200px;max-height:200px;overflow:hidden"><canvas id="graficoKm" style="height:180px!important"></canvas></div></div>
        </div>
        <div class="col-md-5">
          <div class="section-card" style="max-height:300px;overflow-y:auto">
            <h3><i class="bi bi-truck"></i> Em Rota Agora</h3>
            ${data.motoristas_ativos_rota.length===0?'<p class="text-muted mt-2 small">Nenhum motorista em rota.</p>':data.motoristas_ativos_rota.map(m=>`
              <div class="d-flex align-items-center justify-content-between py-2 border-bottom"><div><strong>${m.nome}</strong><br><small class="text-muted">${m.rota}</small></div>${statusBadge(m.status)}</div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- 💰 TABELA DE PAGAMENTOS POR MOTORISTA -->
      <div class="section-card mb-3">
        <h3><i class="bi bi-cash-stack"></i> Pagamentos por Motorista <small class="text-muted" style="font-weight:400">(€0,13/km)</small></h3>
        <div class="table-responsive-scroll">
          <table class="table-moderna">
            <thead><tr><th>Motorista</th><th>Km Rodados</th><th class="text-end">A Receber</th><th class="text-end">Adiantamentos</th><th class="text-end">Saldo</th></tr></thead>
            <tbody>
              ${pag.length===0 ? '<tr><td colspan="5" class="text-muted text-center">Nenhum dado disponível</td></tr>' : pag.map(p => {
                const saldo = p.valor_receber - p.adiantamentos;
                return `<tr>
                  <td><strong>${p.nome}</strong></td>
                  <td>${(p.km_total/1000).toFixed(1)}k</td>
                  <td class="text-end fw-bold" style="color:#c0392b">${formatMoney(p.valor_receber)}</td>
                  <td class="text-end">${formatMoney(p.adiantamentos)}</td>
                  <td class="text-end fw-bold" style="color:${saldo>=0?'#c0392b':'#27ae60'}">${formatMoney(saldo)}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Últimas Rotas -->
      <div class="section-card mb-3">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h3 class="mb-0"><i class="bi bi-clock-history"></i> Últimas Rotas</h3>
          <button class="btn-ghost btn-sm" onclick="navigate('rotas')">Ver Todas →</button>
        </div>
        <div class="table-responsive-scroll">
          <table class="table-moderna">
            <thead><tr><th>Rota</th><th>Origem → Destino</th><th class="hide-mobile">Data</th><th>Motorista</th><th>Status</th></tr></thead>
            <tbody>
              ${data.ultimas_rotas.map(r=>`
                <tr>
                  <td><strong>${r.nome}</strong></td>
                  <td>${r.origem} → ${r.destino}</td>
                  <td class="hide-mobile">${formatDate(r.data_saida)}</td>
                  <td>${r.motorista_nome||'-'}</td>
                  <td>${statusBadge(r.status)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Resumo Financeiro -->
      <div class="row g-3 mt-2">
        <div class="col-4"><div class="card-moderno text-center p-2 p-md-3"><div class="card-label" style="font-size:0.7rem">Km Total Geral</div><div class="card-number" style="font-size:clamp(1rem,3vw,1.8rem)">${(fin.km_total_geral/1000).toFixed(1)}k</div></div></div>
        <div class="col-4"><div class="card-moderno text-center p-2 p-md-3"><div class="card-label" style="font-size:0.7rem">A Pagar (0,13€)</div><div class="card-number" style="font-size:clamp(1rem,3vw,1.8rem);color:#c0392b">${formatMoney(fin.valor_km_total)}</div></div></div>
        <div class="col-4"><div class="card-moderno text-center p-2 p-md-3"><div class="card-label" style="font-size:0.7rem">Adiantamentos</div><div class="card-number" style="font-size:clamp(1rem,3vw,1.8rem);color:#e67e22">${formatMoney(fin.total_adiantamentos)}</div></div></div>
      </div>
    `;

    const canvas = document.getElementById('graficoKm');
    if (canvas) {
      canvas.style.height='180px';canvas.style.maxHeight='180px';
      new Chart(canvas.getContext('2d'),{
        type:'line',
        data:{labels:['Jan','Fev','Mar','Abr','Mai','Jun'],datasets:[{label:'Km',data:[18500,19200,18800,20500,19800,data.km_total_mes],borderColor:'#1a3a5c',backgroundColor:'rgba(26,58,92,0.08)',tension:0.3,fill:true,pointRadius:4,pointBackgroundColor:'#1a3a5c'}]},
        options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,grid:{color:'#f0f0f0'},ticks:{font:{size:11}}},x:{grid:{display:false},ticks:{font:{size:11}}}}}
      });
    }
  } catch (e) {
    el.innerHTML = `<div class="alert alert-danger m-4"><strong>Erro:</strong> ${e.message}<br><button class="btn-ghost btn-sm mt-2" onclick="navigate('dashboard')">Tentar novamente</button></div>`;
  }
};