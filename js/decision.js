/**
 * SIGA - Sistema Integrado de Gestão de Ambientes
 * MVP 1 - UC06: Aprovar ou Recusar Reserva por E-mail (Sem Login)
 *        UC07: Registrar Decisão por E-mail aos Administradores
 * Instituto Consenso - Convergência em Saúde
 */

class SigaDecision {
  constructor() {
    this.currentToken = null;
    this.currentAction = null; // 'aprovar' ou 'recusar'
  }

  loadFromUrl(token, action) {
    this.currentToken = token;
    this.currentAction = action;
    this.render();
  }

  render() {
    const container = document.getElementById('decision-view-container');
    if (!container) return;

    // Se nenhum token foi fornecido
    if (!this.currentToken) {
      container.innerHTML = this.renderErrorCard(
        'Nenhum Link Selecionado',
        'Para acessar a tela de decisão de um administrador, utilize o link recebido no e-mail institucional ou selecione uma notificação na Central de E-mails.',
        'help-circle'
      );
      if (window.lucide) lucide.createIcons();
      return;
    }

    // Busca reserva e administrador correspondente pelo token
    const tokenData = store.findByToken(this.currentToken);

    // FE01 / MSG21: Link inválido
    if (!tokenData) {
      container.innerHTML = this.renderErrorCard(
        'Link Inválido ou Inexistente',
        SIGA_MESSAGES.MSG21 + ' Este link de segurança não foi localizado ou pertence a uma reserva excluída.',
        'shield-alert'
      );
      if (window.lucide) lucide.createIcons();
      return;
    }

    const { reservation: res, admin, token } = tokenData;
    const room = SIGA_ROOMS.find(r => r.id === res.roomId) || { name: res.roomId };
    const now = store.getSimulatedTime();

    // FE03 / MSG22: Horário de início já passou sem decisão -> Expirada
    const startDateTime = SigaRules.parseDateTime(res.date, res.startTime);
    if (res.status === 'Pendente' && startDateTime && startDateTime < now) {
      // Atualiza reserva para expirada
      store.updateReservation(res.protocol, {
        status: 'Expirada',
        decidedAt: now.toISOString(),
        notes: (res.notes || '') + ' [Expirada automaticamente pois o horário de início foi ultrapassado]'
      });

      container.innerHTML = this.renderErrorCard(
        'Solicitação Expirada',
        SIGA_MESSAGES.MSG22 + ` O evento estava previsto para iniciar em ${res.date} às ${res.startTime}.`,
        'clock-alert'
      );
      if (window.lucide) lucide.createIcons();
      return;
    }

    // FE02 / MSG20: Reserva já decidida por outro administrador
    if (res.status !== 'Pendente') {
      const decidedDateFormatted = res.decidedAt ? new Date(res.decidedAt).toLocaleString('pt-BR') : 'Data não registrada';
      const isApproved = res.status === 'Aprovada';
      const isRejected = res.status === 'Recusada';

      container.innerHTML = `
        <div class="max-w-2xl mx-auto bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm text-center">
          <div class="w-16 h-16 ${isApproved ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'} rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i data-lucide="${isApproved ? 'check-circle' : 'x-circle'}" class="w-8 h-8"></i>
          </div>

          <span class="inline-block px-3 py-1 rounded-full text-xs font-bold ${isApproved ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'} mb-2">
            Status Atual: ${res.status} (RN10)
          </span>

          <h3 class="text-xl font-bold text-slate-900 mb-2">
            Decisão já Registrada!
          </h3>

          <p class="text-sm text-slate-600 mb-6">
            ${SIGA_MESSAGES.MSG20(res.decidedBy || 'outro administrador', decidedDateFormatted)}
          </p>

          ${isRejected && res.rejectionReason ? `
            <div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs mb-6">
              <span class="font-bold text-slate-700 block mb-1">Motivo da Recusa Registrado:</span>
              <p class="text-slate-600 italic">"${res.rejectionReason}"</p>
            </div>
          ` : ''}

          <div class="flex justify-center gap-3">
            <button 
              onclick="window.app.navigateToCalendar('${res.roomId}')"
              class="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center gap-2"
            >
              <i data-lucide="calendar" class="w-4 h-4"></i>
              Ver no Calendário
            </button>
            <button 
              onclick="window.app.navigateToEmailSimulator('${res.protocol}')"
              class="px-5 py-2.5 rounded-xl bg-[#151E3B] text-white text-xs font-bold hover:bg-[#1E294B] transition-colors inline-flex items-center gap-2"
            >
              <i data-lucide="mail" class="w-4 h-4 text-[#F6A723]"></i>
              Ver Registro de E-mail
            </button>
          </div>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    // Tela de Decisão Ativa (UC06)
    container.innerHTML = `
      <div class="max-w-3xl mx-auto">
        <!-- Banner de Autenticação Segura sem Login (RN18) -->
        <div class="mb-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
              ${admin ? admin.avatar : 'AD'}
            </div>
            <div>
              <div class="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <i data-lucide="shield-check" class="w-4 h-4 text-emerald-600"></i>
                Autenticado via Token Único de E-mail (Sem Login - RN18)
              </div>
              <div class="text-xs text-emerald-800">
                Administrador: <strong>${admin ? admin.name : 'Administrador'}</strong> (${admin ? admin.role : 'Consenso'})
              </div>
            </div>
          </div>
          <span class="text-[11px] font-mono text-emerald-700 bg-white/80 px-2 py-1 rounded border border-emerald-200">
            ${token.slice(0, 18)}...
          </span>
        </div>

        <!-- Card Principal da Solicitação -->
        <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-6">
          <div class="p-6 md:p-8 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 mb-2">
                <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                Aguardando Decisão (RN09)
              </span>
              <h2 class="text-2xl font-bold text-slate-900">
                ${res.eventName}
              </h2>
              <p class="text-xs text-slate-500 mt-1">
                Protocolo: <strong class="font-mono text-slate-700">${res.protocol}</strong> · Registrado em ${new Date(res.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>

            <div class="text-right">
              <span class="text-xs text-slate-400 block uppercase font-bold">Ambiente</span>
              <span class="text-lg font-black text-[#151E3B]">${room.name}</span>
            </div>
          </div>

          <!-- Dados Detalhados da Solicitação -->
          <div class="p-6 md:p-8 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span class="font-bold text-slate-500 uppercase tracking-wider block mb-2">Data e Horários</span>
                <div class="text-sm font-semibold text-slate-800 mb-1">
                  📅 ${res.date.split('-').reverse().join('/')}
                </div>
                <div class="text-slate-600">
                  ⏰ Das <strong>${res.startTime}</strong> às <strong>${res.endTime}</strong> (07:00–23:59)
                </div>
              </div>

              <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span class="font-bold text-slate-500 uppercase tracking-wider block mb-2">Responsável & Lotação</span>
                <div class="text-sm font-semibold text-slate-800 mb-1">
                  👤 ${res.requesterName}
                </div>
                <div class="text-slate-600">
                  ✉️ ${res.requesterEmail} · 👥 <strong>${res.participants} pessoas</strong>
                </div>
              </div>
            </div>

            <!-- Recursos Audiovisuais Solicitados -->
            <div>
              <span class="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Recursos Multimídia Solicitados (RN08):
              </span>
              <div class="flex flex-wrap gap-2">
                ${res.resources?.videoconferencia ? `
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                    <i data-lucide="video" class="w-3.5 h-3.5"></i> Videoconferência
                  </span>
                ` : ''}
                ${res.resources?.gravacao ? `
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
                    <i data-lucide="disc" class="w-3.5 h-3.5"></i> Gravação ao Vivo
                  </span>
                ` : ''}
                ${res.resources?.transmissao ? `
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                    <i data-lucide="radio" class="w-3.5 h-3.5"></i> Transmissão Online
                  </span>
                ` : ''}
                ${!res.resources?.videoconferencia && !res.resources?.gravacao && !res.resources?.transmissao ? `
                  <span class="text-xs text-slate-400 italic">Nenhum recurso audiovisual adicional solicitado.</span>
                ` : ''}
              </div>
            </div>

            <!-- Observações -->
            ${res.notes ? `
              <div>
                <span class="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Observações do Solicitante:
                </span>
                <p class="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  ${res.notes}
                </p>
              </div>
            ` : ''}

            <!-- Formulário de Recusa (visível quando ação for recusar) -->
            <div id="rejection-form-container" class="${this.currentAction === 'recusar' ? '' : 'hidden'} bg-rose-50/60 border border-rose-200 p-5 rounded-2xl">
              <label for="rejection-reason" class="block text-xs font-bold text-rose-950 uppercase tracking-wider mb-1">
                Motivo da Recusa (Obrigatório - RN17) *
              </label>
              <textarea 
                id="rejection-reason" 
                rows="3" 
                placeholder="Descreva detalhadamente o motivo para recusa da reserva (ex.: manutenção técnica agendada para a data, indisponibilidade de equipe de apoio)..."
                class="w-full px-3 py-2 bg-white border border-rose-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              ></textarea>
              <p class="text-[11px] text-rose-800 mt-1">
                O motivo informado será registrado e encaminhado aos 3 administradores no e-mail de fechamento (RN14).
              </p>
            </div>
          </div>

          <!-- Rodapé com Botões de Aprovação e Recusa (UC06) -->
          <div class="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="text-xs text-slate-500 flex items-center gap-1.5">
              <i data-lucide="info" class="w-4 h-4 text-slate-400"></i>
              A primeira decisão registrada prevalece (RN10).
            </div>

            <div class="flex items-center gap-3 w-full sm:w-auto">
              <!-- Botão Recusar -->
              <button 
                type="button" 
                id="decision-reject-btn"
                class="flex-1 sm:flex-none px-6 py-2.5 rounded-xl border border-rose-300 bg-white hover:bg-rose-50 text-rose-700 text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <i data-lucide="x" class="w-4 h-4"></i>
                <span>Recusar Reserva</span>
              </button>

              <!-- Botão Aprovar -->
              <button 
                type="button" 
                id="decision-approve-btn"
                class="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <i data-lucide="check" class="w-4 h-4"></i>
                <span>Confirmar Aprovação</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents(res, admin);
    if (window.lucide) lucide.createIcons();
  }

  bindEvents(res, admin) {
    const approveBtn = document.getElementById('decision-approve-btn');
    const rejectBtn = document.getElementById('decision-reject-btn');
    const rejectionContainer = document.getElementById('rejection-form-container');
    const rejectionInput = document.getElementById('rejection-reason');

    if (approveBtn) {
      approveBtn.onclick = () => {
        // Confirmação de aprovação (Fluxo Principal passo 4 do UC06)
        this.executeDecision(res, admin, 'Aprovada', null);
      };
    }

    if (rejectBtn) {
      rejectBtn.onclick = () => {
        // Se o container de motivo ainda estiver oculto, exibe ele primeiro
        if (rejectionContainer.classList.contains('hidden')) {
          rejectionContainer.classList.remove('hidden');
          if (rejectionInput) rejectionInput.focus();
          window.app.showToast('info', 'Por favor, informe o motivo da recusa.');
          return;
        }

        // Validação de motivo obrigatório (RN17 / FE04 / MSG19)
        const reason = rejectionInput ? rejectionInput.value.trim() : '';
        if (!reason) {
          window.app.showToast('error', SIGA_MESSAGES.MSG19);
          if (rejectionInput) rejectionInput.focus();
          return;
        }

        this.executeDecision(res, admin, 'Recusada', reason);
      };
    }
  }

  executeDecision(res, admin, outcome, rejectionReason) {
    const now = store.getSimulatedTime();
    const adminName = admin ? admin.name : 'Administrador';

    // Invalidação dos tokens dos demais administradores (RN10)
    const updatedTokens = {};
    for (const [key, val] of Object.entries(res.adminTokens || {})) {
      if (admin && key === admin.id) {
        updatedTokens[key] = val + '_used';
      } else {
        updatedTokens[key] = val + '_invalidated';
      }
    }

    // Atualiza a reserva no armazenamento
    store.updateReservation(res.protocol, {
      status: outcome,
      decidedBy: adminName,
      decidedAt: now.toISOString(),
      rejectionReason: outcome === 'Recusada' ? rejectionReason : null,
      adminTokens: updatedTokens
    });

    if (outcome === 'Aprovada') {
      window.app.showToast('success', SIGA_MESSAGES.MSG17(res.protocol));
    } else {
      window.app.showToast('info', SIGA_MESSAGES.MSG18(res.protocol));
    }

    // Re-renderiza a tela para exibir o resultado registrado
    this.render();
  }

  renderErrorCard(title, message, icon) {
    return `
      <div class="max-w-xl mx-auto bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center">
        <div class="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <i data-lucide="${icon || 'alert-triangle'}" class="w-7 h-7"></i>
        </div>
        <h3 class="text-lg font-bold text-slate-900 mb-2">${title}</h3>
        <p class="text-xs text-slate-500 mb-6 leading-relaxed">${message}</p>
        <button 
          onclick="window.app.navigateToCalendar()"
          class="px-5 py-2.5 rounded-xl bg-[#151E3B] text-white text-xs font-bold hover:bg-[#1E294B] transition-colors"
        >
          Voltar ao Calendário Público
        </button>
      </div>
    `;
  }
}
