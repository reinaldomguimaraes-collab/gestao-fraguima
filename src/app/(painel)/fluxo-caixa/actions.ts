"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCliente } from "@/lib/session";

export async function salvarLancamentoAction(formData: FormData) {
  const { empresaId } = await requireCliente();
  const mesReferencia = String(formData.get("mesReferencia") || "");
  if (!mesReferencia) return;

  const data = {
    receitaPrevista: Number(formData.get("receitaPrevista") || 0),
    receitaRealizada: Number(formData.get("receitaRealizada") || 0),
    custoVariavel: Number(formData.get("custoVariavel") || 0),
    custoFixo: Number(formData.get("custoFixo") || 0),
    impostos: Number(formData.get("impostos") || 0)
  };

  await prisma.lancamentoCaixa.upsert({
    where: { empresaId_mesReferencia: { empresaId, mesReferencia } },
    update: data,
    create: { empresaId, mesReferencia, ...data }
  });

  revalidatePath("/fluxo-caixa");
  revalidatePath("/dashboard");
}
