# AGAPEK Ecommerce

Tienda online administrable de **K-Beauty / skincare coreano** para AGAPE FAMILY S.A.C.
Catálogo, carrito, checkout, pagos manuales, compra asistida por WhatsApp y panel administrador.

## Stack

- **Next.js 16** (App Router, React 19, Turbopack) + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** — estética pastel boutique (rosa `#e65d99`)
- Tipografías **Playfair Display** (títulos) + **Inter** (cuerpo)
- **Supabase** (Postgres + Auth + Storage) + **Prisma 7** (driver adapter `@prisma/adapter-pg`)
- **Zustand**, **react-hook-form + zod**, **TanStack Table**, **Recharts**, **date-fns-tz**
- Gestor de paquetes: **pnpm** (obligatorio)

## Puesta en marcha

```bash
pnpm install
cp .env.example .env.local   # completa las credenciales de agapek-dev
pnpm db:generate             # genera el cliente Prisma
pnpm db:migrate              # aplica migraciones (requiere DATABASE_URL real)
pnpm db:seed                 # datos de prueba
pnpm dev                     # http://localhost:3000
```

## Scripts

| Script | Descripción |
| --- | --- |
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build de producción (genera Prisma + Next) |
| `pnpm lint` / `pnpm typecheck` | Linter / chequeo de tipos |
| `pnpm format` | Formatea con Prettier |
| `pnpm test` | Tests con Vitest |
| `pnpm db:migrate` / `pnpm db:deploy` | Migraciones (dev / producción) |
| `pnpm db:studio` | Prisma Studio |
| `pnpm db:seed` | Datos de prueba |

## Entornos

Dos proyectos Supabase: **`agapek-dev`** (desarrollo / preview) y **`agapek-prod`** (producción).
Las credenciales viven en `.env.local` (dev) y en Vercel (prod). Ver el plan completo en la
documentación del proyecto.

## Zona horaria

Todas las fechas se guardan en **UTC**; la conversión a **America/Lima** (UTC-5) ocurre solo al
mostrar, mediante `src/lib/date.ts`.
