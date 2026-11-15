/**
 * SIGA - Sistema Integrado de Gestão de Ambientes
 * MVP 1 - UC03: Solicitar Reserva de Ambiente
 * Instituto Consenso - Convergência em Saúde
 */

class SigaBooking {
  constructor() {
    this.formData = {
      roomId: '',
      eventName: '',
      date: '',
      startTime: '',
      endTime: '',
      participants: '',
      resources: {
        videoconferencia: false,
        gravacao: false,
        transmissao: false
      },
      requesterName: '',
      requesterEmail: '',
      notes: ''
    };
  }

  setInitialValues(values = {}) {
    this.formData = {
      ...this.formData,
      ...values,
      resources: {
        videoconferencia: false,
        gravacao: false,
        transmissao: false,
        ...(values.resources || {})
      }
    };
  }

  render() {
    const container = document.getElementById('booking-view-container');
    if (!container) return;

    // Se a data não foi pré-definida, sugere a data simulada
    const now = store.getSimulatedTime();
    if (!this.formData.date) {
      this.formData.date = now.toISOString().split('T')[0];
    }
    if (!this.formData.startTime) {
      this.formData.startTime = '10:00';
    }
    if (!this.formData.endTime) {
      this.formData.endTime = '11:30';
    }

    const selectedRoom = SIGA_ROOMS.find(r => r.id === this.formData.roomId);

    container.innerHTML = `
      <div class="max-w-4xl mx-auto">
        <!-- Cabeçalho do Formulário -->
        <div class="mb-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#151E3B]/10 text-[#151E3B] mb-2">
              <i data-lucide="file-signature" class="w-3.5 h-3.5 text-[#F6A723]"></i>
              Solicitação Oficial de Reserva
            </div>
            <h2 class="text-2xl font-bold text-slate-900">
              Solicitar Reserva de Ambiente
            </h2>
            <p class="text-sm text-slate-500 mt-1">
              Preencha os dados da solicitação. Toda reserva é gerada com status <strong class="text-amber-600 font-semibold">Pendente</strong> e requer liberação de um dos 3 administradores.
            </p>
          </div>

          <button 
            type="button" 
            id="form-fill-demo-btn"
            class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors shrink-0"
            title="Preencher com dados de teste para apresentação rápida"
          >
            <i data-lucide="sparkles" class="w-4 h-4 text-[#F6A723]"></i>
            Preencher Demonstração
          </button>
        </div>

        <!-- Banner com Alertas e Regras Importantes -->
        <div class="mb-6 bg-blue-50/70 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900 flex items-start gap-3">
          <i data-lucide="info" class="w-5 h-5 text-blue-600 shrink-0 mt-0.5"></i>
          <div>
            <span class="font-bold">Regras do Instituto Consenso:</span>
            Horário de funcionamento das <strong>07:00 às 23:59</strong> no mesmo dia. Antecedência mínima de <strong>30 minutos</strong> (Salas 1 a 4) e de <strong>24 horas</strong> (Auditório, Varanda e Sala de Podcast). Conflitos com reservas Pendentes ou Aprovadas são bloqueados automaticamente.
          </div>
        </div>

        <!-- Formulário Principal -->
        <form id="siga-booking-form" class="space-y-6">
          <!-- 1. Seleção do Ambiente -->
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 class="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 mb-4">
              <span class="w-6 h-6 rounded-full bg-[#151E3B] text-white flex items-center justify-center text-xs">1</span>
              Escolha do Ambiente *
            </h3>

            <div>
              <label for="book-room" class="block text-xs font-semibold text-slate-700 mb-1">
                Ambiente Desejado (RN01) *
              </label>
              <select 
                id="book-room" 
                name="roomId" 
                required 
                class="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#151E3B] focus:border-[#151E3B] transition-all"
              >
                <option value="" disabled ${!this.formData.roomId ? 'selected' : ''}>Selecione um dos 7 ambientes...</option>
                ${SIGA_ROOMS.map(r => `
                  <option value="${r.id}" ${this.formData.roomId === r.id ? 'selected' : ''}>
                    ${r.name} (Capacidade máx: ${r.capacity} pessoas · Antecedência: ${r.minNoticeLabel})
                  </option>
                `).join('')}
              </select>
            </div>

            <!-- Informações dinâmicas do ambiente selecionado -->
            <div id="room-details-callout" class="mt-4 ${selectedRoom ? '' : 'hidden'}">
              ${selectedRoom ? this.renderSelectedRoomInfo(selectedRoom) : ''}
            </div>
          </div>

          <!-- 2. Dados do Evento e Participantes -->
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 class="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 mb-4">
              <span class="w-6 h-6 rounded-full bg-[#151E3B] text-white flex items-center justify-center text-xs">2</span>
              Dados do Evento & Participantes *
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="md:col-span-2">
                <label for="book-event-name" class="block text-xs font-semibold text-slate-700 mb-1">
                  Nome do Evento / Reunião *
                </label>
                <input 
                  type="text" 
                  id="book-event-name" 
                  name="eventName" 
                  required 
                  value="${this.formData.eventName || ''}"
                  placeholder="Ex.: Reunião do Comitê de Bioética"
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#151E3B] focus:border-[#151E3B] transition-all"
                />
              </div>

              <div>
                <label for="book-participants" class="block text-xs font-semibold text-slate-700 mb-1">
                  Nº de Participantes (RN07) *
                </label>
                <input 
                  type="number" 
                  id="book-participants" 
                  name="participants" 
                  required 
                  min="1"
                  max="${selectedRoom ? selectedRoom.capacity : 70}"
                  value="${this.formData.participants || ''}"
                  placeholder="${selectedRoom ? `Máx ${selectedRoom.capacity}` : 'Ex.: 8'}"
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#151E3B] focus:border-[#151E3B] transition-all"
                />
                <p id="participants-hint" class="text-[11px] text-slate-400 mt-1">
                  ${selectedRoom ? `Limite de ${selectedRoom.capacity} pessoas para ${selectedRoom.name}.` : 'Informe a quantidade esperada.'}
                </p>
              </div>
            </div>

            <!-- Recursos Audiovisuais Dinâmicos (RN08 / HU10) -->
            <div class="mt-5 pt-4 border-t border-slate-100">
              <div class="text-xs font-semibold text-slate-700 mb-2 flex items-center justify-between">
                <span>Recursos Audiovisuais Desejados (RN08):</span>
                <span class="text-[11px] text-slate-400 font-normal">Habilitados conforme o ambiente</span>
              </div>

              <div id="resources-container" class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                ${this.renderResourceCheckboxes(selectedRoom)}
              </div>
            </div>
          </div>

          <!-- 3. Data e Horários -->
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 class="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 mb-4">
              <span class="w-6 h-6 rounded-full bg-[#151E3B] text-white flex items-center justify-center text-xs">3</span>
              Data e Horário da Reserva (RN02 a RN06) *
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label for="book-date" class="block text-xs font-semibold text-slate-700 mb-1">
                  Data da Reserva *
                </label>
                <input 
                  type="date" 
                  id="book-date" 
                  name="date" 
                  required 
                  value="${this.formData.date || ''}"
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#151E3B] focus:border-[#151E3B] transition-all"
                />
              </div>

              <div>
                <label for="book-start-time" class="block text-xs font-semibold text-slate-700 mb-1">
                  Horário de Início (>= 07:00) *
                </label>
                <input 
                  type="time" 
                  id="book-start-time" 
                  name="startTime" 
                  required 
                  step="300"
                  value="${this.formData.startTime || '10:00'}"
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#151E3B] focus:border-[#151E3B] transition-all"
                />
              </div>

              <div>
                <label for="book-end-time" class="block text-xs font-semibold text-slate-700 mb-1">
                  Horário de Fim (<= 23:59) *
                </label>
                <input 
                  type="time" 
                  id="book-end-time" 
                  name="endTime" 
                  required 
                  step="300"
                  value="${this.formData.endTime || '11:30'}"
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#151E3B] focus:border-[#151E3B] transition-all"
                />
              </div>
            </div>

            <!-- Feedback de Conflito e Duração em Tempo Real -->
            <div id="time-conflict-feedback" class="mt-3 hidden"></div>
          </div>

          <!-- 4. Responsável e Observações -->
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 class="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 mb-4">
              <span class="w-6 h-6 rounded-full bg-[#151E3B] text-white flex items-center justify-center text-xs">4</span>
              Dados do Responsável & Observações *
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="book-requester-name" class="block text-xs font-semibold text-slate-700 mb-1">
                  Nome do Responsável / Solicitante *
                </label>
                <input 
                  type="text" 
                  id="book-requester-name" 
                  name="requesterName" 
                  required 
                  value="${this.formData.requesterName || ''}"
                  placeholder="Ex.: Cíntia Ramos (ou Dr. Carlos)"
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#151E3B] focus:border-[#151E3B] transition-all"
                />
                <p class="text-[11px] text-slate-400 mt-1">
                  Permite reserva em nome de terceiros (FA02 do UC03).
                </p>
              </div>

              <div>
                <label for="book-requester-email" class="block text-xs font-semibold text-slate-700 mb-1">
                  E-mail de Contato do Responsável *
                </label>
                <input 
                  type="email" 
                  id="book-requester-email" 
                  name="requesterEmail" 
                  required 
                  value="${this.formData.requesterEmail || ''}"
                  placeholder="responsavel@consenso.org.br"
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#151E3B] focus:border-[#151E3B] transition-all"
                />
                <p class="text-[11px] text-slate-400 mt-1">
                  Usado como dado de contato para a administração (RN19).
                </p>
              </div>
            </div>

            <div class="mt-4">
              <label for="book-notes" class="block text-xs font-semibold text-slate-700 mb-1">
                Observações Adicionais (Opcional)
              </label>
              <textarea 
                id="book-notes" 
                name="notes" 
                rows="2" 
                placeholder="Ex.: Necessidade de apoio técnico para conexão ou disposição especial de cadeiras."
                class="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#151E3B] focus:border-[#151E3B] transition-all"
              >${this.formData.notes || ''}</textarea>
            </div>
          </div>

          <!-- Botões de Ação do Formulário -->
          <div class="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
            <button 
              type="button" 
              id="form-cancel-btn"
              class="w-full sm:w-auto px-6 py-3 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>

            <button 
              type="submit" 
              id="form-submit-btn"
              class="w-full sm:w-auto px-8 py-3 bg-[#151E3B] hover:bg-[#1E294B] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
            >
              <i data-lucide="send" class="w-4 h-4 text-[#F6A723] group-hover:translate-x-0.5 transition-transform"></i>
              <span>Solicitar Reserva</span>
            </button>
          </div>
        </form>
      </div>
    `;

    this.bindEvents();
    if (window.lucide) {
      lucide.createIcons();
    }
  }

