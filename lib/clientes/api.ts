import { peticion } from "@/lib/http/cliente";
import type { RespuestaExitosa, RespuestaLista } from "@/lib/tipos/respuesta-api";
import type { ActualizarClienteDto, Cliente, CrearClienteDto } from "@/lib/clientes/tipos";

export async function listarClientes() {
  const { datos } = await peticion<RespuestaLista<Cliente>>("/clientes");
  return datos;
}

export async function crearCliente(dto: CrearClienteDto) {
  const { datos } = await peticion<RespuestaExitosa<Cliente>>("/clientes", {
    metodo: "POST",
    cuerpo: dto,
  });
  return datos;
}

export async function actualizarCliente(id: string, dto: ActualizarClienteDto) {
  const { datos } = await peticion<RespuestaExitosa<Cliente>>(`/clientes/${id}`, {
    metodo: "PATCH",
    cuerpo: dto,
  });
  return datos;
}

export async function eliminarCliente(id: string) {
  await peticion<void>(`/clientes/${id}`, { metodo: "DELETE" });
}
