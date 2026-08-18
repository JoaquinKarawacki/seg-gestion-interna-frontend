export function EsqueletoTabla({ filas = 5 }: { filas?: number }) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
      <div className="flex items-center justify-between">
        <div className="h-7 w-40 animate-pulse rounded bg-gray-100" />
        <div className="h-9 w-40 animate-pulse rounded-full bg-gray-100" />
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-100">
        {Array.from({ length: filas }).map((_, indice) => (
          <div key={indice} className="h-12 animate-pulse border-b border-gray-50 bg-gray-50 last:border-b-0" />
        ))}
      </div>
    </div>
  );
}
