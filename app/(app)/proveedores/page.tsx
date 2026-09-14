"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/lib/auth/contexto";
import { ModalProveedor } from "@/components/proveedores/ModalProveedor";
import { TablaProveedores } from "@/components/proveedores/TablaProveedores";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { Cargando } from "@/components/ui/Cargando";
import { EstadoError } from "@/components/ui/EstadoError";
import { IconoMas } from "@/components/ui/Iconos";
import { useProveedores } from "@/lib/proveedores/hooks";
import type { Proveedor } from "@/lib/proveedores/tipos";

const ROLES_EDICION = ["ADMIN", "PAGOS", "ENCARGADO"];

export default function PaginaProveedores() {
  const { usuario } = useAuth();
  const proveedores = useProveedores();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [proveedorEditando, setProveedorEditando] = useState<Proveedor | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const puedeEditar = Boolean(usuario && ROLES_EDICION.includes(usuario.rol));

  const proveedoresFiltrados = useMemo(() => {
    if (!proveedores.data) return [];
    const busquedaNormalizada = busqueda.trim().toLowerCase();
    return proveedores.data.filter(
      (proveedor) =>
        proveedor.nombre.toLowerCase().includes(busquedaNormalizada) ||
        proveedor.rut.toLowerCase().includes(busquedaNormalizada),
    );
  }, [proveedores.data, busqueda]);
  const hayFiltrosActivos = busqueda.trim() !== "";

  function abrirCrear() {
    setProveedorEditando(null);
    setModalAbierto(true);
  }

  function abrirEditar(proveedor: Proveedor) {
    setProveedorEditando(proveedor);
    setModalAbierto(true);
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 animate-[fade-in_200ms_ease-out]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
          <p className="text-sm text-gray-500">Datos bancarios usados en las órdenes de pago.</p>
        </div>
        <Boton tamanio="sm" onClick={abrirCrear}>
          <IconoMas className="h-4 w-4" />
          Nuevo proveedor
        </Boton>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[240px]">
          <Campo
            etiqueta="Buscar"
            placeholder="Nombre o RUT del proveedor..."
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
          />
        </div>
      </div>

      {proveedores.isLoading ? <Cargando etiqueta="Cargando proveedores..." /> : null}
      {proveedores.isError ? <EstadoError error={proveedores.error} /> : null}
      {proveedores.data ? (
        <TablaProveedores
          proveedores={proveedoresFiltrados}
          hayFiltrosActivos={hayFiltrosActivos}
          puedeEditar={puedeEditar}
          onEditar={abrirEditar}
        />
      ) : null}

      {modalAbierto ? (
        <ModalProveedor proveedor={proveedorEditando} onCerrar={() => setModalAbierto(false)} />
      ) : null}
    </div>
  );
}
