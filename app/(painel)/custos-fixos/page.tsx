import Link from "next/link";
import { requireCliente } from "@/lib/session";
import { totaisCustoFixo } from "@/lib/calc/custosFixos";
import { criarCustoFixoAction, desativarCustoFixoAction } from "./actions";

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default async function CustosFixosPage() {
  const { empresaId } = await requireCliente();
  const { totalFolha, totalVeiculos, custoFixoGeral, custoFixoServicos, itens } = await totaisCustoFixo(empresaId);

  return (
    <div>
      <h1 className="font-display mb-1 text-xl font-bold text-ink">Custos Fixos</h1>
      <p className="caption mb-6">
        Lista única: os totais de Funcionários e Veículos (dos Cadastros) entram automaticamente como "Geral",
        somados às despesas gerais cadastradas aqui.
      </p>

      <div className="mb-6 grid grid-cols-2 gap-4 max-w-xl">
        <div className="card">
          <div className="caption">Custo Fixo Geral</div>
          <div className="font-display text-2xl font-bold text-ink">{fmt(custoFixoGeral)}</div>
        </div>
        <div className="card">
          <div className="caption">Custo Fixo Só Serviços</div>
          <div className="font-display text-2xl font-bold text-ink">{fmt(custoFixoServicos)}</div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-surface-100 text-left text-ink-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Item</th>
              <th className="px-4 py-3 font-medium">Valor</th>
              <th className="px-4 py-3 font-medium">Tag</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-border">
              <td className="px-4 py-3 font-semibold text-ink">Folha de Pagamento</td>
              <td className="px-4 py-3">{fmt(totalFolha)}</td>
              <td className="px-4 py-3">
                <span className="chip chip-open">Geral</span>
              </td>
              <td className="px-4 py-3 text-right">
                <Link href="/cadastros?tab=funcionarios" className="text-sm text-accent underline">
                  Ver cadastro →
                </Link>
              </td>
            </tr>
            <tr className="border-t border-border">
              <td className="px-4 py-3 font-semibold text-ink">Veículos</td>
              <td className="px-4 py-3">{fmt(totalVeiculos)}</td>
              <td className="px-4 py-3">
                <span className="chip chip-open">Geral</span>
              </td>
              <td className="px-4 py-3 text-right">
                <Link href="/cadastros?tab=veiculos" className="text-sm text-accent underline">
                  Ver cadastro →
                </Link>
              </td>
            </tr>
            {itens.map((i) => (
              <tr key={i.id} className="border-t border-border">
                <td className="px-4 py-3 font-semibold text-ink">{i.nome}</td>
                <td className="px-4 py-3">{fmt(Number(i.valor))}</td>
                <td className="px-4 py-3">
                  <span className={`chip ${i.tag === "GERAL" ? "chip-open" : "chip-pending"}`}>
                    {i.tag === "GERAL" ? "Geral" : "Só serviços"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <form action={desativarCustoFixoAction}>
                    <input type="hidden" name="id" value={i.id} />
                    <button className="text-sm text-negative underline">Remover</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form action={criarCustoFixoAction} className="card mt-5 grid grid-cols-3 gap-4 max-w-2xl">
        <div>
          <label className="label">Nome da despesa</label>
          <input className="input" name="nome" required placeholder="Aluguel da sede" />
        </div>
        <div>
          <label className="label">Valor mensal (R$)</label>
          <input className="input" name="valor" type="number" step="0.01" required />
        </div>
        <div>
          <label className="label">Tag</label>
          <select className="input" name="tag" defaultValue="GERAL">
            <option value="GERAL">Geral — toda a empresa</option>
            <option value="SO_SERVICOS">Só serviços</option>
          </select>
        </div>
        <div className="col-span-3 flex justify-end">
          <button className="btn btn-primary" type="submit">
            + Adicionar despesa
          </button>
        </div>
      </form>
    </div>
  );
}
