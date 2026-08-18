export type TipoCuentaBancaria = "CAJA_AHORRO" | "CUENTA_CORRIENTE" | "EXTERIOR";

export interface Proveedor {
  id: string;
  nombre: string;
  rut: string;
  email: string | null;
  telefono: string | null;
  banco: string;
  tipoCuenta: TipoCuentaBancaria;
  numeroCuenta: string;
}

export interface CrearProveedorDto {
  nombre: string;
  rut: string;
  email?: string;
  telefono?: string;
  banco: string;
  tipoCuenta: TipoCuentaBancaria;
  numeroCuenta: string;
}

export interface ActualizarProveedorDto {
  nombre?: string;
  rut?: string;
  email?: string;
  telefono?: string;
  banco?: string;
  tipoCuenta?: TipoCuentaBancaria;
  numeroCuenta?: string;
}
