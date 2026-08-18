"use client";

import { Tabla, TablaCelda, TablaEncabezadoCelda, TablaFila } from "@/components/ui/Tabla";
import { BotonAccionFila } from "@/components/ui/BotonAccionFila";
import { Insignia } from "@/components/ui/Insignia";
import { ErrorApi } from "@/lib/http/cliente";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { IconoEditar, IconoEliminar } from "@/components/ui/Iconos";
import { useActualizarUsuario, useDarDeBajaUsuario } from "@/lib/usuarios/hooks";
import { ETIQUETAS_ROL } from "@/lib/usuarios/presentacion";
import type { Usuario } from "@/lib/usuarios/tipos";

function AccionesUsuario({ usuario }: { usuario: Usuario }) {
  const darDeBaja = useDarDeBajaUsuario();
  const reactivar = useActualizarUsuario(usuario.id);
  const error = darDeBaja.error ?? reactivar.error;

  async function manejarBaja() {
    if (!window.confirm(`¿Dar de baja a "${usuario.nombre}"? No va a poder iniciar sesión.`)) return;
    darDeBaja.mutate(usuario.id);
  }

  function manejarReactivar() {
    reactivar.mutate({ activo: true });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {usuario.activo ? (
        <BotonAccionFila onClick={manejarBaja} disabled={darDeBaja.isPending}>
          <IconoEliminar className="h-3.5 w-3.5" />
          Dar de baja
        </BotonAccionFila>
      ) : (
        <BotonAccionFila onClick={manejarReactivar} disabled={reactivar.isPending}>
          Reactivar
        </BotonAccionFila>
      )}
      {error ? (
        <p className="text-xs text-seg-rojo">
          {error instanceof ErrorApi ? error.message : "Ocurrió un error inesperado"}
        </p>
      ) : null}
    </div>
  );
}

export function TablaUsuarios({
  usuarios,
  onEditar,
}: {
  usuarios: Usuario[];
  onEditar: (usuario: Usuario) => void;
}) {
  if (usuarios.length === 0) {
    return <EstadoVacio titulo="No hay usuarios registrados" />;
  }

  return (
    <Tabla>
      <thead>
        <TablaFila>
          <TablaEncabezadoCelda>Nombre</TablaEncabezadoCelda>
          <TablaEncabezadoCelda>Email</TablaEncabezadoCelda>
          <TablaEncabezadoCelda>Rol</TablaEncabezadoCelda>
          <TablaEncabezadoCelda>Estado</TablaEncabezadoCelda>
          <TablaEncabezadoCelda />
        </TablaFila>
      </thead>
      <tbody>
        {usuarios.map((usuario) => (
          <TablaFila key={usuario.id}>
            <TablaCelda className="font-semibold text-gray-900">{usuario.nombre}</TablaCelda>
            <TablaCelda>{usuario.email}</TablaCelda>
            <TablaCelda>{ETIQUETAS_ROL[usuario.rol]}</TablaCelda>
            <TablaCelda>
              <Insignia tono={usuario.activo ? "gris" : "apagado"}>
                {usuario.activo ? "Activo" : "Inactivo"}
              </Insignia>
            </TablaCelda>
            <TablaCelda>
              <div className="flex justify-end gap-1">
                <BotonAccionFila onClick={() => onEditar(usuario)}>
                  <IconoEditar className="h-3.5 w-3.5" />
                  Editar
                </BotonAccionFila>
                <AccionesUsuario usuario={usuario} />
              </div>
            </TablaCelda>
          </TablaFila>
        ))}
      </tbody>
    </Tabla>
  );
}
