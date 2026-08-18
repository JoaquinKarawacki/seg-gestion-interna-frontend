import { peticion } from "@/lib/http/cliente";
import type { RespuestaExitosa, RespuestaLista } from "@/lib/tipos/respuesta-api";
import type {
  ActualizarProveedorDto,
  CrearProveedorDto,
  Proveedor,
} from "@/lib/proveedores/tipos";

export async function listarProveedores() {
  const { datos } = await peticion<RespuestaLista<Proveedor>>("/proveedores");
  return datos;
}

export async function crearProveedor(dto: CrearProveedorDto) {
  const { datos } = await peticion<RespuestaExitosa<Proveedor>>("/proveedores", {
    metodo: "POST",
    cuerpo: dto,
  });
  return datos;
}

export async function actualizarProveedor(id: string, dto: ActualizarProveedorDto) {
  const { datos } = await peticion<RespuestaExitosa<Proveedor>>(`/proveedores/${id}`, {
    metodo: "PATCH",
    cuerpo: dto,
  });
  return datos;
}

export async function eliminarProveedor(id: string) {
  await peticion<void>(`/proveedores/${id}`, { metodo: "DELETE" });
}
