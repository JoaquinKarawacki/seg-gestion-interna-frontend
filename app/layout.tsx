import type { Metadata } from "next";
import { Red_Hat_Display } from "next/font/google";
import { ProveedorQuery } from "@/lib/query-cliente";
import { ProveedorAuth } from "@/lib/auth/contexto";
import "./globals.css";

const redHatDisplay = Red_Hat_Display({
  subsets: ["latin"],
  variable: "--font-red-hat",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Gestión Interna — SEG Ingeniería",
  description: "Panel de gestión interna de SEG Ingeniería",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${redHatDisplay.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white">
        <ProveedorQuery>
          <ProveedorAuth>{children}</ProveedorAuth>
        </ProveedorQuery>
      </body>
    </html>
  );
}
