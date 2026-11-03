"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCliente } from "@/lib/session";

export async function aceitarTermosAction() {
  const { empresaId, nome } = await requireCliente();

  const existente = await prisma.aceiteTermos.findUnique({ where: { empresaId } });
  if (!existente) {
    const forwardedFor = headers().get("x-forwarded-for");
    const ip = forwardedFor?.split(",")[0]?.trim() || headers().get("x-real-ip") || "desconhecido";

    await prisma.aceiteTermos.create({
      data: { empresaId, nome, ip }
    });
  }

  redirect("/onboarding");
}
