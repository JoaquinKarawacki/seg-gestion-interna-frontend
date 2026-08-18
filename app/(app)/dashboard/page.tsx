"use client";

import { useAuth } from "@/lib/auth/contexto";
import { TarjetaConteoOC } from "@/components/dashboard/TarjetaConteoOC";
import { BotonLink } from "@/components/ui/Boton";
import { IconoBillete, IconoCheck, IconoDocumento, IconoReloj } from "@/components/ui/Iconos";

export default function PaginaDashboard() {
  const { usuario } = useAuth();

  if (!usuario) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 animate-[fade-in_200ms_ease-out]">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Hola, {usuario.nombre}</h1>
        <div className="mt-2 h-1 w-16 rounded bg-seg-rojo" />
      </div>

      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {usuario.rol === "SOLICITANTE" ? (
          <>
            <TarjetaConteoOC
              etiqueta="Mis borradores"
              icono={<IconoDocumento className="h-5 w-5" />}
              filtrosA={{ estado: "BORRADOR", solicitanteId: usuario.id }}
            />
            <TarjetaConteoOC
              etiqueta="Esperando resolución"
              icono={<IconoReloj className="h-5 w-5" />}
              filtrosA={{ estado: "PENDIENTE", solicitanteId: usuario.id }}
              filtrosB={{ estado: "EN_CONSULTA", solicitanteId: usuario.id }}
            />
            <TarjetaConteoOC
              etiqueta="Pagadas"
              icono={<IconoCheck className="h-5 w-5" />}
              filtrosA={{ estado: "PAGADO", solicitanteId: usuario.id }}
            />
          </>
        ) : null}

        {usuario.rol === "ENCARGADO" ? (
          <>
            <TarjetaConteoOC
              etiqueta="Pendientes de mi aprobación"
              icono={<IconoReloj className="h-5 w-5" />}
              filtrosA={{ estado: "PENDIENTE", sectorId: usuario.sectorId ?? undefined }}
            />
            <TarjetaConteoOC
              etiqueta="En consulta"
              icono={<IconoDocumento className="h-5 w-5" />}
              filtrosA={{ estado: "EN_CONSULTA", sectorId: usuario.sectorId ?? undefined }}
            />
            <TarjetaConteoOC
              etiqueta="Aprobadas, esperando pago"
              icono={<IconoCheck className="h-5 w-5" />}
              filtrosA={{ estado: "APROBADO", sectorId: usuario.sectorId ?? undefined }}
            />
          </>
        ) : null}

        {usuario.rol === "PAGOS" ? (
          <>
            <TarjetaConteoOC
              etiqueta="Para pagar"
              icono={<IconoBillete className="h-5 w-5" />}
              filtrosA={{ estado: "APROBADO" }}
            />
            <TarjetaConteoOC
              etiqueta="Observadas"
              icono={<IconoReloj className="h-5 w-5" />}
              filtrosA={{ estado: "PAGO_OBSERVADO" }}
            />
            <TarjetaConteoOC
              etiqueta="Pagadas"
              icono={<IconoCheck className="h-5 w-5" />}
              filtrosA={{ estado: "PAGADO" }}
            />
          </>
        ) : null}

        {usuario.rol === "ADMIN" ? (
          <>
            <TarjetaConteoOC
              etiqueta="Borradores"
              icono={<IconoDocumento className="h-5 w-5" />}
              filtrosA={{ estado: "BORRADOR" }}
            />
            <TarjetaConteoOC
              etiqueta="Pendientes / en consulta"
              icono={<IconoReloj className="h-5 w-5" />}
              filtrosA={{ estado: "PENDIENTE" }}
              filtrosB={{ estado: "EN_CONSULTA" }}
            />
            <TarjetaConteoOC
              etiqueta="Para pagar"
              icono={<IconoBillete className="h-5 w-5" />}
              filtrosA={{ estado: "APROBADO" }}
            />
          </>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <BotonLink variante="outline" tamanio="sm" href="/ordenes-compra">
          Ver Órdenes de Compra
        </BotonLink>
        <BotonLink variante="outline" tamanio="sm" href="/proyectos">
          Ver Proyectos
        </BotonLink>
        <BotonLink variante="outline" tamanio="sm" href="/clientes">
          Ver Clientes
        </BotonLink>
        {usuario.rol === "ADMIN" ? (
          <BotonLink variante="outline" tamanio="sm" href="/auditoria">
            Ver Auditoría
          </BotonLink>
        ) : null}
      </div>
    </div>
  );
}
