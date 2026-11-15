# SIGA – Sistema Integrado de Gestão de Ambientes
## MVP 1 – Frontend | Instituto Consenso (Convergência em Saúde)
### Curso de Análise e Desenvolvimento de Sistemas (ADS) · Projeto Integrador 1

![Logo Instituto Consenso](assets/logo.png)

---

## 📌 1. Visão Geral do Projeto

O **SIGA (Sistema Integrado de Gestão de Ambientes)** é uma solução desenvolvida para a gestão e locação dos **7 ambientes físicos** do **Instituto Consenso**. 

No **MVP 1**, o frontend implementa fielmente todas as regras de negócio, fluxos de uso e histórias de usuário, gerenciando disponibilidades, reservas, validações de capacidade e antecedência mínima, e o fluxo de aprovação descentralizada por e-mail realizada pelos 3 administradores institucionais.

---

## 🚀 2. Como Executar o Frontend

O projeto foi construído utilizando tecnologias modernas (**HTML5**, **Tailwind CSS**, **Lucide Icons** e **JavaScript ES6+** modular), sem necessidade de instalação de dependências pesadas (`npm`, `yarn` ou `node_modules`).

### Opção 1: Via Servidor Local Python (Recomendado)
No terminal, dentro da pasta raiz do projeto (`SIGA`):
```bash
python3 -m http.server 8000
```
Em seguida, abra o navegador em:
👉 **`http://localhost:8000`**

