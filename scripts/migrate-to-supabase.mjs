// One-time data migration: MongoDB -> Supabase (Postgres).
//
// Usage:
//   1. Make sure supabase/schema.sql has already been run on your Supabase project.
//   2. In .env.local, set:
//        MONGODB_URI=<your old Mongo connection string>
//        NEXT_PUBLIC_SUPABASE_URL=<your Supabase project URL>
//        SUPABASE_SERVICE_ROLE_KEY=<your Supabase service role key>
//   3. Run:  node --env-file=.env.local scripts/migrate-to-supabase.mjs
//
// Safe to re-run: it wipes the destination tables it's about to fill before inserting
// (so a failed/partial run can just be retried), but it does NOT touch MongoDB.

import { MongoClient } from 'mongodb';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const MONGODB_URI = process.env.MONGODB_URI;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!MONGODB_URI || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing MONGODB_URI, NEXT_PUBLIC_SUPABASE_URL, or SUPABASE_SERVICE_ROLE_KEY.');
  console.error('Run with: node --env-file=.env.local scripts/migrate-to-supabase.mjs');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function insertInChunks(table, rows, size = 500) {
  for (const batch of chunk(rows, size)) {
    if (batch.length === 0) continue;
    const { error } = await supabase.from(table).insert(batch);
    if (error) throw new Error(`Insert into ${table} failed: ${error.message}`);
  }
}

async function wipe(table) {
  // delete-all trick: match every row via a condition that's always true
  await supabase.from(table).delete().not('id', 'is', null);
}

