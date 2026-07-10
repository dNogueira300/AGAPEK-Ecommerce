import { Sk } from "@/components/tienda/skeletons";

export default function RutinasLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-3 text-center">
        <Sk className="mx-auto h-9 w-56" />
        <Sk className="mx-auto h-4 w-80" />
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Sk key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>
      <div className="mt-12 space-y-10">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Sk className="h-7 w-72" />
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <Sk key={j} className="aspect-[3/4] rounded-2xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
