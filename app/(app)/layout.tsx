import type { ReactNode } from "react";
import { RequiereSesion } from "@/components/layout/RequiereSesion";
import { EncabezadoApp } from "@/components/layout/EncabezadoApp";

export default function LayoutApp({ children }: { children: ReactNode }) {
  return (
    <RequiereSesion>
      <EncabezadoApp />
      <main className="flex-1 bg-gray-50">{children}</main>
    </RequiereSesion>
  );
}
