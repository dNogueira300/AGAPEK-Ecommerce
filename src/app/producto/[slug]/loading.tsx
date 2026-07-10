import { Sk } from "@/components/tienda/skeletons";

export default function ProductoLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Sk className="h-3 w-48" />
      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-3">
          <Sk className="aspect-square w-full rounded-2xl" />
          <div className="flex gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Sk key={i} className="size-20 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Sk className="h-3.5 w-24" />
          <Sk className="h-9 w-4/5" />
          <Sk className="h-4 w-32" />
          <Sk className="h-8 w-36" />
          <Sk className="h-4 w-full" />
          <Sk className="h-4 w-11/12" />
          <Sk className="h-4 w-3/4" />
          <div className="flex gap-3 pt-2">
            <Sk className="h-12 w-32 rounded-full" />
            <Sk className="h-12 w-48 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
