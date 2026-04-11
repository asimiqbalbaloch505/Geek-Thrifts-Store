# GeekThrifts E-Commerce

## Overview

A professional Pakistani thrift fashion ecommerce website for the GeekThrifts brand. Sells shirts, ties (and shoes coming soon). Strict black (#0a0a0a) and milky white (#faf8f5) design. Cash on delivery only.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/geekthrifts), Tailwind CSS, shadcn/ui, wouter routing, Framer Motion
- **Backend**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Admin Panel

- URL: `/admin/login`
- Default credentials: username `admin`, password `geekthrifts2024`
- Override via env vars: `ADMIN_USERNAME`, `ADMIN_PASSWORD`
- Features: Dashboard stats, order management (pending/confirmed/delivered/cancelled), product CRUD, category CRUD

## Key Pages

- `/` — Home with hero, featured products, categories
- `/products` — Shop with category filter
- `/products/:id` — Product detail with size selector and add-to-cart
- `/cart` — Shopping cart with quantity controls
- `/checkout` — Order form (cash on delivery only)
- `/admin/login` — Admin login
- `/admin` — Dashboard
- `/admin/orders` — Order management with status updates
- `/admin/products` — Product CRUD
- `/admin/categories` — Category CRUD

## Categories

- Shirts (S, M, L, XL sizes)
- Ties (One Size)
- Shoes (Coming Soon — no products listed)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/geekthrifts run dev` — run frontend locally

## Database Schema

- `categories` — id, name, slug, description, imageUrl, isActive, createdAt
- `products` — id, name, description, price, imageUrl, categoryId, sizes[], stock, isActive, isFeatured, createdAt
- `orders` — id, customerName, customerPhone, customerAddress, customerCity, notes, status, totalAmount, items (JSON), createdAt
