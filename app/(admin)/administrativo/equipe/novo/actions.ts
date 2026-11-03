"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireProprietario } from "@/lib/session";
import { enviarConviteInterno } from "@/lib/invites";
import { gerarTokenConvite, expiraEm7Dias } from "@/lib/tokens";

export async function convidarColaboradorAction(formData: FormData) {
  await requireProprietario();

  const nome = String(formData.get("nome") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!nome || !email) redirect("/administrativo/equipe/novo?erro=obrigatorio");

  const existente = await prisma.usuarioInterno.findUnique({ where: { email } });
  if (existente) redirect("/administrativo/equipe/novo?erro=existente");

  const interno = await prisma.usuarioInterno.create({
    data: {
      nome,
      email,
      papel: "COLABORADOR",
      status: "PENDENTE",
      conviteToken: gerarTokenConvite(),
      conviteExpira: expiraEm7Dias()
    }
  });

  await enviarConviteInterno(interno.id);
  redirect("/administrativo/equipe");
}
