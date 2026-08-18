import { EstadoVacio } from "@/components/ui/EstadoVacio";
import type { Cliente } from "@/lib/clientes/tipos";

export function FichaCliente({ cliente }: { cliente: Cliente | undefined }) {
  if (!cliente) {
    return <EstadoVacio titulo="No se encontró el cliente de este proyecto" />;
  }

  return (
    <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
      <Dato etiqueta="Nombre" valor={cliente.nombre} />
      <Dato etiqueta="RUT" valor={cliente.rut} />
      <Dato etiqueta="Email" valor={cliente.email ?? "—"} />
      <Dato etiqueta="Teléfono" valor={cliente.telefono ?? "—"} />
    </div>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-400">{etiqueta}</p>
      <p className="text-gray-800">{valor}</p>
    </div>
  );
}
