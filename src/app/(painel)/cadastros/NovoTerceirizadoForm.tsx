"use client";

import { useState } from "react";
import { criarTerceirizadoAction } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

export function NovoTerceirizadoForm() {
  const [tipo, setTipo] = useState<"DIARIA" | "PLACA">("DIARIA");

  return (
    <form action={criarTerceirizadoAction} className="card mt-5 grid grid-cols-2 gap-4">
      <div>
        <label className="label">Nome</label>
        <input className="input" name="nome" required placeholder="Nome da equipe/empresa" />
      </div>

      <div>
        <label className="label">Tipo de cobrança</label>
        <div className="flex gap-2">
          <input type="hidden" name="tipoCobranca" value={tipo} />
          <button
            type="button"
            onClick={() => setTipo("DIARIA")}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
              tipo === "DIARIA" ? "bg-ink text-white" : "border border-border bg-white text-ink-muted"
            }`}
          >
            Por diária
          </button>
          <button
            type="button"
            onClick={() => setTipo("PLACA")}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
              tipo === "PLACA" ? "bg-ink text-white" : "border border-border bg-white text-ink-muted"
            }`}
          >
            Por placa instalada
          </button>
        </div>
      </div>

      {tipo === "DIARIA" ? (
        <div>
          <label className="label">Valor por diária (R$)</label>
          <input className="input" name="valorDiaria" type="number" step="0.01" placeholder="350,00" />
        </div>
      ) : (
        <div>
          <label className="label">Valor por placa (R$)</label>
          <input className="input" name="valorPlaca" type="number" step="0.01" placeholder="45,00" />
        </div>
      )}

      <div className="col-span-2 flex justify-end">
        <SubmitButton pendingText="Adicionando..." className="btn btn-primary">
          + Adicionar terceirizado
        </SubmitButton>
      </div>
    </form>
  );
}