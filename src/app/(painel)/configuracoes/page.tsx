import { prisma } from "@/lib/prisma";
import { requireCliente } from "@/lib/session";
import { salvarPerfilAction } from "./actions";

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

export default async function ConfiguracoesPage() {
  const { empresaId, nome } = await requireCliente();
  const empresa = await prisma.empresa.findUniqueOrThrow({ where: { id: empresaId } });

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

        <div className="card">
          <div className="mb-3 text-sm font-semibold text-ink">Usuários</div>
          <div className="flex items-center justify-between border-b border-border py-2">
            <div>
              <div className="text-sm font-semibold text-ink">{nome}</div>
              <div className="caption">Dono · acesso completo</div>
            </div>
            <span className="chip chip-open">Ativo</span>
          </div>
          <p className="caption mt-3">Convidar outros usuários (ex.: contador) estará disponível a partir da fase 2.</p>
        </div>
      </div>

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
