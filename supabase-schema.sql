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

-- Existing schema continues below. Keep the stock-movement compatibility fix explicit.

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

-- Important: create-table-if-not-exists does not add columns to an already-existing table.
-- This keeps older/live databases compatible with the current stock workflow.
alter table public.stock_movements
  add column if not exists reference_type text;
