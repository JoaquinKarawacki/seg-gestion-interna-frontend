import { obtenerToken } from "@/lib/auth/almacen-token";

const URL_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export class ErrorApi extends Error {
  statusCode: number;
  codigo: string | null;

  constructor(message: string, statusCode: number, codigo: string | null) {
    super(message);
    this.name = "ErrorApi";
    this.statusCode = statusCode;
    this.codigo = codigo;
  }
}

type Metodo = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

interface OpcionesPeticion {
  metodo?: Metodo;
  cuerpo?: unknown;
  formData?: FormData;
  conAuth?: boolean;
}

type ManejadorExpiracion = () => void;
let manejadorExpiracion: ManejadorExpiracion | null = null;

export function registrarManejadorExpiracion(fn: ManejadorExpiracion) {
  manejadorExpiracion = fn;
}

interface CuerpoErrorApi {
  // Shape propio de ExcepcionGlobalFiltro (src/comun/filtros/excepcion-global.filtro.ts).
  error?: string;
  mensaje?: string;
  // Shape default de Nest — algunos errores de ParseFilePipe (validación de PDF) no pasan
  // por el filtro custom y llegan así en vez de {error, mensaje}.
  message?: string | string[];
}

function normalizarMensaje(datos: CuerpoErrorApi | null, status: number): string {
  if (datos?.mensaje) return datos.mensaje;
  if (Array.isArray(datos?.message)) return datos.message.join("; ");
  if (typeof datos?.message === "string") return datos.message;
  return `Ocurrió un error inesperado (${status})`;
}

export async function peticion<T>(ruta: string, opciones: OpcionesPeticion = {}): Promise<T> {
  const { metodo = "GET", cuerpo, formData, conAuth = true } = opciones;
  const token = conAuth ? obtenerToken() : null;

  const headers: Record<string, string> = {};
  if (!formData) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const respuesta = await fetch(`${URL_BASE}${ruta}`, {
    method: metodo,
    headers,
    body: formData ?? (cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined),
    cache: "no-store",
  });

  if (respuesta.status === 204) {
    return undefined as T;
  }

  const tipoContenido = respuesta.headers.get("content-type") ?? "";
  const datos: CuerpoErrorApi | null = tipoContenido.includes("application/json")
    ? await respuesta.json().catch(() => null)
    : null;

  if (!respuesta.ok) {
    if (respuesta.status === 401 && token && manejadorExpiracion) {
      manejadorExpiracion();
    }
    throw new ErrorApi(normalizarMensaje(datos, respuesta.status), respuesta.status, datos?.error ?? null);
  }

  return datos as T;
}

export async function peticionBinaria(
  ruta: string,
): Promise<{ blob: Blob; nombreArchivo: string | null }> {
  const token = obtenerToken();
  const respuesta = await fetch(`${URL_BASE}${ruta}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!respuesta.ok) {
    throw new ErrorApi(`No se pudo descargar el archivo (${respuesta.status})`, respuesta.status, null);
  }

  const disposicion = respuesta.headers.get("content-disposition");
  const coincidencia = disposicion?.match(/filename="?([^"]+)"?/);

  return { blob: await respuesta.blob(), nombreArchivo: coincidencia?.[1] ?? null };
}
