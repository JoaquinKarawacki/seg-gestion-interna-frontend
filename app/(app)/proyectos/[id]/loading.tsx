export default function CargandoDetalleProyecto() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-2">
        <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
        <div className="h-7 w-64 animate-pulse rounded bg-gray-100" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {[0, 1, 2].map((indice) => (
          <div key={indice} className="h-28 animate-pulse rounded-xl border border-gray-100 bg-gray-50" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl border border-gray-100 bg-gray-50" />
    </div>
  );
}
