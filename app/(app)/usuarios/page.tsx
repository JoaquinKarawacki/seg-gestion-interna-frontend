"use client";

import { useState } from "react";
import { RequiereRol } from "@/components/layout/RequiereRol";
import { ModalUsuario } from "@/components/usuarios/ModalUsuario";
import { TablaUsuarios } from "@/components/usuarios/TablaUsuarios";
import { Boton } from "@/components/ui/Boton";
import { Cargando } from "@/components/ui/Cargando";
import { EstadoError } from "@/components/ui/EstadoError";
import { IconoMas } from "@/components/ui/Iconos";
import { useUsuarios } from "@/lib/usuarios/hooks";
import type { Usuario } from "@/lib/usuarios/tipos";

export default function PaginaUsuarios() {
  const usuarios = useUsuarios();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);

  function abrirCrear() {
    setUsuarioEditando(null);
    setModalAbierto(true);
  }

  function abrirEditar(usuario: Usuario) {
    setUsuarioEditando(usuario);
    setModalAbierto(true);
  }

  return (
    <RequiereRol roles={["ADMIN"]}>
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 animate-[fade-in_200ms_ease-out]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
            <p className="text-sm text-gray-500">Personas con acceso al sistema.</p>
          </div>
          <Boton tamanio="sm" onClick={abrirCrear}>
            <IconoMas className="h-4 w-4" />
            Nuevo usuario
          </Boton>
        </div>

        {usuarios.isLoading ? <Cargando etiqueta="Cargando usuarios..." /> : null}
        {usuarios.isError ? <EstadoError error={usuarios.error} /> : null}
        {usuarios.data ? <TablaUsuarios usuarios={usuarios.data} onEditar={abrirEditar} /> : null}

        {modalAbierto ? (
          <ModalUsuario usuario={usuarioEditando} onCerrar={() => setModalAbierto(false)} />
        ) : null}
      </div>
    </RequiereRol>
  );
}
