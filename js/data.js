/**
 * SIGA - Sistema Integrado de Gestão de Ambientes
 * MVP 1 - Estruturas de Dados e Armazenamento (LocalStorage)
 * Instituto Consenso - Convergência em Saúde
 */

// 1.1 e RN01: Os 7 ambientes fixos com suas capacidades, antecedências e recursos
const SIGA_ROOMS = [
  {
    id: 'sala-1',
    name: 'Sala 1',
    category: 'Reunião Executiva',
    capacity: 20,
    minNoticeMinutes: 30, // RN03
    minNoticeLabel: '30 minutos',
    resources: {
      videoconferencia: true,
      gravacao: false,
      transmissao: false
    },
    description: 'Espaço executivo climatizado com mesa de conferência, monitor e sistema de áudio.',
    location: 'Ala Norte - 1º Andar',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  {
    id: 'sala-2',
    name: 'Sala 2',
    category: 'Alinhamento & Comitês',
    capacity: 10,
    minNoticeMinutes: 30, // RN03
    minNoticeLabel: '30 minutos',
    resources: {
      videoconferencia: true,
      gravacao: false,
      transmissao: false
    },
    description: 'Sala planejada para reuniões departamentais, bancas e comitês de projetos.',
    location: 'Ala Norte - 1º Andar',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  },
  {
    id: 'sala-3',
    name: 'Sala 3',
    category: 'Grupos de Estudo & Atendimento',
    capacity: 5,
    minNoticeMinutes: 30, // RN03
    minNoticeLabel: '30 minutos',
    resources: {
      videoconferencia: true,
      gravacao: false,
      transmissao: false
    },
    description: 'Ambiente dinâmico para reuniões rápidas, atendimentos individuais e tutorias.',
    location: 'Ala Sul - Térreo',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  {
    id: 'sala-4',
    name: 'Sala 4',
    category: 'Trabalho Focado & Atendimento',
    capacity: 5,
    minNoticeMinutes: 30, // RN03
    minNoticeLabel: '30 minutos',
    resources: {
      videoconferencia: false,
      gravacao: false,
      transmissao: false
    },
    description: 'Sala de trabalho focado e atendimento direto, com mesa de trabalho e isolamento acústico leve.',
    location: 'Ala Sul - Térreo',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200'
  },
  {
    id: 'sala-podcast',
    name: 'Sala de Podcast',
    category: 'Estúdio de Produção de Mídia',
    capacity: 4,
    minNoticeMinutes: 1440, // 24h = 1440 min (RN03)
    minNoticeLabel: '24 horas',
    resources: {
      videoconferencia: false,
      gravacao: false,
      transmissao: false
    },
    description: 'Estúdio com revestimento acústico profissional, 4 microfones direcionais e fones de monitoramento.',
    location: 'Subsolo Multimídia',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  {
    id: 'auditorio',
    name: 'Auditório',
    category: 'Eventos Solenes & Simpósios',
    capacity: 70,
    minNoticeMinutes: 1440, // 24h (RN03)
    minNoticeLabel: '24 horas',
    resources: {
      videoconferencia: true,
      gravacao: true,
      transmissao: true
    },
    description: 'Auditório master com poltronas ergonômicas, palco, cabine técnica e sistema completo de transmissão.',
    location: 'Bloco Central - Térreo',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  {
    id: 'varanda-externa',
    name: 'Varanda Externa',
    category: 'Convivência & Networking',
    capacity: 70,
    minNoticeMinutes: 1440, // 24h (RN03)
    minNoticeLabel: '24 horas',
    resources: {
      videoconferencia: false,
      gravacao: false,
      transmissao: false
    },
    description: 'Espaço arejado ao ar livre, integrado ao jardim do Instituto, ideal para coffee breaks e recepções.',
    location: 'Área Externa - Jardim',
    badgeClass: 'bg-orange-50 text-orange-800 border-orange-200'
  }
];

// 2. Atores: Administradores do Instituto Consenso
const SIGA_ADMINS = [
  {
    id: 'admin-1',
    name: 'Dra. Camila Mendes',
    role: 'Diretora Executiva',
    email: 'dra.camila@consenso.org.br',
    avatar: 'CM'
  },
  {
    id: 'admin-2',
    name: 'Dr. Roberto Silva',
    role: 'Coord. Operações & Gestão',
    email: 'dr.roberto@consenso.org.br',
    avatar: 'RS'
  },
  {
    id: 'admin-3',
    name: 'Marcos Vinicius',
    role: 'Gestor de Infraestrutura',
    email: 'marcos.infra@consenso.org.br',
    avatar: 'MV'
  }
];

// 5. Mensagens Oficiais de Sucesso e Erro (MSG01 a MSG23)
const SIGA_MESSAGES = {
  MSG01: 'Não foi possível carregar o calendário. Tente novamente.',
  MSG02: 'Nenhuma reserva neste dia. Todos os ambientes estão livres.',
  MSG03: 'Não foi possível carregar os ambientes. Tente novamente.',
  MSG04: 'Por favor, preencha todos os campos obrigatórios.',
  MSG05: 'A data e o horário da reserva não podem estar no passado.',
  MSG06: 'O horário de fim deve ser posterior ao horário de início.',
  MSG07: 'As reservas devem ocorrer entre 07:00 e 23:59.',
  MSG08: 'Para as Salas 1, 2, 3 e 4, a reserva deve ser feita com no mínimo 30 minutos de antecedência.',
  MSG09: 'Para o Auditório, a Varanda Externa e a Sala de Podcast, a reserva deve ser feita com no mínimo 24 horas de antecedência.',
  MSG10: 'O ambiente já está reservado neste período. Escolha outro horário.',
  MSG11: (roomName, max) => `O ambiente ${roomName} comporta no máximo ${max} pessoas.`,
  MSG12: (resource, roomName) => `O recurso "${resource}" não está disponível no ambiente ${roomName}.`,
  MSG13: 'Informe um e-mail válido.',
  MSG14: (protocol) => `Solicitação registrada! Protocolo ${protocol}. Aguarde a liberação por um administrador e acompanhe a situação no calendário.`,
  MSG15: 'Solicitação registrada, mas o e-mail aos administradores não pôde ser enviado. Uma nova tentativa será feita.',
  MSG16: 'Não foi possível registrar a solicitação. Tente novamente.',
  MSG17: (protocol) => `Reserva ${protocol} aprovada com sucesso.`,
  MSG18: (protocol) => `Reserva ${protocol} recusada. O horário foi liberado.`,
  MSG19: 'Informe o motivo da recusa.',
  MSG20: (adminName, dateTime) => `Esta solicitação já foi analisada por ${adminName} em ${dateTime}.`,
  MSG21: 'Link inválido.',
  MSG22: 'Esta solicitação expirou, pois o horário de início já passou.',
  MSG23: 'Decisão registrada, mas o e-mail aos administradores não pôde ser enviado. Uma nova tentativa será feita.'
};

// Dados semente para demonstração inicial (Inicia limpo para demonstrações)
const INITIAL_RESERVATIONS = [];

// Gerenciador de Estado do SIGA
class SigaStore {
  constructor() {
    this.STORAGE_KEY_RESERVATIONS = 'siga_reservations_v2';
    this.STORAGE_KEY_TIME = 'siga_simulated_time_v2';
    this.init();
  }

  init() {
    // Remove armazenamento antigo com dados sementes se houver
    localStorage.removeItem('siga_reservations_v1');
    localStorage.removeItem('siga_simulated_time_v1');

    if (!localStorage.getItem(this.STORAGE_KEY_RESERVATIONS)) {
      this.resetData();
    }
    if (!localStorage.getItem(this.STORAGE_KEY_TIME)) {
      // Data simulada padrão: 2026-11-01T09:30:00
      this.setSimulatedTime('2026-11-01T09:30:00');
    }
  }

  resetData() {
    localStorage.setItem(this.STORAGE_KEY_RESERVATIONS, JSON.stringify([]));
    this.setSimulatedTime('2026-11-01T09:30:00');
  }

  getReservations() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY_RESERVATIONS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Erro ao ler reservas do localStorage:', e);
      return [];
    }
  }

  saveReservations(reservations) {
    localStorage.setItem(this.STORAGE_KEY_RESERVATIONS, JSON.stringify(reservations));
  }

  addReservation(reservation) {
    const list = this.getReservations();
    list.push(reservation);
    this.saveReservations(list);
    return reservation;
  }

  updateReservation(protocol, updates) {
    const list = this.getReservations();
    const index = list.findIndex(r => r.protocol === protocol);
    if (index !== -1) {
      list[index] = { ...list[index], ...updates };
      this.saveReservations(list);
      return list[index];
    }
    return null;
  }

  findByProtocol(protocol) {
    const list = this.getReservations();
    const cleanProtocol = protocol.trim().toUpperCase();
    return list.find(r => r.protocol.toUpperCase() === cleanProtocol) || null;
  }

  findByToken(token) {
    const list = this.getReservations();
    for (const res of list) {
      if (!res.adminTokens) continue;
      for (const [adminId, adminToken] of Object.entries(res.adminTokens)) {
        if (adminToken === token) {
          const admin = SIGA_ADMINS.find(a => a.id === adminId);
          return { reservation: res, admin, token };
        }
      }
    }
    return null;
  }

  getSimulatedTime() {
    const val = localStorage.getItem(this.STORAGE_KEY_TIME);
    return val ? new Date(val) : new Date('2026-11-01T09:30:00');
  }

  setSimulatedTime(isoString) {
    localStorage.setItem(this.STORAGE_KEY_TIME, isoString);
  }

  getNextProtocolYear() {
    const now = this.getSimulatedTime();
    return now.getFullYear();
  }

  generateNextProtocol() {
    const year = this.getNextProtocolYear();
    const list = this.getReservations();
    const yearPrefix = `SIGA-${year}-`;
    
    // Filtra reservas do mesmo ano
    const yearReservations = list.filter(r => r.protocol.startsWith(yearPrefix));
    let maxNumber = 0;
    
    yearReservations.forEach(r => {
      const parts = r.protocol.split('-');
      if (parts.length === 3) {
        const num = parseInt(parts[2], 10);
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    });

    const nextNum = maxNumber + 1;
    const formattedNum = String(nextNum).padStart(3, '0');
    return `SIGA-${year}-${formattedNum}`;
  }
}

// Instância global do repositório
const store = new SigaStore();
