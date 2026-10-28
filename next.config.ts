import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Salida "standalone": Next genera un server mínimo con sus dependencias
  // traceadas, para servir en un contenedor liviano con `node server.js`.
  output: "standalone",
};

export default nextConfig;
