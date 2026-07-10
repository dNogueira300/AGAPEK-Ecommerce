# Product

## Register

brand

> Nota: el registro `brand` aplica a la tienda pública (home, catálogo, producto, rutinas, blog,
> contenido). El panel `/admin` se trabaja con criterios de registro `product` (motion 150–250 ms,
> sin coreografías de carga, foco en la tarea).

## Users

Mujeres jóvenes y adultas de Iquitos (y resto del Perú por envío nacional) interesadas en
K-Beauty / skincare coreano. Compran desde el celular, muchas veces guiadas por WhatsApp.
No son usuarias técnicas: necesitan un flujo de compra claro, precios en soles y confianza en
que los productos son originales. La administradora del negocio (AGAPE FAMILY S.A.C.) opera
todo desde el panel sin tocar código.

## Product Purpose

Tienda online boutique de skincare coreano (AGAPEK · "Bloom & Glow") que acompaña a la clienta
a elegir, comprar y confirmar su pedido: catálogo confiable, checkout ordenado con pago manual
validado (Yape/Plin/BCP/contra entrega), resumen a WhatsApp y seguimiento público por código.
Éxito = ventas que no se pierden en el flujo + operación diaria sin fricción para la administradora.

## Brand Personality

Delicada, cercana, confiable. Estética pastel boutique: rosa de marca `#e65d99` sobre fondo
blanco azulado, mucho aire, tipografía Playfair Display (display) + Inter (UI). El tono es de
asesoría amable ("te ayudamos a armar tu rutina"), nunca agresivo ni de descuento-agresivo.
Referencia visual comprometida: https://kbeauty-two.vercel.app/ (versión temprana de AGAPEK).

## Anti-references

- Marketplaces genéricos y saturados (grids infinitos, banners chillones, urgencia artificial).
- Plantillas e-commerce "AI slop": cards idénticas sin jerarquía, eyebrows uppercase en cada
  sección, gradient text decorativo.
- Estética editorial-revista (serif itálica + mono labels) — no es el registro de AGAPEK.
- Dark mode como default de la tienda: la marca vive en pastel claro.

## Design Principles

1. **La compra no se interrumpe** — todo motion y efecto sirve a explorar y comprar; nada bloquea
   ni retrasa la interacción (checkout y carrito priorizan claridad sobre espectáculo).
2. **Boutique, no bazar** — espacio en blanco, ritmo pausado, pocas cosas bien presentadas.
3. **Administrable siempre** — todo contenido visible (banners, testimonios, marcas, textos de
   negocio) viene de la BD; el diseño debe verse bien con contenido variable.
4. **Suavidad como voz** — transiciones con ease-out expo/quart, sin bounce; el movimiento es
   gentil como la marca ("con gentileza y amor").
5. **Accesible por defecto** — contraste AA, foco visible, `prefers-reduced-motion` respetado en
   cada animación, targets táctiles ≥ 44px.

## Accessibility & Inclusion

WCAG AA: contraste ≥ 4.5:1 en texto de cuerpo, foco visible, navegación por teclado, `alt` en
todas las imágenes, jerarquía semántica de headings. Toda animación tiene alternativa con
`prefers-reduced-motion: reduce` (crossfade o sin animación). Público mobile-first con
conexiones lentas (Iquitos): el motion no puede costar rendimiento (objetivo Lighthouse ≥ 90).
