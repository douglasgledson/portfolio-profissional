import { portfolio, printing, sum } from "./finance-model.js";
import { chart, data, escape, locale, metric, money, option, readLocal, writeLocal } from "./ui.js";

const analyticsCopy = {
  pt: ["Base fictícia em BRL · Referência", "Empresa", "Fornecedor", "Categoria", "Mês de vencimento", "Todos", "Em aberto", "Vencido", "Pago", "Previsto", "Aging", "Vence hoje ou depois", "Pagamentos por mês", "Previsão por vencimento", "Total por empresa", "Total por fornecedor", "Total por categoria", "Baixar base JSON", "Sem dados para o filtro.", "A previsão considera os títulos em aberto com vencimento a partir da referência.", "Logística", "Serviços", "Materiais", "Tecnologia", "Utilidades"],
  en: ["Synthetic data in BRL · Reporting date", "Company", "Supplier", "Category", "Due month", "All", "Open", "Overdue", "Paid", "Forecast", "Aging", "Due today or later", "Payments by month", "Forecast by due month", "Total by company", "Total by supplier", "Total by category", "Download JSON dataset", "No matching data.", "The forecast includes open invoices due on or after the reporting date.", "Logistics", "Services", "Materials", "Technology", "Utilities"]
};
export async function renderAnalytics(root, lang) {
  const t = analyticsCopy[lang];
  const {asOf, invoices} = await data("../data/payables.json");
  const fields = ["company","supplier","category","month"];
  const categories = Object.fromEntries(["logistics","services","materials","technology","utilities"].map((type, i) => [type, t[20+i]]));
  const month = value => new Intl.DateTimeFormat(locale(lang), {year:"numeric", month:"short", timeZone:"UTC"}).format(new Date(value + "-01T00:00:00Z"));
  const date = new Intl.DateTimeFormat(locale(lang), {dateStyle:"medium", timeZone:"UTC"}).format(new Date(asOf));
  const label = (field, value) => {
    if (field === "category") return categories[value];
    if (field === "month") return month(value);
    return t[fields.indexOf(field)+1] + " " + value;
  };
  const valueOf = (row, field) => field === "month" ? row.dueDate.slice(0,7) : row[field];
  const storageKey = "dg-payables-filters";
  const saved = readLocal(storageKey, {});
  root.innerHTML = `<p class="notice">${t[0]} · ${date}</p><form class="card fields">${fields.map((field, i) => {
    const choices = [...new Set(invoices.map(row => valueOf(row,field)))].sort();
    const selected = choices.includes(saved[field]) ? saved[field] : "";
    return `<label>${t[i+1]}<select name="${field}">${option("",t[5],selected)}${choices.map(value=>option(value,label(field,value),selected)).join("")}</select></label>`;
  }).join("")}</form><div id="analytics-output"></div>
  <div class="actions"><a class="secondary" href="./data/payables.json" download>${t[17]}</a></div>`;
  const form = root.querySelector("form");
  const cash = value => money(value,lang);
  const graph = (name, rows) => `<article class="card"><h3>${name}</h3>${rows.length ? chart(rows,name,cash) : `<p>${t[18]}</p>`}</article>`;
  function groups(rows, field, convert, byDate = false) {
    const totals = new Map();
    for (const row of rows) {
      const key = byDate ? row[field].slice(0,7) : row[field];
      totals.set(key, (totals.get(key) ?? 0) + Math.round(row.amount * 100));
    }
    return [...totals].sort((a,b) => byDate ? a[0].localeCompare(b[0]) : b[1] - a[1]).map(([key,value]) => [convert(key), value/100]);
  }
  function refresh() {
    const filters = Object.fromEntries(new FormData(form));
    const filtered = invoices.filter(row => fields.every(field => !filters[field] || filters[field] === valueOf(row,field)));
    const {paid,open,late,forecast,aging} = portfolio(filtered,asOf);
    root.querySelector("#analytics-output").innerHTML = `<div class="metrics">${[open,late,paid,forecast].map((rows,i)=>metric(t[i+6],cash(sum(rows)))).join("")}</div><p>${t[19]}</p>
      <div class="grid">${graph(t[10],[t[11],"1–30","31–60","61–90","91+"].map((band,i)=>[band,aging[i]]))}
      ${graph(t[12],groups(paid,"paidDate",month,true))}${graph(t[13],groups(forecast,"dueDate",month,true))}
      ${fields.slice(0,3).map((field,i)=>graph(t[i+14],groups(filtered,field,value=>label(field,value)))).join("")}</div>`;
  }
  form.addEventListener("change", () => { writeLocal(storageKey,Object.fromEntries(new FormData(form))); refresh(); });
  refresh();
}

