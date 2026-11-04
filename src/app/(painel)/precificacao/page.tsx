import { prisma } from "@/lib/prisma";
import { requireCliente } from "@/lib/session";
import { percentuaisAuto, calcularPreco } from "@/lib/calc/precificacao";
import { custoMensalFuncionario, custoMensalVeiculo, valorHora } from "@/lib/calc/valorHora";
import { valorItemMaoDeObra, unidadeMaoDeObra } from "@/lib/calc/custoServico";
import {
  criarServicoAction,
  desativarServicoAction,
  adicionarMaoDeObraAction,
  removerMaoDeObraAction,
  adicionarInsumoAction,
  removerInsumoAction
} from "./actions";

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtPerc = (v: number) => `${v.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;

export default async function PrecificacaoPage({
  searchParams
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const { empresaId } = await requireCliente();
  const isServico = searchParams.tab === "servico";

  const [auto, parametros] = await Promise.all([
    percentuaisAuto(empresaId),
    prisma.parametrosEmpresa.upsert({ where: { empresaId }, update: {}, create: { empresaId } })
  ]);
  const horasUteis = Number(parametros.horasUteisMes);

  // --- Dados do construtor de custo de Serviços (só carregados na aba Serviços) ---
  let servicos: { id: string; nome: string; custoVariavel: unknown }[] = [];
  let servicoSelecionado: { id: string; nome: string; custoVariavel: unknown } | null = null;
  let maoDeObra: Awaited<ReturnType<typeof carregarMaoDeObra>> = [];
  let insumos: { id: string; descricao: string; valor: unknown }[] = [];
  let funcionarios: Awaited<ReturnType<typeof prisma.funcionario.findMany>> = [];
  let veiculos: Awaited<ReturnType<typeof prisma.veiculo.findMany>> = [];
  let terceirizados: Awaited<ReturnType<typeof prisma.terceirizado.findMany>> = [];

  if (isServico) {
    [servicos, funcionarios, veiculos, terceirizados] = await Promise.all([
      prisma.produtoServico.findMany({ where: { empresaId, frente: "SERVICOS", ativo: true }, orderBy: { nome: "asc" } }),
      prisma.funcionario.findMany({ where: { empresaId, ativo: true }, orderBy: { nome: "asc" } }),
      prisma.veiculo.findMany({ where: { empresaId, ativo: true }, orderBy: { nome: "asc" } }),
      prisma.terceirizado.findMany({ where: { empresaId, ativo: true }, orderBy: { nome: "asc" } })
    ]);

    const servicoIdSelecionado = searchParams.servicoId || servicos[0]?.id || "";
    servicoSelecionado = servicos.find((s) => s.id === servicoIdSelecionado) || null;

    if (servicoSelecionado) {
      [maoDeObra, insumos] = await Promise.all([
        carregarMaoDeObra(servicoSelecionado.id),
        prisma.servicoInsumo.findMany({ where: { produtoServicoId: servicoSelecionado.id }, orderBy: { criadoEm: "asc" } })
      ]);
    }
  }

  const num = (key: string, fallback: number) =>
    searchParams[key] !== undefined && searchParams[key] !== "" ? Number(searchParams[key]) : fallback;

  const perc = {
    ...auto,
    impostos: num("impostos", auto.impostos),
    risco: num("risco", auto.risco),
    cartao: num("cartao", auto.cartao),
    fatorInstalacao: num("fatorInstalacao", auto.fatorInstalacao),
    lucro: num("lucro", auto.lucro)
  };

  const custoPadrao = isServico && servicoSelecionado ? Number(servicoSelecionado.custoVariavel) : 0;
  const custo = num("custo", custoPadrao);
  const comissaoIndicacao = Number(parametros.comissaoIndicacao);

  const resultado = calcularPreco({ custo, perc, isServico, comissaoIndicacao });

  return (
    <div>
      <h1 className="font-display mb-1 text-xl font-bold text-ink">Precificação</h1>
      <p className="caption mb-6">
        Preço = custo ÷ (1 − soma dos percentuais). Custo Fixo e Comercial são calculados automaticamente a partir
        dos seus Custos Fixos e das Metas Comerciais do mês; os demais percentuais vêm de Parâmetros da Empresa, mas
        podem ser ajustados só para esta venda.
      </p>

      <div className="mb-6 flex gap-2">
        <TabLink isServico={false} current={isServico} />
        <TabLink isServico={true} current={isServico} />
      </div>

      {isServico && (
        <div className="card mb-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {servicos.map((s) => (
              <a
                key={s.id}
                href={`/precificacao?tab=servico&servicoId=${s.id}`}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                  servicoSelecionado?.id === s.id ? "bg-ink text-white" : "border border-border bg-white text-ink-muted"
                }`}
              >
                {s.nome}
              </a>
            ))}
            {servicos.length === 0 && <span className="caption">Nenhum serviço cadastrado ainda.</span>}
          </div>

          <form action={criarServicoAction} className="flex gap-2">
            <input className="input flex-1" name="nome" placeholder="Nome do novo serviço (ex.: Limpeza de Painéis)" required />
            <button className="btn btn-primary" type="submit">
              + Novo serviço
            </button>
          </form>

          {servicoSelecionado && (
            <>
              <div className="mt-5 flex items-center justify-between">
                <div className="text-sm font-semibold text-ink">Editando: {servicoSelecionado.nome}</div>
                <form action={desativarServicoAction}>
                  <input type="hidden" name="id" value={servicoSelecionado.id} />
                  <button className="text-sm text-negative underline">Remover este serviço</button>
                </form>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-border p-4">
                  <div className="mb-2 text-sm font-semibold text-ink">Mão de obra e logística</div>
                  <table className="w-full text-sm">
                    <tbody>
                      {maoDeObra.map((item) => (
                        <tr key={item.id} className="border-t border-border">
                          <td className="py-2 text-ink-muted">
                            {labelMaoDeObra(item)}{" "}
                            <span className="caption">
                              ({Number(item.quantidade)} {unidadeMaoDeObra(item)})
                            </span>
                          </td>
                          <td className="py-2 text-right font-medium text-ink">
                            {fmt(valorItemMaoDeObra(item, horasUteis))}
                          </td>
                          <td className="py-2 pl-2 text-right">
                            <form action={removerMaoDeObraAction}>
                              <input type="hidden" name="id" value={item.id} />
                              <button className="text-xs text-negative underline">remover</button>
                            </form>
                          </td>
                        </tr>
                      ))}
                      {maoDeObra.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-2 text-ink-muted">
                            Nenhum item ainda.
                          </td>
                        </tr>
                      )}
                      <tr className="border-t border-border">
                        <td className="py-2 font-semibold text-ink">Total</td>
                        <td className="py-2 text-right font-semibold text-ink">
                          {fmt(maoDeObra.reduce((s, item) => s + valorItemMaoDeObra(item, horasUteis), 0))}
                        </td>
                        <td />
                      </tr>
                    </tbody>
                  </table>

                  <form action={adicionarMaoDeObraAction} className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
                    <input type="hidden" name="produtoServicoId" value={servicoSelecionado.id} />
                    <label className="label">+ Adicionar do cadastro</label>
                    <select className="input" name="origemRef" defaultValue="">
                      <option value="" disabled>
                        Selecione...
                      </option>
                      {funcionarios.length > 0 && (
                        <optgroup label="Funcionários (valor por hora)">
                          {funcionarios.map((f) => (
                            <option key={f.id} value={`FUNCIONARIO:${f.id}`}>
                              {f.nome} — {fmt(valorHora(custoMensalFuncionario(f), horasUteis))}/h
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {veiculos.length > 0 && (
                        <optgroup label="Veículos (valor por hora)">
                          {veiculos.map((v) => (
                            <option key={v.id} value={`VEICULO:${v.id}`}>
                              {v.nome} — {fmt(valorHora(custoMensalVeiculo(v), horasUteis))}/h
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {terceirizados.length > 0 && (
                        <optgroup label="Terceirizados">
                          {terceirizados.map((t) => (
                            <option key={t.id} value={`TERCEIRIZADO:${t.id}`}>
                              {t.nome} —{" "}
                              {t.tipoCobranca === "PLACA"
                                ? `${fmt(Number(t.valorPlaca))}/placa`
                                : `${fmt(Number(t.valorDiaria))}/diária`}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                    <input className="input" type="number" step="0.01" name="quantidade" placeholder="Quantidade (horas, diárias ou placas)" defaultValue={1} />
                    <button className="btn btn-ghost justify-center" type="submit">
                      + Adicionar do cadastro
                    </button>
                  </form>

                  <form action={adicionarMaoDeObraAction} className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
                    <input type="hidden" name="produtoServicoId" value={servicoSelecionado.id} />
                    <input type="hidden" name="origemRef" value="AVULSO" />
                    <label className="label">+ Item avulso</label>
                    <input className="input" name="descricao" placeholder="Descrição (ex.: Ajudante extra)" />
                    <div className="grid grid-cols-2 gap-2">
                      <input className="input" type="number" step="0.01" name="valorUnitario" placeholder="Valor unitário (R$)" />
                      <input className="input" type="number" step="0.01" name="quantidade" placeholder="Qtd." defaultValue={1} />
                    </div>
                    <button className="btn btn-ghost justify-center" type="submit">
                      + Adicionar item avulso
                    </button>
                  </form>
                </div>

                <div className="rounded-xl border border-border p-4">
                  <div className="mb-2 text-sm font-semibold text-ink">Insumos e materiais</div>
                  <table className="w-full text-sm">
                    <tbody>
                      {insumos.map((i) => (
                        <tr key={i.id} className="border-t border-border">
                          <td className="py-2 text-ink-muted">{i.descricao}</td>
                          <td className="py-2 text-right font-medium text-ink">{fmt(Number(i.valor))}</td>
                          <td className="py-2 pl-2 text-right">
                            <form action={removerInsumoAction}>
                              <input type="hidden" name="id" value={i.id} />
                              <button className="text-xs text-negative underline">remover</button>
                            </form>
                          </td>
                        </tr>
                      ))}
                      {insumos.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-2 text-ink-muted">
                            Nenhum insumo ainda.
                          </td>
                        </tr>
                      )}
                      <tr className="border-t border-border">
                        <td className="py-2 font-semibold text-ink">Total</td>
                        <td className="py-2 text-right font-semibold text-ink">
                          {fmt(insumos.reduce((s, i) => s + Number(i.valor), 0))}
                        </td>
                        <td />
                      </tr>
                    </tbody>
                  </table>

                  <form action={adicionarInsumoAction} className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
                    <input type="hidden" name="produtoServicoId" value={servicoSelecionado.id} />
                    <label className="label">+ Adicionar insumo</label>
                    <input className="input" name="descricao" placeholder="Descrição (ex.: Produto de limpeza)" />
                    <input className="input" type="number" step="0.01" name="valor" placeholder="Valor (R$)" />
                    <button className="btn btn-ghost justify-center" type="submit">
                      + Adicionar insumo
                    </button>
                  </form>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-surface-100 px-4 py-3">
                <div className="caption">Custo variável total deste serviço</div>
                <div className="font-display text-2xl font-bold text-ink">{fmt(Number(servicoSelecionado.custoVariavel))}</div>
              </div>
              <p className="caption mt-2">
                Esse valor já entra preenchido no campo “Custo do serviço” da calculadora abaixo — mas você ainda pode
                ajustá-lo manualmente ali antes de calcular.
              </p>
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <form className="card flex flex-col gap-4" method="get">
          <input type="hidden" name="tab" value={isServico ? "servico" : "usina"} />
          {isServico && servicoSelecionado && <input type="hidden" name="servicoId" value={servicoSelecionado.id} />}
          <div>
            <label className="label">{isServico ? "Custo do serviço (mão de obra + insumos)" : "Custo (equipamento + instalação)"}</label>
            <input className="input" type="number" step="0.01" name="custo" defaultValue={custo || ""} placeholder="0,00" />
          </div>

          <div className="text-sm font-semibold text-ink">Percentuais automáticos</div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <AutoBadge label="Custo fixo" value={perc.custoFixo + (isServico ? perc.custoFixoServicos : 0)} />
            <AutoBadge label="Comercial" value={perc.comercial} />
          </div>

          <div className="text-sm font-semibold text-ink">Percentuais editáveis (só nesta venda)</div>
          <div className="grid grid-cols-2 gap-3">
            <Campo label="% Impostos" name="impostos" defaultValue={perc.impostos} />
            <Campo label="% Risco de retorno" name="risco" defaultValue={perc.risco} />
            <Campo label="% Taxa de cartão" name="cartao" defaultValue={perc.cartao} />
            <Campo label="% Fator instalação" name="fatorInstalacao" defaultValue={perc.fatorInstalacao} />
            <Campo label="% Lucro desejado" name="lucro" defaultValue={perc.lucro} />
          </div>

          <button className="btn btn-primary justify-center" type="submit">
            Calcular
          </button>
        </form>

        <div className="card">
          {resultado.acimaDoLimite ? (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-negative">
              A soma dos percentuais chegou a {fmtPerc(resultado.somaPercentuais)} — isso não tem solução (o preço
              ficaria infinito). Reduza algum percentual ou revise o Custo Fixo e as Metas Comerciais.
            </div>
          ) : (
            <>
              <div className="mb-4">
                <div className="caption">Preço de venda</div>
                <div className="font-display text-3xl font-bold text-ink">{fmt(resultado.precoVenda)}</div>
              </div>
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <div className="caption">Preço mínimo (sem lucro)</div>
                  <div className="text-lg font-semibold text-ink">{fmt(resultado.precoMinimo)}</div>
                </div>
                <div>
                  <div className="caption">Com comissão de indicação</div>
                  <div className="text-lg font-semibold text-ink">{fmt(resultado.precoRepresentacao)}</div>
                </div>
              </div>

              <div className="text-sm font-semibold text-ink">Detalhamento (R$ por percentual)</div>
              <table className="mt-2 w-full text-sm">
                <tbody>
                  {resultado.breakdown.map((b) => (
                    <tr key={b.label} className="border-t border-border">
                      <td className="py-2 text-ink-muted">{b.label}</td>
                      <td className="py-2 text-right text-ink-muted">{fmtPerc(b.perc)}</td>
                      <td className="py-2 text-right font-medium text-ink">{fmt(b.valor)}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-border">
                    <td className="py-2 font-semibold text-ink">Soma</td>
                    <td className="py-2 text-right font-semibold text-ink">{fmtPerc(resultado.somaPercentuais)}</td>
                    <td className="py-2 text-right font-semibold text-ink">{fmt(resultado.precoVenda)}</td>
                  </tr>
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

async function carregarMaoDeObra(produtoServicoId: string) {
  return prisma.servicoMaoDeObra.findMany({
    where: { produtoServicoId },
    include: { funcionario: true, veiculo: true, terceirizado: true },
    orderBy: { criadoEm: "asc" }
  });
}

function labelMaoDeObra(item: Awaited<ReturnType<typeof carregarMaoDeObra>>[number]) {
  if (item.origem === "FUNCIONARIO") return `${item.funcionario?.nome ?? "Funcionário removido"} (Funcionário)`;
  if (item.origem === "VEICULO") return `${item.veiculo?.nome ?? "Veículo removido"} (Veículo)`;
  if (item.origem === "TERCEIRIZADO") return `${item.terceirizado?.nome ?? "Terceirizado removido"} (Terceirizado)`;
  return item.descricao || "Item avulso";
}

function TabLink({ isServico, current }: { isServico: boolean; current: boolean }) {
  const active = isServico === current;
  return (
    <a
      href={`/precificacao?tab=${isServico ? "servico" : "usina"}`}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
        active ? "bg-ink text-white" : "border border-border bg-white text-ink-muted"
      }`}
    >
      {isServico ? "Serviços" : "Venda de Usina"}
    </a>
  );
}

function AutoBadge({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-surface-100 px-3 py-2">
      <div className="caption">{label}</div>
      <div className="text-sm font-semibold text-ink">{fmtPerc(value)}</div>
    </div>
  );
}

function Campo({ label, name, defaultValue }: { label: string; name: string; defaultValue: number }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input className="input" type="number" step="0.01" name={name} defaultValue={defaultValue} />
    </div>
  );
}