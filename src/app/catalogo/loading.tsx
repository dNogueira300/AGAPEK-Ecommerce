import { ProductGridSkeleton, Sk } from "@/components/tienda/skeletons";

export default function CatalogoLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="border-border flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Sk className="h-3 w-28" />
          <Sk className="h-9 w-56" />
          <Sk className="h-3.5 w-24" />
        </div>
        <Sk className="h-10 w-44 rounded-full" />
      </div>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:gap-8">
        <div className="hidden w-64 shrink-0 space-y-6 lg:block">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2.5">
              <Sk className="h-4 w-24" />
              <Sk className="h-3.5 w-full" />
              <Sk className="h-3.5 w-5/6" />
              <Sk className="h-3.5 w-4/6" />
            </div>
          ))}
        </div>
        <div className="flex-1">
          <ProductGridSkeleton count={6} />
        </div>
      </div>
    </div>
  );
}
