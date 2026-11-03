import { prisma } from "@/lib/prisma";
import { custoMensalFuncionario, custoMensalVeiculo } from "./valorHora";

/**
 * Totais de Custo Fixo da empresa, somando:
 *  - Folha de Pagamento (Funcionários ativos) e Veículos ativos — sempre "Geral";
 *  - as despesas gerais cadastradas em Custos Fixos, por tag (Geral / Só serviços).
 *
 * custoFixoGeral entra na precificação de QUALQUER frente; custoFixoServicos
 * entra só na precificação de Serviços, somado ao Geral.
 */
export async function totaisCustoFixo(empresaId: string) {
  const [funcionarios, veiculos, itens] = await Promise.all([
    prisma.funcionario.findMany({ where: { empresaId, ativo: true } }),
    prisma.veiculo.findMany({ where: { empresaId, ativo: true } }),
    prisma.custoFixo.findMany({ where: { empresaId, ativo: true } })
  ]);

  const totalFolha = funcionarios.reduce((s, f) => s + custoMensalFuncionario(f), 0);
  const totalVeiculos = veiculos.reduce((s, v) => s + custoMensalVeiculo(v), 0);

  const totalItensGeral = itens.filter((i) => i.tag === "GERAL").reduce((s, i) => s + Number(i.valor), 0);
  const totalItensServicos = itens
    .filter((i) => i.tag === "SO_SERVICOS")
    .reduce((s, i) => s + Number(i.valor), 0);

  const custoFixoGeral = totalFolha + totalVeiculos + totalItensGeral;
  const custoFixoServicos = totalItensServicos;

  return { totalFolha, totalVeiculos, custoFixoGeral, custoFixoServicos, itens, funcionarios, veiculos };
}
