import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireProprietario } from "@/lib/session";
import { StatusChip } from "@/components/StatusChip";
import { toggleRemovidoAction, reenviarConviteInternoAction } from "./actions";

export default async function EquipePage() {
  const proprietario = await requireProprietario();

  const membros = await prisma.usuarioInterno.findMany({ orderBy: { criadoEm: "asc" } });

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-ink">Equipe</h1>
        <Link href="/administrativo/equipe/novo" className="btn btn-primary">
          + Convidar colaborador
        </Link>
      </div>
      <p className="caption mb-6">
        Visível só para o Proprietário — colaboradores podem cadastrar clientes e bloquear/desbloquear o acesso
        deles, mas não gerenciam quem tem acesso ao Administrativo.
      </p>

      <div className="overflow-hidden rounded-xl border border-border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-surface-100 text-left text-ink-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">E-mail</th>
              <th className="px-4 py-3 font-medium">Papel</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Desde</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {membros.map((m) => {
              const isFixo = m.papel === "PROPRIETARIO";
              return (
                <tr key={m.id} className={`border-t border-border ${m.status === "REMOVIDO" ? "opacity-60" : ""}`}>
                  <td className="px-4 py-3 font-semibold text-ink">{m.nome}</td>
                  <td className="font-mono px-4 py-3 text-ink-muted">{m.email}</td>
                  <td className="px-4 py-3">{isFixo ? "Proprietário" : "Colaborador"}</td>
                  <td className="px-4 py-3">
                    <StatusChip status={m.status} />
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{m.criadoEm.toLocaleDateString("pt-BR")}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    {isFixo ? (
                      <span className="caption">—</span>
                    ) : (
                      <>
                        {m.status === "PENDENTE" && (
                          <form action={reenviarConviteInternoAction} className="inline">
                            <input type="hidden" name="id" value={m.id} />
                            <button className="text-sm font-medium text-accent underline">Reenviar convite</button>
                          </form>
                        )}
                        <form action={toggleRemovidoAction} className="ml-3 inline">
                          <input type="hidden" name="id" value={m.id} />
                          <button
                            className={`text-sm font-medium underline ${
                              m.status === "REMOVIDO" ? "text-positive" : "text-negative"
                            }`}
                          >
                            {m.status === "REMOVIDO" ? "Reativar acesso" : "Remover acesso"}
                          </button>
                        </form>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="card mt-5 max-w-xl">
        <div className="mb-2 text-sm font-semibold text-ink">Nota de produto</div>
        <p className="caption">
          O Proprietário é único por conta (quem assinou o contrato com a Duo Fraguima) e não pode ser removido por
          aqui. Colaboradores entram e saem livremente, convidados pelo Proprietário.
        </p>
      </div>
    </div>
  );
}
