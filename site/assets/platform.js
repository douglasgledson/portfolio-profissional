import { escape } from "./ui.js";
import { media } from "./presentation.js";

const details = {
  pt: {
    title:"Solução Power Platform",
    description:"Arquitetura de referência para um fluxo de contas a pagar na Microsoft Power Platform. A demonstração web é independente, assistida por IA e usa dados fictícios.",
    architecture:"Arquitetura de referência",
    stack:[
      ["Microsoft Entra ID","Identidade organizacional, grupos e acesso ao aplicativo."],
      ["Power Apps","Interface Canvas para cadastro, consulta da fila e acompanhamento."],
      ["SharePoint Lists","Fonte de dados para solicitações, alçadas e trilha de eventos."],
      ["Power Automate","Orquestra validação, aprovação em níveis, registro e tratamento de falhas."],
      ["Teams e Outlook","Avisos, lembretes de SLA e comunicação de decisões."],
      ["Power BI","Indicadores de fila, tempos por etapa e conformidade com SLA."]
    ],
    connections:"Entra ID identifica o usuário. O Canvas lê e grava em SharePoint Lists. Power Automate reage às mudanças, envia avisos e registra decisões. Power BI consulta a trilha para gerar indicadores.",
    model:"Modelo de dados",
    modelHeaders:["Lista","Campos genéricos","Relação"],
    entities:[
      ["Solicitacoes","ID, Titulo, Valor, Status, SolicitanteEmail, PrazoSLA","Uma solicitação recebe vários eventos."],
      ["Alcadas","ID, LimiteMinimo, Nivel, GrupoAprovador, VigenteDesde","A regra vigente determina as etapas na abertura."],
      ["Eventos","ID, SolicitacaoID, Perfil, Acao, RegistradoEm","Cada evento aponta para uma solicitação."]
    ],
    flow:"Fluxo de aprovação",
    stages:[["Solicitação","Registro de dados e prazo."],["Validação financeira","Conferência e devolução quando necessário."],["Gestor e diretoria","Roteamento sequencial conforme valor."],["Encerramento","Registro da decisão e aviso ao solicitante."]],
    roles:"Matriz de responsabilidades",
    roleHeaders:["Papel","Responsabilidade","Controle"],
    responsibilities:[
      ["Solicitante","Submeter e acompanhar","Acesso limitado aos próprios registros."],
      ["Equipe financeira","Validar documentos e classificar a demanda","Registrar motivo da devolução."],
      ["Gestor e diretoria","Decidir conforme a alçada","Registrar perfil, horário e decisão."],
      ["Administrador do processo","Versionar regras e acompanhar exceções","Acesso restrito ao grupo responsável."],
      ["Gestão","Acompanhar indicadores","Acesso de leitura segundo a política da organização."]
    ],
    examples:"Exemplos genéricos de Power Fx",
    exampleText:"Os exemplos supõem campos de texto e nomes internos genéricos. Use os separadores do editor conforme o idioma. As permissões devem ser configuradas na fonte, no aplicativo e nos fluxos.",
    filter:"Filtrar registros do solicitante",
    create:"Criar uma solicitação simples",
    gallery:"Capturas e vídeos de aplicativos",
    pending:"Espaço reservado para materiais autorizados de aplicativos efetivamente desenvolvidos."
  },
  en: {
    title:"Power Platform solution",
    description:"Reference architecture for a Microsoft Power Platform accounts payable workflow. The separate AI-assisted web demo uses fictional data.",
    architecture:"Reference architecture",
    stack:[
      ["Microsoft Entra ID","Organizational identity, groups and application access."],
      ["Power Apps","Canvas interface for intake, queue review and tracking."],
      ["SharePoint Lists","Data source for requests, thresholds and process events."],
      ["Power Automate","Orchestrates validation, approval levels, audit events and failure handling."],
      ["Teams and Outlook","Notifications, SLA reminders and decision updates."],
      ["Power BI","Queue, time by stage and SLA compliance metrics."]
    ],
    connections:"Entra ID identifies the user. The canvas app reads and writes SharePoint Lists. Power Automate reacts to changes, sends messages and logs decisions. Power BI reads process events to calculate metrics.",
    model:"Data model",
    modelHeaders:["List","Example fields","Relationship"],
    entities:[
      ["Solicitacoes","ID, Titulo, Valor, Status, SolicitanteEmail, PrazoSLA","Each request has multiple events."],
      ["Alcadas","ID, LimiteMinimo, Nivel, GrupoAprovador, VigenteDesde","The effective rule determines stages at intake."],
      ["Eventos","ID, SolicitacaoID, Perfil, Acao, RegistradoEm","Each event refers to one request."]
    ],
    flow:"Approval flow",
    stages:[["Request","Record the data and deadline."],["Finance review","Verify and return as needed."],["Manager and director","Route in sequence according to amount."],["Close","Log the decision and notify the requester."]],
    roles:"Responsibility matrix",
    roleHeaders:["Role","Responsibility","Control"],
    responsibilities:[
      ["Requester","Submit and track","Access to own records."],
      ["Finance team","Validate documents and classify the request","Record the reason for returns."],
      ["Manager and director","Decide within their authority","Record actor, timestamp and decision."],
      ["Process administrator","Maintain rule versions and review exceptions","Restrict access to the designated group."],
      ["Management","Monitor metrics","Read access according to organizational policy."]
    ],
    examples:"Generic Power Fx examples",
    exampleText:"Examples assume text columns and generic internal names. Use the separators for your editor locale. Configure permissions in the data source, application and flows.",
    filter:"Filter the requester's records",
    create:"Create a simple request",
    gallery:"Application screenshots and videos",
    pending:"Space for authorized material from completed applications."
  }
};

function table(headers, rows) {
  return `<div class="table-wrap"><table><thead><tr>${headers.map(name=>`<th scope="col">${name}</th>`).join("")}</tr></thead>
    <tbody>${rows.map(([first,...values])=>`<tr><th scope="row">${first}</th>${values.map(value=>`<td>${value}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}
function diagram(rows, name) {
  return `<ol class="platform-diagram" aria-label="${name}">${rows.map(([title,body])=>
    `<li><strong>${title}</strong><p>${body}</p></li>`).join("")}</ol>`;
}
export const platformTitle = lang => details[lang].title;
export function platform(lang, assets) {
  const t = details[lang];
  const formulas = [
    'Filter(Solicitacoes, SolicitanteEmail = User().Email)',
    'Patch(Solicitacoes, Defaults(Solicitacoes),\n  { Titulo: txtTitulo.Text, Valor: Value(txtValor.Text),\n    SolicitanteEmail: User().Email, Status: "Em validação" })'
  ];
  return `<div class="platform-content"><p>${t.description}</p>
    <section><h3>${t.architecture}</h3>${diagram(t.stack,t.architecture)}<p>${t.connections}</p></section>
    <section><h3>${t.model}</h3>${table(t.modelHeaders,t.entities)}</section>
    <section><h3>${t.flow}</h3>${diagram(t.stages,t.flow)}</section>
    <section><h3>${t.roles}</h3>${table(t.roleHeaders,t.responsibilities)}</section>
    <section><h3>${t.examples}</h3><p>${t.exampleText}</p><div class="grid">
    ${[t.filter,t.create].map((label,index)=>`<div class="card"><strong>${label}</strong><pre><code>${escape(formulas[index])}</code></pre></div>`).join("")}</div></section>
    <section><h3>${t.gallery}</h3>${assets.length ? `<div class="grid">${media(assets,lang)}</div>` : `<p>${t.pending}</p>`}</section>
  </div>`;
}