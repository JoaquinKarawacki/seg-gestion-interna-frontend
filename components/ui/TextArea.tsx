import { forwardRef, type TextareaHTMLAttributes } from "react";
import clsx from "clsx";

interface PropsTextArea extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  etiqueta: string;
  error?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, PropsTextArea>(function TextArea(
  { etiqueta, error, className, id, rows = 4, ...resto },
  ref,
) {
  const idCampo = id ?? etiqueta.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={idCampo} className="text-sm font-medium text-gray-700">
        {etiqueta}
      </label>
      <textarea
        ref={ref}
        id={idCampo}
        rows={rows}
        className={clsx(
          "rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-seg-rojo/40 focus:border-seg-rojo",
          error ? "border-red-400" : "border-gray-200",
          className,
        )}
        {...resto}
      />
      {error ? <p className="text-xs text-seg-rojo">{error}</p> : null}
    </div>
  );
});
