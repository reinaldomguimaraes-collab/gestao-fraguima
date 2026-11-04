"use client";

import { useState } from "react";

const PASSOS = [
  { titulo: "Dashboard", texto: "Aqui você vê o resumo financeiro do mês: faturamento, custo fixo, resultado e o progresso das suas metas." },
  { titulo: "Parâmetros da Empresa", texto: "Configure uma vez: regime tributário, percentuais padrão e horas úteis/mês. Esses valores viram o padrão da Precificação." },
  { titulo: "Cadastros", texto: "Cadastre funcionários, veículos e terceirizados — o Custo Mensal e o Valor Hora de cada um são calculados sozinhos." },
  { titulo: "Custos Fixos", texto: "Veja a lista única de despesas, somando Folha de Pagamento, Veículos e as despesas gerais que você cadastrar." },
  { titulo: "Metas Comerciais", texto: "Defina meta, ticket médio e % de conversão de cada frente — o sistema calcula quantas vendas e quantos leads você precisa." },
  { titulo: "Vendas", texto: "Lance cada venda realizada. Dá pra editar enquanto o mês está aberto, sempre com um motivo registrado." },
  { titulo: "Precificação", texto: "Duas calculadoras — Venda de Usina e Serviços — que chegam ao preço somando percentuais sobre o custo." },
  { titulo: "Fluxo de Caixa", texto: "Acompanhe entradas e saídas previstas x realizadas, mês a mês, com o saldo acumulado." }
];

export default function OnboardingPage() {
  const [passo, setPasso] = useState(0);
  const total = PASSOS.length;
  const atual = PASSOS[passo];
  const ultimo = passo === total - 1;

  return (
    <div className="max-w-xl">
      <h1 className="font-display mb-1 text-xl font-bold text-ink">Bem-vindo ao Duo Fraguima</h1>
      <p className="caption mb-6">
        Um guia rápido pelas partes do painel — você pode rever isso quando quiser em Configurações.
      </p>

      <div className="card">
        <div className="mb-5 flex items-center gap-1.5">
          {PASSOS.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= passo ? "bg-accent" : "bg-border"}`} />
          ))}
        </div>

        <div className="flex gap-4">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-accent text-base font-semibold text-white">
            {passo + 1}
          </div>
          <div>
            <div className="text-base font-semibold text-ink">{atual.titulo}</div>
            <p className="caption mt-1">{atual.texto}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
          <span className="caption">
            {passo + 1} de {total}
          </span>
          <div className="flex gap-2">
            {passo > 0 && (
              <button type="button" className="btn btn-ghost" onClick={() => setPasso((p) => p - 1)}>
                Anterior
              </button>
            )}
            {!ultimo ? (
              <button type="button" className="btn btn-primary" onClick={() => setPasso((p) => p + 1)}>
                Próximo
              </button>
            ) : (
              <a href="/dashboard" className="btn btn-primary">
                Ir para o Dashboard
              </a>
            )}
          </div>
        </div>
      </div>

      <a href="/dashboard" className="caption mt-4 inline-block underline">
        Pular e ir direto para o Dashboard
      </a>
    </div>
  );
}