"use client";

import { useState } from "react";
import { ModalCliente } from "@/components/clientes/ModalCliente";
import { TablaClientes } from "@/components/clientes/TablaClientes";
import { Boton } from "@/components/ui/Boton";
import { Cargando } from "@/components/ui/Cargando";
import { EstadoError } from "@/components/ui/EstadoError";
import { IconoMas } from "@/components/ui/Iconos";
import { useClientes } from "@/lib/clientes/hooks";
import type { Cliente } from "@/lib/clientes/tipos";

export default function PaginaClientes() {
  const clientes = useClientes();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);

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
          <p className="text-sm text-gray-500">Clientes con proyectos u órdenes de compra asociadas.</p>
        </div>
        <Boton tamanio="sm" onClick={abrirCrear}>
          <IconoMas className="h-4 w-4" />
          Nuevo cliente
        </Boton>
      </div>

      {clientes.isLoading ? <Cargando etiqueta="Cargando clientes..." /> : null}
      {clientes.isError ? <EstadoError error={clientes.error} /> : null}
      {clientes.data ? <TablaClientes clientes={clientes.data} onEditar={abrirEditar} /> : null}

      {modalAbierto ? (
        <ModalCliente cliente={clienteEditando} onCerrar={() => setModalAbierto(false)} />
      ) : null}
    </div>
  );
}
