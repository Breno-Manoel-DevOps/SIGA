/**
 * SIGA - Sistema Integrado de Gestão de Ambientes
 * MVP 1 - UC05 & UC07: Simulador de E-mails dos Administradores
 * Instituto Consenso - Convergência em Saúde
 */

class SigaEmailSimulator {
  constructor() {
    this.selectedAdminId = 'admin-1'; // Dra. Camila Mendes
    this.selectedProtocol = null;
  }

  setAdmin(adminId) {
    this.selectedAdminId = adminId;
    this.render();
  }

  setProtocol(protocol) {
    this.selectedProtocol = protocol;
    this.render();
  }

  render() {
    const container = document.getElementById('email-view-container');
    if (!container) return;

    const allReservations = store.getReservations();
    const currentAdmin = SIGA_ADMINS.find(a => a.id === this.selectedAdminId) || SIGA_ADMINS[0];

    // Se um protocolo foi selecionado, busca ele; senão pega o mais recente
    const selectedRes = this.selectedProtocol 
      ? store.findByProtocol(this.selectedProtocol) 
      : (allReservations[allReservations.length - 1] || null);

    const room = selectedRes ? (SIGA_ROOMS.find(r => r.id === selectedRes.roomId) || { name: selectedRes.roomId }) : null;

    container.innerHTML = `
      <div class="max-w-5xl mx-auto">
        <!-- Cabeçalho -->
        <div class="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#151E3B]/10 text-[#151E3B] mb-2">
              <i data-lucide="inbox" class="w-3.5 h-3.5 text-[#F6A723]"></i>
              Central de Notificações dos Administradores
            </div>
            <h2 class="text-2xl font-bold text-slate-900">
              Caixa de Entrada dos 3 Administradores
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">
              Simulação interativa do fluxo de e-mails institucionais (RN09, RN13, RN14, RN18 e RN19).
            </p>
          </div>

          <!-- Seletor do Administrador Ativo -->
          <div class="flex items-center gap-2 bg-white p-1.5 border border-slate-200 rounded-2xl shadow-xs">
            <span class="text-xs font-semibold text-slate-400 pl-2">Visualizar como:</span>
            <div class="flex gap-1">
              ${SIGA_ADMINS.map(adm => `
                <button 
                  type="button" 
                  data-admin-id="${adm.id}"
                  class="admin-tab-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${this.selectedAdminId === adm.id ? 'bg-[#151E3B] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}"
                >
                  ${adm.name.split(' ')[0]} ${adm.name.split(' ').slice(-1)}
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Coluna Esquerda: Lista de Solicitações/E-mails -->
          <div class="lg:col-span-4 space-y-3">
            <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>E-mails Recebidos (${allReservations.length})</span>
                <span class="text-[10px] text-slate-400 font-mono">${currentAdmin.email}</span>
              </div>

              <div class="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                ${allReservations.length === 0 ? `
                  <div class="p-6 text-center text-xs text-slate-400">
                    <i data-lucide="inbox" class="w-8 h-8 text-slate-300 mx-auto mb-2"></i>
                    Nenhuma notificação recebida ainda.
                  </div>
                ` : ''}
                ${allReservations.slice().reverse().map(res => {
                  const isSelected = selectedRes && selectedRes.protocol === res.protocol;
                  const isPending = res.status === 'Pendente';
                  const isApproved = res.status === 'Aprovada';
                  const resRoom = SIGA_ROOMS.find(r => r.id === res.roomId) || { name: res.roomId };

                  return `
                    <div 
                      data-select-protocol="${res.protocol}"
                      class="p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-blue-50/70 border-[#151E3B] ring-1 ring-[#151E3B]' : 'bg-white border-slate-200 hover:bg-slate-50'}"
                    >
                      <div class="flex items-center justify-between gap-1 mb-1">
                        <span class="text-[11px] font-mono font-bold text-slate-700">${res.protocol}</span>
                        <span class="text-[10px] font-bold px-1.5 py-0.2 rounded-full ${isPending ? 'bg-amber-100 text-amber-800' : isApproved ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'}">
                          ${res.status}
                        </span>
                      </div>
                      <h4 class="text-xs font-bold text-slate-900 truncate">${res.eventName}</h4>
                      <p class="text-[11px] text-slate-500 truncate mt-0.5">${resRoom.name} · ${res.startTime}-${res.endTime}</p>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>

          <!-- Coluna Direita: Exibição do E-mail Formatado (RN13 ou RN14) -->
          <div class="lg:col-span-8">
            ${selectedRes ? this.renderEmailBody(selectedRes, room, currentAdmin) : `
              <div class="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400 text-xs flex flex-col items-center justify-center">
                <i data-lucide="mail-open" class="w-10 h-10 text-slate-300 mb-3"></i>
                <h4 class="text-sm font-bold text-slate-700 mb-1">Caixa de Entrada Vazia</h4>
                <p class="max-w-xs mx-auto text-slate-500">Nenhuma solicitação de reserva no momento. Ao registrar uma solicitação na aba "Nova Reserva", o e-mail de notificação aos 3 administradores chegará aqui automaticamente.</p>
              </div>
            `}
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    if (window.lucide) lucide.createIcons();
  }

