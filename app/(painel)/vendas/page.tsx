import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireCliente } from "@/lib/session";
import { criarVendaAction, fecharMesAction } from "./actions";

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const FRENTES: Record<string, string> = { VENDA_USINAS: "Venda de Usinas", SERVICOS: "Serviços", MRR: "MRR" };

function limitesMesAtual() {
  const now = new Date();
  const inicio = new Date(now.getFullYear(), now.getMonth(), 1);
  const fim = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { inicio, fim };
}

export default async function VendasPage({ searchParams }: { searchParams: { erro?: string } }) {
  const { empresaId } = await requireCliente();
  const { inicio, fim } = limitesMesAtual();

  const vendas = await prisma.venda.findMany({
    where: { empresaId, data: { gte: inicio, lt: fim } },
    orderBy: { data: "desc" }
  });

  const mesAberto = vendas.length === 0 || vendas.some((v) => !v.mesFechado);
  const mesLabel = inicio.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-ink">Vendas</h1>
        <span className={`chip ${mesAberto ? "chip-open" : "chip-negative"}`}>
          {mesLabel} · {mesAberto ? "Mês aberto" : "Mês fechado"}
        </span>
      </div>
      <p className="caption mb-6">
        Lance cada venda realizada. Enquanto o mês estiver aberto, dá para editar — pedindo o motivo da alteração;
        depois do fechamento, o lançamento fica travado.
      </p>

      {searchParams.erro === "fechado" && (
        <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-negative">
          Esse lançamento já está num mês fechado e não pode mais ser editado.
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-surface-100 text-left text-ink-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Data</th>
              <th className="px-4 py-3 font-medium">Frente</th>
              <th className="px-4 py-3 font-medium">Tipo de serviço</th>
              <th className="px-4 py-3 font-medium">Preço cobrado</th>
              <th className="px-4 py-3 font-medium">Custo variável</th>
              <th className="px-4 py-3 font-medium">Margem</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {vendas.map((v) => (
              <tr key={v.id} className="border-t border-border">
                <td className="px-4 py-3">{v.data.toLocaleDateString("pt-BR")}</td>
                <td className="px-4 py-3">{FRENTES[v.frente]}</td>
                <td className="px-4 py-3">{v.tipoServico || "—"}</td>
                <td className="px-4 py-3">{fmt(Number(v.precoCobrado))}</td>
                <td className="px-4 py-3">{fmt(Number(v.custoVariavel))}</td>
                <td className="px-4 py-3 font-medium text-ink">
                  {fmt(Number(v.precoCobrado) - Number(v.custoVariavel))}
                </td>
                <td className="px-4 py-3 text-right">
                  {v.mesFechado ? (
                    <span className="caption">Travado</span>
                  ) : (
                    <Link href={`/vendas/${v.id}/editar`} className="text-sm text-accent underline">
                      Editar
                    </Link>
                  )}
                </td>
              </tr>
            ))}
            {vendas.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-ink-muted">
                  Nenhuma venda lançada neste mês.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <form action={criarVendaAction} className="card flex flex-col gap-4">
          <div className="text-sm font-semibold text-ink">Nova venda</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Data</label>
              <input className="input" type="date" name="data" required defaultValue={new Date().toISOString().slice(0, 10)} />
            </div>
            <div>
              <label className="label">Frente</label>
              <select className="input" name="frente" required>
                <option value="VENDA_USINAS">Venda de Usinas</option>
                <option value="SERVICOS">Serviços</option>
                <option value="MRR">MRR</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Tipo de serviço (só quando a frente é Serviços)</label>
            <input className="input" name="tipoServico" placeholder="Ex.: Limpeza de painéis" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Preço cobrado (R$)</label>
              <input className="input" type="number" step="0.01" name="precoCobrado" required />
            </div>
            <div>
              <label className="label">Custo variável (R$)</label>
              <input className="input" type="number" step="0.01" name="custoVariavel" />
            </div>
          </div>
          <button className="btn btn-primary justify-center" type="submit">
            Lançar venda
          </button>
        </form>

        {mesAberto && vendas.length > 0 && (
          <form action={fecharMesAction} className="card flex flex-col gap-3 self-start">
            <div className="text-sm font-semibold text-ink">Fechar o mês</div>
            <p className="caption">
              Depois de fechado, nenhuma venda deste mês pode mais ser editada — só consultada.
            </p>
            <input type="hidden" name="inicio" value={inicio.toISOString()} />
            <input type="hidden" name="fim" value={fim.toISOString()} />
            <button className="btn btn-ghost justify-center" type="submit">
              Fechar {mesLabel}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
