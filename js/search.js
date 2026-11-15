/**
 * SIGA - Sistema Integrado de Gestão de Ambientes
 * MVP 1 - Consulta de Solicitação por Protocolo (RN19 e Item 8)
 * Instituto Consenso - Convergência em Saúde
 */

class SigaSearch {
  constructor() {
    this.searchedProtocol = '';
  }

  setProtocol(protocol) {
    this.searchedProtocol = protocol;
    this.render();
  }

  render() {
    const container = document.getElementById('search-view-container');
    if (!container) return;

    const allReservations = store.getReservations();
    const result = this.searchedProtocol ? store.findByProtocol(this.searchedProtocol) : null;

    container.innerHTML = `
      <div class="max-w-3xl mx-auto">
        <!-- Cabeçalho -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#151E3B]/10 text-[#151E3B] mb-2">
            <i data-lucide="search" class="w-3.5 h-3.5 text-[#F6A723]"></i>
            Acompanhamento do Solicitante (RN19)
          </div>
          <h2 class="text-2xl md:text-3xl font-black text-slate-900">
            Consultar Situação da Reserva
          </h2>
          <p class="text-xs md:text-sm text-slate-500 mt-1 max-w-lg mx-auto">
            Informe o número de protocolo único no formato <strong>SIGA-AAAA-NNN</strong> para acompanhar a análise e liberação pelos administradores.
          </p>
        </div>

        <!-- Barra de Busca -->
        <div class="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm mb-6 flex items-center gap-2">
          <div class="relative flex-1">
            <i data-lucide="hash" class="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"></i>
            <input 
              type="text" 
              id="search-protocol-input" 
              value="${this.searchedProtocol || ''}"
              placeholder="Digite o protocolo (ex.: SIGA-2026-001)"
              class="w-full pl-11 pr-4 py-3 bg-transparent text-sm font-mono font-bold text-slate-900 uppercase focus:outline-none placeholder:font-sans placeholder:font-normal placeholder:text-slate-400"
            />
          </div>
          <button 
            type="button" 
            id="search-protocol-btn"
            class="px-6 py-3 bg-[#151E3B] hover:bg-[#1E294B] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0"
          >
            <i data-lucide="search" class="w-4 h-4 text-[#F6A723]"></i>
            <span>Consultar</span>
          </button>
        </div>

        <!-- Atalhos rápidos com as últimas reservas -->
        <div class="mb-8 flex items-center gap-2 overflow-x-auto pb-2 text-xs">
          <span class="text-slate-400 font-semibold whitespace-nowrap">Recentes:</span>
          ${allReservations.slice(-5).reverse().map(r => `
            <button 
              type="button" 
              data-quick-proto="${r.protocol}"
              class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] font-bold transition-colors whitespace-nowrap"
            >
              ${r.protocol}
            </button>
          `).join('')}
        </div>

        <!-- Resultado da Consulta -->
        ${this.searchedProtocol ? (result ? this.renderResultCard(result) : this.renderNotFound()) : ''}
      </div>
    `;

