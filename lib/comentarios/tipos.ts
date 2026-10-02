export interface Comentario {
  id: string;
  ordenPagoId: string;
  autorId: string;
  texto: string;
  creadoEn: string;
}

export interface CrearComentarioDto {
  texto: string;
}
