import { prisma } from "@/lib/prisma";
import { requireCliente } from "@/lib/session";
import { salvarParametrosAction } from "./actions";

export default async function ParametrosPage() {
  const { empresaId } = await requireCliente();

  const p = await prisma.parametrosEmpresa.upsert({
    where: { empresaId },
    update: {},
    create: { empresaId }
  });

  return (
    <div className="max-w-2xl">
      <h1 className="font-display mb-1 text-xl font-bold text-ink">Parâmetros da Empresa</h1>
      <p className="caption mb-6">
        Configure uma vez: esses valores viram o padrão usado na calculadora de Precificação.
      </p>

      <form action={salvarParametrosAction} className="card flex flex-col gap-5">
        <div>
          <label className="label">Regime tributário</label>
          <select className="input" name="regimeTributario" defaultValue={p.regimeTributario}>
            <option>Simples Nacional</option>
            <option>Lucro Presumido</option>
            <option>Lucro Real</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Campo label="Horas úteis/mês" name="horasUteisMes" defaultValue={p.horasUteisMes.toString()} />
          <Campo label="Custo comercial mensal (R$)" name="custoComercialMes" defaultValue={p.custoComercialMes.toString()} />
        </div>

        <div className="text-sm font-semibold text-ink">Percentuais padrão da precificação</div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <Campo label="% Impostos" name="percImpostos" defaultValue={p.percImpostos.toString()} suffix="%" />
          <Campo label="% Lucro desejado" name="percLucroDesejado" defaultValue={p.percLucroDesejado.toString()} suffix="%" />
          <Campo label="% Risco de retorno" name="percRisco" defaultValue={p.percRisco.toString()} suffix="%" />
          <Campo label="% Taxa de cartão" name="percTaxaCartao" defaultValue={p.percTaxaCartao.toString()} suffix="%" />
          <Campo label="% Fator instalação" name="percFatorInstalacao" defaultValue={p.percFatorInstalacao.toString()} suffix="%" />
        </div>

        <div className="text-sm font-semibold text-ink">Comissões por canal</div>
        <div className="grid grid-cols-3 gap-4">
          <Campo label="Global" name="comissaoGlobal" defaultValue={p.comissaoGlobal.toString()} suffix="%" />
          <Campo label="Indicação" name="comissaoIndicacao" defaultValue={p.comissaoIndicacao.toString()} suffix="%" />
          <Campo label="MC" name="comissaoMC" defaultValue={p.comissaoMC.toString()} suffix="%" />
        </div>

        <div className="mt-2 flex justify-end">
          <button className="btn btn-primary" type="submit">
            Salvar alterações
          </button>
        </div>
      </form>
    </div>
  );
}

function Campo({ label, name, defaultValue, suffix }: { label: string; name: string; defaultValue: string; suffix?: string }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <input className="input" type="number" step="0.01" name={name} defaultValue={defaultValue} />
        {suffix && <span className="pointer-events-none absolute right-3 top-2 text-sm text-ink-muted">{suffix}</span>}
      </div>
    </div>
  );
}
