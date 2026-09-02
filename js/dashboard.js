// dashboard.js — lógica do dashboard principal

import { supabase } from './supabase.js';
import { formatEUR, formatEURCompact, formatPct } from './utils.js';

// TODO: substituir por dados reais do Supabase
const DEMO = {
  rendimentoMensal: 4850,
  despesasFixas: 1230,
  saldoMensal: 3620,
  patrimonioTotal: 890000,
  imoveis: 720000,
  etfs: 142000,
  outros: 28000,
};

export async function initDashboard() {
  renderStats(DEMO);
  renderChart(DEMO);
}

function renderStats(d) {
  document.getElementById('stat-rendimento').textContent  = formatEURCompact(d.rendimentoMensal);
  document.getElementById('stat-despesas').textContent    = formatEURCompact(d.despesasFixas);
  document.getElementById('stat-saldo').textContent       = formatEURCompact(d.saldoMensal);
  document.getElementById('stat-patrimonio').textContent  = formatEURCompact(d.patrimonioTotal);
}

function renderChart(d) {
  const ctx = document.getElementById('chart-patrimonio');
  if (!ctx || !window.Chart) return;

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Imóveis', 'ETFs', 'Outros'],
      datasets: [{
        data: [d.imoveis, d.etfs, d.outros],
        backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b'],
        borderColor: '#17171e',
        borderWidth: 3,
        hoverOffset: 6,
      }],
    },
    options: {
      responsive: true,
      cutout: '72%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#9090a8', font: { size: 12 }, padding: 16 },
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${formatEURCompact(ctx.raw)} (${formatPct(ctx.raw / [d.imoveis, d.etfs, d.outros].reduce((a,b)=>a+b,0) * 100, 0)})`,
          },
        },
      },
    },
  });
}
