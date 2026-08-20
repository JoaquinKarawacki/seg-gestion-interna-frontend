export default function CargandoDashboard() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <div className="mb-10 flex flex-col gap-2">
        <div className="h-9 w-64 animate-pulse rounded bg-gray-100" />
        <div className="h-1 w-16 animate-pulse rounded bg-gray-100" />
      </div>
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((indice) => (
          <div key={indice} className="h-24 animate-pulse rounded-xl border border-gray-100 bg-gray-50" />
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        {[0, 1, 2, 3].map((indice) => (
          <div key={indice} className="h-9 w-40 animate-pulse rounded-full bg-gray-100" />
        ))}
      </div>
    </div>
  );
}
