"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCliente } from "@/lib/session";

function mesAtual() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export async function salvarMetaAction(formData: FormData) {
  const { empresaId } = await requireCliente();
  const frente = String(formData.get("frente")) as "VENDA_USINAS" | "SERVICOS" | "MRR";
  const mesReferencia = mesAtual();

  await prisma.metaFrente.upsert({
    where: { empresaId_frente_mesReferencia: { empresaId, frente, mesReferencia } },
    update: {
      metaValor: Number(formData.get("metaValor") || 0),
      ticketMedio: Number(formData.get("ticketMedio") || 0),
      percConversao: Number(formData.get("percConversao") || 0)
    },
    create: {
      empresaId,
      frente,
      mesReferencia,
      metaValor: Number(formData.get("metaValor") || 0),
      ticketMedio: Number(formData.get("ticketMedio") || 0),
      percConversao: Number(formData.get("percConversao") || 0)
    }
  });

  revalidatePath("/metas");
  revalidatePath("/precificacao");
  revalidatePath("/dashboard");
}
