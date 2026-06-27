create table dropdown_options (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  value text not null,
  unique(type, value)
);

create policy "Public can read dropdown_options"
on dropdown_options for select
to anon
using (true);

create policy "Public can insert dropdown_options"
on dropdown_options for insert
to anon
with check (true);

alter table dropdown_options enable row level security;

insert into dropdown_options (type, value) values
('service_type', 'CAR WASH'),
('service_type', 'RESTAURANT'),
('service_type', 'RETAIL'),
('service_type', 'SERVICES'),
('verification', 'GOOGLE SEARCHES'),
('verification', 'SSM CHECK'),
('verification', 'SITE VISIT'),
('verification', 'SOCIAL MEDIA'),
('status', 'BUMI'),
('status', 'NON BUMI'),
('status', '-');
