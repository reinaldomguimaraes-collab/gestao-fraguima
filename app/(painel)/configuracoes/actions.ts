"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCliente } from "@/lib/session";

export async function salvarPerfilAction(formData: FormData) {
  const { empresaId } = await requireCliente();
  await prisma.empresa.update({
    where: { id: empresaId },
    data: {
      nome: String(formData.get("nome") || ""),
      cnpj: String(formData.get("cnpj") || "") || null,
      responsavel: String(formData.get("responsavel") || "")
    }
  });
  revalidatePath("/configuracoes");
}
