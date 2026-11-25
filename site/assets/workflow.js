import { chart, data, escape, integer, locale, metric, money, option, readLocal, writeLocal } from "./ui.js";
import { canAct, deadline, isOpen, overdue, positive, request, roles, stages, transition } from "./workflow-model.js";

const key = "dg-ap-workflow-v1";
const translations = {
  pt: {
    warning: "Demonstração independente com dados fictícios. Os perfis são simulados e não constituem um mecanismo de segurança corporativa. As alterações ficam neste navegador.",
    roles: ["Solicitante", "Validação financeira", "Gestor", "Diretoria", "Administrador"],
    stages: ["Em validação", "Aguardando gestor", "Aguardando diretoria", "Aprovada", "Devolvida"],
    role: "Perfil simulado", operational: "Painel operacional", open: "Em andamento", approved: "Aprovadas", late: "Em atraso",
    closedSla: "Encerradas no SLA", distribution: "Solicitações por estágio", individual: "Nova solicitação",
    title: "Descrição fictícia", amount: "Valor em BRL", submit: "Cadastrar", batch: "Cadastro em lote",
    batchHint: "Uma solicitação por linha, no formato descrição;valor. Use ponto ou vírgula decimal e dispense separadores de milhar.",
    batchLabel: "Solicitações do lote", batchSubmit: "Cadastrar lote", list: "Fila de solicitações",
    search: "Pesquisar por descrição ou ID", status: "Estágio", all: "Todos", sla: "Prazo de SLA", any: "Todos", onTime: "No prazo", overdue: "Atrasada",
    action: "Ações", advance: "Avançar", return: "Devolver", history: "Histórico", empty: "Nenhuma solicitação encontrada.",
    notices: "Notificações simuladas", matrix: "Matriz de aprovação", manager: "Gestor a partir de (BRL)", director: "Diretoria a partir de (BRL)",
    hours: "SLA em horas corridas", rule: "A validação financeira é sempre obrigatória. Ao atingir a faixa de diretoria, o gestor aprova primeiro. Mudanças valem para novas solicitações.",
    save: "Salvar matriz", saved: "Alteração aplicada.", bad: "Revise dados, valores e limites. Nenhuma alteração foi aplicada.", reset: "Repor dados fictícios",
    confirm: "Repor os dados iniciais e descartar as alterações deste navegador?", noStorage: "Alteração aplicada nesta sessão. O armazenamento está indisponível."
  },
  en: {
    warning: "Standalone demo with fictional data. Roles are simulated and do not provide corporate security. Changes stay in this browser.",
    roles: ["Requester", "Finance reviewer", "Manager", "Director", "Administrator"],
    stages: ["In finance review", "Awaiting manager", "Awaiting director", "Approved", "Returned"],
    role: "Simulated role", operational: "Operational dashboard", open: "In progress", approved: "Approved", late: "Overdue",
    closedSla: "Closed within SLA", distribution: "Requests by stage", individual: "New request",
    title: "Fictional description", amount: "Amount in BRL", submit: "Submit request", batch: "Batch entry",
    batchHint: "One request per line in description;amount format. Use a decimal point or comma and omit thousands separators.",
    batchLabel: "Batch requests", batchSubmit: "Submit batch", list: "Request queue",
    search: "Search by description or ID", status: "Stage", all: "All", sla: "SLA deadline", any: "All", onTime: "On time", overdue: "Overdue",
    action: "Actions", advance: "Advance", return: "Return", history: "History", empty: "No matching requests.",
    notices: "Simulated notifications", matrix: "Approval matrix", manager: "Manager threshold (BRL)", director: "Director threshold (BRL)",
    hours: "SLA in elapsed hours", rule: "Finance review is required. The manager approves before the director when both thresholds apply. Changes apply to new requests.",
    save: "Save matrix", saved: "Change applied.", bad: "Check entries, amounts and limits. No changes were applied.", reset: "Restore sample data",
    confirm: "Restore the sample data and discard changes in this browser?", noStorage: "Change applied for this session. Browser storage is unavailable."
  }
};

