create table businesses (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  service_type text not null,
  owner text,
  verification text,
  location text,
  status text check (status in ('BUMI', 'NON BUMI', '-')),
  created_at timestamptz default now()
);
