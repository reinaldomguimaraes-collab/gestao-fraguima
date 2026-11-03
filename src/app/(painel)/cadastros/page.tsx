import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireCliente } from "@/lib/session";
import { custoMensalFuncionario, custoMensalVeiculo, valorHora } from "@/lib/calc/valorHora";
import {
  criarFuncionarioAction,
  desativarFuncionarioAction,
  criarVeiculoAction,
  desativarVeiculoAction,
  criarTerceirizadoAction,
  desativarTerceirizadoAction
} from "./actions";

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default async function CadastrosPage({ searchParams }: { searchParams: { tab?: string } }) {
  const { empresaId } = await requireCliente();
  const tab = searchParams.tab === "veiculos" || searchParams.tab === "terceirizados" ? searchParams.tab : "funcionarios";

  const [parametros, funcionarios, veiculos, terceirizados] = await Promise.all([
    prisma.parametrosEmpresa.upsert({ where: { empresaId }, update: {}, create: { empresaId } }),
    prisma.funcionario.findMany({ where: { empresaId, ativo: true }, orderBy: { criadoEm: "asc" } }),
    prisma.veiculo.findMany({ where: { empresaId, ativo: true }, orderBy: { criadoEm: "asc" } }),
    prisma.terceirizado.findMany({ where: { empresaId, ativo: true }, orderBy: { criadoEm: "asc" } })
  ]);

  const horasUteis = Number(parametros.horasUteisMes);

  return (
    <div>
      <h1 className="font-display mb-1 text-xl font-bold text-ink">Cadastros</h1>
      <p className="caption mb-6">
        Cadastre uma vez — o Custo Mensal e o Valor Hora de cada um são calculados automaticamente e ficam
        disponíveis para usar em qualquer venda ou serviço.
      </p>

      <div className="mb-6 flex gap-2">
        <TabLink tab="funcionarios" current={tab} label="Funcionários" />
        <TabLink tab="veiculos" current={tab} label="Veículos" />
        <TabLink tab="terceirizados" current={tab} label="Terceirizados" />
      </div>

      {tab === "funcionarios" && (
        <section>
          <div className="overflow-hidden rounded-xl border border-border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-surface-100 text-left text-ink-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Nome</th>
                  <th className="px-4 py-3 font-medium">Função</th>
                  <th className="px-4 py-3 font-medium">Custo mensal</th>
                  <th className="px-4 py-3 font-medium">Valor hora</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {funcionarios.map((f) => {
                  const custo = custoMensalFuncionario(f);
                  return (
                    <tr key={f.id} className="border-t border-border">
                      <td className="px-4 py-3 font-semibold text-ink">{f.nome}</td>
                      <td className="px-4 py-3">{f.funcao}</td>
                      <td className="px-4 py-3">{fmt(custo)}</td>
                      <td className="px-4 py-3">{fmt(valorHora(custo, horasUteis))}/h</td>
                      <td className="px-4 py-3 text-right">
                        <form action={desativarFuncionarioAction}>
                          <input type="hidden" name="id" value={f.id} />
                          <button className="text-sm text-negative underline">Remover</button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
                {funcionarios.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-ink-muted">
                      Nenhum funcionário cadastrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <form action={criarFuncionarioAction} className="card mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
            <Campo label="Nome" name="nome" required />
            <Campo label="Função" name="funcao" required />
            <Campo label="Salário base (R$)" name="salarioBase" type="number" />
            <Campo label="% Encargos" name="percEncargos" type="number" />
            <Campo label="VA/VR (R$)" name="valeAlimentacao" type="number" />
            <Campo label="Vale transporte (R$)" name="valeTransporte" type="number" />
            <Campo label="Plano de saúde (R$)" name="planoSaude" type="number" />
            <Campo label="Bonificação (R$)" name="bonificacao" type="number" />
            <div className="flex items-end">
              <button className="btn btn-primary w-full justify-center" type="submit">
                + Adicionar funcionário
              </button>
            </div>
          </form>
        </section>
      )}

      {tab === "veiculos" && (
        <section>
          <div className="overflow-hidden rounded-xl border border-border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-surface-100 text-left text-ink-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Nome</th>
                  <th className="px-4 py-3 font-medium">Custo mensal</th>
                  <th className="px-4 py-3 font-medium">Valor hora</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {veiculos.map((v) => {
                  const custo = custoMensalVeiculo(v);
                  return (
                    <tr key={v.id} className="border-t border-border">
                      <td className="px-4 py-3 font-semibold text-ink">{v.nome}</td>
                      <td className="px-4 py-3">{fmt(custo)}</td>
                      <td className="px-4 py-3">{fmt(valorHora(custo, horasUteis))}/h</td>
                      <td className="px-4 py-3 text-right">
                        <form action={desativarVeiculoAction}>
                          <input type="hidden" name="id" value={v.id} />
                          <button className="text-sm text-negative underline">Remover</button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
                {veiculos.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-ink-muted">
                      Nenhum veículo cadastrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <form action={criarVeiculoAction} className="card mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
            <Campo label="Nome" name="nome" required />
            <Campo label="Valor do veículo — referência (R$)" name="valorVeiculo" type="number" />
            <Campo label="Seguro (R$/mês)" name="seguroMensal" type="number" />
            <Campo label="IPVA mensal (R$)" name="ipvaMensal" type="number" />
            <Campo label="Manutenção (R$/mês)" name="manutencao" type="number" />
            <div className="flex items-end">
              <button className="btn btn-primary w-full justify-center" type="submit">
                + Adicionar veículo
              </button>
            </div>
          </form>
          <p className="caption mt-2">
            O valor do veículo é só referência — não entra no custo mensal (sem depreciação). O IPVA já é lançado
            como valor mensal direto.
          </p>
        </section>
      )}

      {tab === "terceirizados" && (
        <section>
          <div className="overflow-hidden rounded-xl border border-border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-surface-100 text-left text-ink-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Nome</th>
                  <th className="px-4 py-3 font-medium">Valor por diária</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {terceirizados.map((t) => (
                  <tr key={t.id} className="border-t border-border">
                    <td className="px-4 py-3 font-semibold text-ink">{t.nome}</td>
                    <td className="px-4 py-3">{fmt(Number(t.valorDiaria))}</td>
                    <td className="px-4 py-3 text-right">
                      <form action={desativarTerceirizadoAction}>
                        <input type="hidden" name="id" value={t.id} />
                        <button className="text-sm text-negative underline">Remover</button>
                      </form>
                    </td>
                  </tr>
                ))}
                {terceirizados.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-ink-muted">
                      Nenhum terceirizado cadastrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <form action={criarTerceirizadoAction} className="card mt-5 grid grid-cols-2 gap-4">
            <Campo label="Nome" name="nome" required />
            <Campo label="Valor por diária (R$)" name="valorDiaria" type="number" />
            <div className="col-span-2 flex justify-end">
              <button className="btn btn-primary" type="submit">
                + Adicionar terceirizado
              </button>
            </div>
          </form>
          <p className="caption mt-2">
            Mão de obra terceirizada é puxada manualmente em vendas/serviços específicos — não entra no Custo Fixo.
          </p>
        </section>
      )}
    </div>
  );
}

function TabLink({ tab, current, label }: { tab: string; current: string; label: string }) {
  const active = tab === current;
  return (
    <Link
      href={`/cadastros?tab=${tab}`}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
        active ? "bg-ink text-white" : "bg-white text-ink-muted border border-border"
      }`}
    >
      {label}
    </Link>
  );
}

function Campo({
  label,
  name,
  type = "text",
  required = false
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input className="input" name={name} type={type} step={type === "number" ? "0.01" : undefined} required={required} />
    </div>
  );
}
