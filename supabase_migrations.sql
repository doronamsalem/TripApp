-- groups and membership
create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references auth.users,
  created_at timestamptz default now()
);

create table if not exists group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade,
  user_id uuid references auth.users,
  role text default 'member',
  joined_at timestamptz default now(),
  unique (group_id, user_id)
);

-- attachable items (itinerary entries, expense attachments, etc.)
create table if not exists attachments (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade,
  related_type text, -- 'itinerary'|'expense'|'link'
  related_id uuid,
  filename text,
  storage_path text,
  public_url text,
  uploaded_by uuid references auth.users,
  uploaded_at timestamptz default now()
);

-- expense splits to allow per-user share
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade,
  description text,
  total numeric,
  paid_by uuid references auth.users, -- the payer (any group member)
  created_at timestamptz default now()
);

create table if not exists expense_splits (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid references expenses(id) on delete cascade,
  user_id uuid references auth.users,
  amount numeric not null
);