  renderSelectedRoomInfo(room) {
    return `
      <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <span class="font-bold text-slate-800">${room.name}</span>
          <span class="text-slate-400">|</span>
          <span>Capacidade máxima: <strong>${room.capacity} pessoas</strong></span>
          <span class="text-slate-400">|</span>
          <span>Antecedência mínima: <strong class="text-slate-800">${room.minNoticeLabel}</strong></span>
        </div>
        <div class="text-[11px] text-slate-500 font-medium">
          ${room.category}
        </div>
      </div>
    `;
  }

  renderResourceCheckboxes(room) {
    if (!room) {
      return `
        <div class="col-span-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-500 text-center">
          Selecione primeiro um ambiente para ver os recursos audiovisuais disponíveis.
        </div>
      `;
    }

    const hasAny = room.resources.videoconferencia || room.resources.gravacao || room.resources.transmissao;

    if (!hasAny) {
      return `
        <div class="col-span-3 p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
          <i data-lucide="alert-circle" class="w-4 h-4 text-amber-600 shrink-0"></i>
          <span>Este ambiente (${room.name}) não possui recursos audiovisuais adicionais para solicitação.</span>
        </div>
      `;
    }

    return `
      ${room.resources.videoconferencia ? `
        <label class="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors bg-white">
          <input 
            type="checkbox" 
            name="res_videoconferencia" 
            class="mt-0.5 rounded text-[#151E3B] focus:ring-[#151E3B]"
            ${this.formData.resources.videoconferencia ? 'checked' : ''}
          />
          <div>
            <span class="text-xs font-bold text-slate-800 block">Videoconferência</span>
            <span class="text-[11px] text-slate-500">Câmera e áudio para reunião híbrida</span>
          </div>
        </label>
      ` : ''}

      ${room.resources.gravacao ? `
        <label class="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors bg-white">
          <input 
            type="checkbox" 
            name="res_gravacao" 
            class="mt-0.5 rounded text-[#151E3B] focus:ring-[#151E3B]"
            ${this.formData.resources.gravacao ? 'checked' : ''}
          />
          <div>
            <span class="text-xs font-bold text-slate-800 block">Gravação ao Vivo</span>
            <span class="text-[11px] text-slate-500">Captação em HD para arquivo institucional</span>
          </div>
        </label>
      ` : ''}

      ${room.resources.transmissao ? `
        <label class="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors bg-white">
          <input 
            type="checkbox" 
            name="res_transmissao" 
            class="mt-0.5 rounded text-[#151E3B] focus:ring-[#151E3B]"
            ${this.formData.resources.transmissao ? 'checked' : ''}
          />
          <div>
            <span class="text-xs font-bold text-slate-800 block">Transmissão</span>
            <span class="text-[11px] text-slate-500">Streaming online para canal oficial</span>
          </div>
        </label>
      ` : ''}
    `;
  }

