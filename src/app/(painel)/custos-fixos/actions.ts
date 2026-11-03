"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCliente } from "@/lib/session";

export async function criarCustoFixoAction(formData: FormData) {
  const { empresaId } = await requireCliente();
  const nome = String(formData.get("nome") || "");
  const valor = Number(formData.get("valor") || 0);
  const tag = formData.get("tag") === "SO_SERVICOS" ? "SO_SERVICOS" : "GERAL";
  if (!nome) return;

  await prisma.custoFixo.create({ data: { empresaId, nome, valor, tag } });
  revalidatePath("/custos-fixos");
  revalidatePath("/precificacao");
}

export async function desativarCustoFixoAction(formData: FormData) {
  const { empresaId } = await requireCliente();
  const id = String(formData.get("id") || "");
  await prisma.custoFixo.updateMany({ where: { id, empresaId }, data: { ativo: false } });
  revalidatePath("/custos-fixos");
  revalidatePath("/precificacao");
}
