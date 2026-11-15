/**
 * SIGA - Sistema Integrado de Gestão de Ambientes
 * MVP 1 - Aplicação Principal e Orquestrador de Telas
 * Instituto Consenso - Convergência em Saúde
 */

class SigaApp {
  constructor() {
    this.currentView = 'calendario';
    this.calendar = new SigaCalendar();
    this.rooms = new SigaRooms();
    this.booking = new SigaBooking();
    this.decision = new SigaDecision();
    this.search = new SigaSearch();
    this.emailSim = new SigaEmailSimulator();
  }

  init() {
    this.setupNavigation();
    this.setupClock();
    this.setupHashRouting();
    this.handleRoute();

    window.addEventListener('hashchange', () => this.handleRoute());
  }

  setupNavigation() {
    document.querySelectorAll('[data-nav-target]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('data-nav-target');
        window.location.hash = target;
      });
    });

    // Botão de Reset de Dados
    const resetBtn = document.getElementById('btn-reset-demo-data');
    if (resetBtn) {
      resetBtn.onclick = () => {
        if (confirm('Deseja limpar todas as reservas para iniciar uma nova demonstração?')) {
          store.resetData();
          this.showToast('info', 'Todas as reservas foram limpas. O sistema está pronto para a demonstração!');
          this.handleRoute();
        }
      };
    }
  }

  setupClock() {
    const clockDisplay = document.getElementById('simulated-clock-display');
    const clockBtn = document.getElementById('btn-adjust-simulated-time');

    const updateDisplay = () => {
      const sim = store.getSimulatedTime();
      if (clockDisplay) {
        const d = sim.toLocaleDateString('pt-BR');
        const t = sim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        clockDisplay.textContent = `${d} · ${t}`;
      }
    };

    updateDisplay();

    // Modal para ajuste do horário do sistema
    if (clockBtn) {
      clockBtn.onclick = () => {
        const sim = store.getSimulatedTime();
        // Converte para valor compatível com input datetime-local: YYYY-MM-DDTHH:MM
        const year = sim.getFullYear();
        const month = String(sim.getMonth() + 1).padStart(2, '0');
        const day = String(sim.getDate()).padStart(2, '0');
        const hours = String(sim.getHours()).padStart(2, '0');
        const mins = String(sim.getMinutes()).padStart(2, '0');
        const currentVal = `${year}-${month}-${day}T${hours}:${mins}`;

        this.showModal(`
          <div class="p-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2.5 bg-amber-100 text-amber-700 rounded-xl">
                <i data-lucide="clock" class="w-6 h-6"></i>
              </div>
              <div>
                <h3 class="text-lg font-bold text-slate-900">Ajustar Instante Simulado</h3>
                <p class="text-xs text-slate-500">Útil para testar regras de antecedência mínima (RN03) e expiração (FE03).</p>
              </div>
            </div>

            <div class="mb-4">
              <label for="time-adjust-input" class="block text-xs font-semibold text-slate-700 mb-1">
                Data e Horário Simulado do SIGA:
              </label>
              <input 
                type="datetime-local" 
                id="time-adjust-input" 
                value="${currentVal}"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#151E3B]"
              />
            </div>

            <div class="flex items-center justify-end gap-2 pt-2">
              <button 
                type="button" 
                onclick="window.app.closeModal()"
                class="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button 
                type="button" 
                id="confirm-time-adjust-btn"
                class="px-5 py-2 bg-[#151E3B] text-white rounded-xl text-xs font-bold hover:bg-[#1E294B]"
              >
                Aplicar Horário
              </button>
            </div>
          </div>
        `);

        if (window.lucide) lucide.createIcons();

        const confirmBtn = document.getElementById('confirm-time-adjust-btn');
        const inputVal = document.getElementById('time-adjust-input');
        if (confirmBtn && inputVal) {
          confirmBtn.onclick = () => {
            if (inputVal.value) {
              store.setSimulatedTime(inputVal.value);
              updateDisplay();
              this.closeModal();
              this.showToast('success', 'Instante simulado atualizado!');
              this.handleRoute();
            }
          };
        }
      };
    }
  }

  setupHashRouting() {
    const rawPath = window.location.pathname.replace(/^\/+|\/+$/g, '');
    const validPaths = ['calendario', 'ambientes', 'nova-reserva', 'consultar', 'emails', 'decisao'];
    if (!window.location.hash) {
      if (rawPath && validPaths.includes(rawPath)) {
        window.location.hash = `${rawPath}${window.location.search || ''}`;
      } else {
        window.location.hash = 'calendario';
      }
    }
  }

  handleRoute() {
    let rawHash = window.location.hash.slice(1);
    if (!rawHash) {
      const rawPath = window.location.pathname.replace(/^\/+|\/+$/g, '');
      const validPaths = ['calendario', 'ambientes', 'nova-reserva', 'consultar', 'emails', 'decisao'];
      if (rawPath && validPaths.includes(rawPath)) {
        rawHash = rawPath + (window.location.search || '');
      } else {
        rawHash = 'calendario';
      }
    }
    const [path, queryString] = rawHash.split('?');
    const params = new URLSearchParams(queryString || '');

    // Esconde todas as views
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));

    // Atualiza links da barra de navegação
    document.querySelectorAll('[data-nav-target]').forEach(link => {
      const target = link.getAttribute('data-nav-target');
      if (target === path) {
        link.classList.add('active-nav-item');
      } else {
        link.classList.remove('active-nav-item');
      }
    });

    switch (path) {
      case 'calendario':
        document.getElementById('view-calendario')?.classList.remove('hidden');
        if (params.get('sala')) {
          this.calendar.setRoomFilter(params.get('sala'));
        }
        if (params.get('data')) {
          const [y, m, d] = params.get('data').split('-').map(Number);
          this.calendar.setDate(new Date(y, m - 1, d));
        }
        this.calendar.render();
        break;

      case 'ambientes':
        document.getElementById('view-ambientes')?.classList.remove('hidden');
        this.rooms.render();
        break;

      case 'nova-reserva':
        document.getElementById('view-nova-reserva')?.classList.remove('hidden');
        if (params.get('sala')) {
          this.booking.formData.roomId = params.get('sala');
        }
        if (params.get('data')) {
          this.booking.formData.date = params.get('data');
        }
        if (params.get('inicio')) {
          this.booking.formData.startTime = params.get('inicio');
        }
        if (params.get('fim')) {
          this.booking.formData.endTime = params.get('fim');
        }
        this.booking.render();
        break;

      case 'consultar':
        document.getElementById('view-consultar')?.classList.remove('hidden');
        if (params.get('protocolo')) {
          this.search.searchedProtocol = params.get('protocolo');
        }
        this.search.render();
        break;

      case 'emails':
        document.getElementById('view-emails')?.classList.remove('hidden');
        if (params.get('protocolo')) {
          this.emailSim.setProtocol(params.get('protocolo'));
        }
        if (params.get('admin')) {
          this.emailSim.setAdmin(params.get('admin'));
        }
        this.emailSim.render();
        break;

      case 'decisao':
        document.getElementById('view-decisao')?.classList.remove('hidden');
        const token = params.get('token');
        const acao = params.get('acao');
        this.decision.loadFromUrl(token, acao);
        break;

      case 'sobre':
        document.getElementById('view-sobre')?.classList.remove('hidden');
        break;

      default:
        document.getElementById('view-calendario')?.classList.remove('hidden');
        this.calendar.render();
        break;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.lucide) {
      lucide.createIcons();
    }
  }

  navigateToCalendar(roomId = null, dateStr = null) {
    let url = 'calendario';
    const params = [];
    if (roomId) params.push(`sala=${encodeURIComponent(roomId)}`);
    if (dateStr) params.push(`data=${encodeURIComponent(dateStr)}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    window.location.hash = url;
  }

  openBookingForm(initialData = {}) {
    this.booking.setInitialValues(initialData);
    let url = 'nova-reserva';
    const params = [];
    if (initialData.roomId) params.push(`sala=${encodeURIComponent(initialData.roomId)}`);
    if (initialData.date) params.push(`data=${encodeURIComponent(initialData.date)}`);
    if (initialData.startTime) params.push(`inicio=${encodeURIComponent(initialData.startTime)}`);
    if (initialData.endTime) params.push(`fim=${encodeURIComponent(initialData.endTime)}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    window.location.hash = url;
  }

  navigateToEmailSimulator(protocol = null) {
    let url = 'emails';
    if (protocol) url += `?protocolo=${encodeURIComponent(protocol)}`;
    window.location.hash = url;
  }

  navigateToSearch(protocol = null) {
    let url = 'consultar';
    if (protocol) url += `?protocolo=${encodeURIComponent(protocol)}`;
    window.location.hash = url;
  }

  showToast(type, message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast flex items-start gap-3 p-4 rounded-2xl bg-white border shadow-lg text-xs font-medium text-slate-800';

    let iconHtml = '';
    let borderClass = 'border-slate-200';

    if (type === 'success') {
      iconHtml = '<i data-lucide="check-circle" class="w-5 h-5 text-emerald-600 shrink-0"></i>';
      borderClass = 'border-emerald-300 bg-emerald-50/40';
    } else if (type === 'error') {
      iconHtml = '<i data-lucide="alert-octagon" class="w-5 h-5 text-rose-600 shrink-0"></i>';
      borderClass = 'border-rose-300 bg-rose-50/40';
    } else if (type === 'warning') {
      iconHtml = '<i data-lucide="alert-triangle" class="w-5 h-5 text-amber-500 shrink-0"></i>';
      borderClass = 'border-amber-300 bg-amber-50/40';
    } else {
      iconHtml = '<i data-lucide="info" class="w-5 h-5 text-blue-600 shrink-0"></i>';
      borderClass = 'border-blue-300 bg-blue-50/40';
    }

    toast.className += ` ${borderClass}`;
    toast.innerHTML = `
      ${iconHtml}
      <div class="flex-1">${message}</div>
      <button class="text-slate-400 hover:text-slate-600 ml-2">&times;</button>
    `;

    const closeBtn = toast.querySelector('button');
    closeBtn.onclick = () => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    };

    container.appendChild(toast);
    if (window.lucide) lucide.createIcons();

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }
    }, 5000);
  }

  showModal(htmlContent) {
    const modalContainer = document.getElementById('app-modal-container');
    if (!modalContainer) return;

    modalContainer.innerHTML = `
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden transform animate-in fade-in zoom-in-95">
          ${htmlContent}
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();
  }

  closeModal() {
    const modalContainer = document.getElementById('app-modal-container');
    if (modalContainer) {
      modalContainer.innerHTML = '';
    }
  }

  showReservationModal(res) {
    const room = SIGA_ROOMS.find(r => r.id === res.roomId) || { name: res.roomId };
    const isApproved = res.status === 'Aprovada';
    const isPending = res.status === 'Pendente';

    this.showModal(`
      <div class="p-6 md:p-8">
        <div class="flex items-start justify-between gap-4 mb-4">
          <div>
            <span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isApproved ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'} mb-1">
              ${res.status}
            </span>
            <h3 class="text-xl font-bold text-slate-900">${res.eventName}</h3>
            <p class="text-xs text-slate-500 font-mono">${res.protocol}</p>
          </div>
          <button onclick="window.app.closeModal()" class="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
        </div>

        <div class="space-y-3 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl mb-6">
          <div class="flex justify-between">
            <span class="text-slate-400">Ambiente:</span>
            <strong class="text-slate-800">${room.name}</strong>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Data:</span>
            <strong class="text-slate-800">${res.date.split('-').reverse().join('/')}</strong>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Horário:</span>
            <strong class="text-slate-800">${res.startTime} às ${res.endTime}</strong>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Responsável:</span>
            <strong class="text-slate-800">${res.requesterName}</strong>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Participantes:</span>
            <strong class="text-slate-800">${res.participants} pessoas</strong>
          </div>
          ${res.notes ? `
            <div class="pt-2 border-t border-slate-200">
              <span class="text-slate-400 block mb-0.5">Observações:</span>
              <p class="text-slate-700 italic">${res.notes}</p>
            </div>
          ` : ''}
        </div>

        <div class="flex justify-end gap-2">
          <button 
            type="button" 
            onclick="window.app.closeModal()"
            class="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Fechar
          </button>
          <button 
            type="button" 
            onclick="window.app.closeModal(); window.app.navigateToSearch('${res.protocol}')"
            class="px-4 py-2 bg-[#151E3B] text-white rounded-xl text-xs font-bold hover:bg-[#1E294B]"
          >
            Ver Detalhes do Protocolo
          </button>
        </div>
      </div>
    `);
  }
}

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.app = new SigaApp();
  window.app.init();
});
