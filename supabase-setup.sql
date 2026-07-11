-- ============================================================
-- GeekThrifts — Supabase PostgreSQL Setup Script
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url   TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id             SERIAL PRIMARY KEY,
  name           TEXT NOT NULL,
  description    TEXT,
  price          DECIMAL(10, 2) NOT NULL,
  image_url      TEXT,
  category_id    INTEGER NOT NULL,
  sizes          TEXT[] NOT NULL DEFAULT '{}',
  widths         TEXT[] NOT NULL DEFAULT '{}',
  stock          INTEGER NOT NULL DEFAULT 0,
  size_inventory JSONB NOT NULL DEFAULT '[]',
  is_active      BOOLEAN NOT NULL DEFAULT true,
  is_featured    BOOLEAN NOT NULL DEFAULT false,
  subcategory    TEXT,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 3. ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id               SERIAL PRIMARY KEY,
  customer_name    TEXT NOT NULL,
  customer_email   TEXT,
  customer_phone   TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  customer_city    TEXT NOT NULL,
  notes            TEXT,
  status           TEXT NOT NULL DEFAULT 'pending',
  total_amount     DECIMAL(10, 2) NOT NULL,
  items            JSONB NOT NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 4. USERS
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SEED DATA — Categories
-- ============================================================
INSERT INTO categories (name, slug, description, is_active) VALUES
  ('Ties',     'ties',     'Elegant silk and cotton ties to complete your look', true),
  ('Shirts',   'shirts',   'Premium formal and casual shirts for every occasion', true),
  ('Shoes',    'shoes',    'Formal and casual footwear for the modern gentleman', true),
  ('Watches',  'watches',  NULL, true),
  ('Belts',    'belts',    NULL, true),
  ('Trousers', 'trousers', NULL, true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- NOTE on size_inventory format:
-- For sized products (shirts, trousers, shoes), store as:
--   [{"size": "S", "qty": 10}, {"size": "M", "qty": 5}, ...]
-- For no-size products (watches, belts, ties):
--   [] (empty array) — use stock column for total quantity
-- ============================================================
