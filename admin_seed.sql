-- Seed para criar o admin no Supabase
insert into public.users (email, password, name, role, active)
values ('paulokakoma19@gmail.com', '9898', 'Admin', 'admin', true)
on conflict (email) do nothing;
