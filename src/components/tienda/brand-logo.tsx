import { Sparkles } from "lucide-react";

export function BrandLogo({ logoUrl }: { logoUrl: string | null }) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={logoUrl} alt="AGAPEK" className="h-9 w-auto object-contain sm:h-10" />
    );
  }
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
        <Sparkles className="size-4.5" strokeWidth={2.25} />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-semibold tracking-wide text-foreground">
          AGAPEK
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          Bloom &amp; Glow
        </span>
      </span>
    </span>
  );
}
