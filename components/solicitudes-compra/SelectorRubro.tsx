"use client";

import { Select } from "@/components/ui/Select";
import { Campo } from "@/components/ui/Campo";
import { useRubros } from "@/lib/rubros/hooks";

// Valor centinela para la opción "Otros" — al elegirla se revela un campo de
// texto y el submit manda `rubroNombre` en vez de `rubroId`.
export const VALOR_RUBRO_OTROS = "__otros__";

export function SelectorRubro({
  rubroId,
  rubroNombre,
  onRubroIdChange,
  onRubroNombreChange,
  error,
}: {
  rubroId: string;
  rubroNombre: string;
  onRubroIdChange: (valor: string) => void;
  onRubroNombreChange: (valor: string) => void;
  error?: string;
}) {
  const rubros = useRubros();
  const activos = (rubros.data ?? []).filter((rubro) => rubro.activo);
  const esOtros = rubroId === VALOR_RUBRO_OTROS;

  return (
    <div className="flex flex-col gap-3">
      <Select
        etiqueta="Rubro"
        value={rubroId}
        error={error}
        onChange={(evento) => {
          const valor = evento.target.value;
          onRubroIdChange(valor);
          if (valor !== VALOR_RUBRO_OTROS) onRubroNombreChange("");
        }}
      >
        <option value="">— Seleccionar —</option>
        {activos.map((rubro) => (
          <option key={rubro.id} value={rubro.id}>
            {rubro.nombre}
          </option>
        ))}
        <option value={VALOR_RUBRO_OTROS}>Otros</option>
      </Select>
      {esOtros ? (
        <Campo
          etiqueta="Nombre del rubro"
          placeholder="Especificá el rubro..."
          value={rubroNombre}
          onChange={(evento) => onRubroNombreChange(evento.target.value)}
        />
      ) : null}
    </div>
  );
}
