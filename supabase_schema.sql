-- Enable useful extensions
create extension if not exists "uuid-ossp";

-- USERS table (application-level profile)
create table if not exists public.users (
  id uuid primary key default auth.uid(),
  name text,
  email text,
  created_at timestamp with time zone default now()
);

-- mirror auth users via trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RATES (optional caching)
create table if not exists public.rates (
  id uuid primary key default uuid_generate_v4(),
  currency_code text check (currency_code in ('ILS','USD','EUR','THB')) not null,
  rate_to_ILS numeric not null,
  updated_at timestamp with time zone default now()
);

-- EXPENSES
create table if not exists public.expenses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null default auth.uid(),
  date date not null,
  category text not null,
  amount numeric not null,
  currency text check (currency in ('ILS','USD','EUR','THB')) not null,
  payer text check (payer in ('A','B')) not null,
  split_type text check (split_type in ('HALF','ALL_TO_A','ALL_TO_B','CUSTOM')) not null,
  custom_pct_to_A numeric,
  rate_override numeric,
  amount_base_ILS numeric not null,
  share_A numeric not null,
  share_B numeric not null,
  paid_by_A numeric not null,
  paid_by_B numeric not null,
  owes_A numeric not null,
  owes_B numeric not null,
  note text,
  link text,
  created_at timestamp with time zone default now()
);

-- ITINERARY
create table if not exists public.itinerary (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null default auth.uid(),
  type text check (type in ('Flight','Hotel','Activity')) not null,
  title text not null,
  date date not null,
  start_time text not null,
  end_time text,
  location text not null,
  notes text,
  link text,
  created_at timestamp with time zone default now()
);

-- LINKS
create table if not exists public.links (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null default auth.uid(),
  type text check (type in ('Flight','Hotel','Other')) not null,
  name text not null,
  url text not null,
  status text check (status in ('Considering','Booked','Cancelled')) not null default 'Considering',
  notes text,
  created_at timestamp with time zone default now()
);

-- RLS
alter table public.users enable row level security;
alter table public.expenses enable row level security;
alter table public.itinerary enable row level security;
alter table public.links enable row level security;

-- policies: users can see their own rows
create policy "Users can read own profile" on public.users
  for select using (id = auth.uid());
create policy "Users can insert own profile" on public.users
  for insert with check (id = auth.uid());
create policy "Users can update own profile" on public.users
  for update using (id = auth.uid());

create policy "Expenses are per-user" on public.expenses
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Itinerary per-user" on public.itinerary
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Links per-user" on public.links
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
