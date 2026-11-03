import { prisma } from "@/lib/prisma";
import { requireCliente } from "@/lib/session";
import { percentuaisAuto, calcularPreco } from "@/lib/calc/precificacao";

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
  const custo = num("custo", 0);
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <form className="card flex flex-col gap-4" method="get">
          <input type="hidden" name="tab" value={isServico ? "servico" : "usina"} />
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
