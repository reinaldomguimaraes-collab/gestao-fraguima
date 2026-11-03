import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireCliente } from "@/lib/session";
import { editarVendaAction } from "../../actions";

export default async function EditarVendaPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { erro?: string };
}) {
  const { empresaId } = await requireCliente();
  const venda = await prisma.venda.findFirst({ where: { id: params.id, empresaId } });
  if (!venda) redirect("/vendas");
  if (venda.mesFechado) redirect("/vendas?erro=fechado");

  return (
    <div className="max-w-lg">
      <h1 className="font-display mb-1 text-xl font-bold text-ink">Editar venda</h1>
      <p className="caption mb-6">Toda edição enquanto o mês está aberto pede o motivo, para manter o histórico de auditoria.</p>

      {searchParams.erro === "motivo" && (
        <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-negative">
          Informe o motivo da alteração.
        </div>
      )}

      <form action={editarVendaAction} className="card flex flex-col gap-4">
        <input type="hidden" name="id" value={venda.id} />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Data</label>
            <input className="input" type="date" name="data" required defaultValue={venda.data.toISOString().slice(0, 10)} />
          </div>
          <div>
            <label className="label">Frente</label>
            <select className="input" name="frente" defaultValue={venda.frente} required>
              <option value="VENDA_USINAS">Venda de Usinas</option>
              <option value="SERVICOS">Serviços</option>
              <option value="MRR">MRR</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label">Tipo de serviço</label>
          <input className="input" name="tipoServico" defaultValue={venda.tipoServico || ""} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Preço cobrado (R$)</label>
            <input className="input" type="number" step="0.01" name="precoCobrado" defaultValue={venda.precoCobrado.toString()} required />
          </div>
          <div>
            <label className="label">Custo variável (R$)</label>
            <input className="input" type="number" step="0.01" name="custoVariavel" defaultValue={venda.custoVariavel.toString()} />
          </div>
        </div>
        <div>
          <label className="label">Motivo da alteração</label>
          <input className="input" name="motivo" required placeholder="Ex.: valor lançado errado" />
        </div>
        <div className="mt-2 flex justify-end gap-3">
          <Link href="/vendas" className="btn btn-ghost">
            Cancelar
          </Link>
          <button className="btn btn-primary" type="submit">
            Salvar alteração
          </button>
        </div>
      </form>
    </div>
  );
}
