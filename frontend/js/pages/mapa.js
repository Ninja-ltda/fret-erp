window.PAGES.mapa = async function(el) {
  el.innerHTML = '<div class="d-flex justify-content-center align-items-center py-5"><div class="spinner-border text-primary me-3"></div><span class="text-muted">Carregando mapa...</span></div>';

  try {
    const dados = await API.get('/mapa/completo');

    el.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h2 class="page-title mb-0"><i class="bi bi-geo-alt"></i> Mapa de Operações</h2>
        <div class="d-flex gap-2 align-items-center">
          <div class="d-flex gap-2 small me-3">
            <span>🟢 Em curso</span><span>🟡 Planejada</span>
            <span>🟣 IDS</span><span>🔵 DKV</span><span>🟠 Repsol</span>
          </div>
          <select id="tileSelector" class="form-control-moderno" style="width:auto;padding:6px 10px;font-size:0.85rem" onchange="trocarMapa()">
            <option value="osm">🗺️ Mapa Padrão</option>
            <option value="sat">🛰️ Satélite</option>
          </select>
        </div>
      </div>
      <div class="section-card p-0" style="overflow:hidden">
        <div id="mapaFretFull" style="height:calc(100vh - 160px);width:100%;border-radius:12px;z-index:1;cursor:grab;min-height:500px"></div>
      </div>
      <div class="row g-2 mt-2">
        ${dados.geoRotas.map(r => `
          <div class="col-md-4 col-lg-3">
            <div class="card-moderno p-2 small">
              <strong>${r.origem} → ${r.destino}</strong>
              <span class="badge ${r.status==='em_andamento'?'bg-success':'bg-warning text-dark'}">${r.status==='em_andamento'?'Em curso':'Planejada'}</span>
              <div class="text-muted mt-1">${r.distancia_km}km · ${r.motorista||'Sem motorista'}</div>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="small text-muted mt-1">
        ⛽ ${dados.postos.length} postos no mapa — <span class="text-primary">IDS</span> <span class="text-primary">DKV</span> <span class="text-warning">Repsol</span> com ícones coloridos. Clique nos postos e nas linhas das rotas para ver detalhes.
      </div>
    `;

    setTimeout(() => initMapaDedicado(dados, 'osm'), 200);

  } catch (e) {
    el.innerHTML = `<div class="alert alert-danger m-4">Erro: ${e.message}<br><button class="btn-ghost btn-sm mt-2" onclick="navigate('mapa')">Tentar novamente</button></div>`;
  }
};

let mapaFretFull = null;
let currentTile = 'osm';

window.trocarMapa = function() {
  const tipo = document.getElementById('tileSelector').value;
  currentTile = tipo;
  if (mapaFretFull) {
    mapaFretFull.eachLayer(layer => {
      if (layer instanceof L.TileLayer) {
        mapaFretFull.removeLayer(layer);
      }
    });
    const tileUrl = tipo === 'sat'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const attr = tipo === 'sat' ? '&copy; Esri' : '&copy; OpenStreetMap';
    L.tileLayer(tileUrl, { attribution: attr, maxZoom: 19 }).addTo(mapaFretFull);
  }
};

function initMapaDedicado(dados, tile) {
  const el = document.getElementById('mapaFretFull');
  if (!el || !window.L) return;
  el._leaflet_id = null;
  if (mapaFretFull) { mapaFretFull.remove(); mapaFretFull = null; }

  const mapa = L.map('mapaFretFull', { center: [46.2, 1.5], zoom: 5, scrollWheelZoom: true, zoomControl: true });
  mapaFretFull = mapa;

  const tileUrl = tile === 'sat'
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const attr = tile === 'sat' ? '&copy; Esri' : '&copy; OpenStreetMap';
  L.tileLayer(tileUrl, { attribution: attr, maxZoom: 19 }).addTo(mapa);

  // Postos
  const iconsPosto = {
    'IDS': '<div style="width:24px;height:24px;border-radius:50%;background:#8b5cf6;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:bold;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)">I</div>',
    'DKV': '<div style="width:24px;height:24px;border-radius:50%;background:#3b82f6;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:bold;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)">D</div>',
    'Repsol': '<div style="width:24px;height:24px;border-radius:50%;background:#f97316;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:bold;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)">R</div>',
  };

  dados.postos.forEach(p => {
    if (!p.latitude || !p.longitude) return;
    L.marker([p.latitude, p.longitude], {
      icon: L.divIcon({ className:'posto-icon', html: iconsPosto[p.empresa] || iconsPosto['outro'], iconSize:[24,24], iconAnchor:[12,12] }),
    }).bindTooltip(`<strong>${p.empresa} · ${p.nome}</strong><br>${p.localizacao}`, { direction:'top' }).addTo(mapa);
  });

  // Linhas de rota (OSRM routing)
  dados.geoRotas.filter(r => r.origemCoord && r.destinoCoord).forEach((rota, idx) => {
    setTimeout(() => {
      fetch(`https://router.project-osrm.org/route/v1/driving/${rota.origemCoord[1]},${rota.origemCoord[0]};${rota.destinoCoord[1]},${rota.destinoCoord[0]}?overview=full&geometries=geojson`)
        .then(r => r.json()).then(rd => {
          if (rd.code==='Ok' && rd.routes?.[0]) {
            const coords = rd.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
            const ativa = rota.status==='em_andamento';
            L.polyline(coords, { color:ativa?'#22c55e':'#eab308', weight:ativa?4:3, opacity:0.75 })
              .bindPopup(`<strong>${rota.nome}</strong><br>${rota.distancia_km}km${rota.motorista?'<br>🚛 '+rota.motorista:''}${rota.caminhao?'<br>📋 '+rota.caminhao:''}`).addTo(mapa);
          }
        }).catch(() => drawLine(rota, mapa));
    }, idx * 400);
  });

  // Labels países
  [[39.5,-8],[40.8,-4],[46.7,2.5],[50.5,4.5],[52,5.5]].forEach(([la,lo], i) => {
    L.circleMarker([la,lo], { radius:4, fillColor:'#1a3a5c', color:'#1a3a5c', fillOpacity:0.3, weight:1 }).addTo(mapa);
  });
  const nomes = ['🇵🇹 Portugal','🇪🇸 Espanha','🇫🇷 França','🇧🇪 Bélgica','🇳🇱 Holanda'];
  [[39.5,-8],[40.8,-4],[46.7,2.5],[50.5,4.5],[52,5.5]].forEach(([la,lo],i)=>{
    L.marker([la,lo],{interactive:false,icon:L.divIcon({className:'cl',html:`<div style="background:rgba(26,58,92,0.85);color:#fff;padding:3px 10px;border-radius:6px;font-size:13px;font-weight:600;white-space:nowrap">${nomes[i]}</div>`,iconSize:[130,22],iconAnchor:[65,11]})}).addTo(mapa);
  });

  setTimeout(() => mapa.invalidateSize(), 500);
}

function drawLine(rota, mapa) {
  const a = rota.status==='em_andamento';
  L.polyline([rota.origemCoord, rota.destinoCoord], { color:a?'#22c55e':'#eab308', weight:a?3:2, opacity:0.6, dashArray:a?null:'10,6' }).bindPopup(`<strong>${rota.nome}</strong><br>${rota.distancia_km}km`).addTo(mapa);
}