-- Ejecutar en Supabase SQL Editor.
-- Permite que el superadmin vea todos los perfiles y cambie roles de otros usuarios.
-- Tambien crea/actualiza profiles automaticamente cuando se registra un usuario nuevo.

create or replace function public.current_user_role_name()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select r.nombre
  from public.profiles p
  join public.roles r on r.id = p.role_id
  where p.id = auth.uid()
  limit 1
$$;

grant execute on function public.current_user_role_name() to authenticated;

grant select on public.profiles to authenticated;
grant update (role_id) on public.profiles to authenticated;
grant select on public.roles to authenticated;

alter table public.profiles enable row level security;
alter table public.roles enable row level security;

drop policy if exists "profiles_select_own_or_superadmin" on public.profiles;
drop policy if exists "profiles_select_own_or_admin_or_superadmin" on public.profiles;
create policy "profiles_select_own_or_superadmin"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or public.current_user_role_name() = 'superadmin'
);

drop policy if exists "profiles_update_role_superadmin_not_self" on public.profiles;
create policy "profiles_update_role_superadmin_not_self"
on public.profiles
for update
to authenticated
using (
  public.current_user_role_name() = 'superadmin'
  and id <> auth.uid()
)
with check (
  public.current_user_role_name() = 'superadmin'
  and id <> auth.uid()
);

drop policy if exists "roles_select_authenticated" on public.roles;
create policy "roles_select_authenticated"
on public.roles
for select
to authenticated
using (true);

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  default_role_id integer;
begin
  select id
  into default_role_id
  from public.roles
  where nombre = 'cliente'
  limit 1;

  insert into public.profiles (id, nombre, role_id)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'name',
      new.raw_user_meta_data ->> 'nombre',
      split_part(new.email, '@', 1),
      'Sin nombre'
    ),
    coalesce(default_role_id, 1)
  )
  on conflict (id) do update
  set nombre = excluded.nombre
  where public.profiles.nombre is null
    or public.profiles.nombre = '';

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();
