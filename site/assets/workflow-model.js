export const roles = ["requester", "finance", "manager", "director", "admin"];
export const stages = ["review", "manager", "director", "approved", "returned"];
export const isOpen = item => !["approved", "returned"].includes(item.stage);
export const deadline = item => Date.parse(item.createdAt) + item.sla * 3600000;
export const overdue = (item, now) => deadline(item) < (isOpen(item) ? now : Date.parse(item.updatedAt));
export const positive = value => Number.isFinite(value) && value > 0 && value <= 100000000;
export function request(title, amount, rules, now) {
  if (!title.trim() || title.length > 90 || !positive(amount)) throw new Error("request");
  const date = new Date(now).toISOString();
  const cents = Math.round(amount * 100);
  if (!cents) throw new Error("request");
  return {
    id: crypto.randomUUID(), title: title.trim(), amount: cents / 100,
    stage: "review", approval: cents >= Math.round(rules.director * 100) ? "director" :
      cents >= Math.round(rules.manager * 100) ? "manager" : "finance",
    sla: rules.sla, createdAt: date, updatedAt: date,
    history: [{ stage: "review", role: "requester", time: date }]
  };
}
export const canAct = (item, role) => ({ review: "finance", manager: "manager", director: "director" })[item.stage] === role;
export function transition(item, role, action, now) {
  if (!canAct(item, role) || !["advance", "return"].includes(action)) throw new Error("transition");
  let stage = "returned";
  if (action === "advance") {
    const next = { review: item.approval === "finance" ? "approved" : "manager", manager: item.approval === "director" ? "director" : "approved", director: "approved" };
    stage = next[item.stage];
  }
  const time = new Date(now).toISOString();
  return { ...item, stage, updatedAt: time, history: [...item.history, { stage, role, time }] };
}