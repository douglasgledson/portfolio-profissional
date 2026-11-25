export const escape = value => String(value ?? "").replace(/[&<>"']/g, char =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

export function readLocal(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
export function writeLocal(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { return false; }
}
export const locale = lang => lang === "pt" ? "pt-BR" : "en-US";
export const money = (value, lang) => new Intl.NumberFormat(locale(lang), {
  style: "currency", currency: "BRL", maximumFractionDigits: 2
}).format(value);
export const integer = (value, lang) => new Intl.NumberFormat(locale(lang)).format(value);
export const metric = (name, value) => `<div class="metric"><span>${escape(name)}</span><strong>${escape(value)}</strong></div>`;
export function chart(rows, label, format = String) {
  const max = Math.max(1, ...rows.map(([, value]) => value));
  return `<div class="chart" role="group" aria-label="${escape(label)}">${rows.map(([name, value]) =>
    `<details><summary><span>${escape(name)}</span><span class="track" aria-hidden="true"><span class="fill" style="width:${100 * value / max}%"></span></span><strong>${escape(format(value))}</strong></summary><p>${escape(label)} · ${escape(name)} · ${escape(format(value))}</p></details>`).join("")}</div>`;
}
export async function data(url) {
  const response = await fetch(new URL(url, import.meta.url));
  if (!response.ok) throw new Error(String(response.status));
  return response.json();
}
export const option = (value, label, selected) =>
  `<option value="${escape(value)}"${value === selected ? " selected" : ""}>${escape(label)}</option>`;