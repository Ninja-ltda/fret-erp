window.PAGES = {};
let currentPage = 'dashboard';

function navigate(page) {
  currentPage = page;
  // Update active nav
  document.querySelectorAll('.btn-sidebar, .btn-mobile-nav').forEach(b => {
    b.classList.toggle('active', b.dataset.page === page);
  });
  // Load page
  const content = document.getElementById('pageContent');
  if (window.PAGES[page]) {
    // Show loading immediately
    content.innerHTML = '<div class="d-flex justify-content-center align-items-center py-5"><div class="spinner-border text-primary me-3" role="status"></div><span class="text-muted">Carregando...</span></div>';
    // Call the page renderer — catch & show any error
    Promise.resolve(window.PAGES[page](content)).catch(err => {
      console.error('Page error:', err);
      content.innerHTML = `<div class="alert alert-danger m-4">
        <strong>Erro ao carregar "${page}":</strong> ${err.message || err}
        <br><small>Verifica se o servidor está a correr.</small>
        <br><button class="btn-ghost btn-sm mt-2" onclick="navigate('${page}')">Tentar novamente</button>
      </div>`;
    });
  } else {
    content.innerHTML = `<div class="alert alert-warning m-4">Página "${page}" não encontrada.</div>`;
  }
}

function initApp() {
  console.log('FRET iniciado. Páginas disponíveis:', Object.keys(window.PAGES));
  navigate('dashboard');
}

// Aguarda o DOM carregar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}