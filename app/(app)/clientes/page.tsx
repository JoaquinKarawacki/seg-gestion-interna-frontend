"use client";

import { useMemo, useState } from "react";
import { ModalCliente } from "@/components/clientes/ModalCliente";
import { TablaClientes } from "@/components/clientes/TablaClientes";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { Cargando } from "@/components/ui/Cargando";
import { EstadoError } from "@/components/ui/EstadoError";
import { IconoMas } from "@/components/ui/Iconos";
import { useClientes } from "@/lib/clientes/hooks";
import type { Cliente } from "@/lib/clientes/tipos";

export default function PaginaClientes() {
  const clientes = useClientes();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  const [busqueda, setBusqueda] = useState("");

  const clientesFiltrados = useMemo(() => {
    if (!clientes.data) return [];
    const busquedaNormalizada = busqueda.trim().toLowerCase();
    return clientes.data.filter(
      (cliente) =>
        cliente.nombre.toLowerCase().includes(busquedaNormalizada) ||
        cliente.rut.toLowerCase().includes(busquedaNormalizada),
    );
  }, [clientes.data, busqueda]);
  const hayFiltrosActivos = busqueda.trim() !== "";

  function abrirCrear() {
    setClienteEditando(null);
    setModalAbierto(true);
  }

  function abrirEditar(cliente: Cliente) {
    setClienteEditando(cliente);
    setModalAbierto(true);
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 animate-[fade-in_200ms_ease-out]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-sm text-gray-500">Clientes con proyectos u órdenes de pago asociadas.</p>
        </div>
        <Boton tamanio="sm" onClick={abrirCrear}>
          <IconoMas className="h-4 w-4" />
          Nuevo cliente
        </Boton>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[240px]">
          <Campo
            etiqueta="Buscar"
            placeholder="Nombre o RUT del cliente..."
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
          />
        </div>
      </div>

      {clientes.isLoading ? <Cargando etiqueta="Cargando clientes..." /> : null}
      {clientes.isError ? <EstadoError error={clientes.error} /> : null}
      {clientes.data ? (
        <TablaClientes clientes={clientesFiltrados} hayFiltrosActivos={hayFiltrosActivos} onEditar={abrirEditar} />
      ) : null}

      {modalAbierto ? (
        <ModalCliente cliente={clienteEditando} onCerrar={() => setModalAbierto(false)} />
      ) : null}
    </div>
  );
}
