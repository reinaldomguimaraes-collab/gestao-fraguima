"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireCliente, requireDono } from "@/lib/session";
import { enviarConviteCliente } from "@/lib/invites";

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

// ---------------------------------------------------------------------------
// Equipe da empresa (DONO x MEMBRO) — só o DONO convida/remove; requireDono()
// garante isso e já devolve o empresaId certo (nunca de um form).
// ---------------------------------------------------------------------------

export type ConvidarMembroState = { ok: true } | { ok: false; erro: string } | null;

export async function convidarMembroAction(
  _prev: ConvidarMembroState,
  formData: FormData
): Promise<ConvidarMembroState> {
  const { empresaId } = await requireDono();
  const nome = String(formData.get("nome") || "").trim();
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  if (!nome || !email) return { ok: false, erro: "obrigatorio" };

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) return { ok: false, erro: "existente" };

  const membro = await prisma.usuario.create({
    data: { empresaId, nome, email, papel: "MEMBRO" }
  });
  await enviarConviteCliente(membro.id);
  revalidatePath("/configuracoes");
  return { ok: true };
}

export async function toggleRemovidoMembroAction(formData: FormData) {
  const { empresaId } = await requireDono();
  const id = String(formData.get("id") || "");
  if (!id) return;

  const alvo = await prisma.usuario.findUnique({ where: { id } });
  // Nunca aceita um id de fora da própria empresa, e o DONO não se remove por aqui.
  if (!alvo || alvo.empresaId !== empresaId || alvo.papel === "DONO") return;

  await prisma.usuario.update({
    where: { id },
    data: { removidoEm: alvo.removidoEm ? null : new Date() }
  });
  revalidatePath("/configuracoes");
}

export async function reenviarConviteMembroAction(formData: FormData) {
  const { empresaId } = await requireDono();
  const id = String(formData.get("id") || "");
  if (!id) return;

  const alvo = await prisma.usuario.findUnique({ where: { id } });
  if (!alvo || alvo.empresaId !== empresaId) return;
  await enviarConviteCliente(id);
  revalidatePath("/configuracoes");
}

// ---------------------------------------------------------------------------
// Alterar senha (usuário logado) — tanto para quem já tem senha quanto para
// quem só entrava pelo Google e agora quer definir a primeira senha.
// ---------------------------------------------------------------------------

export type AlterarSenhaState = { ok: true } | { ok: false; erro: string } | null;

export async function alterarSenhaAction(
  _prev: AlterarSenhaState,
  formData: FormData
): Promise<AlterarSenhaState> {
  const { id } = await requireCliente();
  const senhaAtual = String(formData.get("senhaAtual") || "");
  const novaSenha = String(formData.get("novaSenha") || "");
  const confirmar = String(formData.get("confirmar") || "");

  if (novaSenha.length < 8) return { ok: false, erro: "curta" };
  if (novaSenha !== confirmar) return { ok: false, erro: "diferente" };

  // Durante uma sessão de "modo suporte" (Representar), id não corresponde a
  // nenhum Usuario de verdade — não há senha de ninguém específico a trocar.
  const usuario = await prisma.usuario.findUnique({ where: { id } });
  if (!usuario) return { ok: false, erro: "geral" };

  if (usuario.senhaHash) {
    const ok = await bcrypt.compare(senhaAtual, usuario.senhaHash);
    if (!ok) return { ok: false, erro: "senha_atual" };
  }

  const senhaHash = await bcrypt.hash(novaSenha, 10);
  await prisma.usuario.update({ where: { id }, data: { senhaHash } });
  return { ok: true };
}
