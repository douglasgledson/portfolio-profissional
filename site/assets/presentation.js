import { escape } from "./ui.js";

export const localized = (value, lang) => value?.[lang] || value?.[lang === "pt" ? "en" : "pt"] || "";

const fonts = {system:'"Segoe UI", system-ui, sans-serif', sans:"Arial, sans-serif", serif:"Georgia, serif"};
const cards = {rounded:["15px","none"], square:["2px","none"], pillowed:["22px","0 10px 30px var(--shadow)"]};
const tokens = {
  primary:"--primary", secondary:"--panel", accent:"--accent", background:"--bg",
  text:"--ink", menuBackground:"--menu-bg", menuText:"--menu-ink"
};

function foreground(color) {
  const [r,g,b] = color.slice(1).match(/../g).map(hex=>{
    const c = parseInt(hex,16)/255;
    return c <= 0.04045 ? c/12.92 : ((c+0.055)/1.055)**2.4;
  });
  return (.2126*r + .7152*g + .0722*b) > .179 ? "#101010" : "#ffffff";
}
export function applyAppearance(appearance, preference) {
  const active = preference || (appearance?.defaultTheme === "light" ? "light" : "dark");
  const root = document.documentElement;
  root.dataset.theme = active;
  if (!appearance) return active;
  const colors = appearance[active] || {};
  for (const [key,property] of Object.entries(tokens)) {
    const color = colors[key];
    if (/^#[0-9a-f]{6}$/i.test(color)) root.style.setProperty(property,color);
    else root.style.removeProperty(property);
  }
  const primary = colors.primary;
  if (/^#[0-9a-f]{6}$/i.test(primary)) root.style.setProperty("--on-primary",foreground(primary));
  else root.style.removeProperty("--on-primary");
  root.style.setProperty("--font", Object.hasOwn(fonts,appearance.font) ? fonts[appearance.font] : fonts.system);
  const [radius,shadow] = Object.hasOwn(cards,appearance.cards) ? cards[appearance.cards] : cards.rounded;
  root.style.setProperty("--card-radius",radius);
  root.style.setProperty("--card-shadow",shadow);
  return active;
}

export function publicUrl(value) {
  if ((/^\.\/(media|docs)\/[\w.-]+(?:\/[\w.-]+)*$/.test(value)
      || /^\.\/assets\/curriculos\/[\w.-]+\.pdf$/i.test(value))
      && !value.slice(2).split("/").some(part=>[".",".."].includes(part))) return value;
  try {
    const url = new URL(value);
    if (url.protocol === "https:" && url.hostname && !url.username && !/[\s\\]/.test(value)) return url.href;
  } catch { return ""; }
  return "";
}

const objectUrls = new Set();
export function releaseMedia() {
  for (const url of objectUrls) URL.revokeObjectURL(url);
  objectUrls.clear();
}
const extensions = {
  "application/pdf":"pdf", "application/x-pbix":"pbix", "application/x-pbit":"pbit", "application/json":"json",
  "text/csv":"csv", "text/plain":"txt", "application/zip":"zip",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":"xlsx"
};
function packagedAsset(value, kinds) {
  if (typeof value !== "string") return null;
  const url = publicUrl(value);
  if (url) return {url, embedded:false};
  const match = /^data:([a-z0-9.+/-]+);base64,([A-Za-z0-9+/=]+)$/.exec(value);
  if (!match || !kinds.includes(match[1])) return null;
  try {
    const bytes = Uint8Array.from(atob(match[2]),char=>char.charCodeAt(0));
    const url = URL.createObjectURL(new Blob([bytes],{type:match[1]}));
    objectUrls.add(url);
    return {url,mime:match[1],embedded:true};
  } catch { return null; }
}
export function image(value, alt, className) {
  const asset = packagedAsset(value,["image/jpeg","image/png","image/webp","image/gif"]);
  return asset ? `<img class="${className}" src="${escape(asset.url)}" alt="${escape(alt)}"${className === "professional-photo" ? "" : ' loading="lazy"'}>` : "";
}
export function link(value, label) {
  const url = publicUrl(value);
  return url ? `<a class="text-link" href="${escape(url)}">${escape(label)}</a>` : "";
}
export function documentLink(value, label, name, pdf = false) {
  const asset = packagedAsset(value,pdf ? ["application/pdf"] : Object.keys(extensions));
  return asset ? `<a class="text-link" href="${escape(asset.url)}"${asset.embedded || (pdf && asset.url.startsWith("./")) ? ` download="${escape(name)}.${pdf ? "pdf" : extensions[asset.mime]}"` : ""}>${escape(label)}</a>` : "";
}
export function media(items, lang) {
  const en = lang === "en";
  return items.map((item,index)=>{
    const label = localized(item.label,lang);
    const video = packagedAsset(item.video,["video/mp4","video/webm"]);
    const inline = video?.embedded || /\.(?:mp4|webm)(?:$|[?#])/i.test(video?.url || "");
    return `<article class="card media-item"><h3>${escape(label)}</h3>
      ${image(item.image,label,"case-image")}
      ${inline ? `<video controls preload="none" aria-label="${escape(label)}" src="${escape(video.url)}"></video>` :
        link(item.video,en ? "Watch video" : "Assistir ao vídeo")}
      ${documentLink(item.document,en ? "Open document" : "Acessar documento","documento-" + (index+1))}
      ${link(item.link,en ? "Visit authorized link" : "Acessar link autorizado")}</article>`;
  }).join("");
}