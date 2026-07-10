import { PageTransition } from "@/components/tienda/page-transition";

// template.tsx se vuelve a montar en cada navegación → permite animar la entrada.
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