    this.bindEvents();
    if (window.lucide) lucide.createIcons();
  }

  renderResultCard(res) {
    const room = SIGA_ROOMS.find(r => r.id === res.roomId) || { name: res.roomId, location: 'Instalações' };
    const isApproved = res.status === 'Aprovada';
    const isPending = res.status === 'Pendente';
    const isRejected = res.status === 'Recusada';
    const isExpired = res.status === 'Expirada';

    let statusBadge = '';
    if (isApproved) {
      statusBadge = '<span class="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">Aprovada / Bloqueada no Calendário</span>';
    } else if (isPending) {
      statusBadge = '<span class="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">Pendente de Liberação</span>';
    } else if (isRejected) {
      statusBadge = '<span class="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">Recusada (Horário Liberado)</span>';
    } else {
      statusBadge = '<span class="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">Expirada</span>';
    }

    return `
      <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <!-- Topo com Status e Protocolo -->
        <div class="p-6 md:p-8 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="mb-2">${statusBadge}</div>
            <h3 class="text-xl md:text-2xl font-bold text-slate-900">
              ${res.eventName}
            </h3>
            <p class="text-xs text-slate-500 font-mono mt-0.5">
              Protocolo: <strong>${res.protocol}</strong> · Registrado em ${new Date(res.createdAt).toLocaleString('pt-BR')}
            </p>
          </div>

          <div class="text-right">
            <span class="text-xs font-bold uppercase text-slate-400 block">Ambiente</span>
            <span class="text-lg font-black text-[#151E3B]">${room.name}</span>
          </div>
        </div>

        <!-- Linha do Tempo do Ciclo de Vida -->
        <div class="p-6 border-b border-slate-100 bg-white">
          <div class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Ciclo de Análise da Solicitação (RN09 a RN11)
          </div>
          <div class="grid grid-cols-3 gap-2 text-center text-xs">
            <!-- Passo 1 -->
            <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
              <div class="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold mx-auto flex items-center justify-center text-[10px] mb-1">
                ✓
              </div>
              <span class="font-bold block">1. Registrada</span>
              <span class="text-[10px] text-emerald-600">Protocolo Gerado</span>
            </div>

            <!-- Passo 2 -->
            <div class="p-3 rounded-xl ${isPending ? 'bg-amber-50 border border-amber-300 text-amber-900 animate-pulse' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'}">
              <div class="w-6 h-6 rounded-full ${isPending ? 'bg-amber-500' : 'bg-emerald-600'} text-white font-bold mx-auto flex items-center justify-center text-[10px] mb-1">
                ${isPending ? '2' : '✓'}
              </div>
              <span class="font-bold block">2. Notificação</span>
              <span class="text-[10px] ${isPending ? 'text-amber-700' : 'text-emerald-600'}">3 Admins Notificados</span>
            </div>

            <!-- Passo 3 -->
            <div class="p-3 rounded-xl ${isApproved ? 'bg-rose-50 border border-rose-300 text-rose-900' : isRejected ? 'bg-slate-100 border border-slate-300 text-slate-700' : 'bg-slate-50 border border-slate-200 text-slate-400'}">
              <div class="w-6 h-6 rounded-full ${isApproved ? 'bg-rose-600' : isRejected ? 'bg-slate-600' : 'bg-slate-300'} text-white font-bold mx-auto flex items-center justify-center text-[10px] mb-1">
                ${isApproved || isRejected ? '✓' : '3'}
              </div>
              <span class="font-bold block">3. Decisão Final</span>
              <span class="text-[10px]">
                ${isApproved ? 'Aprovada' : isRejected ? 'Recusada' : 'Aguardando'}
              </span>
            </div>
          </div>
        </div>

        <!-- Dados da Reserva -->
        <div class="p-6 md:p-8 space-y-4 text-xs">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 bg-slate-50 rounded-2xl">
              <span class="font-bold text-slate-500 uppercase block mb-1">Data e Horário</span>
              <div class="text-sm font-bold text-slate-800">
                📅 ${res.date.split('-').reverse().join('/')}
              </div>
              <div class="text-slate-600 mt-0.5">
                ⏰ Das <strong>${res.startTime}</strong> às <strong>${res.endTime}</strong>
              </div>
            </div>

            <div class="p-4 bg-slate-50 rounded-2xl">
              <span class="font-bold text-slate-500 uppercase block mb-1">Responsável</span>
              <div class="text-sm font-bold text-slate-800">
                👤 ${res.requesterName}
              </div>
              <div class="text-slate-600 mt-0.5">
                ✉️ ${res.requesterEmail} · 👥 <strong>${res.participants} pessoas</strong>
              </div>
            </div>
          </div>

          <!-- Decisão Registrada (se houver) -->
          ${res.decidedBy ? `
            <div class="p-4 rounded-2xl border ${isApproved ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' : 'bg-rose-50/70 border-rose-200 text-rose-950'}">
              <span class="font-bold uppercase tracking-wider text-[11px] block mb-1">
                Registro de Decisão da Administração (RN10 / RN14):
              </span>
              <div class="text-xs">
                Decidido por: <strong>${res.decidedBy}</strong> em <strong>${new Date(res.decidedAt).toLocaleString('pt-BR')}</strong>
              </div>
              ${res.rejectionReason ? `
                <div class="mt-2 p-3 bg-white/80 rounded-xl border border-rose-200 text-xs text-rose-900">
                  <strong>Justificativa da Recusa (RN17):</strong> ${res.rejectionReason}
                </div>
              ` : ''}
            </div>
          ` : ''}
        </div>

        <!-- Ações do Rodapé -->
        <div class="p-4 md:p-6 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button 
            type="button" 
            onclick="window.app.navigateToCalendar('${res.roomId}')"
            class="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors inline-flex items-center gap-2"
          >
            <i data-lucide="calendar" class="w-4 h-4"></i>
            Visualizar no Calendário
          </button>

          <!-- Se for pendente, permite simular o reenvio (FA01 do UC05) -->
          ${isPending ? `
            <button 
              type="button" 
              id="resend-notification-btn"
              class="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors inline-flex items-center gap-2"
            >
              <i data-lucide="send" class="w-4 h-4"></i>
              Reenviar Notificação aos Administradores (FA01)
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  renderNotFound() {
    return `
      <div class="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center">
        <div class="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <i data-lucide="file-question" class="w-7 h-7"></i>
        </div>
        <h3 class="text-lg font-bold text-slate-900 mb-1">Protocolo Não Encontrado</h3>
        <p class="text-xs text-slate-500 max-w-sm mx-auto mb-4">
          Não localizamos nenhuma reserva com o protocolo "<strong>${this.searchedProtocol}</strong>". Verifique se digitou corretamente o código.
        </p>
      </div>
    `;
  }

  bindEvents() {
    const input = document.getElementById('search-protocol-input');
    const btn = document.getElementById('search-protocol-btn');

    const doSearch = () => {
      const val = input ? input.value.trim().toUpperCase() : '';
      if (!val) {
        window.app.showToast('info', 'Por favor, digite o número do protocolo.');
        return;
      }
      this.searchedProtocol = val;
      this.render();
    };

    if (btn) btn.onclick = doSearch;
    if (input) {
      input.onkeydown = (e) => {
        if (e.key === 'Enter') doSearch();
      };
    }

    // Atalhos rápidos
    document.querySelectorAll('[data-quick-proto]').forEach(b => {
      b.onclick = () => {
        const proto = b.getAttribute('data-quick-proto');
        this.searchedProtocol = proto;
        this.render();
      };
    });

    // Reenvio manual (FA01 do UC05)
    const resendBtn = document.getElementById('resend-notification-btn');
    if (resendBtn) {
      resendBtn.onclick = () => {
        window.app.showToast('success', 'E-mails de notificação reenviados com sucesso aos 3 administradores.');
      };
    }
  }
}
