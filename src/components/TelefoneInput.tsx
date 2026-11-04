"use client";

import { useState } from "react";

/**
 * Input de telefone com máscara automática (padrão brasileiro).
 * Formata enquanto a pessoa digita: (87) 99952-2543 ou (87) 3333-2222.
 * Continua sendo um input comum (não controlado pelo servidor) — o valor
 * formatado é o que vai no FormData, então nada muda nas actions.
 */
function formatarTelefone(valorDigitado: string) {
  const digitos = valorDigitado.replace(/\D/g, "").slice(0, 11);

  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  if (digitos.length <= 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

export function TelefoneInput({
  name,
  defaultValue,
  required
}: {
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  const [valor, setValor] = useState(defaultValue ? formatarTelefone(defaultValue) : "");

  return (
    <input
      className="input"
      name={name}
      required={required}
      inputMode="tel"
      placeholder="(00) 00000-0000"
      value={valor}
      onChange={(e) => setValor(formatarTelefone(e.target.value))}
    />
  );
}