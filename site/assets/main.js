import { copy } from "./profile.js";
import { chart, data, escape, metric, readLocal, writeLocal } from "./ui.js";
import { renderWorkflow } from "./workflow.js";
import { renderAnalytics, renderPrint } from "./finance.js";
import { applyAppearance, documentLink, image, link, localized, media, releaseMedia } from "./presentation.js";
import { demoNames, documentedProjects, projectFields } from "./projects.js";
import { platform, platformTitle } from "./platform.js";

const main = document.querySelector("#main");
const nav = document.querySelector("#nav");
const language = document.querySelector("#language");
const themeButton = document.querySelector("#theme");
const brand = document.querySelector(".brand");
const demos = { "ap-workflow": renderWorkflow, "ap-analytics": renderAnalytics, printhub: renderPrint };
const isEditor = location.hostname === "127.0.0.1" && location.pathname === "/preview/"
  && new URLSearchParams(location.search).get("editor") === "1" && window.parent !== window;
let content;
let lang = !isEditor && readLocal("dg-language", "pt") === "en" ? "en" : "pt";
let themePreference = isEditor ? null : readLocal("dg-theme", null);
if (!["light","dark"].includes(themePreference)) themePreference = null;
let theme;

const words = {
  pt: {
    ai:"Demonstrações web independentes, desenvolvidas com auxílio de inteligência artificial e dados fictícios.",
    bi:"Relatórios Microsoft Power BI", biIntro:"Espaço para trabalhos efetivamente desenvolvidos no Power BI e materiais autorizados de demonstração.",
    biEmpty:"Relatórios e materiais podem ser incluídos após autorização.", gallery:"Materiais do projeto", openReport:"Ver relatório",
    biFields:["Contexto empresarial","Indicadores","Modelo dimensional","Medidas DAX","Transformações Power Query"],
    certifications:"Certificações", phone:"Telefone", services:"Soluções para finanças, controles gerenciais e melhoria de processos empresariais.",
    skillIntro:"Microsoft Power Platform, Excel, VBA e SAP GUI Scripting aplicados a processos financeiros e automação.",
    consult:"Consultoria", portfolioIntro:"Estudos de caso sobre processos financeiros, indicadores, automação e planejamento de operações.",
    photo:"Foto profissional de", reportBack:"Voltar aos relatórios", dataError:"Não foi possível carregar a configuração do portfólio."
  },
  en: {
    ai:"Independent web demos developed with AI assistance and based on fictional data.",
    bi:"Microsoft Power BI reports", biIntro:"A space for work built in Power BI and authorized demonstration materials.",
    biEmpty:"Reports and materials can be added once authorized.", gallery:"Project materials", openReport:"View report",
    biFields:["Business context","Metrics","Dimensional model","DAX measures","Power Query transformations"],
    certifications:"Certifications", phone:"Phone", services:"Services for finance, management controls and business process improvement.",
    skillIntro:"Microsoft Power Platform, Excel, VBA and SAP GUI Scripting applied to financial processes and automation.",
    consult:"Consulting", portfolioIntro:"Case studies on financial processes, reporting, automation and operations planning.",
    photo:"Professional photo of", reportBack:"Back to reports", dataError:"Could not load the portfolio configuration."
  }
};

const tx = value => localized(value,lang);
const text = value => escape(tx(value));
const pills = values => `<div class="tags">${values.map(value => `<span class="pill">${escape(value)}</span>`).join("")}</div>`;
const list = values => `<ul>${values.map(value => `<li>${escape(value)}</li>`).join("")}</ul>`;
const card = (title, body) => `<article class="card"><h3>${escape(title)}</h3>${body}</article>`;
const paragraph = value => value ? `<p class="preserve-space">${escape(value)}</p>` : "";
const grid = items => `<div class="grid">${items}</div>`;
const section = (id, title, body, introduction = "", overline = "") =>
  `<section class="section" id="${id}"><div class="wrap"><div class="heading">${overline ? `<span class="eyebrow">${escape(overline)}</span>` : ""}<h2>${escape(title)}</h2>${paragraph(introduction)}</div>${body}</div></section>`;

