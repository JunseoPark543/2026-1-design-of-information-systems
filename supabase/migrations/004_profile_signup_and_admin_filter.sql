alter table public.profiles add column if not exists role text default 'consumer';
alter table public.profiles add column if not exists signup_year int;
alter table public.profiles add column if not exists signup_month int;
alter table public.profiles add column if not exists signup_day int;

update public.profiles
set
  role = coalesce(role, 'consumer'),
  signup_year = coalesce(signup_year, extract(year from created_at)::int),
  signup_month = coalesce(signup_month, extract(month from created_at)::int),
  signup_day = coalesce(signup_day, extract(day from created_at)::int);

update public.profiles
set role = 'admin'
where name = '관리자';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  signup_time timestamptz := now();
begin
  insert into public.profiles (id, name, phone, gender, age, role, signup_year, signup_month, signup_day)
  values (
    new.id,
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'gender',
    nullif(new.raw_user_meta_data ->> 'age', '')::int,
    coalesce(new.raw_user_meta_data ->> 'role', 'consumer'),
    coalesce(nullif(new.raw_user_meta_data ->> 'signup_year', '')::int, extract(year from signup_time)::int),
    coalesce(nullif(new.raw_user_meta_data ->> 'signup_month', '')::int, extract(month from signup_time)::int),
    coalesce(nullif(new.raw_user_meta_data ->> 'signup_day', '')::int, extract(day from signup_time)::int)
  )
  on conflict (id) do update set
    name = excluded.name,
    phone = excluded.phone,
    gender = excluded.gender,
    age = excluded.age,
    role = excluded.role,
    signup_year = coalesce(public.profiles.signup_year, excluded.signup_year),
    signup_month = coalesce(public.profiles.signup_month, excluded.signup_month),
    signup_day = coalesce(public.profiles.signup_day, excluded.signup_day);
  return new;
end;
$$;

create or replace view public.admin_profile_summary as
with order_stats as (
  select user_id, count(*)::int as order_count, coalesce(sum(total_amount), 0)::int as total_spent
  from public.orders
  where user_id is not null
  group by user_id
), review_stats as (
  select user_id, count(*)::int as review_count
  from public.reviews
  where user_id is not null
  group by user_id
), request_stats as (
  select user_id, coalesce(sum(request_count), 0)::int as request_count
  from public.menu_requests
  where user_id is not null
  group by user_id
)
select
  p.id,
  p.name,
  p.phone,
  p.gender,
  p.age,
  p.signup_year,
  p.signup_month,
  p.signup_day,
  p.created_at,
  coalesce(os.order_count, 0) as order_count,
  coalesce(os.total_spent, 0) as total_spent,
  coalesce(rs.review_count, 0) as review_count,
  coalesce(mrs.request_count, 0) as request_count
from public.profiles p
left join order_stats os on os.user_id = p.id
left join review_stats rs on rs.user_id = p.id
left join request_stats mrs on mrs.user_id = p.id
where coalesce(p.role, 'consumer') <> 'admin';

grant select on public.admin_profile_summary to anon, authenticated;
