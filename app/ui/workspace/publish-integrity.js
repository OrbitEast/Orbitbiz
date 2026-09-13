/* OrbitBiz — final workflow integrity layer. Loaded after workspace modules. */
(() => {
  "use strict";
  const core=window.OrbitBiz=window.OrbitBiz||{};
  const w=core.workspace=core.workspace||{};
  const esc=v=>w.esc(v), money=v=>w.money(v), today=()=>new Date().toISOString().slice(0,10);
  const rows=(s,t,c="*")=>w.safe(s,t,c);

  /* Inventory must remain the authoritative stock view; views.js historically overwrote it. */
  if(typeof w.inventoryView==="function"){
    const originalInventory=w.inventoryView;
    w.inventoryView=originalInventory;
  }

  /* Transactional PO receiving: purchase + stock ledger + warehouse stock happen together. */
  w.receivePurchaseOrder=async(state,id)=>{
    try{
      const r=await w.db().rpc("receive_purchase_order",{p_purchase_order_id:id});
      if(r.error) throw r.error;
      w.toast("Purchase order received and stock updated");
      await state.renderPage();
    }catch(e){console.error(e);w.toast(e.message||"Could not receive order");}
  };

  /* Customer receipt: one transaction creates the payment, receipt, invoice update and receipt allocation. */
  w.newReceipt=async state=>{
    const [customers,invoices]=await Promise.all([
      rows(state,"customers","id,name,company_name"),
      rows(state,"invoices","id,invoice_number,customer_id,total,amount_paid,status")
    ]);
    const node=w.modal("Record receipt",`<form class="ob-form"><div class="ob-form-grid"><label class="ob-field"><span>Customer</span><select name="customer_id"><option value="">Auto from invoice</option>${customers.map(x=>`<option value="${esc(x.id)}">${esc(x.company_name||x.name)}</option>`).join("")}</select></label><label class="ob-field"><span>Invoice</span><select name="invoice_id"><option value="">Unallocated</option>${invoices.filter(x=>x.status!=="paid").map(x=>`<option value="${esc(x.id)}">${esc(x.invoice_number)} · ${money(Math.max(0,Number(x.total||0)-Number(x.amount_paid||0)))} due</option>`).join("")}</select></label>${w.field("Date","receipt_date","date",true,today())}${w.field("Amount","amount","number",true,"","0.00")}<label class="ob-field"><span>Method</span><select name="method"><option value="bank_transfer">Bank transfer</option><option value="upi">UPI</option><option value="cash">Cash</option><option value="card">Card</option><option value="cheque">Cheque</option><option value="other">Other</option></select></label>${w.field("Reference","reference")}</div>${w.textarea("Notes","notes","","Optional receipt note")}<button class="ob-primary" type="submit">Save receipt ${w.icon("arrow")}</button></form>`);
    node.querySelector("form").addEventListener("submit",async e=>{
      e.preventDefault();
      const f=e.currentTarget,d=Object.fromEntries(new FormData(f).entries()),amount=Number(d.amount||0);
      if(!Number.isFinite(amount)||amount<=0){w.toast("Enter a valid amount");return;}
      const button=f.querySelector("button[type=submit]");button.disabled=true;button.textContent="Saving…";
      try{
        if(d.invoice_id&&d.customer_id){
          const inv=await w.db().from("invoices").select("customer_id").eq("id",d.invoice_id).eq("business_id",state.businessId).single();
          if(inv.error)throw inv.error;
          if(inv.data.customer_id!==d.customer_id)throw new Error("Selected customer does not match the invoice");
        }
        const r=await w.db().rpc("record_customer_receipt",{p_business_id:state.businessId,p_invoice_id:d.invoice_id||null,p_receipt_date:d.receipt_date||today(),p_amount:amount,p_method:d.method||"bank_transfer",p_reference:d.reference||null,p_notes:d.notes||null});
        if(r.error)throw r.error;
        node.remove();w.toast("Receipt recorded");await state.renderPage();
      }catch(err){console.error(err);w.toast(err.message||"Could not record receipt");button.disabled=false;button.textContent="Save receipt";}
    });
  };

  /* Quotation discount is percentage-based; invoice discount is amount-based. Convert explicitly. */
  w.convertQuotation=async(state,id)=>{
    try{
      const db=w.db();
      const q=await db.from("quotations").select("id,business_id,customer_id,quote_number,notes").eq("id",id).eq("business_id",state.businessId).maybeSingle();
      if(q.error||!q.data)throw q.error||new Error("Quotation could not be loaded");
      if(String(q.data.quote_number||"").toLowerCase().startsWith("quo-")){/* normal numbering; invoice gets its own sequence */}
      const lines=await db.from("quotation_items").select("item_id,description,quantity,unit_price,discount,tax_rate").eq("quotation_id",id).order("created_at");
      if(lines.error)throw lines.error;
      if(!lines.data?.length)throw new Error("Quotation has no line items");
      const invoiceLines=lines.data.map(x=>{const base=Number(x.quantity||0)*Number(x.unit_price||0);const discountAmount=Math.min(base,base*Math.max(0,Number(x.discount||0))/100);const tax=Number(x.tax_rate||0);return {item_id:x.item_id,description:x.description||"Item",quantity:Number(x.quantity||0),unit_price:Number(x.unit_price||0),discount:discountAmount,tax_rate:tax};});
      const subtotal=invoiceLines.reduce((s,x)=>s+x.quantity*x.unit_price,0);
      const discountTotal=invoiceLines.reduce((s,x)=>s+x.discount,0);
      const taxTotal=invoiceLines.reduce((s,x)=>s+(x.quantity*x.unit_price-x.discount)*x.tax_rate/100,0);
      const total=subtotal-discountTotal+taxTotal;
      const number=`INV-${Date.now().toString().slice(-8)}`;
      const inv=await db.from("invoices").insert({business_id:state.businessId,customer_id:q.data.customer_id,invoice_number:number,status:"draft",issue_date:today(),subtotal:Math.round(subtotal*100)/100,discount_total:Math.round(discountTotal*100)/100,tax_total:Math.round(taxTotal*100)/100,total:Math.round(total*100)/100,amount_paid:0,notes:q.data.notes||null}).select("id").single();
      if(inv.error)throw inv.error;
      const copy=await db.from("invoice_items").insert(invoiceLines.map((x,i)=>({...x,invoice_id:inv.data.id,line_total:Math.round((x.quantity*x.unit_price-x.discount+(x.quantity*x.unit_price-x.discount)*x.tax_rate/100)*100)/100,sort_order:i})));
      if(copy.error)throw copy.error;
      const upd=await db.from("quotations").update({status:"converted"}).eq("id",id).eq("business_id",state.businessId);
      if(upd.error)throw upd.error;
      w.toast(`Invoice ${number} created`);state.openInvoice(inv.data.id);
    }catch(e){console.error(e);w.toast(e.message||"Could not convert quotation");}
  };

  /* Settings alignment: businesses.address is JSONB, so preserve the address as structured data. */
  const originalSettingsView=w.settingsView;
  if(originalSettingsView){
    w.settingsView=async state=>{
      const b=(await w.db().from("businesses").select("*").eq("id",state.businessId).maybeSingle());
      if(b.error)throw b.error; const x=b.data||{};
      let address=""; if(typeof x.address==="string")address=x.address; else if(x.address?.text)address=x.address.text; else if(x.address&&typeof x.address==="object")address=Object.values(x.address).filter(v=>typeof v==="string").join(", ");
      const field=(label,name,type,value,placeholder="")=>`<label class="ob-field"><span>${esc(label)}</span><input name="${esc(name)}" type="${type}" value="${esc(value??"")}" placeholder="${esc(placeholder)}"></label>`;
      return `<div class="ob-op-hero ob-settings-hero"><div><span class="ob-eyebrow">WORKSPACE SETTINGS</span><h2>Make OrbitBiz yours.</h2><p>Business identity, tax details and document defaults.</p></div></div><form class="ob-panel ob-settings-form" data-settings-form><div class="ob-panel-head"><div><span>BUSINESS PROFILE</span><h3>Identity</h3></div><span class="ob-settings-badge">${w.icon("settings")} Private workspace</span></div><div class="ob-form-grid">${field("Business name","name","text",x.name,"Your business name")}${field("Legal / company name","legal_name","text",x.legal_name,"Optional legal name")}${field("Email","email","email",x.email,"Business email")}${field("Phone","phone","tel",x.phone,"Business phone")}${field("GSTIN","gstin","text",x.gstin,"Optional GSTIN")}${field("PAN","pan","text",x.pan,"Optional PAN")}${field("Website","website","url",x.website,"https://")}${field("Currency","currency","text",x.currency||"INR","INR")}</div>${w.textarea("Business address","address",address,"Address shown on business documents")}<div class="ob-settings-divider"></div><div class="ob-panel-head compact"><div><span>WORKSPACE</span><h3>Defaults</h3></div></div><div class="ob-form-grid">${field("Financial year starts","financial_year_start","date",x.financial_year_start||`${new Date().getFullYear()}-04-01`)}${field("Timezone","timezone","text",x.timezone||"Asia/Kolkata","Asia/Kolkata")}</div><div class="ob-settings-actions"><span>Changes apply to this business workspace.</span><button class="ob-primary" type="submit">Save changes ${w.icon("arrow")}</button></div></form>`;
    };
    w.saveSettings=async(e,state)=>{e.preventDefault();const f=e.currentTarget,r=Object.fromEntries(new FormData(f).entries());if(!r.name?.trim()){w.toast("Business name is required");return;}const payload={name:r.name.trim(),legal_name:r.legal_name?.trim()||null,email:r.email?.trim()||null,phone:r.phone?.trim()||null,gstin:r.gstin?.trim()||null,pan:r.pan?.trim()||null,website:r.website?.trim()||null,currency:r.currency?.trim()||"INR",address:{text:r.address?.trim()||""},financial_year_start:r.financial_year_start||null,timezone:r.timezone?.trim()||"Asia/Kolkata",updated_at:new Date().toISOString()};const result=await w.db().from("businesses").update(payload).eq("id",state.businessId);if(result.error){w.toast(result.error.message||"Could not save settings");return;}w.toast("Business profile saved");await state.renderPage();};
  }

  /* Reconciliation uses the live schema names and calculates difference from the two balances. */
  w.newReconciliation=async state=>{const accounts=await rows(state,"payment_accounts","id,name,account_type,current_balance");const node=w.modal("New reconciliation",`<form class="ob-form"><div class="ob-form-grid"><label class="ob-field"><span>Payment account</span><select name="payment_account_id"><option value="">Select account</option>${accounts.map(a=>`<option value="${esc(a.id)}">${esc(a.name)} · ${money(a.current_balance)}</option>`).join("")}</select></label>${w.field("Date","reconciliation_date","date",true,today())}${w.field("Statement balance","statement_balance","number",true,"","0.00")}${w.field("Book balance","book_balance","number",true,"","0.00")}</div>${w.textarea("Notes","notes","","Optional reconciliation note")}<button class="ob-primary" type="submit">Save reconciliation ${w.icon("arrow")}</button></form>`);node.querySelector("form").addEventListener("submit",async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),statement=Number(d.statement_balance),book=Number(d.book_balance);if(!Number.isFinite(statement)||!Number.isFinite(book)){w.toast("Enter valid balances");return;}const diff=Math.round((statement-book)*100)/100;const r=await w.db().from("reconciliations").insert({business_id:state.businessId,payment_account_id:d.payment_account_id||null,reconciliation_date:d.reconciliation_date||today(),statement_balance:statement,book_balance:book,difference:diff,status:"open",notes:d.notes?.trim()||null});if(r.error){w.toast(r.error.message);return;}node.remove();w.toast("Reconciliation saved");await state.renderPage();});};
  w.markReconciled=async(state,id)=>{const r=await w.db().from("reconciliations").update({status:"reconciled",updated_at:new Date().toISOString()}).eq("id",id).eq("business_id",state.businessId);if(r.error){w.toast(r.error.message);return;}w.toast("Reconciliation marked complete");await state.renderPage();};
})();
