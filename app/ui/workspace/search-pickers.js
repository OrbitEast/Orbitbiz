/* OrbitBiz — reusable searchable entity pickers. */
(()=>{
  "use strict";
  const core=window.OrbitBiz=window.OrbitBiz||{},w=core.workspace=core.workspace||{};
  const esc=v=>w.esc(v);
  const enhance=select=>{
    if(!select||select.dataset.searchEnhanced==="1"||select.closest("[data-search-picker]")||!select.options.length)return;
    const isCustomer=select.name==="customer_id",isItem=select.matches("[data-item]");
    if(!isCustomer&&!isItem)return;
    select.dataset.searchEnhanced="1";
    const wrapper=document.createElement("div");wrapper.className="ob-search-picker";wrapper.dataset.searchPicker=isCustomer?"customer":"item";
    const input=document.createElement("input"),list=document.createElement("datalist"),add=document.createElement("button"),hint=document.createElement("small"),hidden=document.createElement("input");
    const listId=`ob-picker-${Math.random().toString(36).slice(2,10)}`;
    input.type="text";input.setAttribute("list",listId);input.placeholder=`Search ${isCustomer?"customer":"product"}…`;input.autocomplete="off";input.className="ob-picker-input";
    list.id=listId;add.type="button";add.className="ob-soft ob-picker-add";add.innerHTML=`${w.icon("plus")} Add now`;hint.className="ob-picker-hint";hidden.type="hidden";hidden.value=select.value;
    const labelFor=option=>option?.textContent?.trim()||"";
    [...select.options].forEach(o=>{if(o.value){const opt=document.createElement("option");opt.value=labelFor(o);opt.dataset.id=o.value;list.appendChild(opt)}});
    input.value=labelFor(select.selectedOptions[0]);
    const row=document.createElement("div");row.className="ob-search-row";row.append(input,add);wrapper.append(row,hidden,list,hint);select.before(wrapper);select.style.display="none";
    const resolve=()=>{const value=input.value.trim().toLowerCase();const option=[...select.options].find(o=>o.value&&labelFor(o).toLowerCase()===value);if(option){select.value=option.value;hidden.value=option.value;hint.textContent=`${isCustomer?"Customer":"Product"} selected.`;select.dispatchEvent(new Event("change",{bubbles:true}))}else{select.value="";hidden.value="";hint.textContent=value?`No exact match. Use “Add now” to create this ${isCustomer?"customer":"product"}.`:"Search and choose an existing record."}};
    input.addEventListener("input",resolve);input.addEventListener("change",resolve);
    const openCreate=()=>{
      wrapper.querySelector(".ob-picker-create")?.remove();
      const card=document.createElement("div");card.className="ob-picker-create";
      card.innerHTML=`<div class="ob-picker-create-head"><strong>Add ${isCustomer?"customer":"product"}</strong><button type="button" data-cancel>×</button></div><form class="ob-form"><div class="ob-form-grid">${w.field("Name","name","text",true,input.value.trim())}${isCustomer?w.field("Company","company_name"):w.field("SKU","sku")}${isCustomer?w.field("Phone","phone","tel"):w.field("Sale price","selling_price","number")}${isCustomer?w.field("GSTIN","gstin"):w.field("Tax rate","tax_rate","number")}</div><button class="ob-primary small" type="submit">Save ${isCustomer?"customer":"product"}</button></form>`;
      wrapper.appendChild(card);card.querySelector("[data-cancel]").onclick=()=>card.remove();
      card.querySelector("form").addEventListener("submit",async e=>{e.preventDefault();const raw=Object.fromEntries(new FormData(e.currentTarget).entries()),name=String(raw.name||"").trim();if(!name){w.toast("Name is required");return}const state=core.workspaceState;if(!state?.businessId){w.toast("Workspace is not ready");return}const data=isCustomer?{business_id:state.businessId,name,company_name:String(raw.company_name||"").trim()||null,phone:String(raw.phone||"").trim()||null,gstin:String(raw.gstin||"").trim()||null}:{business_id:state.businessId,name,sku:String(raw.sku||"").trim()||null,selling_price:Number(raw.selling_price||0),tax_rate:Number(raw.tax_rate||0),is_active:true};const result=await w.db().from(isCustomer?"customers":"items").insert(data).select(isCustomer?"id,name,company_name,gstin":"id,name,sku,selling_price,tax_rate,unit,item_type").single();if(result.error){w.toast(result.error.message||`Could not add ${isCustomer?"customer":"product"}`);return}const x=result.data,label=isCustomer?`${x.name}${x.company_name?` · ${x.company_name}`:""}`:`${x.name}${x.sku?` · ${x.sku}`:""}`;const option=new Option(label,x.id);select.add(option);select.value=x.id;hidden.value=x.id;input.value=label;const dlOpt=document.createElement("option");dlOpt.value=label;dlOpt.dataset.id=x.id;list.appendChild(dlOpt);hint.textContent=`${isCustomer?"Customer":"Product"} added and selected.`;card.remove();select.dispatchEvent(new Event("change",{bubbles:true}));w.toast(`${isCustomer?"Customer":"Product"} added`)});
    };
    add.addEventListener("click",openCreate);
  };
  const scan=root=>root.querySelectorAll?.('select[name="customer_id"],select[data-item]').forEach(enhance);
  const observer=new MutationObserver(mutations=>mutations.forEach(m=>m.addedNodes.forEach(node=>{if(node.nodeType===1){scan(node);if(node.matches?.(".ob-modal"))scan(node)}})));
  const start=()=>{scan(document);observer.observe(document.body,{childList:true,subtree:true})};
  if(document.body)start();else document.addEventListener("DOMContentLoaded",start,{once:true});
})();
