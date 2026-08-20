"use client";

import { useState } from "react";
import { Tabla, TablaCelda, TablaEncabezadoCelda, TablaFila } from "@/components/ui/Tabla";
import { BotonAccionFila } from "@/components/ui/BotonAccionFila";
import { EstadoError } from "@/components/ui/EstadoError";
import { Insignia } from "@/components/ui/Insignia";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { IconoEditar, IconoEliminar } from "@/components/ui/Iconos";
import { useActualizarUsuario, useDarDeBajaUsuario } from "@/lib/usuarios/hooks";
import { ETIQUETAS_ROL } from "@/lib/usuarios/presentacion";
import type { Usuario } from "@/lib/usuarios/tipos";

function AccionesUsuario({
  usuario,
  onError,
}: {
  usuario: Usuario;
  onError: (error: unknown) => void;
}) {
  const darDeBaja = useDarDeBajaUsuario();
  const reactivar = useActualizarUsuario(usuario.id);

  async function manejarBaja() {
    if (!window.confirm(`¿Dar de baja a "${usuario.nombre}"? No va a poder iniciar sesión.`)) return;
    onError(null);
    try {
      await darDeBaja.mutateAsync(usuario.id);
    } catch (error) {
      onError(error);
    }
  }

  async function manejarReactivar() {
    onError(null);
    try {
      await reactivar.mutateAsync({ activo: true });
    } catch (error) {
      onError(error);
    }
  }

  return usuario.activo ? (
    <BotonAccionFila onClick={manejarBaja} disabled={darDeBaja.isPending}>
      <IconoEliminar className="h-3.5 w-3.5" />
      Dar de baja
    </BotonAccionFila>
  ) : (
    <BotonAccionFila onClick={manejarReactivar} disabled={reactivar.isPending}>
      Reactivar
    </BotonAccionFila>
  );
}

export function TablaUsuarios({
  usuarios,
  onEditar,
}: {
  usuarios: Usuario[];
  onEditar: (usuario: Usuario) => void;
}) {
  const [error, setError] = useState<unknown>(null);

  if (usuarios.length === 0) {
    return <EstadoVacio titulo="No hay usuarios registrados" />;
  }

  return (
    <div className="flex flex-col gap-3">
      {error ? <EstadoError error={error} /> : null}
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
                  <AccionesUsuario usuario={usuario} onError={setError} />
                </div>
              </TablaCelda>
            </TablaFila>
          ))}
        </tbody>
      </Tabla>
    </div>
  );
}
