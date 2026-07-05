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
    facebook: "https://facebook.com/AgapeK",
    instagram: "",
    tiktok: "",
  };
  // update: {} para no sobrescribir lo que la administradora edite en el panel.
  for (const [clave, valor] of Object.entries(config)) {
    await prisma.configuracion.upsert({
      where: { clave },
      update: {},
      create: { clave, valor: valor as never },
    });
  }

  // Banners del hero (idempotente: refresca los de prueba).
  await prisma.banner.deleteMany({});
  await prisma.banner.createMany({
    data: [
      {
        titulo: "El secreto del acabado jugoso y saludable de Corea",
        subtitulo:
          "Texturas ultra ligeras de rápida absorción que hidratan a nivel celular. Logra un brillo natural que provoca tocar desde adentro.",
        cta: "Comprar ahora",
        imagenUrl: "/banners/foto-1.webp",
        enlace: "/catalogo",
        orden: 0,
      },
      {
        titulo: "Descubre las marcas más queridas de Corea",
        subtitulo:
          "Beauty of Joseon, COSRX, Anua, Round Lab y más. Originales, seleccionadas con cariño para tu piel.",
        cta: "Ver marcas",
        imagenUrl: "/banners/foto-2.webp",
        enlace: "/marcas",
        orden: 1,
      },
      {
        titulo: "Cuida tu piel con gentileza y amor",
        subtitulo:
          "Arma tu rutina paso a paso según tu tipo de piel y recibe asesoría personalizada por WhatsApp.",
        cta: "Arma tu rutina",
        imagenUrl: "/banners/foto-3.webp",
        enlace: "/rutinas",
        orden: 2,
      },
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

  // Posts del blog (idempotente por slug).
  const POSTS = [
    {
      slug: "como-iniciar-tu-rutina-de-skincare-coreano",
      titulo: "Cómo iniciar tu rutina de skincare coreano",
      categoria: "Rutinas",
      autor: "Equipo AGAPEK",
      resumen:
        "Descubre los 10 pasos esenciales del skincare coreano y cómo adaptarlos a tu vida diaria para una piel radiante.",
      portadaUrl: "/banners/foto-1.webp",
    },
    {
      slug: "diferencia-entre-tonico-esencia-y-serum",
      titulo: "Diferencia entre tónico, esencia y sérum",
      categoria: "Ingredientes",
      resumen:
        "Aprende a distinguir cada producto y cuál es el orden correcto de aplicación en tu rutina de cuidado facial.",
      portadaUrl: "/productos/p2.webp",
    },
    {
      slug: "que-protector-solar-usar-en-clima-amazonico",
      titulo: "Qué protector solar usar en clima amazónico",
      categoria: "Tips",
      resumen:
        "Guía práctica para elegir el mejor SPF para el clima tropical de Iquitos y mantener tu piel protegida.",
      portadaUrl: "/banners/foto-3.webp",
    },
    {
      slug: "ingredientes-estrella-del-k-beauty",
      titulo: "Ingredientes estrella del K-Beauty",
      categoria: "Ingredientes",
      resumen:
        "Centella asiática, niacinamida, ácido hialurónico y más: qué hacen y para qué tipo de piel son ideales.",
      portadaUrl: "/productos/p5.webp",
    },
    {
      slug: "maquillaje-coreano-look-natural",
      titulo: "Maquillaje coreano: el look natural que amamos",
      categoria: "Maquillaje",
      resumen:
        "Consigue el famoso acabado 'glass skin' y un maquillaje fresco paso a paso con productos coreanos.",
      portadaUrl: "/productos/p6.webp",
    },
    {
      slug: "rutina-de-noche-para-piel-luminosa",
      titulo: "Rutina de noche para una piel luminosa",
      categoria: "Rutinas",
      resumen:
        "La noche es cuando tu piel se repara. Te contamos los pasos clave para despertar con una piel más suave.",
      portadaUrl: "/banners/foto-2.webp",
    },
  ];
  const AUTORES = ["Equipo AGAPEK", "Doyla Yamashita", "Asesora AGAPEK"];
  for (let pi = 0; pi < POSTS.length; pi++) {
    const post = { autor: AUTORES[pi % AUTORES.length], ...POSTS[pi] };
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: { ...post, publicado: true },
      create: {
        ...post,
        publicado: true,
        contenido:
          "El cuidado de la piel coreano se basa en la constancia y en escuchar lo que tu piel necesita. En AGAPEK seleccionamos productos originales y te acompañamos con asesoría personalizada por WhatsApp para que armes la rutina perfecta para ti.\n\nRecuerda: menos es más al inicio. Empieza con limpieza, hidratación y protección solar, y ve sumando productos según tu tipo de piel y tus objetivos.",
      },
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
