'use client';


function Shimmer({ className = '' }: { className?: string }) {
  return (
    <div
      className={`bg-ivory-dark/60 rounded overflow-hidden relative ${className}`}
    >
      <div className="absolute inset-0 shimmer" />
    </div>
  );
}

export function TrendingSkeleton() {
  return (
    <div className="section-pad max-w-[1440px] mx-auto px-6">
      <div className="flex items-end justify-between mb-12">
        <div className="space-y-3">
          <Shimmer className="h-3 w-32" />
          <Shimmer className="h-9 w-56" />
        </div>
        <Shimmer className="h-4 w-20" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-4">
            <Shimmer className="h-[380px] w-full rounded-2xl" />
            <div className="space-y-2">
              <Shimmer className="h-3 w-20" />
              <Shimmer className="h-5 w-3/4" />
              <Shimmer className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CategoriesSkeleton() {
  return (
    <div className="section-pad bg-ivory">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="mb-10 space-y-3">
          <Shimmer className="h-3 w-36" />
          <Shimmer className="h-9 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-[280px_200px] gap-4">
          <Shimmer className="lg:col-span-2 lg:row-span-2 rounded-2xl h-[300px] lg:h-full" />
          <Shimmer className="lg:col-span-1 rounded-2xl h-[220px]" />
          <Shimmer className="lg:col-span-1 rounded-2xl h-[220px]" />
          <Shimmer className="lg:col-span-1 rounded-2xl h-[200px]" />
          <Shimmer className="lg:col-span-1 rounded-2xl h-[200px]" />
        </div>
      </div>
    </div>
  );
}

export function ReviewsSkeleton() {
  return (
    <div className="section-pad bg-ivory">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="text-center mb-14 space-y-3">
          <Shimmer className="h-3 w-28 mx-auto" />
          <Shimmer className="h-9 w-64 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-border/40 space-y-4">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Shimmer key={s} className="h-3.5 w-3.5 rounded" />
                ))}
              </div>
              <Shimmer className="h-16 w-full" />
              <div className="flex items-center justify-between pt-4 border-t border-border/30">
                <Shimmer className="h-3 w-24" />
                <Shimmer className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
