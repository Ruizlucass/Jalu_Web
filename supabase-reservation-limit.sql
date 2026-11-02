-- Ejecutar en Supabase SQL Editor para limitar reservas por usuario y evitar
-- que dos clientes reserven el mismo horario en la misma sucursal.

create index if not exists reservas_user_fecha_estado_limit_idx
  on public.reservas (user_id, fecha, estado);

-- Devuelve solo los horarios ocupados, sin exponer datos de los clientes.
create or replace function public.get_reserved_reservation_slots(
  target_branch text,
  target_date date
)
returns table (hora text)
language sql
stable
security definer
set search_path = public
as $$
  select distinct left(reservation.hora::text, 5) as hora
  from public.reservas as reservation
  where reservation.fecha = target_date
    and lower(trim(coalesce(reservation.sucursal, ''))) = lower(trim(target_branch))
    and lower(coalesce(reservation.estado, 'pendiente')) in ('pendiente', 'confirmado')
    and reservation.hora is not null;
$$;

grant execute on function public.get_reserved_reservation_slots(text, date)
  to anon, authenticated;

create or replace function public.enforce_user_reservation_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  daily_reservations integer;
  active_reservations integer;
  occupied_slot_reservations integer;
  daily_reservation_limit constant integer := 2;
begin
  if new.user_id is null or new.fecha is null then
    return new;
  end if;

  -- Serializa los envíos de la misma cuenta para impedir que evadan los límites con solicitudes simultáneas.
  perform pg_advisory_xact_lock(hashtext(new.user_id::text));

  if tg_op = 'INSERT' then
    select count(*)
    into daily_reservations
    from public.reservas as reservation
    where reservation.user_id = new.user_id
      and reservation.fecha = new.fecha;
  elsif new.user_id is distinct from old.user_id
    or new.fecha is distinct from old.fecha then
    select count(*)
    into daily_reservations
    from public.reservas as reservation
    where reservation.user_id = new.user_id
      and reservation.fecha = new.fecha
      and reservation.id <> new.id;
  else
    daily_reservations := 0;
  end if;

  if daily_reservations >= daily_reservation_limit then
    raise exception 'DAILY_RESERVATION_LIMIT_REACHED'
      using errcode = 'P0001';
  end if;

  if lower(coalesce(new.estado, 'pendiente')) in ('pendiente', 'confirmado') then
    if new.sucursal is not null and new.hora is not null then
      -- Serializa las solicitudes del mismo local, fecha y horario.
      perform pg_advisory_xact_lock(
        hashtext(
          'reservation-slot:' || new.fecha::text || ':' ||
          lower(trim(new.sucursal)) || ':' || left(new.hora::text, 5)
        )
      );

      select count(*)
      into occupied_slot_reservations
      from public.reservas as reservation
      where reservation.fecha = new.fecha
        and lower(trim(coalesce(reservation.sucursal, ''))) = lower(trim(new.sucursal))
        and left(reservation.hora::text, 5) = left(new.hora::text, 5)
        and lower(coalesce(reservation.estado, 'pendiente')) in ('pendiente', 'confirmado')
        and (tg_op <> 'UPDATE' or reservation.id <> new.id);

      if occupied_slot_reservations > 0 then
        raise exception 'RESERVATION_SLOT_TAKEN'
          using errcode = 'P0001';
      end if;
    end if;

    if tg_op = 'UPDATE' then
      select count(*)
      into active_reservations
      from public.reservas as reservation
      where reservation.user_id = new.user_id
        and lower(coalesce(reservation.estado, 'pendiente')) in ('pendiente', 'confirmado')
        and reservation.id <> new.id;
    else
      select count(*)
      into active_reservations
      from public.reservas as reservation
      where reservation.user_id = new.user_id
        and lower(coalesce(reservation.estado, 'pendiente')) in ('pendiente', 'confirmado');
    end if;

    if active_reservations > 0 then
      raise exception 'ACTIVE_RESERVATION_EXISTS'
        using errcode = 'P0001';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists reservas_enforce_user_limit on public.reservas;
create trigger reservas_enforce_user_limit
before insert or update of user_id, estado, fecha, sucursal, hora
on public.reservas
for each row
execute function public.enforce_user_reservation_limit();
