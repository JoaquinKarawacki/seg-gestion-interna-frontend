export interface RegistroAuditoria {
  id: string;
  usuarioId: string;
  usuarioEmail: string;
  accion: string;
  descripcion: string;
  entidad: string | null;
  entidadId: string | null;
  creadoEn: string;
}

export interface FiltrosAuditoria {
  accion?: string;
  entidad?: string;
  usuarioEmail?: string;
  pagina?: number;
  porPagina?: number;
}
