export const sum = rows => rows.reduce((total, row) => total + Math.round(row.amount * 100), 0) / 100;

export function portfolio(rows, asOf) {
  const paid = rows.filter(row => row.paidDate && row.paidDate <= asOf);
  const open = rows.filter(row => !row.paidDate || row.paidDate > asOf);
  const late = open.filter(row => row.dueDate < asOf);
  const forecast = open.filter(row => row.dueDate >= asOf);
  const bands = [[], [], [], [], []];
  for (const row of open) {
    const days = (Date.parse(asOf) - Date.parse(row.dueDate)) / 86400000;
    const index = days <= 0 ? 0 : days <= 30 ? 1 : days <= 60 ? 2 : days <= 90 ? 3 : 4;
    bands[index].push(row);
  }
  return { paid, open, late, forecast, aging: bands.map(sum) };
}

export function printing({price, variable, fixed, volume, investment}) {
  const contribution = price - variable;
  const profit = contribution * volume - fixed;
  return {
    contribution, profit, margin: contribution / price, markup: variable ? contribution / variable : null,
    roi: investment ? profit * 12 / investment : null,
    payback: profit > 0 && investment > 0 ? investment / profit : null,
    breakEven: contribution > 0 ? Math.ceil(fixed / contribution) : null
  };
}