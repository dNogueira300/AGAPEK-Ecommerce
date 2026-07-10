import { Sk } from "@/components/tienda/skeletons";

export default function BlogLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-3 text-center">
        <Sk className="mx-auto h-9 w-64" />
        <Sk className="mx-auto h-4 w-80" />
      </div>
      <Sk className="mt-10 aspect-[16/10] w-full rounded-3xl md:aspect-[21/9]" />
      <div className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Sk className="aspect-[16/11] w-full rounded-2xl" />
            <Sk className="h-3 w-20" />
            <Sk className="h-5 w-5/6" />
            <Sk className="h-3.5 w-40" />
          </div>
        ))}
      </div>
    </div>
  );
}
