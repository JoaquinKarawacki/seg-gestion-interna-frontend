import type { ReactNode } from "react";

export function TarjetaBordeSuperior({
  titulo,
  children,
}: {
  titulo: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-7 border-t-4 border-seg-rojo">
      <h3 className="font-bold text-gray-900 text-lg mb-3">{titulo}</h3>
      <div className="text-gray-600 leading-relaxed text-sm">{children}</div>
    </div>
  );
}

export function TarjetaCabeceraRoja({
  titulo,
  icono,
  children,
}: {
  titulo: string;
  icono?: ReactNode;
  children: ReactNode;
}) {
  return (
    <article className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div className="bg-seg-rojo p-6 text-white flex flex-col items-center text-center">
        {icono}
        <h3 className="text-xl font-bold mt-2">{titulo}</h3>
      </div>
      <div className="p-6">{children}</div>
    </article>
  );
}
