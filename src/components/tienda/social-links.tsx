import Link from "next/link";
import { cn } from "@/lib/utils";

export interface RedesSociales {
  facebook?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
}

function Facebook({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M13.5 21v-8h2.6l.4-3h-3V8.2c0-.87.24-1.46 1.5-1.46H17V4.06C16.7 4.02 15.8 4 14.76 4 12.6 4 11.1 5.32 11.1 7.74V10H8.5v3h2.6v8h2.4Z" />
    </svg>
  );
}
function Instagram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}
function TikTok({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M16.5 3c.3 1.9 1.4 3.2 3.5 3.5v2.6c-1.2.1-2.4-.2-3.5-.8v5.9c0 3-2.2 5.3-5.2 5.3A5.2 5.2 0 0 1 6 14.3a5.1 5.1 0 0 1 5.6-5v2.7c-.4-.1-.7-.2-1-.2a2.5 2.5 0 1 0 2.4 2.5V3h3.5Z" />
    </svg>
  );
}

const RED = [
  { key: "facebook" as const, label: "Facebook", Icon: Facebook },
  { key: "instagram" as const, label: "Instagram", Icon: Instagram },
  { key: "tiktok" as const, label: "TikTok", Icon: TikTok },
];

export function SocialLinks({
  redes,
  className,
  itemClassName,
}: {
  redes: RedesSociales;
  className?: string;
  itemClassName?: string;
}) {
  const activos = RED.filter((r) => redes[r.key]);
  if (activos.length === 0) return null;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {activos.map(({ key, label, Icon }) => (
        <Link
          key={key}
          href={redes[key]!}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className={cn(
            "flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground/80 transition-colors hover:border-primary/40 hover:bg-secondary hover:text-primary",
            itemClassName,
          )}
        >
          <Icon className="size-5" />
        </Link>
      ))}
    </div>
  );
}
