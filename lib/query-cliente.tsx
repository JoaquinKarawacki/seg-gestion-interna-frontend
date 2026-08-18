"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function ProveedorQuery({ children }: { children: ReactNode }) {
  const [clienteQuery] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: false,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return <QueryClientProvider client={clienteQuery}>{children}</QueryClientProvider>;
}
