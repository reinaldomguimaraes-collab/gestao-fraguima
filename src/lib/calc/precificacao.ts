import { prisma } from "@/lib/prisma";
import { totaisCustoFixo } from "./custosFixos";

/**
 * Fonte de verdade do cálculo: a cascata de percentuais do precificacao-unificada_5.html
 * (preço = custo ÷ (1 − Σ%)), com %CustoFixo e %Comercial derivados automaticamente e os
 * demais percentuais editáveis por venda. A comissão é aplicada DEPOIS, separada da cascata.
 */

export type Percentuais = {
  custoFixo: number; // auto
  custoFixoServicos: number; // auto, só entra em Serviços
  comercial: number; // auto
  impostos: number;
  risco: number;
  cartao: number;
  fatorInstalacao: number;
  lucro: number;
};

function mesAtual() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** %CustoFixo e %Comercial são "auto": custo fixo / comercial dividido pelo faturamento total esperado do mês. */
export async function percentuaisAuto(empresaId: string): Promise<Percentuais> {
  const [parametros, { custoFixoGeral, custoFixoServicos }, metas] = await Promise.all([
    prisma.parametrosEmpresa.upsert({ where: { empresaId }, update: {}, create: { empresaId } }),
    totaisCustoFixo(empresaId),
    prisma.metaFrente.findMany({ where: { empresaId, mesReferencia: mesAtual() } })
  ]);

  const faturamentoTotal = metas.reduce((s, m) => s + Number(m.metaValor), 0);

  const percCustoFixo = faturamentoTotal > 0 ? (custoFixoGeral / faturamentoTotal) * 100 : 0;
  const percCustoFixoServicos = faturamentoTotal > 0 ? (custoFixoServicos / faturamentoTotal) * 100 : 0;
  const percComercial = faturamentoTotal > 0 ? (Number(parametros.custoComercialMes) / faturamentoTotal) * 100 : 0;

  return {
    custoFixo: percCustoFixo,
    custoFixoServicos: percCustoFixoServicos,
    comercial: percComercial,
    impostos: Number(parametros.percImpostos),
    risco: Number(parametros.percRisco),
    cartao: Number(parametros.percTaxaCartao),
    fatorInstalacao: Number(parametros.percFatorInstalacao),
    lucro: Number(parametros.percLucroDesejado)
  };
}

export type ResultadoPrecificacao = {
  somaPercentuais: number;
  precoVenda: number;
  precoMinimo: number;
  precoRepresentacao: number;
  acimaDoLimite: boolean; // soma de percentuais >= 100%, cálculo não é possível
  breakdown: { label: string; perc: number; valor: number }[];
};

export function calcularPreco(params: {
  custo: number;
  perc: Percentuais;
  isServico: boolean;
  comissaoIndicacao: number;
}): ResultadoPrecificacao {
  const { custo, perc, isServico, comissaoIndicacao } = params;

  const custoFixoTotal = perc.custoFixo + (isServico ? perc.custoFixoServicos : 0);
  const somaPercentuais =
    custoFixoTotal + perc.comercial + perc.impostos + perc.risco + perc.cartao + perc.fatorInstalacao + perc.lucro;

  const acimaDoLimite = somaPercentuais >= 100;
  const divisorVenda = 1 - somaPercentuais / 100;
  const precoVenda = acimaDoLimite ? 0 : custo / divisorVenda;

  const somaSemLucro = somaPercentuais - perc.lucro;
  const divisorMinimo = 1 - somaSemLucro / 100;
  const precoMinimo = somaSemLucro >= 100 ? 0 : custo / divisorMinimo;

  const divisorComissao = 1 - comissaoIndicacao / 100;
  const precoRepresentacao = divisorComissao > 0 ? precoVenda / divisorComissao : precoVenda;

  const breakdown = [
    { label: "Custo fixo", perc: custoFixoTotal, valor: precoVenda * (custoFixoTotal / 100) },
    { label: "Comercial", perc: perc.comercial, valor: precoVenda * (perc.comercial / 100) },
    { label: "Impostos", perc: perc.impostos, valor: precoVenda * (perc.impostos / 100) },
    { label: "Risco de retorno", perc: perc.risco, valor: precoVenda * (perc.risco / 100) },
    { label: "Taxa de cartão", perc: perc.cartao, valor: precoVenda * (perc.cartao / 100) },
    { label: "Fator instalação", perc: perc.fatorInstalacao, valor: precoVenda * (perc.fatorInstalacao / 100) },
    { label: "Lucro desejado", perc: perc.lucro, valor: precoVenda * (perc.lucro / 100) }
  ];

  return { somaPercentuais, precoVenda, precoMinimo, precoRepresentacao, acimaDoLimite, breakdown };
}
