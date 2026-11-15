/**
 * SIGA - Sistema Integrado de Gestão de Ambientes
 * MVP 1 - Regras de Negócio (RN01 a RN19) e Validações
 * Instituto Consenso - Convergência em Saúde
 */

const SigaRules = {
  // Converte data (YYYY-MM-DD) e hora (HH:MM) para objeto Date
  parseDateTime(dateStr, timeStr) {
    if (!dateStr || !timeStr) return null;
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes, 0, 0);
  },

  // Converte minutos para string HH:MM
  minutesToTimeString(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  },

  // Converte HH:MM para total de minutos desde 00:00
  timeStringToMinutes(timeStr) {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h * 60) + m;
  },

  // RN02: As locações ocorrem de 07:00 a 23:59, no mesmo dia
  validateOperatingHours(startTime, endTime) {
    const minTime = '07:00';
    const maxTime = '23:59';
    if (startTime < minTime || startTime > maxTime) return false;
    if (endTime < minTime || endTime > maxTime) return false;
    return true;
  },

  // RN04: A data/hora de início não pode estar no passado
  validateNotInPast(dateStr, startTimeStr, now = store.getSimulatedTime()) {
    const startDateTime = this.parseDateTime(dateStr, startTimeStr);
    if (!startDateTime) return false;
    return startDateTime.getTime() >= now.getTime();
  },

  // RN05: O horário de fim deve ser posterior ao de início (não há duração mínima)
  validateEndAfterStart(startTime, endTime) {
    if (!startTime || !endTime) return false;
    const startMin = this.timeStringToMinutes(startTime);
    const endMin = this.timeStringToMinutes(endTime);
    return endMin > startMin;
  },

  // RN03: Antecedência mínima (30 min para Salas 1 a 4; 24h para Auditório, Varanda e Podcast)
  validateMinimumNotice(roomId, dateStr, startTimeStr, now = store.getSimulatedTime()) {
    const room = SIGA_ROOMS.find(r => r.id === roomId);
    if (!room) return { valid: false, error: 'Ambiente não encontrado.' };

    const startDateTime = this.parseDateTime(dateStr, startTimeStr);
    if (!startDateTime) return { valid: false, error: 'Data ou horário inválido.' };

    const diffMinutes = Math.floor((startDateTime.getTime() - now.getTime()) / (1000 * 60));

    if (diffMinutes < room.minNoticeMinutes) {
      if (['sala-1', 'sala-2', 'sala-3', 'sala-4'].includes(roomId)) {
        return {
          valid: false,
          error: SIGA_MESSAGES.MSG08,
          diffMinutes,
          requiredMinutes: room.minNoticeMinutes
        };
      } else {
        return {
          valid: false,
          error: SIGA_MESSAGES.MSG09,
          diffMinutes,
          requiredMinutes: room.minNoticeMinutes
        };
      }
    }

    return { valid: true };
  },

  // RN07: O número de participantes deve ser >= 1 e <= capacidade máxima do ambiente
  validateCapacity(roomId, participants) {
    const room = SIGA_ROOMS.find(r => r.id === roomId);
    if (!room) return { valid: false, error: 'Ambiente inválido.' };

    const count = parseInt(participants, 10);
    if (isNaN(count) || count < 1) {
      return { valid: false, error: 'O número de participantes deve ser de no mínimo 1.' };
    }

    if (count > room.capacity) {
      return {
        valid: false,
        error: SIGA_MESSAGES.MSG11(room.name, room.capacity)
      };
    }

    return { valid: true };
  },

  // RN08: Os recursos só podem ser solicitados nos ambientes que os possuem
  validateResources(roomId, requestedResources) {
    const room = SIGA_ROOMS.find(r => r.id === roomId);
    if (!room) return { valid: false, error: 'Ambiente inválido.' };

    const invalidResources = [];
    if (requestedResources.videoconferencia && !room.resources.videoconferencia) {
      invalidResources.push('Videoconferência');
    }
    if (requestedResources.gravacao && !room.resources.gravacao) {
      invalidResources.push('Gravação ao vivo');
    }
    if (requestedResources.transmissao && !room.resources.transmissao) {
      invalidResources.push('Transmissão');
    }

    if (invalidResources.length > 0) {
      return {
        valid: false,
        invalidResources,
        error: SIGA_MESSAGES.MSG12(invalidResources.join(', '), room.name)
      };
    }

    return { valid: true };
  },

  // Validação simples de formato de e-mail (FE02 / MSG13)
  validateEmail(email) {
    if (!email) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
  },

  // UC04 / RN06: Validar e Bloquear Conflito de Horário
  // Há conflito se: início_novo < fim_existente && fim_novo > início_existente
  // Reservas Pendentes e Aprovadas bloqueiam o horário.
  // Reservas Recusadas NÃO bloqueiam.
  // Reservas adjacentes (ex: 10:00-11:00 e 11:00-12:00) NÃO geram conflito.
  checkTimeConflict(roomId, dateStr, startTimeStr, endTimeStr, ignoreProtocol = null) {
    const allReservations = store.getReservations();
    const newStart = this.timeStringToMinutes(startTimeStr);
    const newEnd = this.timeStringToMinutes(endTimeStr);

    for (const res of allReservations) {
      // Ignora se for a mesma reserva (caso de edição futura), ou outro ambiente, ou outra data
      if (ignoreProtocol && res.protocol === ignoreProtocol) continue;
      if (res.roomId !== roomId) continue;
      if (res.date !== dateStr) continue;

      // RN06: Apenas Pendentes e Aprovadas contam como bloqueio
      if (res.status !== 'Pendente' && res.status !== 'Aprovada') continue;

      const existingStart = this.timeStringToMinutes(res.startTime);
      const existingEnd = this.timeStringToMinutes(res.endTime);

      // Teste de intersecção estrita de intervalos
      if (newStart < existingEnd && newEnd > existingStart) {
        return {
          hasConflict: true,
          conflictingReservation: res,
          error: SIGA_MESSAGES.MSG10,
          details: `Conflito com "${res.eventName}" (${res.startTime} às ${res.endTime} - ${res.status})`
        };
      }
    }

    return { hasConflict: false };
  },

  // Validação completa para submissão do UC03
  validateReservationForm(data) {
    const errors = [];

    // 1. Campos obrigatórios (MSG04 / FE01)
    if (!data.roomId || !data.eventName?.trim() || !data.date || !data.startTime || !data.endTime || !data.requesterName?.trim() || !data.requesterEmail?.trim() || !data.participants) {
      return { valid: false, generalError: SIGA_MESSAGES.MSG04 };
    }

    // 2. Validação de formato de e-mail (MSG13 / FE02)
    if (!this.validateEmail(data.requesterEmail)) {
      return { valid: false, field: 'requesterEmail', error: SIGA_MESSAGES.MSG13 };
    }

    // 3. Validação de data/hora no passado (MSG05 / FE03)
    if (!this.validateNotInPast(data.date, data.startTime)) {
      return { valid: false, field: 'startTime', error: SIGA_MESSAGES.MSG05 };
    }

    // 4. Fora do horário de locação (MSG07 / FE04)
    if (!this.validateOperatingHours(data.startTime, data.endTime)) {
      return { valid: false, field: 'startTime', error: SIGA_MESSAGES.MSG07 };
    }

    // 5. Horário de fim não posterior ao de início (MSG06 / FE05)
    if (!this.validateEndAfterStart(data.startTime, data.endTime)) {
      return { valid: false, field: 'endTime', error: SIGA_MESSAGES.MSG06 };
    }

    // 6. Antecedência mínima (MSG08 / MSG09 / FE06)
    const noticeCheck = this.validateMinimumNotice(data.roomId, data.date, data.startTime);
    if (!noticeCheck.valid) {
      return { valid: false, field: 'startTime', error: noticeCheck.error };
    }

    // 7. Capacidade máxima (MSG11 / FE07)
    const capCheck = this.validateCapacity(data.roomId, data.participants);
    if (!capCheck.valid) {
      return { valid: false, field: 'participants', error: capCheck.error };
    }

    // 8. Recursos permitidos (MSG12 / FE08)
    const resCheck = this.validateResources(data.roomId, data.resources || {});
    if (!resCheck.valid) {
      return { valid: false, field: 'resources', error: resCheck.error };
    }

    // 9. Conflito de horários (MSG10 / FE09 / UC04)
    const conflictCheck = this.checkTimeConflict(data.roomId, data.date, data.startTime, data.endTime);
    if (conflictCheck.hasConflict) {
      return { valid: false, field: 'timeRange', error: conflictCheck.error, details: conflictCheck.details };
    }

    return { valid: true };
  },

  // Calcula o status em tempo real de cada ambiente para o UC02 (Livre ou Ocupado)
  getRoomCurrentStatus(roomId, now = store.getSimulatedTime()) {
    const todayStr = now.toISOString().split('T')[0];
    const currentHours = now.getHours();
    const currentMins = now.getMinutes();
    const currentTimeStr = `${String(currentHours).padStart(2, '0')}:${String(currentMins).padStart(2, '0')}`;
    const currentMinutes = (currentHours * 60) + currentMins;

    const reservations = store.getReservations();
    const active = reservations.find(r => {
      if (r.roomId !== roomId || r.date !== todayStr) return false;
      if (r.status !== 'Aprovada' && r.status !== 'Pendente') return false;

      const start = SigaRules.timeStringToMinutes(r.startTime);
      const end = SigaRules.timeStringToMinutes(r.endTime);

      return currentMinutes >= start && currentMinutes < end;
    });

    if (active) {
      return {
        status: 'Ocupado',
        colorClass: 'badge-aprovada',
        reservation: active,
        message: `Ocupado por "${active.eventName}" até às ${active.endTime} (${active.status})`
      };
    }

    return {
      status: 'Livre',
      colorClass: 'badge-livre',
      reservation: null,
      message: 'Disponível para reservas neste horário'
    };
  },

  // Gera os tokens únicos para cada um dos 3 administradores (RN13 / UC05)
  generateAdminTokens(protocol) {
    const timestamp = Date.now().toString(36);
    return {
      'admin-1': `tok_${protocol.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}_adm1_${timestamp}`,
      'admin-2': `tok_${protocol.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}_adm2_${timestamp}`,
      'admin-3': `tok_${protocol.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}_adm3_${timestamp}`
    };
  }
};
