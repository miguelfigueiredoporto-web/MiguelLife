// nav.js — navegação partilhada (sem ES modules para compatibilidade directa com browser)

(function () {
  const ITEMS = [
    { id: 'dashboard',      label: 'Dashboard',      href: 'dashboard.html',      icon: 'layout-dashboard' },
    { id: 'imoveis',        label: 'Imóveis',         href: 'imoveis.html',        icon: 'building-2' },
    { id: 'arrendamentos',  label: 'Arrendamentos',   href: 'arrendamentos.html',  icon: 'key-round' },
    { id: 'rendimentos',    label: 'Rendimentos',     href: 'rendimentos.html',    icon: 'euro' },
    { id: 'despesas',       label: 'Despesas',        href: 'despesas.html',       icon: 'wallet' },
    { id: 'tarefas',        label: 'Tarefas',         href: 'tarefas.html',        icon: 'check-square' },
  ];

  // Detecta a página activa pelo nome do ficheiro
  function getActive() {
    const path = window.location.pathname.split('/').pop() || 'dashboard.html';
    if (path.startsWith('imovel')) return 'imoveis';
    const match = ITEMS.find(i => i.href === path);
    return match ? match.id : 'dashboard';
  }

  // ---- Sidebar (desktop) ----
  function buildSidebar(active) {
    const nav = document.getElementById('sidebar');
    if (!nav) return;

    nav.innerHTML = `
      <div class="sidebar-logo">
        <div class="sidebar-logo-mark">M</div>
        <span class="sidebar-logo-text">Miguel Life</span>
      </div>

      <div class="sidebar-section">
        ${ITEMS.map(item => `
          <a href="${item.href}" class="sidebar-item ${active === item.id ? 'active' : ''}" data-nav="${item.id}">
            <i data-lucide="${item.icon}" width="18" height="18"></i>
            <span>${item.label}</span>
          </a>
        `).join('')}
      </div>

      <div class="sidebar-bottom">
        <a href="definicoes.html" class="sidebar-item ${active === 'definicoes' ? 'active' : ''}">
          <i data-lucide="settings" width="18" height="18"></i>
          <span>Definições</span>
        </a>
        <button class="sidebar-item" id="btn-signout" style="width:100%;border:none;background:none;text-align:left;cursor:pointer;">
          <i data-lucide="log-out" width="18" height="18"></i>
          <span>Sair</span>
        </button>
      </div>
    `;
  }

  // ---- Bottom nav (mobile) ----
  function buildBottomNav(active) {
    const nav = document.getElementById('bottom-nav');
    if (!nav) return;

    nav.innerHTML = ITEMS.map(item => `
      <a href="${item.href}" class="nav-item ${active === item.id ? 'active' : ''}" data-nav="${item.id}">
        <i data-lucide="${item.icon}" width="22" height="22"></i>
        <span class="nav-label">${item.label}</span>
      </a>
    `).join('');
  }

  // ---- Sign out ----
  function bindSignOut() {
    const btn = document.getElementById('btn-signout');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      // Quando Supabase estiver configurado: await supabase.auth.signOut()
      window.location.href = 'index.html';
    });
  }

  // ---- Init ----
  function init() {
    const active = getActive();
    buildSidebar(active);
    buildBottomNav(active);
    bindSignOut();

    // Inicializa os ícones Lucide após injectar o HTML
    if (window.lucide) lucide.createIcons();
  }

  // Aguarda o DOM e os ícones Lucide
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
