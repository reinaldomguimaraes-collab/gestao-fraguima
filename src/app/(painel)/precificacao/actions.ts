"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCliente } from "@/lib/session";
import { recalcularCustoServico } from "@/lib/calc/custoServico";

async function horasUteisDaEmpresa(empresaId: string) {
  const parametros = await prisma.parametrosEmpresa.upsert({
    where: { empresaId },
    update: {},
    create: { empresaId }
  });
  return Number(parametros.horasUteisMes);
}

/** Garante que o Serviço pertence à empresa logada antes de qualquer leitura/escrita nele. */
async function servicoDaEmpresa(empresaId: string, produtoServicoId: string) {
  const servico = await prisma.produtoServico.findFirst({ where: { id: produtoServicoId, empresaId } });
  if (!servico) throw new Error("Serviço não encontrado.");
  return servico;
}

export async function criarServicoAction(formData: FormData) {
  const { empresaId } = await requireCliente();
  const nome = String(formData.get("nome") || "").trim();
  if (!nome) return;

  const servico = await prisma.produtoServico.create({ data: { empresaId, nome, frente: "SERVICOS" } });
  revalidatePath("/precificacao");
  redirect(`/precificacao?tab=servico&servicoId=${servico.id}`);
}

export async function desativarServicoAction(formData: FormData) {
  const { empresaId } = await requireCliente();
  const id = String(formData.get("id") || "");
  await prisma.produtoServico.updateMany({ where: { id, empresaId }, data: { ativo: false } });
  revalidatePath("/precificacao");
  redirect("/precificacao?tab=servico");
}

export async function adicionarMaoDeObraAction(formData: FormData) {
  const { empresaId } = await requireCliente();
  const produtoServicoId = String(formData.get("produtoServicoId") || "");
  await servicoDaEmpresa(empresaId, produtoServicoId);

  const origemRef = String(formData.get("origemRef") || ""); // "FUNCIONARIO:<id>" | "VEICULO:<id>" | "TERCEIRIZADO:<id>" | "AVULSO"
  const quantidade = Number(formData.get("quantidade") || 1) || 1;
  const [origem, refId] = origemRef.split(":");

  const data: Record<string, unknown> = { produtoServicoId, origem, quantidade };

  if (origem === "FUNCIONARIO") {
    const f = await prisma.funcionario.findFirst({ where: { id: refId, empresaId } });
    if (!f) throw new Error("Funcionário não encontrado.");
    data.funcionarioId = refId;
  } else if (origem === "VEICULO") {
    const v = await prisma.veiculo.findFirst({ where: { id: refId, empresaId } });
    if (!v) throw new Error("Veículo não encontrado.");
    data.veiculoId = refId;
  } else if (origem === "TERCEIRIZADO") {
    const t = await prisma.terceirizado.findFirst({ where: { id: refId, empresaId } });
    if (!t) throw new Error("Terceirizado não encontrado.");
    data.terceirizadoId = refId;
  } else if (origem === "AVULSO") {
    const descricao = String(formData.get("descricao") || "").trim();
    if (!descricao) return;
    data.descricao = descricao;
    data.valorUnitario = Number(formData.get("valorUnitario") || 0);
  } else {
    return;
  }

  await prisma.servicoMaoDeObra.create({ data });
  await recalcularCustoServico(prisma, produtoServicoId, await horasUteisDaEmpresa(empresaId));
  revalidatePath("/precificacao");
}

export async function removerMaoDeObraAction(formData: FormData) {
  const { empresaId } = await requireCliente();
  const id = String(formData.get("id") || "");

  const item = await prisma.servicoMaoDeObra.findFirst({
    where: { id, produtoServico: { empresaId } },
    select: { produtoServicoId: true }
  });
  if (!item) return;

  await prisma.servicoMaoDeObra.delete({ where: { id } });
  await recalcularCustoServico(prisma, item.produtoServicoId, await horasUteisDaEmpresa(empresaId));
  revalidatePath("/precificacao");
}

export async function adicionarInsumoAction(formData: FormData) {
  const { empresaId } = await requireCliente();
  const produtoServicoId = String(formData.get("produtoServicoId") || "");
  await servicoDaEmpresa(empresaId, produtoServicoId);

  const descricao = String(formData.get("descricao") || "").trim();
  const valor = Number(formData.get("valor") || 0);
  if (!descricao) return;

  await prisma.servicoInsumo.create({ data: { produtoServicoId, descricao, valor } });
  await recalcularCustoServico(prisma, produtoServicoId, await horasUteisDaEmpresa(empresaId));
  revalidatePath("/precificacao");
}

export async function removerInsumoAction(formData: FormData) {
  const { empresaId } = await requireCliente();
  const id = String(formData.get("id") || "");

  const item = await prisma.servicoInsumo.findFirst({
    where: { id, produtoServico: { empresaId } },
    select: { produtoServicoId: true }
  });
  if (!item) return;

  await prisma.servicoInsumo.delete({ where: { id } });
  await recalcularCustoServico(prisma, item.produtoServicoId, await horasUteisDaEmpresa(empresaId));
  revalidatePath("/precificacao");
}