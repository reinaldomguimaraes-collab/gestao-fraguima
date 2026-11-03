import { prisma } from "@/lib/prisma";
import { requireCliente } from "@/lib/session";
import { salvarMetaAction } from "./actions";

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const FRENTES: { key: "VENDA_USINAS" | "SERVICOS" | "MRR"; label: string }[] = [
  { key: "VENDA_USINAS", label: "Venda de Usinas" },
  { key: "SERVICOS", label: "Serviços" },
  { key: "MRR", label: "MRR" }
];

function mesAtual() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default async function MetasPage() {
  const { empresaId } = await requireCliente();
  const mesReferencia = mesAtual();

  const metas = await prisma.metaFrente.findMany({ where: { empresaId, mesReferencia } });
  const porFrente = Object.fromEntries(metas.map((m) => [m.frente, m]));

  const faturamentoTotal = metas.reduce((s, m) => s + Number(m.metaValor), 0);

  return (
    <div>
      <h1 className="font-display mb-1 text-xl font-bold text-ink">Metas Comerciais</h1>
      <p className="caption mb-6">
        Defina a meta, o ticket médio e a % de conversão de cada frente de receita. O sistema calcula quantas vendas
        e quanta demanda (leads) você precisa em cada uma — e essas metas também alimentam o Custo Fixo e Comercial
        automáticos da Precificação.
      </p>

      <div className="mb-6 card max-w-xs">
        <div className="caption">Faturamento total previsto (mês)</div>
        <div className="font-display text-2xl font-bold text-ink">{fmt(faturamentoTotal)}</div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {FRENTES.map(({ key, label }) => {
          const m = porFrente[key];
          const metaValor = m ? Number(m.metaValor) : 0;
          const ticketMedio = m ? Number(m.ticketMedio) : 0;
          const percConversao = m ? Number(m.percConversao) : 0;
          const vendasNecessarias = ticketMedio > 0 ? metaValor / ticketMedio : 0;
          const demandaNecessaria = percConversao > 0 ? (vendasNecessarias / percConversao) * 100 : 0;

          return (
            <form key={key} action={salvarMetaAction} className="card flex flex-col gap-3">
              <input type="hidden" name="frente" value={key} />
              <div className="text-sm font-semibold text-ink">{label}</div>
              <div>
                <label className="label">Meta (R$/mês)</label>
                <input className="input" type="number" step="0.01" name="metaValor" defaultValue={metaValor || ""} />
              </div>
              <div>
                <label className="label">Ticket médio (R$)</label>
                <input className="input" type="number" step="0.01" name="ticketMedio" defaultValue={ticketMedio || ""} />
              </div>
              <div>
                <label className="label">% Conversão</label>
                <input className="input" type="number" step="0.01" name="percConversao" defaultValue={percConversao || ""} />
              </div>
              <div className="rounded-lg bg-surface-100 p-3 text-sm">
                <div className="flex justify-between">
                  <span className="caption">Vendas necessárias</span>
                  <span className="font-medium text-ink">{vendasNecessarias.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="caption">Demanda necessária (leads)</span>
                  <span className="font-medium text-ink">{demandaNecessaria.toFixed(0)}</span>
                </div>
              </div>
              <button className="btn btn-primary justify-center" type="submit">
                Salvar
              </button>
            </form>
          );
        })}
      </div>
    </div>
  );
}
