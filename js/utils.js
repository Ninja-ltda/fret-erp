function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }

function toast(msg, type = 'success') {
  const colors = { success: '#28a745', danger: '#dc3545', warning: '#fd7e14', info: '#17a2b8' };
  const container = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = `toast align-items-center text-white border-0 show`;
  el.style.background = colors[type] || colors.info;
  el.role = 'alert';
  el.innerHTML = `<div class="d-flex"><div class="toast-body">${msg}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>`;
  container.appendChild(el);
  const bsToast = new bootstrap.Toast(el, { autohide: true, delay: 3000 });
  bsToast.show();
  el.addEventListener('hidden.bs.toast', () => el.remove());
}

function loadingSpinner(text = 'Carregando...') {
  return `<div class="d-flex justify-content-center align-items-center py-5"><div class="spinner-border text-primary me-3" role="status"></div><span class="text-muted">${text}</span></div>`;
}

function statusBadge(status) {
  const map = {
    'planejada': 'status-planejada', 'pendente': 'status-pendente',
    'em_andamento': 'status-em_andamento', 'aceite': 'status-aceite',
    'em_rota': 'status-em_rota',
    'concluida': 'status-concluida', 'concluido': 'status-concluido',
    'cancelada': 'status-cancelada', 'cancelado': 'status-cancelado',
  };
  const cls = map[status] || 'status-planejada';
  const label = status.replace(/_/g, ' ');
  return `<span class="status-badge ${cls}">${label}</span>`;
}

function modalForm(title, fields, onSubmit) {
  const modal = document.createElement('div');
  modal.className = 'modal fade';
  modal.tabIndex = -1;
  modal.innerHTML = `
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title fw-bold">${title}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          ${fields.map(f => {
            if (f.type === 'select') {
              return `<div class="mb-3"><label>${f.label}</label>
                <select class="form-control-moderno" id="mf-${f.key}">${(f.options||[]).map(o => `<option value="${o.value}">${o.text}</option>`).join('')}</select></div>`;
            }
            if (f.type === 'textarea') {
              return `<div class="mb-3"><label>${f.label}</label>
                <textarea class="form-control-moderno" id="mf-${f.key}" rows="2">${f.value||''}</textarea></div>`;
            }
            return `<div class="mb-3"><label>${f.label}</label>
              <input type="${f.type||'text'}" class="form-control-moderno" id="mf-${f.key}" value="${f.value||''}" ${f.step?`step="${f.step}"`:''} ${f.min?`min="${f.min}"`:''}></div>`;
          }).join('')}
        </div>
        <div class="modal-footer">
          <button class="btn-ghost btn-sm" data-bs-dismiss="modal">Cancelar</button>
          <button class="btn-primary-custom btn-sm" id="mf-submit">Salvar</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();
  modal.querySelector('#mf-submit').onclick = async () => {
    const data = {};
    fields.forEach(f => {
      const el = document.getElementById(`mf-${f.key}`);
      if (f.type === 'number' || f.type === 'range') data[f.key] = parseFloat(el.value) || 0;
      else data[f.key] = el.value;
    });
    await onSubmit(data);
    bsModal.hide();
    modal.remove();
  };
  modal.addEventListener('hidden.bs.modal', () => modal.remove());
}

function formatMoney(v) {
  return '€ ' + Number(v).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('pt-PT');
}

function dataHoje() {
  return new Date().toISOString().split('T')[0];
}

function relogio() {
  const now = new Date();
  document.getElementById('relogio').textContent = now.toLocaleTimeString('pt-PT');
}
setInterval(relogio, 1000);