import type { SVGProps } from "react";

type PropsIcono = SVGProps<SVGSVGElement>;

const PROPS_BASE = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function IconoCerrar(props: PropsIcono) {
  return (
    <svg {...PROPS_BASE} {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function IconoUsuario(props: PropsIcono) {
  return (
    <svg {...PROPS_BASE} {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" />
    </svg>
  );
}

export function IconoSalir(props: PropsIcono) {
  return (
    <svg {...PROPS_BASE} {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

export function IconoMenu(props: PropsIcono) {
  return (
    <svg {...PROPS_BASE} {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export function IconoChevronAbajo(props: PropsIcono) {
  return (
    <svg {...PROPS_BASE} {...props}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function IconoMas(props: PropsIcono) {
  return (
    <svg {...PROPS_BASE} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconoEditar(props: PropsIcono) {
  return (
    <svg {...PROPS_BASE} {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

export function IconoEliminar(props: PropsIcono) {
  return (
    <svg {...PROPS_BASE} {...props}>
      <path d="M4 7h16" />
      <path d="M10 11v6M14 11v6" />
      <path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
      <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
    </svg>
  );
}
