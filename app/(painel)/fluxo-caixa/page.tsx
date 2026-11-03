import { prisma } from "@/lib/prisma";
import { requireCliente } from "@/lib/session";
import { totaisCustoFixo } from "@/lib/calc/custosFixos";
import { salvarLancamentoAction } from "./actions";

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function mesAtual() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function labelMes(mesReferencia: string) {
  const [ano, mes] = mesReferencia.split("-").map(Number);
  return new Date(ano, mes - 1, 1).toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
}

export default async function FluxoCaixaPage() {
  const { empresaId } = await requireCliente();
  const mesReferencia = mesAtual();

  const [lancamentos, { custoFixoGeral }] = await Promise.all([
    prisma.lancamentoCaixa.findMany({ where: { empresaId }, orderBy: { mesReferencia: "asc" } }),
    totaisCustoFixo(empresaId)
  ]);

  const atual = lancamentos.find((l) => l.mesReferencia === mesReferencia);

  let acumulado = 0;
  const linhas = lancamentos.map((l) => {
    const resultadoPrevisto = Number(l.receitaPrevista) - Number(l.custoVariavel) - Number(l.custoFixo) - Number(l.impostos);
    const resultadoRealizado = Number(l.receitaRealizada) - Number(l.custoVariavel) - Number(l.custoFixo) - Number(l.impostos);
    acumulado += resultadoRealizado;
    return { ...l, resultadoPrevisto, resultadoRealizado, variacao: resultadoRealizado - resultadoPrevisto, acumulado };
  });

  return (
    <div>
      <h1 className="font-display mb-1 text-xl font-bold text-ink">Fluxo de Caixa</h1>
      <p className="caption mb-6">Entradas e saídas projetadas x realizadas, mês a mês, com o saldo acumulado.</p>

      <div className="mb-6 overflow-x-auto rounded-xl border border-border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-surface-100 text-left text-ink-muted">
            <tr>
              <th className="px-3 py-3 font-medium">Mês</th>
              <th className="px-3 py-3 font-medium">Receita prevista</th>
              <th className="px-3 py-3 font-medium">Receita realizada</th>
              <th className="px-3 py-3 font-medium">Resultado previsto</th>
              <th className="px-3 py-3 font-medium">Resultado realizado</th>
              <th className="px-3 py-3 font-medium">Variação</th>
              <th className="px-3 py-3 font-medium">Saldo acumulado</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => (
              <tr key={l.mesReferencia} className="border-t border-border">
                <td className="px-3 py-3 font-semibold text-ink">{labelMes(l.mesReferencia)}</td>
                <td className="px-3 py-3">{fmt(Number(l.receitaPrevista))}</td>
                <td className="px-3 py-3">{fmt(Number(l.receitaRealizada))}</td>
                <td className="px-3 py-3">{fmt(l.resultadoPrevisto)}</td>
                <td className="px-3 py-3">{fmt(l.resultadoRealizado)}</td>
                <td className={`px-3 py-3 font-medium ${l.variacao >= 0 ? "text-positive" : "text-negative"}`}>
                  {fmt(l.variacao)}
                </td>
                <td className="px-3 py-3 font-semibold text-ink">{fmt(l.acumulado)}</td>
              </tr>
            ))}
            {linhas.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-ink-muted">
                  Nenhum lançamento ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <form action={salvarLancamentoAction} className="card max-w-xl">
        <div className="mb-3 text-sm font-semibold text-ink">Lançamento do mês atual ({labelMes(mesReferencia)})</div>
        <input type="hidden" name="mesReferencia" value={mesReferencia} />
        <div className="grid grid-cols-2 gap-4">
          <Campo label="Receita prevista (R$)" name="receitaPrevista" defaultValue={atual?.receitaPrevista.toString()} />
          <Campo label="Receita realizada (R$)" name="receitaRealizada" defaultValue={atual?.receitaRealizada.toString()} />
          <Campo
            label="Custo fixo (R$)"
            name="custoFixo"
            defaultValue={atual?.custoFixo.toString() ?? custoFixoGeral.toFixed(2)}
          />
          <Campo label="Custo variável (R$)" name="custoVariavel" defaultValue={atual?.custoVariavel.toString()} />
          <Campo label="Impostos (R$)" name="impostos" defaultValue={atual?.impostos.toString()} />
        </div>
        <div className="mt-4 flex justify-end">
          <button className="btn btn-primary" type="submit">
            Salvar lançamento
          </button>
        </div>
      </form>
    </div>
  );
}

function Campo({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input className="input" type="number" step="0.01" name={name} defaultValue={defaultValue || ""} />
    </div>
  );
}
