"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCliente } from "@/lib/session";

function num(formData: FormData, key: string) {
  const v = formData.get(key);
  return v === null || v === "" ? 0 : Number(v);
}

export async function criarFuncionarioAction(formData: FormData) {
  const { empresaId } = await requireCliente();
  await prisma.funcionario.create({
    data: {
      empresaId,
      nome: String(formData.get("nome") || ""),
      funcao: String(formData.get("funcao") || ""),
      salarioBase: num(formData, "salarioBase"),
      percEncargos: num(formData, "percEncargos"),
      valeAlimentacao: num(formData, "valeAlimentacao"),
      valeTransporte: num(formData, "valeTransporte"),
      planoSaude: num(formData, "planoSaude"),
      bonificacao: num(formData, "bonificacao")
    }
  });
  revalidatePath("/cadastros");
  revalidatePath("/custos-fixos");
}

export async function desativarFuncionarioAction(formData: FormData) {
  const { empresaId } = await requireCliente();
  const id = String(formData.get("id") || "");
  await prisma.funcionario.updateMany({ where: { id, empresaId }, data: { ativo: false } });
  revalidatePath("/cadastros");
  revalidatePath("/custos-fixos");
}

export async function criarVeiculoAction(formData: FormData) {
  const { empresaId } = await requireCliente();
  await prisma.veiculo.create({
    data: {
      empresaId,
      nome: String(formData.get("nome") || ""),
      valorVeiculo: num(formData, "valorVeiculo"),
      seguroMensal: num(formData, "seguroMensal"),
      ipvaMensal: num(formData, "ipvaMensal"),
      manutencao: num(formData, "manutencao")
    }
  });
  revalidatePath("/cadastros");
  revalidatePath("/custos-fixos");
}

export async function desativarVeiculoAction(formData: FormData) {
  const { empresaId } = await requireCliente();
  const id = String(formData.get("id") || "");
  await prisma.veiculo.updateMany({ where: { id, empresaId }, data: { ativo: false } });
  revalidatePath("/cadastros");
  revalidatePath("/custos-fixos");
}

export async function criarTerceirizadoAction(formData: FormData) {
  const { empresaId } = await requireCliente();
  await prisma.terceirizado.create({
    data: {
      empresaId,
      nome: String(formData.get("nome") || ""),
      valorDiaria: num(formData, "valorDiaria")
    }
  });
  revalidatePath("/cadastros");
}

export async function desativarTerceirizadoAction(formData: FormData) {
  const { empresaId } = await requireCliente();
  const id = String(formData.get("id") || "");
  await prisma.terceirizado.updateMany({ where: { id, empresaId }, data: { ativo: false } });
  revalidatePath("/cadastros");
}
