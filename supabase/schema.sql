-- kmarket Supabase schema
-- Run this once in the Supabase SQL editor (Project -> SQL Editor -> New query) on a fresh project.
-- Mirrors the previous MongoDB/Mongoose models (see src/lib/models.ts in git history).

create extension if not exists pgcrypto;

-- ============ ENUMS ============
create type user_gender as enum ('male', 'female', 'other');
create type user_role as enum ('user', 'admin');
create type auth_provider as enum ('google');
create type product_size_type as enum ('none', 'clothing', 'shoes', 'bags', 'ring', 'custom');
create type order_status as enum ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');
create type payment_status as enum ('pending', 'paid', 'failed', 'refunded');
create type delivery_type as enum ('city', 'province', 'pickup');
create type discount_type as enum ('percent', 'fixed');

-- ============ USERS ============
create table users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password text,
  full_name text not null,
  phone text,
  address text,
  gender user_gender,
  avatar text,
  role user_role not null default 'user',
  provider auth_provider,
  provider_id text,
  profile_completed boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ CATEGORIES ============
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  icon text,
  image text,
  parent_id uuid references categories(id) on delete set null,
  filters jsonb not null default '[]',
  is_active boolean not null default true,
  "order" integer not null default 0,
  created_at timestamptz not null default now()
);

create index categories_parent_id_idx on categories(parent_id);

-- ============ PRODUCTS ============
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price numeric not null,
  sale_price numeric,
  images jsonb not null default '[]',
  colors jsonb not null default '[]',
  size_type product_size_type not null default 'none',
  sizes jsonb not null default '[]',
  weight numeric,
  brand text,
  stock integer not null default 0,
  category_id uuid not null references categories(id),
  subcategory_id uuid references categories(id),
  attributes jsonb not null default '{}',
  is_featured boolean not null default false,
  is_new boolean not null default true,
  is_active boolean not null default true,
  rating numeric not null default 0,
  review_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_vector tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(brand, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(description, '')), 'C')
  ) stored
);

create index products_category_id_idx on products(category_id);
create index products_subcategory_id_idx on products(subcategory_id);
create index products_search_vector_idx on products using gin(search_vector);

-- ============ ORDERS ============
create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references users(id) on delete set null,
  total_amount numeric not null,
  shipping_fee numeric not null default 5000,
  discount_amount numeric not null default 0,
  final_amount numeric not null,
  status order_status not null default 'pending',
  payment_status payment_status not null default 'pending',
  payment_method text not null default 'bank_transfer',
  shipping_name text not null,
  shipping_phone text not null,
  shipping_address text not null default '',
  shipping_city text not null default '',
  shipping_district text not null default '',
  delivery_type delivery_type not null default 'city',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_user_id_idx on orders(user_id);
create index orders_created_at_idx on orders(created_at desc);

-- ============ ORDER ITEMS (relational — was an embedded array in Mongo) ============
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  name text not null,
  image text,
  price numeric not null,
  quantity integer not null,
  size text
);

create index order_items_order_id_idx on order_items(order_id);
create index order_items_product_id_idx on order_items(product_id);

-- ============ REVIEWS ============
create table reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  images jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create index reviews_product_id_idx on reviews(product_id);

-- Recompute product rating/review_count whenever a review is inserted, updated, or deleted
-- (replaces the Mongoose `ReviewSchema.post('save', ...)` hook)
create or replace function recompute_product_rating() returns trigger as $$
declare
  target_product_id uuid;
begin
  target_product_id := coalesce(new.product_id, old.product_id);

  update products
  set rating = coalesce((select round(avg(rating)::numeric, 1) from reviews where product_id = target_product_id), 0),
      review_count = (select count(*) from reviews where product_id = target_product_id)
  where id = target_product_id;

  return null;
end;
$$ language plpgsql;

create trigger reviews_after_change
after insert or update or delete on reviews
for each row execute function recompute_product_rating();

-- ============ DISCOUNTS ============
create table discounts (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type discount_type not null,
  value numeric not null,
  min_order numeric,
  max_discount numeric,
  usage_limit integer,
  used_count integer not null default 0,
  start_date timestamptz not null,
  end_date timestamptz not null,
  is_active boolean not null default true
);

-- ============ BANNERS ============
create table banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  description text,
  image text not null,
  link text,
  bg_color text not null default '#FEE2E2',
  text_color text not null default '#F97316',
  "order" integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ ORDER CREATION RPC ============
-- Atomically creates an order + its items and decrements product stock in one transaction,
-- fixing the race condition present in the old per-item Mongo $inc stock decrement.
-- p_items shape: [{ "product_id": "uuid", "quantity": int, "size": "text or null" }, ...]
create or replace function create_order(
  p_order_number text,
  p_user_id uuid,
  p_items jsonb,
  p_shipping_fee numeric,
  p_discount_amount numeric,
  p_shipping_name text,
  p_shipping_phone text,
  p_shipping_address text,
  p_shipping_city text,
  p_shipping_district text,
  p_delivery_type delivery_type,
  p_notes text
) returns uuid as $$
declare
  v_order_id uuid;
  v_item jsonb;
  v_product products%rowtype;
  v_total_amount numeric := 0;
  v_item_price numeric;
begin
  -- Validate stock and compute total before writing anything
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_product from products where id = (v_item->>'product_id')::uuid for update;
    if not found then
      raise exception 'Product % not found', v_item->>'product_id';
    end if;
    if v_product.stock < (v_item->>'quantity')::integer then
      raise exception 'Insufficient stock for product %', v_product.name;
    end if;
    v_item_price := coalesce(v_product.sale_price, v_product.price);
    v_total_amount := v_total_amount + v_item_price * (v_item->>'quantity')::integer;
  end loop;

  insert into orders (
    order_number, user_id, total_amount, shipping_fee, discount_amount, final_amount,
    shipping_name, shipping_phone, shipping_address, shipping_city, shipping_district,
    delivery_type, notes
  ) values (
    p_order_number, p_user_id, v_total_amount, p_shipping_fee, p_discount_amount,
    v_total_amount + p_shipping_fee - p_discount_amount,
    p_shipping_name, p_shipping_phone, p_shipping_address, p_shipping_city, p_shipping_district,
    p_delivery_type, p_notes
  ) returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_product from products where id = (v_item->>'product_id')::uuid;

    insert into order_items (order_id, product_id, name, image, price, quantity, size)
    values (
      v_order_id,
      v_product.id,
      v_product.name,
      (v_product.images->>0),
      coalesce(v_product.sale_price, v_product.price),
      (v_item->>'quantity')::integer,
      nullif(v_item->>'size', '')
    );

    update products
    set stock = stock - (v_item->>'quantity')::integer
    where id = v_product.id;
  end loop;

  return v_order_id;
end;
$$ language plpgsql;
