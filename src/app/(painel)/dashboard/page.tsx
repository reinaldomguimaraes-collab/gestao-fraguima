import { prisma } from "@/lib/prisma";
import { requireCliente } from "@/lib/session";
import { totaisCustoFixo } from "@/lib/calc/custosFixos";

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const FRENTES: Record<string, string> = { VENDA_USINAS: "Venda de Usinas", SERVICOS: "Serviços", MRR: "MRR" };

function limitesMesAtual() {
  const now = new Date();
  const inicio = new Date(now.getFullYear(), now.getMonth(), 1);
  const fim = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const referencia = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  return { inicio, fim, referencia };
}

export default async function DashboardPage() {
  const { empresaId, nome } = await requireCliente();
  const { inicio, fim, referencia } = limitesMesAtual();

  const [vendas, metas, lancamento, { custoFixoGeral }] = await Promise.all([
    prisma.venda.findMany({ where: { empresaId, data: { gte: inicio, lt: fim } } }),
    prisma.metaFrente.findMany({ where: { empresaId, mesReferencia: referencia } }),
    prisma.lancamentoCaixa.findFirst({ where: { empresaId, mesReferencia: referencia } }),
    totaisCustoFixo(empresaId)
  ]);

  const faturamentoRealizado = vendas.reduce((s, v) => s + Number(v.precoCobrado), 0);
  const custoVariavelRealizado = vendas.reduce((s, v) => s + Number(v.custoVariavel), 0);
  const resultadoMes = faturamentoRealizado - custoVariavelRealizado - custoFixoGeral;

  const saldoAcumulado = await prisma.lancamentoCaixa.findMany({ where: { empresaId } }).then((all) =>
    all.reduce((s, l) => s + (Number(l.receitaRealizada) - Number(l.custoVariavel) - Number(l.custoFixo) - Number(l.impostos)), 0)
  );

  const porFrente = Object.fromEntries(metas.map((m) => [m.frente, m]));
  const vendasPorFrente = Object.fromEntries(
    (["VENDA_USINAS", "SERVICOS", "MRR"] as const).map((f) => [
      f,
      vendas.filter((v) => v.frente === f).reduce((s, v) => s + Number(v.precoCobrado), 0)
    ])
  );

  return (
    <div>
      <h1 className="font-display mb-1 text-xl font-bold text-ink">Olá, {nome.split(" ")[0]}</h1>
      <p className="caption mb-6">Resumo da sua empresa neste mês.</p>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card label="Faturamento do mês" value={fmt(faturamentoRealizado)} />
        <Card label="Custo Fixo do mês" value={fmt(custoFixoGeral)} />
        <Card
          label="Resultado do mês"
          value={fmt(resultadoMes)}
          tone={resultadoMes >= 0 ? "positive" : "negative"}
        />
        <Card label="Saldo acumulado" value={fmt(saldoAcumulado)} tone={saldoAcumulado >= 0 ? "positive" : "negative"} />
      </div>

      <div className="mb-3 text-sm font-semibold text-ink">Metas por frente</div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {(["VENDA_USINAS", "SERVICOS", "MRR"] as const).map((f) => {
          const meta = porFrente[f];
          const metaValor = meta ? Number(meta.metaValor) : 0;
          const realizado = vendasPorFrente[f] || 0;
          const pct = metaValor > 0 ? Math.min(100, (realizado / metaValor) * 100) : 0;
          return (
            <div key={f} className="card">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-ink">{FRENTES[f]}</span>
                <span className="caption">{fmt(realizado)} / {fmt(metaValor)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-100">
                <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Card({ label, value, tone }: { label: string; value: string; tone?: "positive" | "negative" }) {
  return (
    <div className="card">
      <div className="caption">{label}</div>
      <div
        className={`font-display text-xl font-bold ${
          tone === "positive" ? "text-positive" : tone === "negative" ? "text-negative" : "text-ink"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
