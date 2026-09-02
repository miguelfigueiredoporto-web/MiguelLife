// === FORMATADORES ===

export function formatEUR(valor) {
  if (valor == null || isNaN(valor)) return '—';
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(valor);
}

export function formatEURCompact(valor) {
  if (valor == null || isNaN(valor)) return '—';
  if (Math.abs(valor) >= 1_000_000) {
    return (valor / 1_000_000).toFixed(1).replace('.', ',') + ' M€';
  }
  if (Math.abs(valor) >= 1_000) {
    return (valor / 1_000).toFixed(1).replace('.', ',') + ' k€';
  }
  return formatEUR(valor);
}

export function formatPct(valor, casas = 1) {
  if (valor == null || isNaN(valor)) return '—';
  return valor.toFixed(casas).replace('.', ',') + '%';
}

export function formatData(dataStr) {
  if (!dataStr) return '—';
  const d = new Date(dataStr);
  return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDataCurta(dataStr) {
  if (!dataStr) return '—';
  const d = new Date(dataStr);
  return d.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
}

export function mesAno(ano, mes) {
  const d = new Date(ano, mes - 1, 1);
  return d.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
}

// === CÁLCULOS FINANCEIROS ===

export function calcYieldBruta(rendaMensal, valorAquisicao) {
  if (!rendaMensal || !valorAquisicao) return null;
  return (rendaMensal * 12 / valorAquisicao) * 100;
}

export function calcYieldLiquida(rendaMensal, custosAnuais, imposto, capitalProprio) {
  if (!rendaMensal || !capitalProprio) return null;
  const rendaAnual = rendaMensal * 12;
  const rendaLiquida = rendaAnual - (custosAnuais || 0) - (rendaAnual * (imposto || 0.28));
  return (rendaLiquida / capitalProprio) * 100;
}

export function calcImpostoRenda(rendaMensal, regime = 'taxa_autonoma') {
  const anual = rendaMensal * 12;
  if (regime === 'taxa_autonoma') return anual * 0.28;
  return null; // englobamento depende do escalão — calculado externamente
}

export function calcMaisValia(valorMercado, valorAquisicao, custosAquisicao = 0, obras = 0) {
  return valorMercado - valorAquisicao - custosAquisicao - obras;
}

// === DOM HELPERS ===

export function qs(sel, ctx = document) { return ctx.querySelector(sel); }
export function qsa(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }

export function el(tag, attrs = {}, ...children) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2).toLowerCase(), v);
    else e.setAttribute(k, v);
  }
  for (const child of children) {
    if (typeof child === 'string') e.insertAdjacentHTML('beforeend', child);
    else if (child) e.appendChild(child);
  }
  return e;
}

export function showLoading(containerId) {
  const c = document.getElementById(containerId);
  if (c) c.innerHTML = `<div class="loading-overlay"><div class="spinner"></div> A carregar…</div>`;
}

export function showEmpty(containerId, mensagem = 'Sem dados') {
  const c = document.getElementById(containerId);
  if (c) c.innerHTML = `<div class="empty-state"><h3>${mensagem}</h3></div>`;
}

// === TOAST ===

export function toast(mensagem, tipo = 'info', duracao = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const t = document.createElement('div');
  t.className = `toast toast-${tipo}`;
  t.textContent = mensagem;
  container.appendChild(t);

  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transition = 'opacity 0.3s';
    setTimeout(() => t.remove(), 300);
  }, duracao);
}

// === MODAL ===

export function openModal(id) {
  const m = document.getElementById(id);
  if (m) { m.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
}

export function closeModal(id) {
  const m = document.getElementById(id);
  if (m) { m.style.display = 'none'; document.body.style.overflow = ''; }
}

// Fechar modal ao clicar no overlay
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.style.display = 'none';
    document.body.style.overflow = '';
  }
});
