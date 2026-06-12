create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  phone text,
  gender text,
  age int,
  created_at timestamp with time zone default now()
);

create table if not exists public.menus (
  id bigint generated always as identity primary key,
  name text not null,
  category text not null,
  price int not null check (price >= 0),
  description text,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

create table if not exists public.orders (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  ordered_at timestamp with time zone default now(),
  total_amount int not null check (total_amount >= 0)
);

create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id bigint references public.orders(id) on delete cascade,
  menu_id bigint references public.menus(id),
  quantity int not null check (quantity > 0),
  unit_price int not null check (unit_price >= 0)
);

create table if not exists public.reviews (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  menu_id bigint references public.menus(id) on delete cascade,
  rating int check (rating between 1 and 5),
  content text,
  created_at timestamp with time zone default now(),
  unique (user_id, menu_id)
);

create table if not exists public.menu_requests (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  requested_name text not null,
  request_count int default 1 check (request_count > 0),
  created_at timestamp with time zone default now()
);

create table if not exists public.insights (
  id bigint generated always as identity primary key,
  title text,
  content text,
  type text,
  created_at timestamp with time zone default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, phone, gender, age)
  values (
    new.id,
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'gender',
    nullif(new.raw_user_meta_data ->> 'age', '')::int
  )
  on conflict (id) do update set
    name = excluded.name,
    phone = excluded.phone,
    gender = excluded.gender,
    age = excluded.age;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace view public.menu_metrics as
with review_stats as (
  select menu_id, round(avg(rating)::numeric, 2) as average_rating, count(*)::int as review_count
  from public.reviews
  group by menu_id
), order_stats as (
  select menu_id, sum(quantity)::int as sold_count
  from public.order_items
  group by menu_id
)
select
  m.id,
  m.name,
  m.category,
  m.price,
  m.description,
  m.is_active,
  m.created_at,
  coalesce(rs.average_rating, 0) as average_rating,
  coalesce(rs.review_count, 0) as review_count,
  coalesce(os.sold_count, 0) as sold_count
from public.menus m
left join review_stats rs on rs.menu_id = m.id
left join order_stats os on os.menu_id = m.id;

create or replace view public.admin_menu_metrics as
with review_stats as (
  select menu_id, round(avg(rating)::numeric, 2) as average_rating, count(*)::int as review_count
  from public.reviews
  group by menu_id
), order_stats as (
  select menu_id, sum(quantity)::int as sold_count, sum(quantity * unit_price)::int as revenue
  from public.order_items
  group by menu_id
)
select
  m.id as menu_id,
  m.name,
  m.category,
  m.price,
  m.is_active,
  coalesce(os.sold_count, 0) as sold_count,
  coalesce(os.revenue, 0) as revenue,
  coalesce(rs.average_rating, 0) as average_rating,
  coalesce(rs.review_count, 0) as review_count
from public.menus m
left join review_stats rs on rs.menu_id = m.id
left join order_stats os on os.menu_id = m.id;

create or replace view public.menu_request_summary as
select
  min(id) as id,
  null::uuid as user_id,
  min(requested_name) as requested_name,
  sum(request_count)::int as request_count,
  min(created_at) as created_at
from public.menu_requests
group by lower(trim(requested_name));

alter table public.profiles enable row level security;
alter table public.menus enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.menu_requests enable row level security;
alter table public.insights enable row level security;

drop policy if exists "Profiles are readable by owner" on public.profiles;
create policy "Profiles are readable by owner" on public.profiles for select using (auth.uid() = id);
drop policy if exists "Profiles are insertable by owner" on public.profiles;
create policy "Profiles are insertable by owner" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "Profiles are updatable by owner" on public.profiles;
create policy "Profiles are updatable by owner" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Menus are readable by everyone" on public.menus;
create policy "Menus are readable by everyone" on public.menus for select using (true);
-- MVP demo admin: authenticated users can manage menus. Replace with profiles.role = 'admin' in production.
drop policy if exists "Authenticated users can insert menus for demo admin" on public.menus;
create policy "Authenticated users can insert menus for demo admin" on public.menus for insert to authenticated with check (true);
drop policy if exists "Authenticated users can update menus for demo admin" on public.menus;
create policy "Authenticated users can update menus for demo admin" on public.menus for update to authenticated using (true) with check (true);
drop policy if exists "Authenticated users can delete menus for demo admin" on public.menus;
create policy "Authenticated users can delete menus for demo admin" on public.menus for delete to authenticated using (true);

drop policy if exists "Orders are readable by owner" on public.orders;
create policy "Orders are readable by owner" on public.orders for select using (auth.uid() = user_id);
drop policy if exists "Orders are insertable by owner" on public.orders;
create policy "Orders are insertable by owner" on public.orders for insert with check (auth.uid() = user_id);

drop policy if exists "Order items are readable by order owner" on public.order_items;
create policy "Order items are readable by order owner" on public.order_items for select using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
drop policy if exists "Order items are insertable by order owner" on public.order_items;
create policy "Order items are insertable by order owner" on public.order_items for insert with check (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

drop policy if exists "Reviews are readable by everyone" on public.reviews;
create policy "Reviews are readable by everyone" on public.reviews for select using (true);
drop policy if exists "Reviews are insertable by owner" on public.reviews;
create policy "Reviews are insertable by owner" on public.reviews for insert with check (auth.uid() = user_id);
drop policy if exists "Reviews are updatable by owner" on public.reviews;
create policy "Reviews are updatable by owner" on public.reviews for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Reviews are deletable by owner" on public.reviews;
create policy "Reviews are deletable by owner" on public.reviews for delete using (auth.uid() = user_id);

drop policy if exists "Requests are readable by owner" on public.menu_requests;
create policy "Requests are readable by owner" on public.menu_requests for select using (auth.uid() = user_id);
drop policy if exists "Requests are insertable by owner" on public.menu_requests;
create policy "Requests are insertable by owner" on public.menu_requests for insert with check (auth.uid() = user_id);
drop policy if exists "Requests are updatable by owner" on public.menu_requests;
create policy "Requests are updatable by owner" on public.menu_requests for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Dashboard demo views are intentionally readable. In production, expose these only to admin roles.
grant select on public.menu_metrics to anon, authenticated;
grant select on public.admin_menu_metrics to anon, authenticated;
grant select on public.menu_request_summary to anon, authenticated;
grant select on public.menus to anon, authenticated;
grant select, insert, update, delete on public.menus to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert on public.orders to authenticated;
grant select, insert on public.order_items to authenticated;
grant select, insert, update, delete on public.reviews to authenticated;
grant select, insert, update on public.menu_requests to authenticated;
