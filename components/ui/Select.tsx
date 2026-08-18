import { forwardRef, type SelectHTMLAttributes } from "react";
import clsx from "clsx";

interface PropsSelect extends SelectHTMLAttributes<HTMLSelectElement> {
  etiqueta: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, PropsSelect>(function Select(
  { etiqueta, error, className, id, children, ...resto },
  ref,
) {
  const idCampo = id ?? etiqueta.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={idCampo} className="text-sm font-medium text-gray-700">
        {etiqueta}
      </label>
      <select
        ref={ref}
        id={idCampo}
        className={clsx(
          "rounded-lg border bg-white px-3 py-2 text-sm text-gray-900",
          "focus:outline-none focus:ring-2 focus:ring-seg-rojo/40 focus:border-seg-rojo",
          error ? "border-red-400" : "border-gray-200",
          className,
        )}
        {...resto}
      >
        {children}
      </select>
      {error ? <p className="text-xs text-seg-rojo">{error}</p> : null}
    </div>
  );
});
