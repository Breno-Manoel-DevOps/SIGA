/**
 * SIGA - Sistema Integrado de Gestão de Ambientes
 * MVP 1 - UC02: Listar Ambientes
 * Instituto Consenso - Convergência em Saúde
 */

class SigaRooms {
  constructor() {
    this.rooms = SIGA_ROOMS;
  }

  // Gera ícone visual para o card do ambiente
  getRoomIconSvg(iconType) {
    switch (iconType) {
      case 'briefcase':
        return `<i data-lucide="briefcase" class="w-6 h-6 text-[#151E3B]"></i>`;
      case 'users':
        return `<i data-lucide="users" class="w-6 h-6 text-[#151E3B]"></i>`;
      case 'users-round':
        return `<i data-lucide="users-round" class="w-6 h-6 text-[#151E3B]"></i>`;
      case 'focus':
        return `<i data-lucide="target" class="w-6 h-6 text-[#151E3B]"></i>`;
      case 'mic':
        return `<i data-lucide="mic" class="w-6 h-6 text-purple-700"></i>`;
      case 'presentation':
        return `<i data-lucide="tv" class="w-6 h-6 text-amber-600"></i>`;
      case 'sun':
        return `<i data-lucide="sun" class="w-6 h-6 text-orange-600"></i>`;
      default:
        return `<i data-lucide="building" class="w-6 h-6 text-[#151E3B]"></i>`;
    }
  }

