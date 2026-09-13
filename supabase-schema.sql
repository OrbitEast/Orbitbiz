-- OrbitBiz — production relational schema
-- Run this migration in Supabase SQL Editor before enabling live business data.
-- Multi-tenant by business_id; every business-owned table is protected by RLS.

create extension if not exists pgcrypto;

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  email text,
  phone text,
  gstin text,
  pan text,
  address jsonb not null default '{}'::jsonb,
  currency text not null default 'INR',
  fiscal_year_start smallint not null default 4 check (fiscal_year_start between 1 and 12),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete cascade,
  quantity numeric(14,3) not null,
  movement_type text not null check (movement_type in ('opening','purchase','sale','adjustment','return_in','return_out','transfer_in','transfer_out')),
  reference_type text,
  reference_id uuid,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.stock_movements add column if not exists reference_type text;

-- Production invoice creation.
-- UUID primary keys remain database-generated with gen_random_uuid().
-- Invoice numbers are sequential per business and per calendar year.
create or replace function public.create_invoice_with_items(p_business_id uuid,p_customer_id uuid,p_issue_date date,p_due_date date,p_notes text,p_items jsonb)
returns uuid language plpgsql security definer set search_path=public as $$
declare
  v_invoice_id uuid;
  v_invoice_number text;
  v_subtotal numeric(14,2):=0;
  v_discount_total numeric(14,2):=0;
  v_tax_total numeric(14,2):=0;
  v_total numeric(14,2):=0;
  v_item jsonb;
  v_qty numeric(14,3);
  v_price numeric(14,2);
  v_discount numeric(14,2);
  v_tax_rate numeric(7,3);
  v_base numeric(14,2);
  v_tax numeric(14,2);
  v_line_total numeric(14,2);
  v_next integer;
  v_year integer:=extract(year from coalesce(p_issue_date,current_date));
begin
  if not exists(select 1 from public.business_members bm where bm.business_id=p_business_id and bm.user_id=auth.uid()) then raise exception 'Not a member of this business'; end if;
  if p_customer_id is not null and not exists(select 1 from public.customers c where c.id=p_customer_id and c.business_id=p_business_id) then raise exception 'Customer does not belong to this business'; end if;
  if jsonb_typeof(coalesce(p_items,'[]'::jsonb))<>'array' or jsonb_array_length(coalesce(p_items,'[]'::jsonb))=0 then raise exception 'Invoice requires at least one line item'; end if;

  perform pg_advisory_xact_lock(hashtext('orbitbiz-invoice-'||p_business_id::text));
  select coalesce(max((regexp_match(invoice_number,'^INV-'||v_year::text||'-([0-9]+)$'))[1]::integer),0)+1
    into v_next
    from public.invoices
   where business_id=p_business_id and invoice_number like 'INV-'||v_year::text||'-%';
  v_invoice_number:='INV-'||v_year::text||'-'||lpad(v_next::text,4,'0');

  for v_item in select value from jsonb_array_elements(p_items) value loop
    if nullif(v_item->>'item_id','') is not null and not exists(select 1 from public.items i where i.id=(v_item->>'item_id')::uuid and i.business_id=p_business_id) then raise exception 'Item does not belong to this business'; end if;
    v_qty:=greatest(0,coalesce((v_item->>'quantity')::numeric,0));
    v_price:=greatest(0,coalesce((v_item->>'unit_price')::numeric,0));
    v_discount:=greatest(0,coalesce((v_item->>'discount')::numeric,0));
    v_tax_rate:=greatest(0,coalesce((v_item->>'tax_rate')::numeric,0));
    if v_qty<=0 then raise exception 'Quantity must be greater than zero'; end if;
    if nullif(trim(v_item->>'description'),'') is null then raise exception 'Every line needs a description'; end if;
    if v_tax_rate>100 then raise exception 'Tax rate cannot exceed 100 percent'; end if;
    v_base:=round(v_qty*v_price,2);
    v_discount:=least(v_discount,v_base);
    v_tax:=round((v_base-v_discount)*v_tax_rate/100,2);
    v_line_total:=round(v_base-v_discount+v_tax,2);
    v_subtotal:=v_subtotal+v_base;
    v_discount_total:=v_discount_total+v_discount;
    v_tax_total:=v_tax_total+v_tax;
    v_total:=v_total+v_line_total;
  end loop;

  insert into public.invoices(business_id,customer_id,invoice_number,status,issue_date,due_date,subtotal,discount_total,tax_total,total,amount_paid,notes)
  values(p_business_id,p_customer_id,v_invoice_number,'draft',coalesce(p_issue_date,current_date),p_due_date,v_subtotal,v_discount_total,v_tax_total,v_total,0,nullif(trim(p_notes),''))
  returning id into v_invoice_id;

  for v_item in select value from jsonb_array_elements(p_items) value loop
    v_qty:=greatest(0,coalesce((v_item->>'quantity')::numeric,0));
    v_price:=greatest(0,coalesce((v_item->>'unit_price')::numeric,0));
    v_discount:=greatest(0,coalesce((v_item->>'discount')::numeric,0));
    v_tax_rate:=greatest(0,coalesce((v_item->>'tax_rate')::numeric,0));
    v_base:=round(v_qty*v_price,2);
    v_discount:=least(v_discount,v_base);
    v_tax:=round((v_base-v_discount)*v_tax_rate/100,2);
    v_line_total:=round(v_base-v_discount+v_tax,2);
    insert into public.invoice_items(invoice_id,item_id,description,quantity,unit_price,discount,tax_rate,line_total)
    values(v_invoice_id,nullif(v_item->>'item_id','')::uuid,trim(v_item->>'description'),v_qty,v_price,v_discount,v_tax_rate,v_line_total);
  end loop;
  return v_invoice_id;
end;
$$;
