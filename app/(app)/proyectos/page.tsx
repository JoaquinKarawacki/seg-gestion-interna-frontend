"use client";

import { useMemo, useState } from "react";
import { ModalProyecto } from "@/components/proyectos/ModalProyecto";
import { TablaProyectos } from "@/components/proyectos/TablaProyectos";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { Select } from "@/components/ui/Select";
import { Cargando } from "@/components/ui/Cargando";
import { EstadoError } from "@/components/ui/EstadoError";
import { IconoMas } from "@/components/ui/Iconos";
import { useClientes } from "@/lib/clientes/hooks";
import { useSectores } from "@/lib/sectores/hooks";
import { useProyectos } from "@/lib/proyectos/hooks";
import type { Proyecto } from "@/lib/proyectos/tipos";

export default function PaginaProyectos() {
  const proyectos = useProyectos();
  const clientes = useClientes();
  const sectores = useSectores();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [proyectoEditando, setProyectoEditando] = useState<Proyecto | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [sectorId, setSectorId] = useState("");

  const proyectosFiltrados = useMemo(() => {
    if (!proyectos.data) return [];
    const busquedaNormalizada = busqueda.trim().toLowerCase();
    return proyectos.data.filter((proyecto) => {
      const coincideNombre = proyecto.nombre.toLowerCase().includes(busquedaNormalizada);
      const coincideCliente = !clienteId || proyecto.clienteId === clienteId;
      const coincideSector = !sectorId || proyecto.sectorId === sectorId;
      return coincideNombre && coincideCliente && coincideSector;
    });
  }, [proyectos.data, busqueda, clienteId, sectorId]);

  const hayFiltrosActivos = busqueda.trim() !== "" || clienteId !== "" || sectorId !== "";

  function abrirCrear() {
    setProyectoEditando(null);
    setModalAbierto(true);
  }

  function abrirEditar(proyecto: Proyecto) {
    setProyectoEditando(proyecto);
    setModalAbierto(true);
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 animate-[fade-in_200ms_ease-out]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proyectos</h1>
          <p className="text-sm text-gray-500">Trabajos en curso o finalizados para cada cliente.</p>
        </div>
        <Boton tamanio="sm" onClick={abrirCrear}>
          <IconoMas className="h-4 w-4" />
          Nuevo proyecto
        </Boton>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[240px]">
          <Campo
            etiqueta="Buscar"
            placeholder="Nombre del proyecto..."
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
          />
        </div>
        <div className="min-w-[200px]">
          <Select
            etiqueta="Cliente"
            value={clienteId}
            onChange={(evento) => setClienteId(evento.target.value)}
          >
            <option value="">Todos</option>
            {clientes.data?.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombre}
              </option>
            ))}
          </Select>
        </div>
        <div className="min-w-[200px]">
          <Select
            etiqueta="Sector"
            value={sectorId}
            onChange={(evento) => setSectorId(evento.target.value)}
          >
            <option value="">Todos</option>
            {sectores.data?.map((sector) => (
              <option key={sector.id} value={sector.id}>
                {sector.nombre}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {proyectos.isLoading ? <Cargando etiqueta="Cargando proyectos..." /> : null}
      {proyectos.isError ? <EstadoError error={proyectos.error} /> : null}
      {proyectos.data ? (
        <TablaProyectos
          proyectos={proyectosFiltrados}
          hayFiltrosActivos={hayFiltrosActivos}
          onEditar={abrirEditar}
        />
      ) : null}

      {modalAbierto ? (
        <ModalProyecto proyecto={proyectoEditando} onCerrar={() => setModalAbierto(false)} />
      ) : null}
    </div>
  );
}