async function main() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db();

  console.log('Connected to MongoDB and Supabase. Starting migration...\n');

  // ---------- USERS ----------
  const usersIdMap = new Map(); // old ObjectId string -> new UUID
  {
    const docs = await db.collection('users').find({}).toArray();
    await wipe('users');
    const rows = docs.map((d) => {
      const id = randomUUID();
      usersIdMap.set(d._id.toString(), id);
      return {
        id,
        email: d.email,
        password: d.password || null,
        full_name: d.full_name,
        phone: d.phone || null,
        address: d.address || null,
        gender: d.gender || null,
        avatar: d.avatar || null,
        role: d.role || 'user',
        provider: d.provider || null,
        provider_id: d.providerId || null,
        profile_completed: d.profileCompleted ?? false,
        is_active: d.is_active ?? true,
        created_at: d.created_at || new Date(),
        updated_at: d.updated_at || new Date(),
      };
    });
    await insertInChunks('users', rows);
    console.log(`users: migrated ${rows.length}`);
  }

  // ---------- CATEGORIES (two passes for self-referencing parent_id) ----------
  const categoriesIdMap = new Map();
  {
    const docs = await db.collection('categories').find({}).toArray();
    await wipe('categories');

    const rows = docs.map((d) => {
      const id = randomUUID();
      categoriesIdMap.set(d._id.toString(), id);
      return {
        id,
        name: d.name,
        slug: d.slug,
        icon: d.icon || null,
        image: d.image || null,
        parent_id: null, // filled in second pass below
        filters: d.filters || [],
        is_active: d.is_active ?? true,
        order: d.order ?? 0,
        created_at: d.created_at || new Date(),
      };
    });
    await insertInChunks('categories', rows);

    // Second pass: set parent_id now that every category has a new UUID
    for (const d of docs) {
      if (!d.parent_id) continue;
      const newId = categoriesIdMap.get(d._id.toString());
      const newParentId = categoriesIdMap.get(d.parent_id.toString());
      if (newId && newParentId) {
        await supabase.from('categories').update({ parent_id: newParentId }).eq('id', newId);
      }
    }
    console.log(`categories: migrated ${rows.length}`);
  }

  // ---------- PRODUCTS ----------
  const productsIdMap = new Map();
  {
    const docs = await db.collection('products').find({}).toArray();
    await wipe('products');
    const rows = docs.map((d) => {
      const id = randomUUID();
      productsIdMap.set(d._id.toString(), id);
      return {
        id,
        name: d.name,
        slug: d.slug,
        description: d.description || null,
        price: d.price,
        sale_price: d.sale_price ?? null,
        images: d.images || [],
        colors: d.colors || [],
        size_type: d.size_type || 'none',
        sizes: d.sizes || [],
        weight: d.weight ?? null,
        brand: d.brand || null,
        stock: d.stock ?? 0,
        category_id: d.category_id ? categoriesIdMap.get(d.category_id.toString()) || null : null,
        subcategory_id: d.subcategory_id ? categoriesIdMap.get(d.subcategory_id.toString()) || null : null,
        attributes: d.attributes || {},
        is_featured: d.is_featured ?? false,
        is_new: d.is_new ?? true,
        is_active: d.is_active ?? true,
        rating: d.rating ?? 0,
        review_count: d.review_count ?? 0,
        created_at: d.created_at || new Date(),
        updated_at: d.updated_at || new Date(),
      };
    });
    // products without a resolvable category_id would violate the NOT NULL FK — skip + warn instead of failing the whole run
    const valid = rows.filter((r) => r.category_id);
    const skipped = rows.length - valid.length;
    if (skipped > 0) console.warn(`  ! skipping ${skipped} product(s) with no matching category`);
    await insertInChunks('products', valid);
    console.log(`products: migrated ${valid.length}`);
  }

  // ---------- ORDERS + ORDER_ITEMS ----------
  {
    const docs = await db.collection('orders').find({}).toArray();
    await wipe('order_items');
    await wipe('orders');

    const orderRows = docs.map((d) => ({
      id: randomUUID(),
      _oldId: d._id.toString(),
      order_number: d.order_number,
      user_id: d.user_id ? usersIdMap.get(d.user_id.toString()) || null : null,
      total_amount: d.total_amount,
      shipping_fee: d.shipping_fee ?? 5000,
      discount_amount: d.discount_amount ?? 0,
      final_amount: d.final_amount,
      status: d.status || 'pending',
      payment_status: d.payment_status || 'pending',
      payment_method: d.payment_method || 'bank_transfer',
      shipping_name: d.shipping_name,
      shipping_phone: d.shipping_phone,
      shipping_address: d.shipping_address || '',
      shipping_city: d.shipping_city || '',
      shipping_district: d.shipping_district || '',
      delivery_type: d.delivery_type || 'city',
      notes: d.notes || null,
      created_at: d.created_at || new Date(),
      updated_at: d.updated_at || new Date(),
      _items: d.items || [],
    }));

    await insertInChunks(
      'orders',
      orderRows.map(({ _oldId, _items, ...rest }) => rest)
    );

    const itemRows = [];
    for (const order of orderRows) {
      for (const item of order._items) {
        itemRows.push({
          id: randomUUID(),
          order_id: order.id,
          product_id: item.product_id ? productsIdMap.get(item.product_id.toString()) : null,
          name: item.name,
          image: item.image || null,
          price: item.price,
          quantity: item.quantity,
          size: item.size || null,
        });
      }
    }
    const validItems = itemRows.filter((r) => r.product_id);
    const skippedItems = itemRows.length - validItems.length;
    if (skippedItems > 0) console.warn(`  ! skipping ${skippedItems} order item(s) referencing a missing product`);
    await insertInChunks('order_items', validItems);
    console.log(`orders: migrated ${orderRows.length} (with ${validItems.length} order_items)`);
  }

  // ---------- DISCOUNTS ----------
  {
    const docs = await db.collection('discounts').find({}).toArray();
    await wipe('discounts');
    const rows = docs.map((d) => ({
      id: randomUUID(),
      code: d.code,
      type: d.type,
      value: d.value,
      min_order: d.min_order ?? null,
      max_discount: d.max_discount ?? null,
      usage_limit: d.usage_limit ?? null,
      used_count: d.used_count ?? 0,
      start_date: d.start_date,
      end_date: d.end_date,
      is_active: d.is_active ?? true,
    }));
    await insertInChunks('discounts', rows);
    console.log(`discounts: migrated ${rows.length}`);
  }

  // ---------- BANNERS ----------
  {
    const docs = await db.collection('banners').find({}).toArray();
    await wipe('banners');
    const rows = docs.map((d) => ({
      id: randomUUID(),
      title: d.title,
      subtitle: d.subtitle || null,
      description: d.description || null,
      image: d.image,
      link: d.link || null,
      bg_color: d.bg_color || '#FEE2E2',
      text_color: d.text_color || '#F97316',
      order: d.order ?? 0,
      is_active: d.is_active ?? true,
      created_at: d.created_at || new Date(),
      updated_at: d.updated_at || new Date(),
    }));
    await insertInChunks('banners', rows);
    console.log(`banners: migrated ${rows.length}`);
  }

  // ---------- REVIEWS ----------
  {
    const docs = await db.collection('reviews').find({}).toArray();
    await wipe('reviews');
    const rows = docs
      .map((d) => ({
        id: randomUUID(),
        user_id: d.user_id ? usersIdMap.get(d.user_id.toString()) : null,
        product_id: d.product_id ? productsIdMap.get(d.product_id.toString()) : null,
        rating: d.rating,
        comment: d.comment || null,
        images: d.images || [],
        created_at: d.created_at || new Date(),
      }))
      .filter((r) => r.user_id && r.product_id);
    await insertInChunks('reviews', rows);
    console.log(`reviews: migrated ${rows.length}`);
  }

  await client.close();
  console.log('\nDone. Spot-check row counts in the Supabase table editor before switching over.');
}

main().catch((err) => {
  console.error('\nMigration failed:', err);
  process.exit(1);
});
