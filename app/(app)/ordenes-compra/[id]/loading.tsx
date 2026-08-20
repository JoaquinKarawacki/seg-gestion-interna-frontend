export default function CargandoDetalleOrdenCompra() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-2">
        <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
        <div className="h-7 w-56 animate-pulse rounded bg-gray-100" />
      </div>
      <div className="h-40 animate-pulse rounded-xl border border-gray-100 bg-gray-50" />
      <div className="flex flex-wrap gap-2">
        {[0, 1, 2].map((indice) => (
          <div key={indice} className="h-8 w-28 animate-pulse rounded-full bg-gray-100" />
        ))}
      </div>
      <div className="h-32 animate-pulse rounded-xl border border-gray-100 bg-gray-50" />
      <div className="h-32 animate-pulse rounded-xl border border-gray-100 bg-gray-50" />
    </div>
  );
}
