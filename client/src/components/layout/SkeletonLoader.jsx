"use client";

export default function SkeletonLoader({ variant = "table", rows = 5, cols = 4 }) {
  if (variant === "table") {
    return (
      <div className="w-full space-y-4 animate-pulse">
        {/* Header row */}
        <div className="flex gap-4 border-b border-slate-100 pb-4">
          {Array.from({ length: cols }).map((_, idx) => (
            <div key={idx} className="h-4 bg-slate-200 rounded flex-1" />
          ))}
        </div>
        {/* Table rows */}
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} className="flex gap-4 items-center py-2 border-b border-slate-50">
            {Array.from({ length: cols }).map((_, colIdx) => (
              <div
                key={colIdx}
                className={`h-3 bg-slate-100 rounded ${
                  colIdx === 0 ? "w-2/5" : "flex-1"
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (variant === "cards") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="bg-white border border-slate-250 rounded-xl p-5 space-y-3">
            <div className="h-3 w-1/2 bg-slate-200 rounded" />
            <div className="h-6 w-3/4 bg-slate-100 rounded" />
            <div className="h-2 w-1/3 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "detail") {
    return (
      <div className="bg-white border border-slate-250 rounded-xl p-6 space-y-6 animate-pulse">
        <div className="space-y-2">
          <div className="h-5 w-1/3 bg-slate-200 rounded" />
          <div className="h-3 w-1/4 bg-slate-150 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-3 w-1/4 bg-slate-100" />
            <div className="h-10 bg-slate-50 rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-1/4 bg-slate-100" />
            <div className="h-10 bg-slate-50 rounded" />
          </div>
        </div>
        <div className="h-20 bg-slate-50 rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="h-12 bg-slate-100 rounded-lg w-full" />
      ))}
    </div>
  );
}
