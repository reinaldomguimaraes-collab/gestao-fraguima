"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireInterno } from "@/lib/session";
import { enviarConviteCliente } from "@/lib/invites";
import { signIn } from "@/auth";

/**
 * Bloquear/desbloquear acesso é uma ação administrativa deliberadamente
 * cross-tenant — a equipe Duo Fraguima pode (e precisa poder) agir sobre
 * QUALQUER empresa cliente, Proprietário ou Colaborador. Isso é diferente das
 * telas do lado do cliente, que nunca devem aceitar um empresaId de fora da
 * própria sessão.
 */
export async function toggleBloqueioAction(formData: FormData) {
  await requireInterno();
  const empresaId = String(formData.get("empresaId") || "");
  if (!empresaId) return;

  const empresa = await prisma.empresa.findUnique({ where: { id: empresaId } });
  if (!empresa) return;

  await prisma.empresa.update({
    where: { id: empresaId },
    data: { status: empresa.status === "BLOQUEADO" ? "ATIVO" : "BLOQUEADO" }
  });
  revalidatePath("/administrativo");
}

export async function reenviarConviteClienteAction(formData: FormData) {
  await requireInterno();
  const empresaId = String(formData.get("empresaId") || "");
  const usuario = await prisma.usuario.findFirst({ where: { empresaId } });
  if (usuario) await enviarConviteCliente(usuario.id);
  revalidatePath("/administrativo");
}

/**
 * "Representar": qualquer pessoa da equipe Duo Fraguima (Proprietário ou
 * Colaborador) pode ver o painel de uma empresa como se fosse ela, para dar
 * suporte. Isto troca a sessão atual por uma sessão "cliente" da empresa
 * (ver o provider "impersonate" em src/auth.ts, que re-verifica tudo de novo
 * por conta própria) — o requireInterno() aqui é só defesa em profundidade,
 * já que o botão nem aparece fora do Administrativo.
 */
export async function representarAction(formData: FormData) {
  await requireInterno();
  const empresaId = String(formData.get("empresaId") || "");
  if (!empresaId) return;
  await signIn("impersonate", { empresaId, redirectTo: "/dashboard" });
}