const printCopy = {
  pt: ["Cenário fictício em BRL. O ROI usa 12 meses do mesmo resultado mensal. Inclua materiais, energia e demais despesas por unidade no custo variável.", "Preço unitário", "Custo variável unitário", "Custo fixo mensal", "Volume mensal", "Investimento inicial", "Calcular", "Restaurar cenário", "Contribuição unitária", "Resultado mensal", "Margem de contribuição", "Markup sobre custo variável", "ROI anual simples", "Payback em meses", "Equilíbrio em unidades/mês", "Não aplicável", "Cenário calculado.", "Cenário calculado. Armazenamento indisponível."],
  en: ["Fictional scenario in BRL. ROI uses 12 months of the same monthly profit. Include materials, energy and other per-unit expenses in variable cost.", "Unit price", "Unit variable cost", "Monthly fixed cost", "Monthly volume", "Initial investment", "Calculate", "Restore scenario", "Unit contribution", "Monthly profit", "Contribution margin", "Markup over variable cost", "Simple annual ROI", "Payback in months", "Break-even units/month", "Not applicable", "Scenario calculated.", "Scenario calculated. Browser storage is unavailable."]
};
export async function renderPrint(root, lang) {
  const seed = await data("../data/print.json");
  const t = printCopy[lang];
  const key = "dg-print-scenario";
  const numeric = new Intl.NumberFormat(locale(lang), {maximumFractionDigits:2});
  const percent = new Intl.NumberFormat(locale(lang), {style:"percent",maximumFractionDigits:1});
  const keys = Object.keys(seed);
  let values = readLocal(key,seed);
  root.innerHTML = `<p class="notice">${t[0]}</p><form class="form-box"><div class="fields">${keys.map((key,i)=>
    `<label>${t[i+1]}<input required type="number" name="${key}" min="${key==="price" ? ".01" : "0"}" max="100000000" step="${key==="volume" ? "1" : ".01"}" value="${escape(values[key])}"></label>`).join("")}</div>
    <div class="actions"><button class="primary" type="submit">${t[6]}</button><button class="secondary" type="button">${t[7]}</button></div></form><p id="feedback" role="status"></p><div class="metrics" id="print-results"></div>`;
  const form = root.querySelector("form");
  function refresh() {
    const formats = [value=>money(value,lang),value=>money(value,lang),value=>percent.format(value),value=>percent.format(value),value=>percent.format(value),value=>numeric.format(value),value=>numeric.format(value)];
    root.querySelector("#print-results").innerHTML = Object.values(printing(values)).map((value,i)=>metric(t[i+8],value === null ? t[15] : formats[i](value))).join("");
  }
  function update() {
    refresh();
    root.querySelector("#feedback").textContent = writeLocal(key,values) ? t[16] : t[17];
  }
  form.addEventListener("submit", event => {
    event.preventDefault();
    values = Object.fromEntries([...new FormData(form)].map(([key,value])=>[key,Number(value)]));
    update();
  });
  form.querySelector('[type="button"]').addEventListener("click", () => {
    values = {...seed};
    keys.forEach(key=>{ form.elements[key].value = values[key]; });
    update();
  });
  refresh();
}