/* OrbitBiz — invoice page presentation and generation entry. */
(() => {
  "use strict";
  const core = window.OrbitBiz = window.OrbitBiz || {};
  const w = core.workspace = core.workspace || {};
  if (!w.esc || !w.money || !w.icon) return;
  const esc = w.esc, money = w.money, icon = w.icon;

  w.invoicesView = rows => `<section class="ob-invoice-page-head"><div><span class="ob-eyebrow">INVOICING</span><h2>Create and manage invoices</h2><p>Build a complete invoice from inventory items or custom lines, then generate a PDF for download or sharing.</p></div><button class="ob-primary" data-action="quick-invoice">${icon("plus")} Generate new invoice</button></section><article class="ob-panel ob-full-panel"><div class="ob-panel-head"><div><span>INVOICE RECORDS</span><h3>${rows.length} invoice${rows.length === 1 ? "" : "s"}</h3></div><button class="ob-primary small" data-action="quick-invoice">${icon("plus")} Generate new invoice</button></div>${rows.length ? `<div class="ob-table-scroll"><table class="ob-table"><thead><tr><th>Invoice</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th></tr></thead><tbody>${rows.map(r=>{const total=Number(r.total||0),paid=Number(r.amount_paid||0),balance=Math.max(0,total-paid),status=r.status||(balance<=0&&total>0?"paid":"open");return `<tr><td><strong>${esc(r.invoice_number||"Invoice")}</strong></td><td>${money(total)}</td><td>${money(paid)}</td><td>${money(balance)}</td><td><span class="ob-status ${balance<=0&&total>0?"done":"open"}">${esc(status)}</span></td></tr>`}).join("")}</tbody></table></div>` : `<div class="ob-empty"><div>${icon("invoices")}</div><h4>No invoices yet</h4><p>Start your first invoice here. You can choose an inventory item or write a custom product or service.</p><button class="ob-primary" data-action="quick-invoice">${icon("plus")} Generate new invoice</button></div>`}</article>`;

  const style = document.createElement("style");
  style.textContent = `.ob-invoice-page-head{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin-bottom:24px}.ob-invoice-page-head h2{margin:5px 0 8px;font-size:clamp(26px,3vw,38px);letter-spacing:-.03em}.ob-invoice-page-head p{margin:0;max-width:720px;color:#667085;line-height:1.6}.ob-invoice-page-head .ob-primary{white-space:nowrap}@media(max-width:760px){.ob-invoice-page-head{align-items:stretch;flex-direction:column}.ob-invoice-page-head .ob-primary{width:100%}}`;
  document.head.appendChild(style);
})();
