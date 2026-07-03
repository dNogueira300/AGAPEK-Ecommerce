import { config } from "dotenv";
import { PrismaClient, Rol } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Cargar variables (el script se ejecuta con tsx, fuera de Next.js).
config({ path: ".env.local" });
config({ path: ".env" });

// Session pooler (5432) para el script de seed.
const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

// Imágenes de prueba (se repiten; se reemplazan luego desde el panel).
const PRODUCT_IMAGES = [
  "/productos/p1.webp",
  "/productos/p2.webp",
  "/productos/p3.webp",
  "/productos/p4.webp",
  "/productos/p5.webp",
  "/productos/p6.webp",
];

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

    const imagen = PRODUCT_IMAGES[(i - 1) % PRODUCT_IMAGES.length];
    const datos = {
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
    };
    const p = await prisma.producto.upsert({
      where: { codigo },
      update: {},
      create: { codigo, ...datos },
    });
    // Refresca la imagen (idempotente al re-seedear).
    await prisma.productoImagen.deleteMany({ where: { productoId: p.id } });
    await prisma.productoImagen.create({
      data: { productoId: p.id, url: imagen, alt: datos.nombre, orden: 0 },
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

  // Banners del hero (idempotente: refresca los de prueba).
  await prisma.banner.deleteMany({});
  await prisma.banner.createMany({
    data: [
      { titulo: "Tu rutina coreana empieza aquí", imagenUrl: "/banners/foto-1.webp", enlace: "/catalogo", orden: 0 },
      { titulo: "Descubre las marcas de Corea", imagenUrl: "/banners/foto-2.webp", enlace: "/marcas", orden: 1 },
      { titulo: "Cuida tu piel con gentileza y amor", imagenUrl: "/banners/foto-3.webp", enlace: "/rutinas", orden: 2 },
    ],
  });

  // Testimonios (solo si aún no hay).
  if ((await prisma.testimonio.count()) === 0) {
    await prisma.testimonio.createMany({
      data: [
        {
          nombre: "Lucía R.",
          texto:
            "Me ayudaron a armar mi rutina y mi piel está más luminosa que nunca. La atención por WhatsApp es súper amable.",
          rating: 5,
        },
        {
          nombre: "Marena T.",
          texto:
            "Productos originales y llegan rapidísimo a Iquitos. Ya es mi tienda de skincare de confianza.",
          rating: 5,
        },
        {
          nombre: "Diana P.",
          texto:
            "Amo que me asesoren según mi tipo de piel. Los precios son justos y todo llega bien empacado.",
          rating: 5,
        },
      ],
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
