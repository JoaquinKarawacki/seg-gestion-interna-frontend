"use client";

import { useState } from "react";
import { RequiereRol } from "@/components/layout/RequiereRol";
import { TablaAuditoria } from "@/components/auditoria/TablaAuditoria";
import { Boton } from "@/components/ui/Boton";
import { Select } from "@/components/ui/Select";
import { Cargando } from "@/components/ui/Cargando";
import { EstadoError } from "@/components/ui/EstadoError";
import { useAuditoriaPaginada } from "@/lib/auditoria/hooks";
import { ACCIONES_AUDITORIA, ENTIDADES_AUDITORIA, formatearAccion } from "@/lib/auditoria/presentacion";
import { useUsuarios } from "@/lib/usuarios/hooks";

const POR_PAGINA = 50;

export default function PaginaAuditoria() {
  const [accion, setAccion] = useState("");
  const [entidad, setEntidad] = useState("");
  const [usuarioEmail, setUsuarioEmail] = useState("");
  const [paginasCargadas, setPaginasCargadas] = useState(1);

  const usuarios = useUsuarios();
  const auditoria = useAuditoriaPaginada(
    {
      accion: accion || undefined,
      entidad: entidad || undefined,
      usuarioEmail: usuarioEmail || undefined,
    },
    paginasCargadas,
    POR_PAGINA,
  );

  function cambiarFiltro(setter: (valor: string) => void, valor: string) {
    setter(valor);
    setPaginasCargadas(1);
  }

  const hayFiltrosActivos = accion !== "" || entidad !== "" || usuarioEmail !== "";
  const hayMasPaginas = auditoria.registros.length < auditoria.total;

  return (
    <RequiereRol roles={["ADMIN"]}>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 animate-[fade-in_200ms_ease-out]">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Auditoría</h1>
          <p className="text-sm text-gray-500">Registro histórico de acciones realizadas en el sistema.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="min-w-[220px]">
            <Select
              etiqueta="Acción"
              value={accion}
              onChange={(evento) => cambiarFiltro(setAccion, evento.target.value)}
            >
              <option value="">Todas</option>
              {ACCIONES_AUDITORIA.map((valor) => (
                <option key={valor} value={valor}>
                  {formatearAccion(valor)}
                </option>
              ))}
            </Select>
          </div>
          <div className="min-w-[180px]">
            <Select
              etiqueta="Entidad"
              value={entidad}
              onChange={(evento) => cambiarFiltro(setEntidad, evento.target.value)}
            >
              <option value="">Todas</option>
              {ENTIDADES_AUDITORIA.map((valor) => (
                <option key={valor} value={valor}>
                  {valor}
                </option>
              ))}
            </Select>
          </div>
          <div className="min-w-[220px]">
            <Select
              etiqueta="Usuario"
              value={usuarioEmail}
              onChange={(evento) => cambiarFiltro(setUsuarioEmail, evento.target.value)}
            >
              <option value="">Todos</option>
              {usuarios.data?.map((usuario) => (
                <option key={usuario.id} value={usuario.email}>
                  {usuario.nombre}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {auditoria.isLoading ? <Cargando etiqueta="Cargando auditoría..." /> : null}
        {auditoria.isError ? <EstadoError error={auditoria.error} /> : null}
        {!auditoria.isLoading && !auditoria.isError ? (
          <>
            <TablaAuditoria registros={auditoria.registros} hayFiltrosActivos={hayFiltrosActivos} />
            <p className="text-xs text-gray-400">
              Mostrando {auditoria.registros.length} de {auditoria.total}
            </p>
            {hayMasPaginas ? (
              <Boton
                tamanio="sm"
                variante="outline"
                className="self-start"
                disabled={auditoria.isFetchingMas}
                onClick={() => setPaginasCargadas((actual) => actual + 1)}
              >
                {auditoria.isFetchingMas ? "Cargando..." : "Cargar más"}
              </Boton>
            ) : null}
          </>
        ) : null}
      </div>
    </RequiereRol>
  );
}
