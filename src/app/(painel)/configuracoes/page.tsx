import { prisma } from "@/lib/prisma";
import { requireCliente } from "@/lib/session";
import { salvarPerfilAction, toggleRemovidoMembroAction, reenviarConviteMembroAction } from "./actions";
import { StatusChip } from "@/components/StatusChip";
import { AlterarSenhaForm } from "./AlterarSenhaForm";
import { ConvidarMembroForm } from "./ConvidarMembroForm";

const SECOES = [
  { titulo: "Dashboard", texto: "Resumo da saúde financeira do mês: meta batida, saldo de caixa e resultado do período." },
  { titulo: "Parâmetros da Empresa", texto: "Regime tributário, percentuais padrão, horas úteis/mês e comissões por canal — o padrão usado em Precificação." },
  { titulo: "Cadastros", texto: "Funcionários, veículos e terceirizados — Custo Mensal e Valor Hora calculados automaticamente." },
  { titulo: "Custos Fixos", texto: "Lista única de despesas gerais, somada aos totais de Funcionários e Veículos dos Cadastros." },
  { titulo: "Metas Comerciais", texto: "Meta, ticket médio e % de conversão de cada frente — Venda de Usinas, Serviços e MRR." },
  { titulo: "Vendas", texto: "Lançamento de vendas por frente, editável enquanto o mês está aberto, com log de auditoria." },
  { titulo: "Precificação", texto: "Duas calculadoras — Venda de Usina e Serviços — pela cascata de percentuais sobre o custo." },
  { titulo: "Fluxo de Caixa", texto: "Entradas e saídas projetadas x realizadas, com o saldo acumulado." },
  { titulo: "Plano de Negócio", texto: "Em breve — documento guiado com missão, diferenciais e análise de mercado simples." }
];

function statusMembro(u: { removidoEm: Date | null; senhaHash: string | null; googleId: string | null }) {
  if (u.removidoEm) return "REMOVIDO";
  if (!u.senhaHash && !u.googleId) return "PENDENTE";
  return "ATIVO";
}

export default async function ConfiguracoesPage() {
  const { id, empresaId, nome, papel, impersonadoPor } = await requireCliente();
  const empresa = await prisma.empresa.findUniqueOrThrow({ where: { id: empresaId } });
  const membros = await prisma.usuario.findMany({ where: { empresaId }, orderBy: { criadoEm: "asc" } });
  // Em modo suporte não existe um Usuario de verdade por trás da sessão — sem
  // senha de ninguém específico para trocar.
  const usuarioAtual = impersonadoPor ? null : await prisma.usuario.findUnique({ where: { id } });

  return (
    <div className="max-w-2xl">
      <h1 className="font-display mb-6 text-xl font-bold text-ink">Configurações</h1>

      <div className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <form action={salvarPerfilAction} className="card flex flex-col gap-3">
          <div className="text-sm font-semibold text-ink">Perfil da empresa</div>
          <div>
            <label className="label">Nome da empresa</label>
            <input className="input" name="nome" defaultValue={empresa.nome} />
          </div>
          <div>
            <label className="label">CNPJ</label>
            <input className="input font-mono" name="cnpj" defaultValue={empresa.cnpj || ""} />
          </div>
          <div>
            <label className="label">Responsável</label>
            <input className="input" name="responsavel" defaultValue={empresa.responsavel} />
          </div>
          <button className="btn btn-primary mt-1 self-start" type="submit">
            Salvar alterações
          </button>
        </form>

        <div className="card flex flex-col gap-3">
          <div className="text-sm font-semibold text-ink">Usuários</div>
          {membros.map((m) => (
            <div key={m.id} className="flex items-center justify-between border-b border-border py-2 last:border-0">
              <div>
                <div className="text-sm font-semibold text-ink">{m.nome}</div>
                <div className="caption">{m.papel === "DONO" ? "Dono · acesso completo" : "Membro"}</div>
              </div>
              <div className="flex items-center gap-3">
                <StatusChip status={statusMembro(m)} />
                {papel === "DONO" && m.papel !== "DONO" && (
                  <>
                    {statusMembro(m) === "PENDENTE" && (
                      <form action={reenviarConviteMembroAction}>
                        <input type="hidden" name="id" value={m.id} />
                        <button className="text-sm font-medium text-accent underline">Reenviar</button>
                      </form>
                    )}
                    <form action={toggleRemovidoMembroAction}>
                      <input type="hidden" name="id" value={m.id} />
                      <button
                        className={`text-sm font-medium underline ${
                          m.removidoEm ? "text-positive" : "text-negative"
                        }`}
                      >
                        {m.removidoEm ? "Reativar" : "Remover"}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          ))}
          {papel === "DONO" ? (
            <ConvidarMembroForm />
          ) : (
            <p className="caption border-t border-border pt-3">Só o Dono pode convidar ou remover usuários.</p>
          )}
        </div>
      </div>

      {usuarioAtual && (
        <div className="mb-8 max-w-md">
          <AlterarSenhaForm temSenha={!!usuarioAtual.senhaHash} />
        </div>
      )}

      <div className="mb-3 text-sm font-semibold text-ink">Como funciona o Duo Fraguima Gestão Empresarial</div>
      <div className="mb-6 flex flex-col gap-2">
        {SECOES.map((s) => (
          <details key={s.titulo} className="card">
            <summary className="cursor-pointer text-sm font-medium text-ink">{s.titulo}</summary>
            <p className="caption mt-2">{s.texto}</p>
          </details>
        ))}
      </div>

      <a href="/onboarding" className="btn btn-ghost">
        Rever tour de boas-vindas
      </a>
    </div>
  );
}
