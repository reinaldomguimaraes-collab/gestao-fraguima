import { Decimal } from "@prisma/client/runtime/library";
import { custoMensalFuncionario, custoMensalVeiculo, valorHora } from "./valorHora";

type Num = number | Decimal;
const n = (v: Num) => Number(v);

export type OrigemMaoDeObra = "FUNCIONARIO" | "VEICULO" | "TERCEIRIZADO" | "AVULSO";

type ItemMaoDeObra = {
  origem: OrigemMaoDeObra;
  quantidade: Num;
  valorUnitario?: Num | null;
  funcionario?: {
    salarioBase: Num;
    percEncargos: Num;
    valeAlimentacao: Num;
    valeTransporte: Num;
    planoSaude: Num;
    bonificacao: Num;
  } | null;
  veiculo?: { seguroMensal: Num; ipvaMensal: Num; manutencao: Num } | null;
  terceirizado?: { tipoCobranca: "DIARIA" | "PLACA"; valorDiaria: Num | null; valorPlaca: Num | null } | null;
};

/** Valor em R$ de um item de mão de obra do construtor de custo de um Serviço. */
export function valorItemMaoDeObra(item: ItemMaoDeObra, horasUteisMes: Num): number {
  const qtd = n(item.quantidade);
  switch (item.origem) {
    case "FUNCIONARIO":
      if (!item.funcionario) return 0;
      return valorHora(custoMensalFuncionario(item.funcionario), horasUteisMes) * qtd;
    case "VEICULO":
      if (!item.veiculo) return 0;
      return valorHora(custoMensalVeiculo(item.veiculo), horasUteisMes) * qtd;
    case "TERCEIRIZADO": {
      if (!item.terceirizado) return 0;
      const unit =
        item.terceirizado.tipoCobranca === "PLACA"
          ? n(item.terceirizado.valorPlaca ?? 0)
          : n(item.terceirizado.valorDiaria ?? 0);
      return unit * qtd;
    }
    case "AVULSO":
      return n(item.valorUnitario ?? 0) * qtd;
    default:
      return 0;
  }
}

/** Palavra de unidade usada ao exibir a quantidade de um item (horas, diárias, placas ou un.). */
export function unidadeMaoDeObra(item: { origem: OrigemMaoDeObra; terceirizado?: { tipoCobranca: "DIARIA" | "PLACA" } | null }) {
  if (item.origem === "FUNCIONARIO" || item.origem === "VEICULO") return "h";
  if (item.origem === "TERCEIRIZADO") return item.terceirizado?.tipoCobranca === "PLACA" ? "placa(s)" : "diária(s)";
  return "un.";
}

/** Recalcula e persiste o Custo variável total de um Serviço a partir da sua mão de obra + insumos. */
export async function recalcularCustoServico(prisma: any, produtoServicoId: string, horasUteisMes: Num) {
  const [maoDeObra, insumos] = await Promise.all([
    prisma.servicoMaoDeObra.findMany({
      where: { produtoServicoId },
      include: { funcionario: true, veiculo: true, terceirizado: true }
    }),
    prisma.servicoInsumo.findMany({ where: { produtoServicoId } })
  ]);

  const totalMaoDeObra = maoDeObra.reduce((s: number, item: ItemMaoDeObra) => s + valorItemMaoDeObra(item, horasUteisMes), 0);
  const totalInsumos = insumos.reduce((s: number, i: { valor: Num }) => s + n(i.valor), 0);
  const total = totalMaoDeObra + totalInsumos;

  await prisma.produtoServico.update({ where: { id: produtoServicoId }, data: { custoVariavel: total } });
  return total;
}