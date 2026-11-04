"use client";

import { useMemo, useState } from "react";

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function CalculadoraPlaca({
  terceirizados
}: {
  terceirizados: { id: string; nome: string; valorPlaca: number }[];
}) {
  const [selecionadoId, setSelecionadoId] = useState(terceirizados[0]?.id ?? "");
  const [quantidade, setQuantidade] = useState("");

  const selecionado = terceirizados.find((t) => t.id === selecionadoId);
  const qtd = Number(quantidade) || 0;
  const total = useMemo(() => (selecionado ? qtd * selecionado.valorPlaca : 0), [selecionado, qtd]);

  if (terceirizados.length === 0) {
    return (
      <div className="mt-5 card">
        <div className="text-sm font-semibold text-ink">Calculadora rápida</div>
        <p className="caption mt-1">
          Cadastre um terceirizado com cobrança "Por placa instalada" acima para usar a calculadora.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5 card">
      <div className="text-sm font-semibold text-ink">Calculadora rápida</div>
      <p className="caption mb-4 mt-1 max-w-lg">
        Pra te ajudar a chegar no custo total de um serviço com terceirizado por placa. Esse valor não fica salvo —
        é só uma conta na hora, pra você usar na Precificação de Serviço.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Terceirizado</label>
          <select
            className="input"
            value={selecionadoId}
            onChange={(e) => setSelecionadoId(e.target.value)}
          >
            {terceirizados.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome} — {fmt(t.valorPlaca)}/placa
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Quantidade de placas instaladas</label>
          <input
            className="input"
            type="number"
            min="0"
            placeholder="0"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <div className="caption">
          {qtd} placas × {selecionado ? fmt(selecionado.valorPlaca) : "—"}
        </div>
        <div className="text-right">
          <div className="caption">Custo total</div>
          <div className="font-display text-2xl font-bold text-accent">{fmt(total)}</div>
        </div>
      </div>
    </div>
  );
}