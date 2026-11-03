"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireProprietario } from "@/lib/session";
import { enviarConviteInterno } from "@/lib/invites";

export async function toggleRemovidoAction(formData: FormData) {
  const proprietario = await requireProprietario();
  const id = String(formData.get("id") || "");
  if (!id || id === proprietario.id) return; // não se remove por aqui

  const alvo = await prisma.usuarioInterno.findUnique({ where: { id } });
  if (!alvo || alvo.papel === "PROPRIETARIO") return;

  await prisma.usuarioInterno.update({
    where: { id },
    data: { status: alvo.status === "REMOVIDO" ? "ATIVO" : "REMOVIDO" }
  });
  revalidatePath("/administrativo/equipe");
}

export async function reenviarConviteInternoAction(formData: FormData) {
  await requireProprietario();
  const id = String(formData.get("id") || "");
  if (id) await enviarConviteInterno(id);
  revalidatePath("/administrativo/equipe");
}
