"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";

export async function definirSenhaAction(formData: FormData) {
  const token = String(formData.get("token") || "");
  const senha = String(formData.get("senha") || "");
  const confirmar = String(formData.get("confirmar") || "");

  if (!token) redirect("/login?erro=geral");
  if (senha.length < 8) redirect(`/definir-senha?token=${token}&erro=curta`);
  if (senha !== confirmar) redirect(`/definir-senha?token=${token}&erro=diferente`);

  const senhaHash = await bcrypt.hash(senha, 10);

  const usuario = await prisma.usuario.findUnique({ where: { conviteToken: token }, include: { empresa: true } });
  if (usuario) {
    if (!usuario.conviteExpira || usuario.conviteExpira < new Date()) {
      redirect("/login?erro=geral");
    }
    await prisma.$transaction([
      prisma.usuario.update({
        where: { id: usuario.id },
        data: { senhaHash, conviteToken: null, conviteExpira: null }
      }),
      prisma.empresa.update({
        where: { id: usuario.empresaId },
        data: { status: usuario.empresa.status === "PENDENTE" ? "ATIVO" : usuario.empresa.status }
      })
    ]);
    await signIn("credentials", { email: usuario.email, password: senha, redirectTo: "/aceite-termos" });
    return;
  }

  const interno = await prisma.usuarioInterno.findUnique({ where: { conviteToken: token } });
  if (interno) {
    if (!interno.conviteExpira || interno.conviteExpira < new Date()) {
      redirect("/login?erro=geral");
    }
    await prisma.usuarioInterno.update({
      where: { id: interno.id },
      data: {
        senhaHash,
        conviteToken: null,
        conviteExpira: null,
        status: interno.status === "PENDENTE" ? "ATIVO" : interno.status
      }
    });
    await signIn("credentials", { email: interno.email, password: senha, redirectTo: "/administrativo" });
    return;
  }

  redirect("/login?erro=geral");
}

export async function definirSenhaGoogleAction() {
  const { signIn: signInGoogle } = await import("@/auth");
  await signInGoogle("google", { redirectTo: "/" });
}