  bindEvents() {
    const form = document.getElementById('siga-booking-form');
    const roomSelect = document.getElementById('book-room');
    const participantsInput = document.getElementById('book-participants');
    const demoBtn = document.getElementById('form-fill-demo-btn');
    const cancelBtn = document.getElementById('form-cancel-btn');

    // Botão de Preenchimento Rápido para Demonstração
    if (demoBtn) {
      demoBtn.onclick = () => {
        const now = store.getSimulatedTime();
        const dateStr = now.toISOString().split('T')[0];
        this.setInitialValues({
          roomId: 'sala-1',
          eventName: 'Reunião de Alinhamento - Pesquisa Clínica',
          date: dateStr,
          startTime: '16:00',
          endTime: '17:30',
          participants: 12,
          resources: {
            videoconferencia: true,
            gravacao: false,
            transmissao: false
          },
          requesterName: 'Cíntia Ramos (Secretaria Executiva)',
          requesterEmail: 'cintia.secretaria@consenso.org.br',
          notes: 'Será necessário projetor e apoio para conectar 2 participantes remotos.'
        });
        this.render();
        window.app.showToast('info', 'Campos preenchidos com dados de demonstração!');
      };
    }

    if (cancelBtn) {
      cancelBtn.onclick = () => {
        window.app.navigateToCalendar();
      };
    }

    // Mudança de ambiente (RN08 / FE08: Desmarca recursos que não existem no novo ambiente)
    if (roomSelect) {
      roomSelect.onchange = (e) => {
        const newRoomId = e.target.value;
        const previousRoom = SIGA_ROOMS.find(r => r.id === this.formData.roomId);
        const newRoom = SIGA_ROOMS.find(r => r.id === newRoomId);

        this.formData.roomId = newRoomId;

        // Verifica se algum recurso selecionado anteriormente não é suportado pelo novo ambiente
        if (newRoom) {
          let strippedResources = [];
          if (this.formData.resources.videoconferencia && !newRoom.resources.videoconferencia) {
            this.formData.resources.videoconferencia = false;
            strippedResources.push('Videoconferência');
          }
          if (this.formData.resources.gravacao && !newRoom.resources.gravacao) {
            this.formData.resources.gravacao = false;
            strippedResources.push('Gravação ao vivo');
          }
          if (this.formData.resources.transmissao && !newRoom.resources.transmissao) {
            this.formData.resources.transmissao = false;
            strippedResources.push('Transmissão');
          }

          if (strippedResources.length > 0) {
            window.app.showToast('warning', SIGA_MESSAGES.MSG12(strippedResources.join(', '), newRoom.name));
          }

          // Atualiza capacidade máxima no input
          if (participantsInput) {
            participantsInput.max = newRoom.capacity;
            const currentCount = parseInt(participantsInput.value, 10);
            if (!isNaN(currentCount) && currentCount > newRoom.capacity) {
              window.app.showToast('error', SIGA_MESSAGES.MSG11(newRoom.name, newRoom.capacity));
            }
          }
        }

        // Re-renderiza o bloco de recursos e callout
        const callout = document.getElementById('room-details-callout');
        if (callout && newRoom) {
          callout.innerHTML = this.renderSelectedRoomInfo(newRoom);
          callout.classList.remove('hidden');
        }

        const resContainer = document.getElementById('resources-container');
        if (resContainer) {
          resContainer.innerHTML = this.renderResourceCheckboxes(newRoom);
          this.bindResourceCheckboxes();
        }

        if (window.lucide) lucide.createIcons();
      };
    }

    this.bindResourceCheckboxes();

    // Validação ao submeter o formulário
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        this.submitForm();
      };
    }
  }

  bindResourceCheckboxes() {
    const form = document.getElementById('siga-booking-form');
    if (!form) return;

    ['videoconferencia', 'gravacao', 'transmissao'].forEach(resKey => {
      const chk = form.querySelector(`input[name="res_${resKey}"]`);
      if (chk) {
        chk.onchange = (e) => {
          this.formData.resources[resKey] = e.target.checked;
        };
      }
    });
  }

  submitForm() {
    const form = document.getElementById('siga-booking-form');
    if (!form) return;

    // Coleta dados dos inputs
    const roomId = form.roomId.value;
    const eventName = form.eventName.value.trim();
    const date = form.date.value;
    const startTime = form.startTime.value;
    const endTime = form.endTime.value;
    const participants = parseInt(form.participants.value, 10);
    const requesterName = form.requesterName.value.trim();
    const requesterEmail = form.requesterEmail.value.trim();
    const notes = form.notes.value.trim();

    const dataToValidate = {
      roomId,
      eventName,
      date,
      startTime,
      endTime,
      participants,
      resources: this.formData.resources,
      requesterName,
      requesterEmail,
      notes
    };

    // Validação de todas as regras pelo SigaRules
    const validation = SigaRules.validateReservationForm(dataToValidate);

    if (!validation.valid) {
      if (validation.generalError) {
        window.app.showToast('error', validation.generalError);
      } else if (validation.error) {
        window.app.showToast('error', validation.error);
        if (validation.details) {
          window.app.showToast('warning', validation.details);
        }
      }
      return;
    }

    // Gerar Protocolo único SIGA-AAAA-NNN (RN12)
    const protocol = store.generateNextProtocol();

    // Gerar tokens únicos individuais para os 3 administradores (RN13 / UC05)
    const adminTokens = SigaRules.generateAdminTokens(protocol);

    // Criar objeto da reserva com status inicial 'Pendente' (RN09)
    const newReservation = {
      protocol,
      roomId,
      eventName,
      date,
      startTime,
      endTime,
      participants,
      resources: { ...this.formData.resources },
      requesterName,
      requesterEmail,
      notes,
      status: 'Pendente', // RN09
      createdAt: new Date().toISOString(),
      decidedBy: null,
      decidedAt: null,
      rejectionReason: null,
      adminTokens
    };

    try {
      // Salva no banco de dados local (store)
      store.addReservation(newReservation);

      // Exibe Toast de confirmação oficial MSG14
      window.app.showToast('success', SIGA_MESSAGES.MSG14(protocol));

      // Abre modal de confirmação do protocolo com resumo completo
      this.showSuccessConfirmationModal(newReservation);

    } catch (err) {
      console.error('Falha ao gravar:', err);
      // FE10 / MSG16: Falha ao gravar a reserva
      window.app.showToast('error', SIGA_MESSAGES.MSG16);
    }
  }

  showSuccessConfirmationModal(res) {
    const room = SIGA_ROOMS.find(r => r.id === res.roomId);
    const modalContainer = document.getElementById('app-modal-container');
    if (!modalContainer) return;

    modalContainer.innerHTML = `
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-slate-100 transform transition-all animate-in fade-in zoom-in-95">
          <!-- Ícone de Sucesso -->
          <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i data-lucide="check-check" class="w-8 h-8"></i>
          </div>

          <div class="text-center mb-6">
            <span class="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 mb-2">
              Status: Pendente de Liberação (RN09)
            </span>
            <h3 class="text-2xl font-black text-slate-900">
              Solicitação Registrada!
            </h3>
            <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Sua reserva foi encaminhada aos 3 administradores institucionais.
            </p>
          </div>

          <!-- Protocolo em destaque -->
          <div class="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center mb-6 relative">
            <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Número de Protocolo Único (RN12)
            </div>
            <div class="text-2xl md:text-3xl font-mono font-black text-[#151E3B] tracking-wider my-1" id="modal-protocol-text">
              ${res.protocol}
            </div>
            <button 
              id="copy-protocol-btn" 
              class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1 rounded-lg shadow-2xs transition-colors mt-1"
              title="Copiar protocolo para a área de transferência"
            >
              <i data-lucide="copy" class="w-3.5 h-3.5"></i>
              <span>Copiar Protocolo</span>
            </button>
          </div>

          <!-- Resumo dos Dados -->
          <div class="space-y-2.5 text-xs text-slate-600 bg-slate-50/70 p-4 rounded-xl border border-slate-200 mb-6">
            <div class="flex justify-between">
              <span class="text-slate-400">Evento:</span>
              <strong class="text-slate-800 text-right">${res.eventName}</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Ambiente:</span>
              <strong class="text-slate-800">${room.name} (${room.location})</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Data e Horário:</span>
              <strong class="text-slate-800">${res.date.split('-').reverse().join('/')} das ${res.startTime} às ${res.endTime}</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Responsável:</span>
              <strong class="text-slate-800">${res.requesterName} (${res.requesterEmail})</strong>
            </div>
          </div>

          <!-- Botões de Ação do Modal -->
          <div class="flex flex-col sm:flex-row gap-3">
            <button 
              id="modal-view-cal-btn"
              class="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
            >
              <i data-lucide="calendar" class="w-4 h-4"></i>
              Ver no Calendário
            </button>

            <!-- Acesso rápido à Simulação do E-mail do Administrador (UC05 / UC06) -->
            <button 
              id="modal-view-admin-email-btn"
              class="flex-1 px-4 py-2.5 rounded-xl bg-[#151E3B] hover:bg-[#1E294B] text-xs font-bold text-white transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <i data-lucide="mail" class="w-4 h-4 text-[#F6A723]"></i>
              Ver E-mail dos Admins
            </button>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();

    // Eventos do Modal
    const copyBtn = document.getElementById('copy-protocol-btn');
    if (copyBtn) {
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(res.protocol).then(() => {
          window.app.showToast('info', `Protocolo ${res.protocol} copiado!`);
        });
      };
    }

    const viewCalBtn = document.getElementById('modal-view-cal-btn');
    if (viewCalBtn) {
      viewCalBtn.onclick = () => {
        modalContainer.innerHTML = '';
        window.app.navigateToCalendar(res.roomId);
      };
    }

    const viewAdminEmailBtn = document.getElementById('modal-view-admin-email-btn');
    if (viewAdminEmailBtn) {
      viewAdminEmailBtn.onclick = () => {
        modalContainer.innerHTML = '';
        window.app.navigateToEmailSimulator(res.protocol);
      };
    }
  }
}