export async function renderWorkflow(root, lang) {
  const t = translations[lang];
  const seed = await data("../data/workflow.json");
  const newState = () => {
    const now = Date.now();
    const date = new Date(now).toISOString();
    return { rules: { ...seed.rules }, items: seed.items.map(item => {
      const createdAt = new Date(now - item.age * 3600000).toISOString();
      return { ...item, sla: seed.rules.sla, createdAt, updatedAt: date, history: [
        { role: "requester", stage: "review", time: createdAt },
        ...(item.stage === "director" ? [{ role: "finance", stage: "manager", time: new Date((Date.parse(createdAt) + now) / 2).toISOString() }] : []),
        ...(item.stage === "review" ? [] : [{ role: item.actor, stage: item.stage, time: date }])
      ] };
    }) };
  };
  let state = readLocal(key, null);
  if (!state || !Array.isArray(state.items) || !state.rules) {
    state = newState();
    writeLocal(key, state);
  }
  let role = readLocal("dg-workflow-role", "requester");
  if (!roles.includes(role)) role = "requester";
  const stageLabel = stage => t.stages[stages.indexOf(stage)];
  const roleLabel = actor => t.roles[roles.indexOf(actor)];
  const date = value => new Intl.DateTimeFormat(locale(lang), { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
  const number = (name, value, min = ".01", max = "100000000", step = ".01") =>
    `<input name="${name}" type="number" required min="${min}" max="${max}" step="${step}" value="${escape(value)}">`;
  const button = (label, kind = "primary") => `<button class="${kind}" type="submit">${label}</button>`;

  const sections = lang === "pt"
    ? ["Painel", "Solicitações", "Notificações", "Área de trabalho"]
    : ["Dashboard", "Requests", "Notifications", "Workspace"];
  const toolsLabel = lang === "pt" ? "Atalhos do fluxo" : "Workflow shortcuts";
  root.classList.add("canvas-app");
  root.innerHTML = `<header class="canvas-command"><div class="canvas-name"><span class="canvas-icon" aria-hidden="true">▦</span><div><strong>AP Workflow Manager</strong><p>${sections[3]}</p></div></div>
    <label>${t.role}<select id="workflow-role">${roles.map(value => option(value, roleLabel(value), role)).join("")}</select></label>

    </header>
    <nav class="canvas-tabs" aria-label="${toolsLabel}">
      ${["workflow-dashboard","workflow-queue","workflow-events"].map((id,index)=>`<button class="secondary" type="button" data-scroll="${id}">${sections[index]}</button>`).join("")}
    </nav>
    <p class="notice">${t.warning}</p>

    <div id="workflow-dashboard" class="card dashboard"></div><div id="workflow-tools"></div><p id="feedback" role="status"></p>
    <section class="card" id="workflow-queue"><h2>${t.list}</h2><div class="fields">
    <label>${t.search}<input id="workflow-search" type="search"></label>
    <label>${t.status}<select id="workflow-status">${option("",t.all,"")}${stages.map(value => option(value,stageLabel(value),"")).join("")}</select></label>
    <label>${t.sla}<select id="workflow-sla">${option("",t.any,"")}${option("ok",t.onTime,"")}${option("late",t.overdue,"")}</select></label>
    </div><div class="table-wrap" id="workflow-table"></div></section>
    <section class="card dashboard" id="workflow-events"><h2>${t.notices}</h2><ul id="workflow-notices"></ul></section>`;

  const get = id => root.querySelector("#" + id);
  const feedback = get("feedback");
  function controls() {
    const rules = state.rules;
    get("workflow-tools").innerHTML = role === "requester" ? `<div class="grid">
      <form class="form-box" data-form="single"><h3>${t.individual}</h3>
      <label>${t.title}<input name="title" required maxlength="90"></label>
      <label>${t.amount}${number("amount","")}</label><div>${button(t.submit)}</div></form>
      <form class="form-box" data-form="batch"><h3>${t.batch}</h3><p>${t.batchHint}</p>
      <label>${t.batchLabel}<textarea name="batch" required maxlength="10000"></textarea></label><div>${button(t.batchSubmit)}</div></form></div>`
      : role === "admin" ? `<form class="form-box dashboard" data-form="rules"><h3>${t.matrix}</h3><p>${t.rule}</p>
      <div class="fields"><label>${t.manager}${number("manager",rules.manager)}</label><label>${t.director}${number("director",rules.director)}</label>
      <label>${t.hours}${number("sla",rules.sla,"1","720","1")}</label></div><div class="actions">${button(t.save)}
      <button type="button" class="secondary" id="workflow-reset">${t.reset}</button></div></form>` : "";
  }
  function table(now = Date.now()) {
    const query = get("workflow-search").value.trim().toLocaleLowerCase(locale(lang));
    const status = get("workflow-status").value;
    const sla = get("workflow-sla").value;
    const items = state.items.filter(item => (item.title + " " + item.id).toLocaleLowerCase(locale(lang)).includes(query)
      && (!status || item.stage === status) && (!sla || overdue(item, now) === (sla === "late")));
    get("workflow-table").innerHTML = items.length ? `<table><thead><tr>${[t.title,t.amount,t.status,t.sla,t.history,t.action].map(label => `<th scope="col">${label}</th>`).join("")}</tr></thead>
    <tbody>${items.map(item => `<tr><th scope="row">${escape(item.title)}<br><small>${escape(item.id.slice(0,8))}</small></th>
    <td>${money(item.amount,lang)}</td><td><span class="canvas-status" data-stage="${item.stage}">${stageLabel(item.stage)}</span></td><td>${date(deadline(item))}<br>${overdue(item,now) ? t.overdue : t.onTime}</td>
    <td><details><summary>${t.history}</summary><ul>${item.history.map(event => `<li>${stageLabel(event.stage)} · ${roleLabel(event.role)} · ${date(event.time)}</li>`).join("")}</ul></details></td>
    <td>${canAct(item, role) ? `<button class="primary" data-id="${escape(item.id)}" data-action="advance">${t.advance}</button>
    <button class="secondary" data-id="${escape(item.id)}" data-action="return">${t.return}</button>` : "—"}</td></tr>`).join("")}</tbody></table>` : `<p>${t.empty}</p>`;
  }
  function refresh() {
    const now = Date.now();
    const open = state.items.filter(isOpen);
    const closed = state.items.filter(item => !isOpen(item));
    const onTime = closed.filter(item => !overdue(item,now)).length;
    const percent = new Intl.NumberFormat(locale(lang), { style: "percent", maximumFractionDigits: 0 });
    get("workflow-dashboard").innerHTML = `<h2>${t.operational}</h2><div class="metrics">
    ${metric(t.open,open.length)}${metric(t.approved,state.items.filter(item => item.stage==="approved").length)}
    ${metric(t.late,open.filter(item => overdue(item,now)).length)}${metric(t.closedSla,closed.length ? percent.format(onTime/closed.length) : "—")}</div>
    ${chart(stages.map(stage => [stageLabel(stage),state.items.filter(item => item.stage === stage).length]),t.distribution,count => integer(count,lang))}`;
    get("workflow-notices").innerHTML = state.items.flatMap(item => item.history.map(event => ({ title: item.title, event })))
      .sort((a,b) => b.event.time.localeCompare(a.event.time)).slice(0,8)
      .map(item => `<li>${escape(item.title)} · ${stageLabel(item.event.stage)} · ${date(item.event.time)}</li>`).join("");
    table(now);
  }
  function persist() {
    feedback.textContent = writeLocal(key,state) ? t.saved : t.noStorage;
    refresh();
  }
  get("workflow-role").addEventListener("change", event => {
    role = event.target.value;
    writeLocal("dg-workflow-role", role);
    controls();
    table();
    feedback.textContent = "";
  });
  get("workflow-search").addEventListener("input", () => table());
  get("workflow-status").addEventListener("change", () => table());
  get("workflow-sla").addEventListener("change", () => table());

  root.addEventListener("submit", event => {
    event.preventDefault();
    const form = event.target;
    const values = new FormData(form);
    try {
      const mode = form.dataset.form;
      if (mode === "rules" && role === "admin") {
        const manager = Number(values.get("manager"));
        const director = Number(values.get("director"));
        const sla = Number(values.get("sla"));
        if (!positive(manager) || !positive(director) || manager >= director || !Number.isInteger(sla) || sla < 1 || sla > 720) throw new Error("rules");
        state.rules = { manager, director, sla };
      } else if (role === "requester" && ["single","batch"].includes(mode)) {
        const now = Date.now();
        const additions = mode === "single" ? [request(values.get("title"), Number(values.get("amount")), state.rules, now)] :
          values.get("batch").trim().split(/\r?\n/).filter(line => line.trim()).map(line => {
            const fields = line.split(";");
            if (fields.length !== 2 || !/^\d+(?:[.,]\d{1,2})?$/.test(fields[1].trim())) throw new Error("batch");
            return request(fields[0].trim(), Number(fields[1].trim().replace(",",".")),state.rules,now);
          });
        if (!additions.length || additions.length > 100) throw new Error("batch");
        state.items.unshift(...additions);
        form.reset();
      } else return;
      persist();
    } catch { feedback.textContent = t.bad; }
  });
  root.addEventListener("click", event => {
    const target = event.target.closest("button");
    if (!target) return;
    if (target.dataset.scroll) {
      const section = get(target.dataset.scroll);
      section.tabIndex = -1;
      section.focus({preventScroll:true});
      section.scrollIntoView();
      return;
    }
    if (target.id === "workflow-reset" && role === "admin" && window.confirm(t.confirm)) {
      state = newState();
      controls();
      persist();
      get("workflow-reset").focus();
    }
    if (!target.dataset.action) return;
    const index = state.items.findIndex(item => item.id === target.dataset.id);
    if (index < 0 || !canAct(state.items[index],role)) return;
    state.items[index] = transition(state.items[index],role,target.dataset.action,Date.now());
    persist();
    get("workflow-search").focus();
  });
  controls();
  refresh();
}