  renderEmailBody(res, room, currentAdmin) {
    const isPending = res.status === 'Pendente';
    const isApproved = res.status === 'Aprovada';
    const isRejected = res.status === 'Recusada';

    // Obtém o token exclusivo para este administrador
    const token = (res.adminTokens && res.adminTokens[currentAdmin.id]) ? res.adminTokens[currentAdmin.id] : 'token_simulado';

    // URLs de ação com token individual (sem login - RN18)
    const approveUrl = `#decisao?token=${token}&acao=aprovar`;
    const rejectUrl = `#decisao?token=${token}&acao=recusar`;

    return `
      <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <!-- Cabeçalho do Cliente de E-mail -->
        <div class="p-6 bg-slate-900 text-white flex flex-col gap-2">
          <div class="flex items-center justify-between text-xs text-slate-300">
            <span>De: <strong>SIGA - Sistema Integrado de Gestão &lt;siga@consenso.org.br&gt;</strong></span>
            <span class="text-[11px] font-mono">${new Date(res.createdAt).toLocaleString('pt-BR')}</span>
          </div>
          <div class="text-xs text-slate-300">
            Para: <strong>${currentAdmin.name} &lt;${currentAdmin.email}&gt;</strong> (+2 administradores)
          </div>
          <div class="text-base font-bold text-white mt-1 flex items-center gap-2">
            <span class="px-2 py-0.5 rounded text-[11px] font-mono font-bold ${isPending ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-200'}">
              ${isPending ? 'SOLICITAÇÃO DE RESERVA' : 'REGISTRO DE DECISÃO'}
            </span>
            <span>[${res.protocol}] ${isPending ? 'Nova Solicitação:' : 'Decisão Registrada:'} ${res.eventName}</span>
          </div>
        </div>

        <!-- Conteúdo do E-mail Formatado em HTML Conforme RN13 / RN14 -->
        <div class="p-6 md:p-8 space-y-6">
          <!-- Banner Institucional no Corpo do E-mail -->
          <div class="flex items-center justify-between pb-4 border-b border-slate-100">
            <div class="flex items-center gap-3">
              <img src="assets/logo.png" alt="Instituto Consenso" class="h-8 object-contain">
              <div class="text-xs font-bold text-[#151E3B]">
                Instituto Consenso · Convergência em Saúde
              </div>
            </div>
            <span class="text-xs font-mono font-bold text-slate-500">${res.protocol}</span>
          </div>

          <!-- Mensagem introdutória -->
          <p class="text-xs text-slate-600 leading-relaxed">
            Olá, <strong>${currentAdmin.name}</strong>.
            ${isPending 
              ? 'Uma nova solicitação de reserva de espaço institucional foi registrada e aguarda sua análise e liberação.' 
              : `A solicitação abaixo foi analisada e concluída com resultado <strong>${res.status}</strong>.`}
          </p>

          <!-- Tabela com os Dados da RN13 / RN14 -->
          <div class="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden text-xs">
            <div class="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
              <div class="p-4 space-y-2.5">
                <div>
                  <span class="text-slate-400 font-semibold block text-[11px] uppercase">Evento</span>
                  <strong class="text-slate-900">${res.eventName}</strong>
                </div>
                <div>
                  <span class="text-slate-400 font-semibold block text-[11px] uppercase">Ambiente</span>
                  <strong class="text-slate-900">${room.name} (${room.location})</strong>
                </div>
                <div>
                  <span class="text-slate-400 font-semibold block text-[11px] uppercase">Data</span>
                  <strong class="text-slate-900">${res.date.split('-').reverse().join('/')}</strong>
                </div>
                <div>
                  <span class="text-slate-400 font-semibold block text-[11px] uppercase">Horário</span>
                  <strong class="text-slate-900">Das ${res.startTime} às ${res.endTime}</strong>
                </div>
              </div>

              <div class="p-4 space-y-2.5">
                <div>
                  <span class="text-slate-400 font-semibold block text-[11px] uppercase">Responsável</span>
                  <strong class="text-slate-900">${res.requesterName}</strong>
                </div>
                <div>
                  <span class="text-slate-400 font-semibold block text-[11px] uppercase">E-mail de Contato</span>
                  <span class="text-slate-700">${res.requesterEmail}</span>
                </div>
                <div>
                  <span class="text-slate-400 font-semibold block text-[11px] uppercase">Participantes Previstos</span>
                  <strong class="text-slate-900">${res.participants} pessoas (Capacidade máx: ${room.capacity})</strong>
                </div>
                <div>
                  <span class="text-slate-400 font-semibold block text-[11px] uppercase">Recursos Multimídia</span>
                  <span class="text-slate-700">
                    ${[
                      res.resources?.videoconferencia ? 'Videoconferência' : null,
                      res.resources?.gravacao ? 'Gravação ao vivo' : null,
                      res.resources?.transmissao ? 'Transmissão' : null
                    ].filter(Boolean).join(', ') || 'Nenhum recurso audiovisual'}
                  </span>
                </div>
              </div>
            </div>

            <!-- Observações (RN13 / RN14 / FA01) -->
            <div class="p-4 border-t border-slate-200 bg-slate-100/60">
              <span class="text-slate-400 font-semibold block text-[11px] uppercase mb-0.5">Observações</span>
              <p class="text-slate-700">${res.notes || 'Sem observações'}</p>
            </div>

            <!-- Dados da Decisão (se já decidida - RN14) -->
            ${res.decidedBy ? `
              <div class="p-4 border-t border-slate-200 ${isApproved ? 'bg-emerald-50 text-emerald-950' : 'bg-rose-50 text-rose-950'}">
                <div class="font-bold text-xs uppercase tracking-wider mb-1">
                  Comprovante da Decisão Registrada (RN14):
                </div>
                <div class="text-xs">
                  Resultado: <strong>${res.status}</strong> · Decidido por: <strong>${res.decidedBy}</strong> em <strong>${new Date(res.decidedAt).toLocaleString('pt-BR')}</strong>
                </div>
                ${res.rejectionReason ? `
                  <div class="mt-2 text-xs">
                    <strong>Motivo da Recusa (obrigatório na recusa):</strong> "${res.rejectionReason}"
                  </div>
                ` : ''}
              </div>
            ` : ''}
          </div>

          <!-- Links de Aprovar e Recusar da RN13 (Quando pendente) -->
          ${isPending ? `
            <div class="p-5 bg-amber-50/70 border border-amber-200 rounded-2xl">
              <div class="text-xs font-bold text-amber-900 mb-2 flex items-center gap-1.5">
                <i data-lucide="key" class="w-4 h-4 text-amber-600"></i>
                Links Individuais de Decisão (Token Único sem Login - RN18)
              </div>
              <p class="text-xs text-amber-800 mb-4">
                Clique em um dos botões abaixo para acessar diretamente a confirmação institucional da reserva:
              </p>

              <div class="flex flex-wrap items-center gap-3">
                <a 
                  href="${approveUrl}"
                  class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all inline-flex items-center gap-2"
                >
                  <i data-lucide="check" class="w-4 h-4"></i>
                  <span>Aprovar Solicitação</span>
                </a>

                <a 
                  href="${rejectUrl}"
                  class="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all inline-flex items-center gap-2"
                >
                  <i data-lucide="x" class="w-4 h-4"></i>
                  <span>Recusar Solicitação</span>
                </a>
              </div>

              <div class="text-[11px] text-amber-700 mt-3 font-mono">
                Token gerado para ${currentAdmin.name}: ${token}
              </div>
            </div>
          ` : `
            <div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <span class="text-xs text-slate-500 font-medium">Esta solicitação já foi finalizada. Os links de decisão foram invalidados automaticamente (RN10).</span>
              <button 
                onclick="window.app.navigateToCalendar('${res.roomId}')"
                class="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Ver no Calendário
              </button>
            </div>
          `}
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Alternar Administrador
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-admin-id');
        this.setAdmin(id);
      };
    });

    // Selecionar protocolo na lista lateral
    document.querySelectorAll('[data-select-protocol]').forEach(el => {
      el.onclick = () => {
        const proto = el.getAttribute('data-select-protocol');
        this.setProtocol(proto);
      };
    });
  }
}
