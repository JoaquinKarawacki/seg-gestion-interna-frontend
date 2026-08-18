export interface Comentario {
  id: string;
  ordenCompraId: string;
  autorId: string;
  texto: string;
  creadoEn: string;
}

export interface CrearComentarioDto {
  texto: string;
}
