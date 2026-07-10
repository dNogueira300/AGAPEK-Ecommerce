"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { Check, ImagePlus, Loader2, Plus, Trash2 } from "lucide-react";
import { guardarConfiguracion, type ConfigState } from "@/lib/config-actions";
import type { RedExtra } from "@/components/tienda/social-links";

const input =
  "h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";
const label = "text-sm font-medium text-foreground";

export interface ConfigValues {
  whatsapp: string;
  yape: string;
  plin: string;
  cuenta_bcp: string;
  cci: string;
  horario: string;
  delivery_centrico: string;
  delivery_otras: string;
  facebook: string;
  instagram: string;
  tiktok: string;
}

function Campo({
  name,
  label: l,
  value,
  type = "text",
  placeholder,
}: {
  name: string;
  label: string;
  value: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className={label} htmlFor={name}>
        {l}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={value}
        placeholder={placeholder}
        className={input}
      />
    </div>
  );
}

export function ConfigForm({
  values,
  logoUrl,
  ctaUrl,
  redesExtra,
}: {
  values: ConfigValues;
  logoUrl: string | null;
  ctaUrl: string | null;
  redesExtra: RedExtra[];
}) {
  const [state, formAction, pending] = useActionState<ConfigState, FormData>(
    guardarConfiguracion,
    {},
  );
  const [logoPreview, setLogoPreview] = useState<string | null>(logoUrl);
  const [ctaPreview, setCtaPreview] = useState<string | null>(ctaUrl);
  // Lista editable de redes adicionales: quitar aquí y guardar las elimina.
  const [extras, setExtras] = useState<RedExtra[]>(redesExtra);
  const [iconoPreview, setIconoPreview] = useState<string | null>(null);

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      <section className="border-border bg-card space-y-4 rounded-2xl border p-6">
        <h2 className="font-display text-foreground text-lg font-semibold">
          Logo de la tienda
        </h2>
        <div className="flex items-center gap-4">
          <label className="border-border bg-secondary relative flex h-20 w-40 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed">
            {logoPreview ? (
              <Image
                src={logoPreview}
                alt="Logo"
                fill
                unoptimized
                className="object-contain p-2"
              />
            ) : (
              <span className="text-muted-foreground flex flex-col items-center gap-1 text-xs">
                <ImagePlus className="text-primary size-5" />
                Subir logo
              </span>
            )}
            <input
              type="file"
              name="logo"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                setLogoPreview(f ? URL.createObjectURL(f) : logoUrl);
              }}
              className="hidden"
            />
          </label>
          <p className="text-muted-foreground text-sm">
            Reemplaza el logo de AGAPEK en el encabezado y el pie. Se optimiza a WebP. Si
            lo dejas vacío, se usa el logo por defecto.
          </p>
        </div>
      </section>

      <section className="border-border bg-card space-y-4 rounded-2xl border p-6">
        <h2 className="font-display text-foreground text-lg font-semibold">Contacto</h2>
        <Campo
          name="whatsapp"
          label="WhatsApp de ventas (con código país, ej. 51961075865)"
          value={values.whatsapp}
        />
        <Campo name="horario" label="Horario de atención" value={values.horario} />
      </section>

      <section className="border-border bg-card grid gap-4 rounded-2xl border p-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <h2 className="font-display text-foreground text-lg font-semibold">Pagos</h2>
        </div>
        <Campo name="yape" label="Número de Yape" value={values.yape} />
        <Campo name="plin" label="Número de Plin" value={values.plin} />
        <Campo name="cuenta_bcp" label="Cuenta BCP" value={values.cuenta_bcp} />
        <Campo name="cci" label="CCI" value={values.cci} />
      </section>

      <section className="border-border bg-card grid gap-4 rounded-2xl border p-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <h2 className="font-display text-foreground text-lg font-semibold">
            Delivery (Iquitos)
          </h2>
        </div>
        <Campo
          name="delivery_centrico"
          label="Costo zona céntrica (S/)"
          value={values.delivery_centrico}
          type="number"
        />
        <Campo
          name="delivery_otras"
          label="Costo otras zonas (S/)"
          value={values.delivery_otras}
          type="number"
        />
      </section>

      <section className="border-border bg-card space-y-4 rounded-2xl border p-6">
        <h2 className="font-display text-foreground text-lg font-semibold">
          Banner de asesoría del home
        </h2>
        <div className="flex items-center gap-4">
          <label className="border-border bg-secondary relative flex h-24 w-44 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed">
            {ctaPreview ? (
              <Image
                src={ctaPreview}
                alt="Banner CTA"
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <span className="text-muted-foreground flex flex-col items-center gap-1 text-xs">
                <ImagePlus className="text-primary size-5" />
                Subir imagen
              </span>
            )}
            <input
              type="file"
              name="cta_imagen"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                setCtaPreview(f ? URL.createObjectURL(f) : ctaUrl);
              }}
              className="hidden"
            />
          </label>
          <p className="text-muted-foreground text-sm">
            Imagen de fondo del bloque &ldquo;Tu rutina ideal empieza con una buena
            guía&rdquo; del inicio. Se optimiza a WebP. Si la dejas vacía, se usa la
            imagen por defecto.
          </p>
        </div>
      </section>

      <section className="border-border bg-card grid gap-4 rounded-2xl border p-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <h2 className="font-display text-foreground text-lg font-semibold">
            Redes sociales
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Pega el enlace completo. Se dejan vacías las que no uses.
          </p>
        </div>
        <Campo
          name="facebook"
          label="Facebook (URL)"
          value={values.facebook}
          placeholder="https://facebook.com/AgapeK"
        />
        <Campo
          name="instagram"
          label="Instagram (URL)"
          value={values.instagram}
          placeholder="https://instagram.com/…"
        />
        <Campo
          name="tiktok"
          label="TikTok (URL)"
          value={values.tiktok}
          placeholder="https://tiktok.com/@…"
        />

        <div className="sm:col-span-2">
          <h3 className="text-foreground text-sm font-semibold">Otras redes sociales</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Agrega redes con su propio ícono (YouTube, X, Threads, etc.). Aparecen en el
            pie de página junto a las demás.
          </p>
          {/* La lista vigente viaja como JSON; quitar una de aquí y guardar la elimina. */}
          <input type="hidden" name="redes_extra_json" value={JSON.stringify(extras)} />

          {extras.length > 0 && (
            <ul className="mt-3 space-y-2">
              {extras.map((r) => (
                <li
                  key={r.url}
                  className="border-border bg-background flex items-center gap-3 rounded-xl border px-3.5 py-2.5"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={r.iconoUrl}
                    alt=""
                    className="size-6 shrink-0 object-contain"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="text-foreground block text-sm font-medium">
                      {r.nombre}
                    </span>
                    <span className="text-muted-foreground block truncate text-xs">
                      {r.url}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setExtras((xs) => xs.filter((x) => x.url !== r.url))}
                    aria-label={`Quitar ${r.nombre}`}
                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive inline-flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="border-border bg-secondary/40 mt-3 grid gap-3 rounded-xl border border-dashed p-4 sm:grid-cols-[auto_1fr_1fr]">
            <label className="border-border bg-card relative flex size-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed">
              {iconoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={iconoPreview} alt="Ícono" className="size-10 object-contain" />
              ) : (
                <Plus className="text-primary size-5" />
              )}
              <input
                type="file"
                name="red_nueva_icono"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setIconoPreview(f ? URL.createObjectURL(f) : null);
                }}
                className="hidden"
              />
            </label>
            <div className="space-y-1.5">
              <label className={label} htmlFor="red_nueva_nombre">
                Nombre
              </label>
              <input
                id="red_nueva_nombre"
                name="red_nueva_nombre"
                type="text"
                placeholder="YouTube"
                className={input}
              />
            </div>
            <div className="space-y-1.5">
              <label className={label} htmlFor="red_nueva_url">
                Enlace (URL)
              </label>
              <input
                id="red_nueva_url"
                name="red_nueva_url"
                type="url"
                placeholder="https://youtube.com/@agapek"
                className={input}
              />
            </div>
            <p className="text-muted-foreground text-xs sm:col-span-3">
              Sube el ícono (PNG con fondo transparente de preferencia), escribe el nombre
              y el enlace, y presiona &ldquo;Guardar cambios&rdquo;.
            </p>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="bg-primary text-primary-foreground inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {pending && <Loader2 className="size-4 animate-spin" />}
          Guardar cambios
        </button>
        {state.ok && (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--chart-5)]">
            <Check className="size-4" /> Guardado
          </span>
        )}
        {state.error && (
          <span className="text-destructive text-sm font-medium">{state.error}</span>
        )}
      </div>
    </form>
  );
}
