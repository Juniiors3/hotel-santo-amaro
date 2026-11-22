-- ==============================================================================
-- HOTEL SANTO AMARO — ESQUEMA DO BANCO DE DADOS & NORMAS DE SEGURANÇA POSTGRES/SUPABASE
-- ==============================================================================
-- 1. Anti-SQL Injection:
--    - As chamadas da API REST do Supabase (PostgREST) usam consultas parametrizadas.
--    - Os parâmetros da função RPC (p_password text) são tipos fortemente vinculados
--      e avaliados literalmente sem concatenação de string dinâmica.
-- 2. Princípio do Menor Privilégio:
--    - 'anon' tem permissão EXCLUSIVAMENTE para INSERT.
--    - SELECT, UPDATE e DELETE diretos na tabela são BLOQUEADOS para a role 'anon'.
--    - Consultas são permitidas unicamente via RPC com validação de senha.
-- ==============================================================================

-- Criação da tabela principal
create table if not exists public.reservation_requests (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  name text not null,
  phone text not null,
  checkin date not null,
  checkout date not null,
  room_type text not null,
  guests text not null
);

-- Regras de validação e integridade de dados (Check Constraints)
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'valid_stay_dates') then
    alter table public.reservation_requests
      add constraint valid_stay_dates check (checkout >= checkin);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'valid_name_length') then
    alter table public.reservation_requests
      add constraint valid_name_length check (char_length(name) >= 2 and char_length(name) <= 150);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'valid_phone_length') then
    alter table public.reservation_requests
      add constraint valid_phone_length check (char_length(phone) >= 8 and char_length(phone) <= 30);
  end if;
end $$;

-- Índice para acelerar a ordenação do painel administrativo
create index if not exists idx_reservation_requests_created_at
  on public.reservation_requests (created_at desc);

-- Ativação do Row Level Security (RLS)
alter table public.reservation_requests enable row level security;

-- Concessão estrita: apenas INSERT para visitantes anônimos do site
grant insert on table public.reservation_requests to anon;
revoke select, update, delete on table public.reservation_requests from anon;

-- Política de RLS: permite apenas inserção de novos pedidos
drop policy if exists "anon_insert_only" on public.reservation_requests;
create policy "anon_insert_only"
  on public.reservation_requests
  for insert
  to anon
  with check (true);

-- Função RPC de leitura segura com proteção por senha
-- O parâmetro 'set search_path = public' impede vulnerabilidades de Search Path Hijacking
create or replace function public.get_reservation_requests(p_password text)
returns table (
  id uuid,
  created_at timestamptz,
  name text,
  phone text,
  checkin date,
  checkout date,
  room_type text,
  guests text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Validação estrita de senha (comparação literal segura contra injeção)
  if p_password is null or p_password <> 'santoamaro2026' then
    raise exception 'Senha de acesso incorreta.';
  end if;

  return query
  select
    r.id,
    r.created_at,
    r.name,
    r.phone,
    r.checkin,
    r.checkout,
    r.room_type,
    r.guests
  from public.reservation_requests r
  order by r.created_at desc;
end;
$$;

-- Restringe a execução da função exclusivamente aos papéis necessários
revoke all on function public.get_reservation_requests(text) from public;
grant execute on function public.get_reservation_requests(text) to anon, authenticated;