function projectCard(project, t) {
  return `<article class="card project"><span class="tag">${text(project.status)}</span><h3>${text(project.title)}</h3>${paragraph(tx(project.summary))}
    ${pills(project.tech.map(tx))}<a class="text-link" href="#projeto/${escape(project.id)}">${t.case}<span class="sr-only"> · ${text(project.title)}</span></a></article>`;
}
function reportCard(report, w) {
  return card(tx(report.title),paragraph(tx(report.context)) +
    `<a class="text-link" href="#power-bi/${escape(report.id)}">${w.openReport}<span class="sr-only"> · ${text(report.title)}</span></a>`);
}
function home(t, w) {
  const {profile,experience,education,certifications,skills,services,projects,reports} = content;
  const labels = lang === "pt" ? ["Em fila", "Em validação", "Em aprovação", "Aprovadas", "Devolvidas", "Etapa do fluxo"] :
    ["Queued", "In review", "In approval", "Approved", "Returned", "Workflow stage"];
  const photo = image(profile.photo,w.photo+" "+profile.name,"professional-photo");
  const experiences = experience.map(item=>card(tx(item.title),paragraph([item.organization,tx(item.period)].filter(Boolean).join(" · "))
    + paragraph(tx(item.description)) + (!item.organization || !tx(item.period) ? paragraph(t.experiencePending) : "")));
  const studies = education.map(item=>[tx(item.title),item.institution,tx(item.period)].filter(Boolean).join(" · "));
  const certificationsHtml = certifications.length ? `<h3>${w.certifications}</h3><ul>${certifications.map(item=>
    `<li>${link(item.link,tx(item.title)) || text(item.title)}${paragraph([item.institution,tx(item.period)].filter(Boolean).join(" · "))}</li>`).join("")}</ul>` : "";
  const email = /^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(profile.email) ? `<a class="text-link" href="mailto:${escape(profile.email)}">E-mail</a>` : "";
  const phone = profile.phone && `<a class="text-link" href="tel:${escape(profile.phone.replace(/[^+\d]/g,""))}">${escape(profile.phone)}</a>`;
  const contact = [["E-mail",email],[w.phone,phone],["LinkedIn",link(profile.linkedin,"LinkedIn")],["GitHub",link(profile.github,"GitHub")]]
    .map(([label,value])=>`<p>${value || escape(label) + " · " + t.pending}</p>`).join("") + profile.networks.map(item=>`<p>${link(item.url,tx(item.label))}</p>`).join("");
  const resume = documentLink(tx(profile.resume),t.resumeLink,"curriculo-"+lang,true);
  return `<section class="hero" id="inicio"><div class="wrap hero-grid"><div>
    <span class="eyebrow">${t.overline}</span><h1>${text(profile.title)}</h1>
    ${paragraph(tx(profile.intro))}<div class="actions"><a class="primary" href="#projetos">${t.projectsButton}</a><a class="secondary" href="#consultoria">${w.consult}</a></div>
    </div><article class="preview"><div class="preview-top"><span>AP Workflow Manager</span><span class="tag">${t.fictional}</span></div>
    <div class="preview-body"><p>${t.demoIntro}</p>
    <div class="metrics">${metric(labels[0], 5)}${metric(labels[3], 2)}${metric("SLA", "48h")}</div>
    ${chart([[labels[1],2],[labels[2],3],[labels[3],2],[labels[4],1]], labels[5])}
    <a class="text-link" href="#demo/ap-workflow">${t.demoButton}</a></div></article>
    </div></section>
    ${section("projetos",t.work,grid(projects.map(project=>projectCard(project,t)).join("")),w.portfolioIntro,t.portfolio)}
    ${section("relatorios-power-bi",w.bi,reports.length ? grid(reports.map(report=>reportCard(report,w)).join("")) : paragraph(w.biEmpty),w.biIntro)}
    ${section("demonstracoes",t.demos,`<div class="actions">${Object.entries(demoNames).map(([id,name])=>`<a class="secondary" href="#demo/${id}">${escape(name)}</a>`).join("")}</div>`,w.ai)}
    ${section("sobre",t.about,`<div class="about-content">${photo}${paragraph(tx(profile.about))}</div>`)}
    ${section("experiencia",t.experience,grid(experiences.join("")+card(t.education,list(studies)+(education.some(item=>!item.institution || !tx(item.period)) ? paragraph(t.educationPending) : "")+certificationsHtml)))}
    ${section("competencias",t.skills,pills(skills.map(tx)),w.skillIntro)}
    ${section("consultoria",t.services,`<div class="grid services-grid">${services.map(item=>card(tx(item.title),paragraph(tx(item.description)))).join("")}</div>`,w.services)}
    ${section("contato",t.contact,grid(card(t.contact,contact)+card(t.resume,resume || paragraph(t.pending))))}
    ${section("roteiro",t.future,`<details><summary>${lang === "pt" ? "Ver lista de projetos" : "View planned projects"}</summary>${list(t.futureItems)}</details>`)}`;
}
function caseStudy(project,t,w) {
  const hasDemo = Object.hasOwn(demos,project.id);
  const hasDoc = documentedProjects.includes(project.id);
  const ap = project.id === "ap-workflow";
  return `<span class="tag">${text(project.status)}</span><h1>${text(project.title)}</h1>${paragraph(tx(project.summary))}
    ${hasDemo ? `<p class="notice">${w.ai}</p><div class="actions"><a class="primary" href="#demo/${escape(project.id)}">${t.openDemo}</a>
      ${ap ? `<a class="secondary" href="#projeto/ap-workflow/solucao-power-platform">${platformTitle(lang)}</a>` : ""}</div>` : ""}
    ${grid(projectFields.map((field,index)=>{
      const value = field === "tech" ? project.tech.map(tx).join(" · ") : tx(project[field]);
      return value ? card(t.caseLabels[index],paragraph(value)) : "";
    }).join("") + (hasDoc ? card(t.documentation,`<a class="text-link" href="./docs/${project.id}.md">${t.documentation} (.md)</a>`) : "")
      + (!project.media.length ? card(t.video,paragraph(t.pending)) : ""))}
    ${project.media.length ? `<section class="case-section"><h2>${w.gallery}</h2>${grid(media(project.media,lang))}</section>` : ""}
    ${ap ? `<section class="case-section" id="solucao-power-platform"><h2>${platformTitle(lang)}</h2>${platform(lang,content.platformMedia)}</section>` : ""}`;
}
function reportStudy(report,w) {
  const fields = ["context","indicators","model","dax","powerQuery"];
  return `<span class="tag">Microsoft Power BI</span><h1>${text(report.title)}</h1>
    ${grid(fields.map((field,index)=>{
      const value = tx(report[field]);
      const body = ["dax","powerQuery"].includes(field) ? `<pre><code>${escape(value)}</code></pre>` : paragraph(value);
      return value ? card(w.biFields[index],body) : "";
    }).join(""))}
    ${report.media.length ? `<section class="case-section"><h2>${w.gallery}</h2>${grid(media(report.media,lang))}</section>` : ""}`;
}
function changeTheme() {
  theme = applyAppearance(content.appearance,themePreference);
  themeButton.textContent = theme === "dark" ? "☀" : "☾";
  themeButton.setAttribute("aria-label", theme === "dark" ? copy[lang].themeLight : copy[lang].themeDark);
}
async function render(scroll = true) {
  if (!content) return;
  const t = copy[lang];
  const w = words[lang];
  const [route,id,anchor] = location.hash.slice(1).split("/");
  const project = content.projects.find(item=>item.id === id);
  const report = content.reports.find(item=>item.id === id);
  const demo = route === "demo" && Object.hasOwn(demos,id);
  const title = route === "projeto" ? tx(project?.title) : route === "power-bi" ? tx(report?.title) : demo ? demoNames[id] : "";
  releaseMedia();
  document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  changeTheme();
  document.querySelector("#skip").textContent = t.skip;
  const name = content.profile.name;
  const logo = image(content.profile.logo,"","brand-logo");
  const initials = name.trim().split(/\s+/).slice(0,2).map(part=>part[0]).join("").toUpperCase();
  const photo = logo ? "" : image(content.profile.photo,"","brand-photo");
  brand.innerHTML = `${logo || photo || `<span class="monogram" aria-hidden="true">${escape(initials)}</span>`}<span>${escape(name)}</span>`;
  nav.setAttribute("aria-label",lang === "pt" ? "Navegação principal" : "Main navigation");
  nav.innerHTML = [
    ["projetos",t.nav[0]],["relatorios-power-bi","Power BI"],["experiencia",t.nav[1]],["competencias",t.nav[2]],["consultoria",w.consult],["contato",t.nav[3]]
  ].map(([key,label])=>`<a href="#${key}"${route === key ? ' aria-current="location"' : ""}>${label}</a>`).join("");
  document.querySelector("#footer").innerHTML = `<div class="wrap">${t.overline} · ${escape(name)}</div>`;
  language.textContent = lang === "pt" ? "EN" : "PT";
  language.setAttribute("aria-label",lang === "pt" ? "Switch to English" : "Mudar para português");
  document.title = title ? title+" | "+name : name+" | "+t.overline;
  if (["projeto","demo","power-bi"].includes(route)) {
    const isReport = route === "power-bi";
    main.innerHTML = `<div class="wrap main-inner"><p><a class="text-link" href="#${isReport ? "relatorios-power-bi" : "projetos"}">${isReport ? w.reportBack : t.back}</a></p><div id="page"></div></div>`;
    const page = document.querySelector("#page");
    if (scroll && !anchor) {
      window.scrollTo(0,0);
      main.focus({preventScroll:true});
    }
    if (project && route === "projeto") {
      page.innerHTML = caseStudy(project,t,w);
      if (scroll && anchor) document.getElementById(anchor)?.scrollIntoView();
    } else if (report && isReport) {
      page.innerHTML = reportStudy(report,w);
    } else if (demo) {
      page.innerHTML = `<h1>${escape(title)}</h1>${project ? `<p><a class="text-link" href="#projeto/${id}">${t.case}</a></p>` : ""}<p class="notice">${w.ai}</p><div id="demo-root"></div>`;
      const root = page.querySelector("#demo-root");
      try { await demos[id](root,lang); } catch { root.textContent = w.dataError; }
    } else page.innerHTML = `<h1>${t.unknown}</h1>`;
    return;
  }
  main.innerHTML = home(t,w);
  if (scroll && route) document.getElementById(route)?.scrollIntoView();
  if (scroll && route === "inicio") window.scrollTo(0,0);
}

language.addEventListener("click",()=>{
  lang = lang === "pt" ? "en" : "pt";
  if (!isEditor) writeLocal("dg-language",lang);
  render(false);
});
themeButton.addEventListener("click",()=>{
  if (!content) return;
  themePreference = theme === "dark" ? "light" : "dark";
  if (!isEditor) writeLocal("dg-theme",themePreference);
  changeTheme();
});
document.querySelector("#skip").addEventListener("click",event=>{
  event.preventDefault();
  main.focus();
  main.scrollIntoView();
});
window.addEventListener("hashchange",()=>render());

try {
  content = await data("../data/content.json");
  render();
} catch { main.textContent = words[lang].dataError; }
if (isEditor) {
  window.addEventListener("message",event=>{
    if (event.origin === location.origin && event.source === window.parent && event.data?.type === "portfolio-draft") {
      content = event.data.config;
      render(false);
    }
  });
  window.parent.postMessage({type:"portfolio-ready"},location.origin);
}
