import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Prisma CLI no lee .env.local automáticamente: lo cargamos manualmente.
config({ path: ".env.local" });
config({ path: ".env" });

/**
 * Configuración de Prisma 7.
 * En Prisma 7 la URL de conexión se centraliza aquí (ya no hay `directUrl` en el schema).
 * Para Supabase usa la conexión "Session pooler" (puerto 5432), que funciona tanto para
 * migraciones como para runtime. Si Prisma Migrate no puede crear la shadow database,
 * define SHADOW_DATABASE_URL.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
    // Si Prisma Migrate no puede crear la shadow database automáticamente,
    // descomenta la línea siguiente y define SHADOW_DATABASE_URL en .env.local:
    // shadowDatabaseUrl: env("SHADOW_DATABASE_URL"),
  },
});
