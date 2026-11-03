import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireInterno } from "@/lib/session";
import { StatusChip } from "@/components/StatusChip";
import { toggleBloqueioAction, reenviarConviteClienteAction } from "./actions";

export default async function AdministrativoPage() {
  await requireInterno();

  const empresas = await prisma.empresa.findMany({
    orderBy: { criadoEm: "asc" },
    include: { usuarios: { select: { id: true }, take: 1 } }
  });

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-ink">Clientes</h1>
        <Link href="/administrativo/novo" className="btn btn-primary">
          + Novo cliente
        </Link>
      </div>
      <p className="caption mb-6">
        Cadastro feito pela equipe Duo Fraguima — o cliente recebe o acesso por e-mail e pode convidar outros
        usuários da empresa dele a partir da fase 2.
      </p>

      <div className="overflow-hidden rounded-xl border border-border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-surface-100 text-left text-ink-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Empresa</th>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Responsável</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Desde</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {empresas.map((e) => (
              <tr key={e.id} className={`border-t border-border ${e.status === "BLOQUEADO" ? "opacity-60" : ""}`}>
                <td className="px-4 py-3 font-semibold text-ink">{e.nome}</td>
                <td className="font-mono px-4 py-3 text-ink-muted">{e.codigo}</td>
                <td className="px-4 py-3">{e.responsavel}</td>
                <td className="px-4 py-3">
                  <StatusChip status={e.status} />
                </td>
                <td className="px-4 py-3 text-ink-muted">{e.criadoEm.toLocaleDateString("pt-BR")}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  {e.status === "PENDENTE" && (
                    <form action={reenviarConviteClienteAction} className="inline">
                      <input type="hidden" name="empresaId" value={e.id} />
                      <button className="text-sm font-medium text-accent underline">Reenviar convite</button>
                    </form>
                  )}
                  <form action={toggleBloqueioAction} className="ml-3 inline">
                    <input type="hidden" name="empresaId" value={e.id} />
                    <button
                      className={`text-sm font-medium underline ${
                        e.status === "BLOQUEADO" ? "text-positive" : "text-negative"
                      }`}
                    >
                      {e.status === "BLOQUEADO" ? "Desbloquear acesso" : "Bloquear acesso"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card mt-5 max-w-xl">
        <div className="mb-2 text-sm font-semibold text-ink">Nota de produto</div>
        <p className="caption">
          Múltiplos usuários por empresa (ex.: dono + contador) ficam disponíveis a partir da fase 2 — no MVP cada
          empresa opera com 1 usuário.
        </p>
      </div>
    </div>
  );
}
