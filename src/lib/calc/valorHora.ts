import { Decimal } from "@prisma/client/runtime/library";

type Num = number | Decimal;
const n = (v: Num) => Number(v);

/** Custo mensal total de um funcionário: salário + encargos (%) + benefícios fixos. */
export function custoMensalFuncionario(f: {
  salarioBase: Num;
  percEncargos: Num;
  valeAlimentacao: Num;
  valeTransporte: Num;
  planoSaude: Num;
  bonificacao: Num;
}) {
  const base = n(f.salarioBase) * (1 + n(f.percEncargos) / 100);
  return base + n(f.valeAlimentacao) + n(f.valeTransporte) + n(f.planoSaude) + n(f.bonificacao);
}

/**
 * Custo mensal de um veículo: seguro + IPVA mensal + manutenção.
 * O valor do veículo é só referência — não entra no custo mensal (sem depreciação).
 */
export function custoMensalVeiculo(v: { seguroMensal: Num; ipvaMensal: Num; manutencao: Num }) {
  return n(v.seguroMensal) + n(v.ipvaMensal) + n(v.manutencao);
}

/** Valor Hora = custo mensal dividido pelas horas úteis/mês (parâmetro único da empresa). */
export function valorHora(custoMensal: Num, horasUteisMes: Num) {
  const h = n(horasUteisMes);
  return h > 0 ? n(custoMensal) / h : 0;
}