### Opção 2: Publicação na Vercel (100% Configurado e Pronto)
O projeto já conta com o arquivo `vercel.json` e `package.json` devidamente ajustados para deploy estático na Vercel:
1. Acesse **[vercel.com](https://vercel.com)** e faça login.
2. Clique em **"Add New..."** ➔ **"Project"**.
3. Importe o repositório GitHub do projeto (`SIGA`).
4. Clique diretamente em **"Deploy"** (não é necessário alterar nenhuma configuração de build ou variáveis de ambiente).

### Opção 3: Abertura Direta
Você pode simplesmente dar um **duplo clique** no arquivo `index.html` ou abri-lo diretamente em qualquer navegador web moderno (Google Chrome, Firefox, Edge, Safari). Os arquivos de biblioteca (`tailwind.js` e `lucide.min.js`) estão inclusos localmente na pasta `vendor/` para funcionamento 100% offline!

---

## 🏛️ 3. Ambientes Gerenciados (RN01, RN07, RN08 e Tabela 1.1)

| Ambiente | Capacidade Máxima | Antecedência Mínima (RN03) | Videoconferência | Gravação ao Vivo | Transmissão |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Sala 1** | 20 pessoas | 30 minutos | Sim | Não | Não |
| **Sala 2** | 10 pessoas | 30 minutos | Sim | Não | Não |
| **Sala 3** | 5 pessoas | 30 minutos | Sim | Não | Não |
| **Sala 4** | 5 pessoas | 30 minutos | Não | Não | Não |
| **Sala de Podcast** | 4 pessoas | 24 horas | Não | Não | Não |
| **Auditório** | 70 pessoas | 24 horas | Sim | Sim | Sim |
| **Varanda Externa** | 70 pessoas | 24 horas | Não | Não | Não |

---

## 🎨 4. Cores Oficiais do Calendário (RN16)

* 🟢 **Verde (`#10B981`):** Horário **Livre**. Ao clicar na visão diária, abre imediatamente o formulário de reserva pré-preenchido (UC01 - FA03).
* 🟡 **Amarelo (`#F59E0B`):** Horário **Pendente**. Reserva registrada aguardando liberação de um administrador. Bloqueia o horário contra novas solicitações (RN06).
* 🔴 **Vermelho (`#EF4444`):** Horário **Aprovado / Ocupado**. Reserva confirmada por um administrador.
* ⚪ **Cinza (`#94A3B8`):** Horário **Indisponível** (horário no passado ou que não cumpre a antecedência mínima necessária do ambiente).

---

## 📋 5. Casos de Uso Implementados (UC01 a UC07)

* **UC01 - Visualizar Calendário de Locações:** Visões de Mês e Dia (07:00 às 23:59 conforme RN02), filtro por ambiente, alternador de meses e clique direto no horário livre para pré-preenchimento.
* **UC02 - Listar Ambientes:** Cards com os 7 ambientes, status atual em tempo real calculado dinamicamente, capacidade, antecedência, tags de recursos, atalho de agendamento e filtro de agenda.
* **UC03 - Solicitar Reserva de Ambiente:** Formulário com validação em tempo real de horários, regras de antecedência, lotação máxima, recursos permitidos por ambiente (RN08), geração de protocolo sequencial `SIGA-AAAA-NNN` (RN12).
* **UC04 - Validar e Bloquear Conflito de Horário:** Algoritmo que impede sobreposição no mesmo ambiente (`início_novo < fim_existente && fim_novo > início_existente`), permitindo reservas adjacentes (ex: 10:00–11:00 e 11:00–12:00).
* **UC05 - Notificar Administradores da Solicitação:** Emissão de notificações aos 3 administradores contendo tokens de segurança individuais.
* **UC06 - Aprovar ou Recusar Reserva por E-mail (Sem Login):** Tela de decisão acionada por link único. Ao aprovar, status passa para Aprovado; ao recusar, exige motivo obrigatório (RN17) e libera o horário no calendário (RN11). Links dos outros administradores são invalidados imediatamente (RN10).
* **UC07 - Registrar Decisão por E-mail aos Administradores:** Exibição do comprovante com resultado, quem decidiu, data/hora e justificativa.

---

## 📬 6. Recursos Exclusivos para Apresentação Acadêmica

1. **Central de E-mails dos Administradores:**
   - Permite alternar entre os 3 administradores cadastrados (*Dra. Camila Mendes*, *Dr. Roberto Silva* e *Marcos Vinicius*).
   - Renderiza os e-mails exatos (RN13 e RN14) com botões reais de **Aprovar** e **Recusar** contendo tokens exclusivos.
   - Permite testar na prática a invalidação de links (quando um aprova, os outros recebem a mensagem `MSG20: Esta solicitação já foi analisada por...`).
2. **Consulta por Protocolo (RN19):**
   - Permite ao solicitante acompanhar o status da sua solicitação através de uma linha do tempo (Pendente, Aprovada ou Recusada com justificativa).
3. **Controlador de Instante Simulado:**
   - Na barra superior, há um relógio simulador. O avaliador pode alterar o horário do sistema para demonstrar na hora as regras de antecedência de 30 min (Salas 1 a 4) e 24h (Auditório, Varanda e Podcast).
4. **Restaurar Dados:**
   - Botão para resetar o LocalStorage e voltar aos dados semente de demonstração a qualquer momento.

---

## 📂 7. Estrutura de Arquivos

```
SIGA/
├── index.html              # Estrutura principal e layouts das telas
├── README.md               # Documentação técnica e de uso
├── assets/
│   └── logo.png            # Logo oficial do Instituto Consenso
├── css/
│   └── styles.css          # Cores institucionais, status RN16 e animações
├── vendor/
│   ├── tailwind.js         # Tailwind CSS para funcionamento offline
│   └── lucide.min.js       # Ícones SVG offline
└── js/
    ├── data.js             # 7 ambientes, 3 admins, mensagens MSG01 a MSG23, store
    ├── rules.js            # Regras RN01 a RN19, validação UC04 e antecedência
    ├── calendar.js         # UC01 - Visão Mês e Visão Dia
    ├── rooms.js            # UC02 - 7 cards de ambientes e status em tempo real
    ├── booking.js          # UC03 - Formulário de solicitação e modal de confirmação
    ├── decision.js         # UC06 & UC07 - Tela de aprovação/recusa por token
    ├── search.js           # Consulta por protocolo para o solicitante (RN19)
    ├── email-simulator.js  # UC05 & UC07 - Central de e-mails institucionais
    └── app.js              # Roteador, controlador de instantes e notificações
```

---

*Desenvolvido para a matéria de Projeto Integrador 1 — Análise e Desenvolvimento de Sistemas.*