  render() {
    const container = document.getElementById('rooms-view-container');
    if (!container) return;

    const now = store.getSimulatedTime();
    const timeFormatted = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const dateFormatted = now.toLocaleDateString('pt-BR');

    container.innerHTML = `
      <div>
        <!-- Cabeçalho da Seção de Ambientes -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 class="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <i data-lucide="layout-grid" class="w-6 h-6 text-[#F6A723]"></i>
              Ambientes do Instituto Consenso
            </h2>
            <p class="text-sm text-slate-500 mt-1">
              Consulte a disponibilidade em tempo real, capacidade máxima e recursos multimídia dos 7 espaços fixos.
            </p>
          </div>

          <!-- Controles de Atualização e Info da Hora Simulada -->
          <div class="flex items-center gap-3">
            <div class="text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
              <span class="text-slate-400">Instante Atual:</span>
              <strong class="text-slate-800 ml-1">${dateFormatted} às ${timeFormatted}</strong>
            </div>

            <!-- Botão Atualizar (FA02 do UC02) -->
            <button 
              id="rooms-refresh-btn" 
              class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-xs transition-colors"
              title="Recalcular status atual dos 7 ambientes"
            >
              <i data-lucide="refresh-cw" class="w-3.5 h-3.5 text-slate-500"></i>
              <span>Atualizar</span>
            </button>
          </div>
        </div>

        <!-- Grade com exatamente os 7 Cards (RN01 e UC02) -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          ${this.rooms.map(room => {
            const statusInfo = SigaRules.getRoomCurrentStatus(room.id, now);
            const isFree = statusInfo.status === 'Livre';

            return `
              <div class="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group">
                <!-- Topo do Card -->
                <div class="p-5">
                  <div class="flex items-start justify-between gap-3 mb-3">
                    <div class="p-3 bg-slate-100 rounded-xl group-hover:scale-105 transition-transform">
                      ${this.getRoomIconSvg(room.id === 'sala-1' ? 'briefcase' : room.id === 'sala-2' ? 'users' : room.id === 'sala-3' ? 'users-round' : room.id === 'sala-4' ? 'focus' : room.id === 'sala-podcast' ? 'mic' : room.id === 'auditorio' ? 'presentation' : 'sun')}
                    </div>
                    <!-- Badge de Status em Tempo Real (RN16) -->
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${isFree ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}">
                      <span class="w-2 h-2 rounded-full ${isFree ? 'bg-emerald-500' : 'bg-rose-500'}"></span>
                      ${statusInfo.status.toUpperCase()} AGORA
                    </span>
                  </div>

                  <h3 class="text-lg font-bold text-slate-900 group-hover:text-[#151E3B] transition-colors">
                    ${room.name}
                  </h3>
                  <p class="text-xs text-slate-500 font-medium mt-0.5">
                    ${room.category} • ${room.location}
                  </p>

                  <p class="text-xs text-slate-600 mt-3 line-clamp-2">
                    ${room.description}
                  </p>

                  <!-- Métricas: Capacidade e Antecedência Mínima -->
                  <div class="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                    <div class="bg-slate-50 p-2 rounded-lg">
                      <div class="text-[10px] text-slate-400 uppercase font-semibold">Capacidade Máx.</div>
                      <div class="text-sm font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                        <i data-lucide="users" class="w-3.5 h-3.5 text-slate-500"></i>
                        ${room.capacity} pessoas
                      </div>
                    </div>

                    <div class="bg-slate-50 p-2 rounded-lg">
                      <div class="text-[10px] text-slate-400 uppercase font-semibold">Antecedência Mín.</div>
                      <div class="text-sm font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                        <i data-lucide="clock" class="w-3.5 h-3.5 text-slate-500"></i>
                        ${room.minNoticeLabel}
                      </div>
                    </div>
                  </div>

                  <!-- Recursos Disponíveis no Ambiente (RN08) -->
                  <div class="mt-4">
                    <div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Recursos Inclusos:</div>
                    <div class="flex flex-wrap gap-1.5">
                      ${room.resources.videoconferencia ? `
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          <i data-lucide="video" class="w-3 h-3"></i>
                          Videoconferência
                        </span>
                      ` : ''}

                      ${room.resources.gravacao ? `
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                          <i data-lucide="disc" class="w-3 h-3"></i>
                          Gravação ao Vivo
                        </span>
                      ` : ''}

                      ${room.resources.transmissao ? `
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                          <i data-lucide="radio" class="w-3 h-3"></i>
                          Transmissão
                        </span>
                      ` : ''}

                      ${!room.resources.videoconferencia && !room.resources.gravacao && !room.resources.transmissao ? `
                        <span class="text-xs text-slate-400 italic">
                          Sem recursos multimídia adicionais
                        </span>
                      ` : ''}
                    </div>
                  </div>
                </div>

                <!-- Rodapé com Botões de Ação do Card (FA01 do UC02 e FA02 do UC01) -->
                <div class="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                  <!-- Botão Ver no Calendário (UC01 - FA02) -->
                  <button 
                    type="button"
                    data-action="view-calendar-room"
                    data-room-id="${room.id}"
                    class="flex-1 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1"
                    title="Filtrar calendário para este ambiente"
                  >
                    <i data-lucide="calendar" class="w-3.5 h-3.5 text-slate-500"></i>
                    Ver Agenda
                  </button>

                  <!-- Botão Reservar a Partir do Card (FA01 do UC02) -->
                  <button 
                    type="button"
                    data-action="book-room-card"
                    data-room-id="${room.id}"
                    class="flex-1 px-3 py-2 text-xs font-bold text-white bg-[#151E3B] hover:bg-[#1E294B] rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1"
                    title="Iniciar formulário de reserva para ${room.name}"
                  >
                    <i data-lucide="plus" class="w-3.5 h-3.5 text-[#F6A723]"></i>
                    Reservar
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    this.bindEvents();
    if (window.lucide) {
      lucide.createIcons();
    }
  }

  bindEvents() {
    // Botão Atualizar (FA02 do UC02)
    const refreshBtn = document.getElementById('rooms-refresh-btn');
    if (refreshBtn) {
      refreshBtn.onclick = () => {
        window.app.showToast('info', 'Status dos ambientes atualizado com sucesso.');
        this.render();
      };
    }

    // Ação: Ver Agenda (FA01 do UC01 / FA02 do UC02)
    document.querySelectorAll('[data-action="view-calendar-room"]').forEach(btn => {
      btn.onclick = () => {
        const roomId = btn.getAttribute('data-room-id');
        window.app.navigateToCalendar(roomId);
      };
    });

    // Ação: Reservar (FA01 do UC02)
    document.querySelectorAll('[data-action="book-room-card"]').forEach(btn => {
      btn.onclick = () => {
        const roomId = btn.getAttribute('data-room-id');
        window.app.openBookingForm({ roomId });
      };
    });
  }
}
