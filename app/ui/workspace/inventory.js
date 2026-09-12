/* OrbitBiz workspace — inventory ledger and stock movement controls. */
(() => {
  "use strict";
  const core = window.OrbitBiz = window.OrbitBiz || {};
  const w = core.workspace = core.workspace || {};
  const esc = v => w.esc(v);
  const money = v => w.money(v);
  const today = () => new Date().toISOString().slice(0,10);
  const movementTypes = [
    ["purchase", "Purchase received", 1],
    ["sale", "Sale / stock out", -1],
    ["return_in", "Customer return", 1],
    ["return_out", "Supplier return", -1],
    ["transfer_in", "Transfer in", 1],
    ["transfer_out", "Transfer out", -1],
    ["adjustment", "Stock adjustment", 0]
  ];
  const signedQuantity = (type, quantity) => {
    const q = Math.abs(Number(quantity || 0));
    const rule = movementTypes.find(x => x[0] === type);
    return type === "adjustment" ? Number(quantity || 0) : q * (rule?.[2] || 1);
  };
  const stockMap = (items, movements) => {
    const map = new Map(items.map(item => [item.id, Number(item.opening_stock || 0)]));
    (movements || []).forEach(m => map.set(m.item_id, (map.get(m.item_id) || 0) + Number(m.quantity || 0)));
    return map;
  };

  w.inventoryView = (items, movements = []) => {
    const stocks = stockMap(items, movements);
    const low = items.filter(i => i.item_type === "product" && i.reorder_level != null && stocks.get(i.id) <= Number(i.reorder_level));
    const value = items.reduce((sum, i) => sum + Math.max(0, stocks.get(i.id) || 0) * Number(i.purchase_price || 0), 0);
    const recent = [...movements].sort((a,b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)).slice(0, 40);
    const itemMap = new Map(items.map(i => [i.id, i]));
    const fmtQty = q => Number(q || 0).toLocaleString("en-IN", {maximumFractionDigits: 3});
    const typeLabel = type => movementTypes.find(x => x[0] === type)?.[1] || String(type || "Movement");
    return `<div class="ob-op-hero"><div><span class="ob-eyebrow">INVENTORY CONTROL</span><h2>Know what is in stock.</h2><p>Track product quantities from opening stock through purchases, sales, returns and adjustments.</p></div><button class="ob-primary" data-action="new-stock-movement">${w.icon("plus")} Move stock</button></div>
      <section class="ob-op-metrics"><article class="ob-op-card green"><span>Catalogue</span><strong>${items.length}</strong><small>Items and services</small></article><article class="ob-op-card blue"><span>Stock value</span><strong>${money(value)}</strong><small>At purchase cost</small></article><article class="ob-op-card pink"><span>Low stock</span><strong>${low.length}</strong><small>At or below reorder level</small></article><article class="ob-op-card yellow"><span>Movements</span><strong>${movements.length}</strong><small>Recorded stock events</small></article></section>
      <article class="ob-panel ob-full-panel"><div class="ob-panel-head"><div><span>STOCK REGISTER</span><h3>Products & services</h3></div><div class="ob-panel-actions"><button class="ob-soft" data-action="new-item">${w.icon("plus")} Add item</button><button class="ob-primary small" data-action="new-stock-movement">${w.icon("plus")} Move stock</button></div></div>${items.length ? `<div class="ob-table-scroll"><table class="ob-table"><thead><tr><th>Item</th><th>SKU</th><th>Type</th><th>Sale price</th><th>On hand</th><th>Reorder</th><th></th></tr></thead><tbody>${items.map(i => { const stock=stocks.get(i.id)||0, reorder=i.reorder_level; const isLow=i.item_type === "product" && reorder != null && stock <= Number(reorder); return `<tr><td><strong>${esc(i.name)}</strong></td><td>${esc(i.sku || "—")}</td><td>${esc(i.item_type || "product")}</td><td>${money(i.selling_price)}</td><td><strong class="${stock < 0 ? "ob-stock-negative" : isLow ? "ob-stock-low" : ""}">${fmtQty(stock)} ${esc(i.unit || "pcs")}</strong></td><td>${reorder == null ? "—" : fmtQty(reorder)}</td><td><button class="ob-row-action" data-action="new-stock-movement" data-item-id="${esc(i.id)}">Move</button></td></tr>`; }).join("")}</tbody></table></div>` : `<div class="ob-empty"><div>${w.icon("inventory")}</div><h4>Your catalogue is empty</h4><p>Add products or services before recording stock movement.</p><button class="ob-soft" data-action="new-item">${w.icon("plus")} Add first item</button></div>`}</article>
      <article class="ob-panel ob-full-panel"><div class="ob-panel-head"><div><span>MOVEMENT LEDGER</span><h3>Recent stock activity</h3></div></div>${recent.length ? `<div class="ob-table-scroll"><table class="ob-table"><thead><tr><th>Date</th><th>Item</th><th>Movement</th><th>Quantity</th><th>Reference</th><th>Note</th></tr></thead><tbody>${recent.map(m => { const q=Number(m.quantity||0); return `<tr><td>${esc(m.created_at ? new Date(m.created_at).toLocaleDateString("en-IN") : "—")}</td><td><strong>${esc(itemMap.get(m.item_id)?.name || "Deleted item")}</strong></td><td>${esc(typeLabel(m.movement_type))}</td><td><strong class="${q < 0 ? "ob-stock-negative" : "ob-stock-positive"}">${q > 0 ? "+" : ""}${fmtQty(q)}</strong></td><td>${esc(m.reference_type || "—")}</td><td>${esc(m.notes || "—")}</td></tr>`; }).join("")}</tbody></table></div>` : `<div class="ob-empty"><div>${w.icon("inventory")}</div><h4>No stock movements yet</h4><p>Record a purchase, sale, return, transfer or adjustment to build the ledger.</p><button class="ob-soft" data-action="new-stock-movement">${w.icon("plus")} Record movement</button></div>`}</article>`;
  };

  w.newStockMovement = async (state, presetItemId = "") => {
    const items = await w.safe(state, "items", "id,name,sku,item_type,unit,selling_price,purchase_price,opening_stock,reorder_level");
    if (!items.length) { w.toast("Add an item before moving stock"); return; }
    const stocks = stockMap(items, await w.safe(state, "stock_movements", "item_id,quantity"));
    const options = items.filter(i => i.item_type !== "service").map(i => `<option value="${esc(i.id)}" ${presetItemId === i.id ? "selected" : ""}>${esc(i.name)}${i.sku ? ` · ${esc(i.sku)}` : ""}</option>`).join("");
    const typeOptions = movementTypes.map(x => `<option value="${x[0]}">${x[1]}</option>`).join("");
    const node = w.modal("Move stock", `<form class="ob-form" data-form="stock-movement"><div class="ob-form-grid"><label class="ob-field"><span>Item</span><select name="item_id" required>${options}</select></label><label class="ob-field"><span>Movement</span><select name="movement_type" data-movement-type required>${typeOptions}</select></label>${w.field("Quantity","quantity","number",true,"","Enter quantity")}${w.field("Date","occurred_on","date",true,today())}</div><div class="ob-stock-preview" data-stock-preview></div>${w.textarea("Note","notes","","Optional reason or reference") }<button class="ob-primary" type="submit">Record movement ${w.icon("arrow")}</button></form>`);
    const form=node.querySelector("form"), itemSelect=form.querySelector("[name=item_id]"), typeSelect=form.querySelector("[name=movement_type]"), qtyInput=form.querySelector("[name=quantity]"), preview=node.querySelector("[data-stock-preview]");
    const refreshPreview=()=>{const item=items.find(i=>i.id===itemSelect.value), type=typeSelect.value, q=Number(qtyInput.value||0), signed=signedQuantity(type,q), current=stocks.get(item?.id)||0, next=current+signed; preview.innerHTML=item ? `<span>Current stock</span><strong>${Number(current).toLocaleString("en-IN",{maximumFractionDigits:3})} ${esc(item.unit||"pcs")}</strong><span>After movement</span><strong class="${next<0?"ob-stock-negative":""}">${Number(next).toLocaleString("en-IN",{maximumFractionDigits:3})} ${esc(item.unit||"pcs")}</strong>` : "";};
    [itemSelect,typeSelect,qtyInput].forEach(el=>el.addEventListener("input",refreshPreview));
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const item=items.find(i=>i.id===itemSelect.value), type=typeSelect.value, rawQty=Number(qtyInput.value||0), quantity=signedQuantity(type,rawQty), current=stocks.get(item?.id)||0;
      if (!item || item.item_type === "service") { w.toast("Select a stock-tracked product"); return; }
      if (!Number.isFinite(rawQty) || rawQty <= 0 || (type === "adjustment" && !Number.isFinite(quantity))) { w.toast("Enter a valid quantity"); return; }
      if (current + quantity < 0) { w.toast("This movement would make stock negative"); return; }
      const button=form.querySelector("button[type=submit]"); button.disabled=true; button.textContent="Saving…";
      try {
        const result=await w.db().from("stock_movements").insert({business_id:state.businessId,item_id:item.id,quantity,movement_type:type,reference_type:"manual",notes:String(form.querySelector("[name=notes]").value||"").trim()||null,created_at:new Date(`${form.querySelector("[name=occurred_on]").value||today()}T00:00:00`).toISOString()});
        if(result.error) throw result.error;
        node.remove(); w.toast("Stock movement recorded"); await state.renderPage();
      } catch(error){console.error(error);w.toast(error.message||"Could not record movement");button.disabled=false;button.textContent="Record movement";}
    });
    refreshPreview();
  };

  w.newItem = state => {
    const node=w.modal("Add item", `<form class="ob-form" data-form="item"><div class="ob-form-grid"><label class="ob-field"><span>Item type</span><select name="item_type"><option value="product">Product</option><option value="service">Service</option></select></label>${w.field("Item name","name","text",true)}${w.field("SKU","sku")}${w.field("Unit","unit", "text", false, "pcs")}${w.field("Sale price","selling_price","number",false,"0","0.00")}${w.field("Purchase price","purchase_price","number",false,"0","0.00")}${w.field("Tax rate","tax_rate","number",false,"0","0.00")}${w.field("Opening stock","opening_stock","number",false,"0","0.000")}${w.field("Reorder level","reorder_level","number",false,"","0.000")}</div><button class="ob-primary" type="submit">Save item ${w.icon("arrow")}</button></form>`);
    node.querySelector("form")?.addEventListener("submit",event=>w.saveItem(event,state));
  };
  w.saveItem = async (event,state) => {
    event.preventDefault(); const form=event.currentTarget, raw=Object.fromEntries(new FormData(form).entries());
    const data={business_id:state.businessId,item_type:raw.item_type||"product",name:String(raw.name||"").trim(),sku:String(raw.sku||"").trim()||null,unit:String(raw.unit||"pcs").trim()||"pcs",selling_price:Number(raw.selling_price||0),purchase_price:Number(raw.purchase_price||0),tax_rate:Number(raw.tax_rate||0),opening_stock:Number(raw.opening_stock||0),reorder_level:raw.reorder_level===""?null:Number(raw.reorder_level)};
    if(!data.name||[data.selling_price,data.purchase_price,data.tax_rate,data.opening_stock].some(n=>!Number.isFinite(n)||n<0)||(data.reorder_level!==null&&(!Number.isFinite(data.reorder_level)||data.reorder_level<0))){w.toast("Check the item details");return;}
    try{const result=await w.db().from("items").insert(data);if(result.error)throw result.error;form.closest(".ob-modal")?.remove();w.toast("Item added");await state.renderPage();}catch(error){console.error(error);w.toast(error.message||"Could not save item");}
  };

  document.addEventListener("click", event => {
    const button=event.target.closest('[data-action="new-stock-movement"]');
    if(!button) return;
    event.preventDefault(); event.stopImmediatePropagation();
    const state=core.workspaceState;
    if(state?.businessId) w.newStockMovement(state,button.dataset.itemId||"");
  }, true);
})();
