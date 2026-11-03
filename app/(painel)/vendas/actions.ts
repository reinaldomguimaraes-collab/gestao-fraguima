"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCliente } from "@/lib/session";

export async function criarVendaAction(formData: FormData) {
  const { empresaId } = await requireCliente();

  await prisma.venda.create({
    data: {
      empresaId,
      data: new Date(String(formData.get("data"))),
      frente: String(formData.get("frente")) as any,
      tipoServico: String(formData.get("tipoServico") || "") || null,
      precoCobrado: Number(formData.get("precoCobrado") || 0),
      custoVariavel: Number(formData.get("custoVariavel") || 0)
    }
  });

  revalidatePath("/vendas");
}

export async function editarVendaAction(formData: FormData) {
  const { empresaId } = await requireCliente();
  const id = String(formData.get("id") || "");
  const motivo = String(formData.get("motivo") || "").trim();

  const venda = await prisma.venda.findFirst({ where: { id, empresaId } });
  if (!venda) redirect("/vendas");
  if (venda.mesFechado) redirect("/vendas?erro=fechado");
  if (!motivo) redirect(`/vendas/${id}/editar?erro=motivo`);

  const antes = {
    data: venda.data,
    frente: venda.frente,
    tipoServico: venda.tipoServico,
    precoCobrado: venda.precoCobrado,
    custoVariavel: venda.custoVariavel
  };
  const depois = {
    data: new Date(String(formData.get("data"))),
    frente: String(formData.get("frente")),
    tipoServico: String(formData.get("tipoServico") || "") || null,
    precoCobrado: Number(formData.get("precoCobrado") || 0),
    custoVariavel: Number(formData.get("custoVariavel") || 0)
  };

  await prisma.$transaction([
    prisma.venda.update({ where: { id }, data: depois as any }),
    prisma.vendaEdicaoLog.create({
      data: { vendaId: id, motivo, camposAntes: antes as any, camposDepois: depois as any }
    })
  ]);

  redirect("/vendas");
}

export async function fecharMesAction(formData: FormData) {
  const { empresaId } = await requireCliente();
  const inicio = new Date(String(formData.get("inicio")));
  const fim = new Date(String(formData.get("fim")));

  await prisma.venda.updateMany({
    where: { empresaId, data: { gte: inicio, lt: fim } },
    data: { mesFechado: true }
  });
  revalidatePath("/vendas");
}
