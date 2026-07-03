import { PrismaClient, Rol } from "@prisma/client";

const prisma = new PrismaClient();

// Imagen genérica reutilizable (se reemplaza luego desde el panel).
const IMG = "/productos/generico.svg";

const MARCAS = [
  "Beauty of Joseon",
  "COSRX",
  "Anua",
  "Round Lab",
  "SKIN1004",
  "Isntree",
];

const CATEGORIAS = [
  "Skincare",
  "Makeup",
  "Cuerpo y bienestar",
  "Marcas",
];

const NECESIDADES = ["calmar", "hidratar", "iluminar", "limpiar"];
const TIPOS_PIEL = ["seca", "grasa", "mixta", "sensible"];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

async function main() {
  console.log("🌱 Sembrando datos de prueba...");

  const marcas = await Promise.all(
    MARCAS.map((nombre) =>
      prisma.marca.upsert({
        where: { slug: slugify(nombre) },
        update: {},
        create: { nombre, slug: slugify(nombre), aliada: true },
      }),
    ),
  );

  const categorias = await Promise.all(
    CATEGORIAS.map((nombre, i) =>
      prisma.categoria.upsert({
        where: { slug: slugify(nombre) },
        update: {},
        create: { nombre, slug: slugify(nombre), orden: i },
      }),
    ),
  );

  // 24 productos genéricos repartidos entre marcas y categorías.
  for (let i = 1; i <= 24; i++) {
    const marca = marcas[i % marcas.length];
    const categoria = categorias[i % categorias.length];
    const precio = 25 + (i % 10) * 5;
    const codigo = `AGK-${String(i).padStart(4, "0")}`;

    await prisma.producto.upsert({
      where: { codigo },
      update: {},
      create: {
        codigo,
        nombre: `Producto Skincare ${i}`,
        slug: `producto-skincare-${i}`,
        descripcionCorta: "Producto coreano original para el cuidado de la piel.",
        descripcion:
          "Fórmula suave con ingredientes coreanos, ideal para tu rutina diaria de skincare.",
        modoUso: "Aplicar sobre el rostro limpio, mañana y noche.",
        precio,
        precioOferta: i % 4 === 0 ? precio - 5 : null,
        stock: i % 7 === 0 ? 0 : 20 + i,
        destacado: i % 3 === 0,
        nuevo: i % 5 === 0,
        tipoPiel: [TIPOS_PIEL[i % TIPOS_PIEL.length]],
        necesidad: [NECESIDADES[i % NECESIDADES.length]],
        marcaId: marca.id,
        categoriaId: categoria.id,
        imagenes: {
          create: [{ url: IMG, alt: `Producto Skincare ${i}`, orden: 0 }],
        },
      },
    });
  }

  // Configuración base del negocio (editable desde el panel).
  const config: Record<string, unknown> = {
    whatsapp: "51961075865",
    yape: "961075865",
    plin: "961075865",
    cuenta_bcp: "39093099279046",
    cci: "00239019309927904636",
    delivery_centrico: 5,
    delivery_otras: 10,
    horario: "Lun a Sáb 9:00 a.m. – 6:00 p.m.",
  };
  for (const [clave, valor] of Object.entries(config)) {
    await prisma.configuracion.upsert({
      where: { clave },
      update: { valor: valor as never },
      create: { clave, valor: valor as never },
    });
  }

  void Rol; // enum disponible para futuros seeds de usuarios
  console.log("✅ Seed completado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
