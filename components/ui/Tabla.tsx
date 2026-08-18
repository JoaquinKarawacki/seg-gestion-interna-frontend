import type { ReactNode, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import clsx from "clsx";

export function Tabla({
  children,
  className,
  ...resto
}: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className={clsx("w-full text-left text-sm", className)} {...resto}>
        {children}
      </table>
    </div>
  );
}

export function TablaEncabezadoCelda({
  children,
  className,
  ...resto
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={clsx(
        "bg-gray-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-500",
        className,
      )}
      {...resto}
    >
      {children}
    </th>
  );
}

export function TablaCelda({
  children,
  className,
  ...resto
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={clsx("border-t border-gray-100 px-4 py-3 text-gray-700", className)} {...resto}>
      {children}
    </td>
  );
}

export function TablaFila({ children, className }: { children: ReactNode; className?: string }) {
  return <tr className={clsx("transition-colors hover:bg-gray-50", className)}>{children}</tr>;
}
