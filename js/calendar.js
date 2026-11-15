/**
 * SIGA - Sistema Integrado de Gestão de Ambientes
 * MVP 1 - UC01: Visualizar Calendário de Locações (Mês e Dia)
 * Instituto Consenso - Convergência em Saúde
 */

class SigaCalendar {
  constructor() {
    this.currentDate = store.getSimulatedTime();
    this.selectedDate = new Date(this.currentDate);
    this.selectedRoomFilter = 'all'; // 'all' ou ID do ambiente
    this.activeView = 'month'; // 'month' ou 'day'
    this.hours = [];
    for (let h = 7; h <= 23; h++) {
      this.hours.push(`${String(h).padStart(2, '0')}:00`);
    }
  }

  setDate(date) {
    this.selectedDate = new Date(date);
    this.render();
  }

  setRoomFilter(roomId) {
    this.selectedRoomFilter = roomId;
    this.render();
  }

  setView(view) {
    this.activeView = view;
    this.render();
  }

  formatDateBR(date) {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  formatMonthYear(date) {
    const monthName = date.toLocaleDateString('pt-BR', { month: 'long' });
    return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} de ${date.getFullYear()}`;
  }

  // Gera array de dias do mês atual para o grid
  getMonthDaysGrid(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Primeiro dia do mês
    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay(); // 0 = Domingo
    
    // Último dia do mês
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();
    
    // Dias do mês anterior para completar a primeira semana
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const days = [];
    
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const dayDate = new Date(year, month - 1, d);
      days.push({
        date: dayDate,
        dayNum: d,
        isCurrentMonth: false,
        dateStr: dayDate.toISOString().split('T')[0]
      });
    }
    
    // Dias do mês atual
    for (let i = 1; i <= totalDays; i++) {
      const dayDate = new Date(year, month, i);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        date: dayDate,
        dayNum: i,
        isCurrentMonth: true,
        dateStr
      });
    }
    
    // Dias do próximo mês para completar a grade de 35 ou 42 células
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const dayDate = new Date(year, month + 1, i);
      days.push({
        date: dayDate,
        dayNum: i,
        isCurrentMonth: false,
        dateStr: dayDate.toISOString().split('T')[0]
      });
    }
    
    return days;
  }

  render() {
    const container = document.getElementById('calendar-view-container');
    if (!container) return;

    const rooms = this.selectedRoomFilter === 'all'
      ? SIGA_ROOMS
      : SIGA_ROOMS.filter(r => r.id === this.selectedRoomFilter);

    const now = store.getSimulatedTime();
    const nowDateStr = now.toISOString().split('T')[0];

    container.innerHTML = `
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <!-- Barra de Ferramentas do Calendário -->
        <div class="p-4 md:p-6 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <!-- Seletor de Mês / Dia e Navegação -->
          <div class="flex items-center gap-2">
            <div class="flex items-center bg-white border border-slate-300 rounded-xl shadow-xs overflow-hidden">
              <button id="cal-prev-btn" class="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors" title="Anterior">
                <i data-lucide="chevron-left" class="w-5 h-5"></i>
              </button>
              <button id="cal-today-btn" class="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 border-x border-slate-200 transition-colors">
                Hoje
              </button>
              <button id="cal-next-btn" class="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors" title="Próximo">
                <i data-lucide="chevron-right" class="w-5 h-5"></i>
              </button>
            </div>
            <h2 class="text-lg md:text-xl font-bold text-slate-800 ml-2" id="cal-title-display">
              ${this.activeView === 'month' ? this.formatMonthYear(this.selectedDate) : this.formatDateBR(this.selectedDate)}
            </h2>
          </div>

          <!-- Controles: Filtro por Ambiente e Alternador Mês/Dia -->
          <div class="flex flex-wrap items-center gap-3">
            <!-- Filtro de Ambiente -->
            <div class="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-300 rounded-xl shadow-xs text-sm">
              <i data-lucide="filter" class="w-4 h-4 text-slate-500"></i>
              <label for="cal-room-filter" class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ambiente:</label>
              <select id="cal-room-filter" class="bg-transparent border-none text-slate-800 font-medium focus:ring-0 cursor-pointer pr-4">
                <option value="all" ${this.selectedRoomFilter === 'all' ? 'selected' : ''}>Todos os Ambientes (7)</option>
                ${SIGA_ROOMS.map(r => `
                  <option value="${r.id}" ${this.selectedRoomFilter === r.id ? 'selected' : ''}>${r.name}</option>
                `).join('')}
              </select>
            </div>

            <!-- Alternador de Visão (Mês / Dia) -->
            <div class="inline-flex p-1 bg-slate-200/80 rounded-xl border border-slate-300/60 text-sm">
              <button id="cal-view-month-btn" class="px-3.5 py-1.5 rounded-lg font-medium transition-all ${this.activeView === 'month' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'}">
                Visão Mês
              </button>
              <button id="cal-view-day-btn" class="px-3.5 py-1.5 rounded-lg font-medium transition-all ${this.activeView === 'day' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'}">
                Visão Dia
              </button>
            </div>
          </div>
        </div>

        <!-- Legenda de Cores Oficial (RN16) -->
        <div class="px-6 py-2.5 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center justify-between text-xs font-medium text-slate-600 gap-2">
          <span class="text-slate-500 font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <i data-lucide="palette" class="w-3.5 h-3.5 text-slate-500"></i>
            Legenda (RN16):
          </span>
          <div class="flex flex-wrap items-center gap-4">
            <span class="flex items-center gap-1.5">
              <span class="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-200"></span>
              <span><strong>Verde:</strong> Livre (Clique para reservar)</span>
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-3 h-3 rounded-full bg-amber-500 ring-2 ring-amber-200"></span>
              <span><strong>Amarelo:</strong> Pendente de aprovação</span>
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-3 h-3 rounded-full bg-rose-500 ring-2 ring-rose-200"></span>
              <span><strong>Vermelho:</strong> Aprovada / Ocupada</span>
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-3 h-3 rounded-full bg-slate-400 ring-2 ring-slate-200"></span>
              <span><strong>Cinza:</strong> Indisponível (passado / antecedência)</span>
            </span>
          </div>
        </div>

        <!-- Conteúdo da Visão -->
        <div id="cal-main-content" class="p-4 md:p-6">
          ${this.activeView === 'month' ? this.renderMonthView() : this.renderDayView()}
        </div>
      </div>
    `;

    this.bindEvents();
    if (window.lucide) {
      lucide.createIcons();
    }
  }

  renderMonthView() {
    const days = this.getMonthDaysGrid(this.selectedDate);
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const allReservations = store.getReservations();
    const now = store.getSimulatedTime();
    const todayStr = now.toISOString().split('T')[0];

    return `
      <div class="grid grid-cols-7 gap-px bg-slate-200 rounded-xl overflow-hidden border border-slate-200">
        <!-- Cabeçalho dos Dias da Semana -->
        ${dayNames.map(d => `
          <div class="bg-slate-100 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-slate-600">
            ${d}
          </div>
        `).join('')}

        <!-- Grade de Células dos Dias -->
        ${days.map(item => {
          // Filtra reservas do dia
          let dayReservations = allReservations.filter(r => r.date === item.dateStr);
          if (this.selectedRoomFilter !== 'all') {
            dayReservations = dayReservations.filter(r => r.roomId === this.selectedRoomFilter);
          }

          // Separa por status
          const approved = dayReservations.filter(r => r.status === 'Aprovada');
          const pending = dayReservations.filter(r => r.status === 'Pendente');
          const isToday = item.dateStr === todayStr;

          return `
            <div 
              data-date="${item.dateStr}"
              class="cal-month-cell min-h-[105px] p-2 bg-white transition-all cursor-pointer hover:bg-blue-50/50 flex flex-col justify-between ${!item.isCurrentMonth ? 'opacity-40 bg-slate-50' : ''} ${isToday ? 'ring-2 ring-inset ring-amber-500/80 bg-amber-50/20' : ''}"
              title="Clique para ver a grade horária detalhada de ${item.dayNum}"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold ${isToday ? 'bg-[#151E3B] text-white w-6 h-6 rounded-full flex items-center justify-center' : item.isCurrentMonth ? 'text-slate-800' : 'text-slate-400'}">
                  ${item.dayNum}
                </span>
                ${dayReservations.length > 0 ? `
                  <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    ${dayReservations.length} res.
                  </span>
                ` : ''}
              </div>

              <!-- Badges de Status / Eventos no Dia -->
              <div class="mt-1 space-y-1 overflow-hidden">
                ${approved.slice(0, 2).map(r => `
                  <div class="truncate text-[10px] font-medium px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200/80 flex items-center gap-1" title="${r.eventName} (${r.startTime}-${r.endTime})">
                    <span class="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                    <span class="truncate">${r.startTime} ${r.eventName}</span>
                  </div>
                `).join('')}

                ${pending.slice(0, 2).map(r => `
                  <div class="truncate text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center gap-1" title="${r.eventName} (${r.startTime}-${r.endTime}) - Pendente">
                    <span class="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                    <span class="truncate">${r.startTime} ${r.eventName}</span>
                  </div>
                `).join('')}

                ${dayReservations.length > 2 ? `
                  <div class="text-[10px] text-slate-500 font-medium pl-1">
                    +${dayReservations.length - 2} mais...
                  </div>
                ` : ''}
              </div>

              <!-- Indicador de livre quando vazio -->
              ${dayReservations.length === 0 && item.isCurrentMonth ? `
                <div class="text-[11px] text-emerald-600/70 font-medium flex items-center gap-1 mt-auto">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Livre
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  renderDayView() {
    const dateStr = this.selectedDate.toISOString().split('T')[0];
    const allReservations = store.getReservations();
    const rooms = this.selectedRoomFilter === 'all'
      ? SIGA_ROOMS
      : SIGA_ROOMS.filter(r => r.id === this.selectedRoomFilter);

    // Filtrar reservas do dia selecionado
    const dayReservations = allReservations.filter(r => r.date === dateStr);
    const now = store.getSimulatedTime();

    // Mensagem MSG02 caso não haja nenhuma reserva no dia
    const hasReservations = dayReservations.some(r => 
      this.selectedRoomFilter === 'all' || r.roomId === this.selectedRoomFilter
    );

    return `
      <div>
        ${!hasReservations ? `
          <div class="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center gap-2">
            <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-600"></i>
            <span>${SIGA_MESSAGES.MSG02}</span>
          </div>
        ` : ''}

        <!-- Grid de Horários das 07:00 às 23:59 (RN02) -->
        <div class="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-xs">
          <div class="min-w-[850px]">
            <!-- Linha de Cabeçalho dos Ambientes -->
            <div class="flex border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 uppercase tracking-wider sticky top-0 z-10">
              <div class="calendar-time-col py-3 px-2 text-center border-r border-slate-200 bg-slate-100 text-slate-500">
                Horário
              </div>
              ${rooms.map(room => `
                <div class="flex-1 calendar-room-col py-3 px-3 border-r border-slate-200 last:border-r-0">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-slate-900">${room.name}</span>
                    <span class="text-[10px] text-slate-500 font-normal">Cap. ${room.capacity}</span>
                  </div>
                  <div class="text-[10px] text-slate-500 font-normal truncate mt-0.5">
                    Ant. ${room.minNoticeLabel}
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Linhas dos Horários (07:00 até 23:00) -->
            <div class="divide-y divide-slate-100">
              ${this.hours.map(hourStr => {
                const hourMinutes = SigaRules.timeStringToMinutes(hourStr);
                const nextHourStr = `${String(parseInt(hourStr.slice(0, 2)) + 1).padStart(2, '0')}:00`;
                const nextHourMinutes = hourMinutes + 60;

                return `
                  <div class="flex items-stretch min-h-[54px] hover:bg-slate-50/30">
                    <!-- Coluna do Horário -->
                    <div class="calendar-time-col py-2 px-2 text-center text-xs font-semibold text-slate-500 border-r border-slate-200 bg-slate-50/70 flex items-center justify-center">
                      ${hourStr}
                    </div>

                    <!-- Colunas dos Ambientes para este Horário -->
                    ${rooms.map(room => {
                      // Verifica se há reserva cobrindo este slot de 1 hora
                      const activeRes = dayReservations.find(r => {
                        if (r.roomId !== room.id) return false;
                        if (r.status !== 'Aprovada' && r.status !== 'Pendente') return false;
                        const rStart = SigaRules.timeStringToMinutes(r.startTime);
                        const rEnd = SigaRules.timeStringToMinutes(r.endTime);
                        // Interseção com o bloco horário atual
                        return (hourMinutes < rEnd && nextHourMinutes > rStart);
                      });

                      // Verifica se o slot está no passado ou viola antecedência mínima
                      const slotDate = SigaRules.parseDateTime(dateStr, hourStr);
                      const isPast = slotDate < now;
                      const noticeCheck = SigaRules.validateMinimumNotice(room.id, dateStr, hourStr, now);
                      const isNoticeViolated = !noticeCheck.valid;

                      if (activeRes) {
                        const isApproved = activeRes.status === 'Aprovada';
                        const isPending = activeRes.status === 'Pendente';
                        const isStartSlot = SigaRules.timeStringToMinutes(activeRes.startTime) >= hourMinutes && SigaRules.timeStringToMinutes(activeRes.startTime) < nextHourMinutes;

                        return `
                          <div class="flex-1 calendar-room-col p-1.5 border-r border-slate-200 last:border-r-0 relative group">
                            <div 
                              data-res-protocol="${activeRes.protocol}"
                              class="w-full h-full p-2 rounded-lg cursor-pointer transition-all border ${isApproved ? 'bg-rose-50 border-rose-300 text-rose-900 hover:bg-rose-100/80' : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100/80 animate-soft-pulse'} flex flex-col justify-center"
                              title="${activeRes.eventName} (${activeRes.startTime} às ${activeRes.endTime}) - Clique para detalhes"
                            >
                              <div class="flex items-center justify-between gap-1">
                                <span class="font-bold text-xs truncate">${activeRes.eventName}</span>
                                <span class="text-[10px] font-bold px-1.5 py-0.2 rounded-full ${isApproved ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'}">
                                  ${isApproved ? 'Aprovada' : 'Pendente'}
                                </span>
                              </div>
                              <div class="text-[11px] opacity-80 mt-0.5 flex items-center justify-between">
                                <span>${activeRes.startTime} - ${activeRes.endTime}</span>
                                <span class="text-[10px] font-mono">${activeRes.protocol}</span>
                              </div>
                            </div>
                          </div>
                        `;
                      } else if (isPast || isNoticeViolated) {
                        // RN16: Cinza = Indisponível
                        const reason = isPast ? 'Horário já passou' : `Antecedência mínima necessária: ${room.minNoticeLabel}`;
                        return `
                          <div class="flex-1 calendar-room-col p-1 border-r border-slate-200 last:border-r-0 bg-slate-100/60" title="${reason}">
                            <div class="w-full h-full flex items-center justify-center text-[11px] text-slate-400 font-medium">
                              <span class="inline-flex items-center gap-1">
                                <i data-lucide="lock" class="w-3 h-3 text-slate-400"></i>
                                Indisponível
                              </span>
                            </div>
                          </div>
                        `;
                      } else {
                        // RN16: Verde = Livre (FA03: Iniciar solicitação ao clicar)
                        return `
                          <div class="flex-1 calendar-room-col p-1 border-r border-slate-200 last:border-r-0">
                            <button 
                              type="button"
                              data-action="book-slot"
                              data-room-id="${room.id}"
                              data-date="${dateStr}"
                              data-start-time="${hourStr}"
                              class="w-full h-full min-h-[38px] rounded-lg border border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-100 hover:border-emerald-500 text-emerald-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-all group"
                              title="Horário Livre. Clique para solicitar reserva deste ambiente."
                            >
                              <span class="w-2 h-2 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform"></span>
                              <span>Livre</span>
                              <span class="text-[10px] opacity-0 group-hover:opacity-100 font-bold transition-opacity text-emerald-800">· Reservar</span>
                            </button>
                          </div>
                        `;
                      }
                    }).join('')}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Navegação anterior / próximo / hoje
    const prevBtn = document.getElementById('cal-prev-btn');
    const nextBtn = document.getElementById('cal-next-btn');
    const todayBtn = document.getElementById('cal-today-btn');

    if (prevBtn) {
      prevBtn.onclick = () => {
        if (this.activeView === 'month') {
          this.selectedDate.setMonth(this.selectedDate.getMonth() - 1);
        } else {
          this.selectedDate.setDate(this.selectedDate.getDate() - 1);
        }
        this.render();
      };
    }

    if (nextBtn) {
      nextBtn.onclick = () => {
        if (this.activeView === 'month') {
          this.selectedDate.setMonth(this.selectedDate.getMonth() + 1);
        } else {
          this.selectedDate.setDate(this.selectedDate.getDate() + 1);
        }
        this.render();
      };
    }

    if (todayBtn) {
      todayBtn.onclick = () => {
        this.selectedDate = new Date(store.getSimulatedTime());
        this.render();
      };
    }

    // Filtro por ambiente (FA02 do UC01)
    const filterSelect = document.getElementById('cal-room-filter');
    if (filterSelect) {
      filterSelect.onchange = (e) => {
        this.setRoomFilter(e.target.value);
      };
    }

    // Alternador Mês / Dia
    const monthViewBtn = document.getElementById('cal-view-month-btn');
    const dayViewBtn = document.getElementById('cal-view-day-btn');

    if (monthViewBtn) {
      monthViewBtn.onclick = () => this.setView('month');
    }
    if (dayViewBtn) {
      dayViewBtn.onclick = () => this.setView('day');
    }

    // Clique na célula do mês para abrir a visão do dia (Fluxo Principal 4 e 5 do UC01)
    document.querySelectorAll('.cal-month-cell').forEach(cell => {
      cell.onclick = () => {
        const dateStr = cell.getAttribute('data-date');
        if (dateStr) {
          const [y, m, d] = dateStr.split('-').map(Number);
          this.selectedDate = new Date(y, m - 1, d);
          this.setView('day');
        }
      };
    });

    // Clique em slot livre na visão dia -> FA03 Iniciar solicitação pré-preenchida
    document.querySelectorAll('[data-action="book-slot"]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const roomId = btn.getAttribute('data-room-id');
        const date = btn.getAttribute('data-date');
        const startTime = btn.getAttribute('data-start-time');
        
        // Calcula fim sugerido (+ 1 hora ou até 23:59)
        const startMin = SigaRules.timeStringToMinutes(startTime);
        const endMin = Math.min(startMin + 60, SigaRules.timeStringToMinutes('23:59'));
        const endTime = SigaRules.minutesToTimeString(endMin);

        // Dispara evento para o UC03
        window.app.openBookingForm({
          roomId,
          date,
          startTime,
          endTime
        });
      };
    });

    // Clique em reserva existente para exibir detalhes completos
    document.querySelectorAll('[data-res-protocol]').forEach(el => {
      el.onclick = (e) => {
        e.stopPropagation();
        const protocol = el.getAttribute('data-res-protocol');
        const res = store.findByProtocol(protocol);
        if (res) {
          window.app.showReservationModal(res);
        }
      };
    });
  }
}
