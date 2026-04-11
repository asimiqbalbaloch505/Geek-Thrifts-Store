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
- **API codegen**: Orval (from OpenAPI spec in lib/api-spec/openapi.yaml)
- **Auth**: bcryptjs + jsonwebtoken (JWT, 30d expiry for users, 7d for admin)
- **Build**: esbuild (CJS bundle)

## Admin Panel

- URL: `/admin/login`
- Credentials: email `asimiqbalbaloch505@gmail.com`, password `Asim@39794`
- Override via env vars: `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `JWT_SECRET`
- Features: Dashboard stats, order management (pending/confirmed/delivered/cancelled), product CRUD, category CRUD

## User Auth

- Signup: `/signup` — creates account, returns JWT stored in localStorage (`userToken`)
- Login: `/login` — authenticates, returns JWT stored in localStorage (`userToken`)
- User profile stored as JSON in localStorage (`userProfile`)
- Navbar shows user name dropdown with sign-out when logged in
- Backend routes: `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`

## Key Pages

- `/` — Home with hero, featured products, categories
- `/products` — Shop with category filter
- `/products/:id` — Product detail with size selection
- `/cart` — Cart (localStorage-persisted)
- `/checkout` — Checkout form (cash on delivery, PKR pricing)
- `/login` — User sign in
- `/signup` — User account creation
- `/admin/login` — Admin portal entry
- `/admin` — Dashboard with stats
- `/admin/orders` — Order management
- `/admin/products` — Product CRUD
- `/admin/categories` — Category CRUD

## Database Schema

Tables in PostgreSQL:
- `categories` — product categories (shirts, ties, shoes)
- `products` — items with images, price (PKR), sizes, stock, active status
- `orders` — customer orders with line items (JSONB), status, COD payment
- `users` — customer accounts (name, email, hashed password, createdAt)

## Design Rules

- Colors: black `#0a0a0a` and milky white `#faf8f5` ONLY
- Currency: Always PKR (e.g. "PKR 2,500")
- Shoes category: Always "Coming Soon" — no product listing
- No emojis anywhere in the UI
- Cart persists in localStorage

## Notes

- Use `bcryptjs` (pure JS), NOT `bcrypt` (requires native build approval)
- Table component exports: `TableBody`, `TableHeader`, `TableHead`, `TableCell`, `TableRow`
- Import hooks from `@workspace/api-client-react` only
- Admin auth stored in `adminToken` localStorage key
- User auth stored in `userToken` + `userProfile` localStorage keys
- After schema changes: run `pnpm --filter @workspace/db run push`
- After OpenAPI changes: run `pnpm --filter @workspace/api-spec run codegen`
