"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCliente } from "@/lib/session";

function num(formData: FormData, key: string) {
  const v = formData.get(key);
  return v === null || v === "" ? 0 : Number(v);
}

export async function salvarParametrosAction(formData: FormData) {
  const { empresaId } = await requireCliente();

  await prisma.parametrosEmpresa.upsert({
    where: { empresaId },
    update: {
      regimeTributario: String(formData.get("regimeTributario") || "Simples Nacional"),
      horasUteisMes: num(formData, "horasUteisMes"),
      percImpostos: num(formData, "percImpostos"),
      percLucroDesejado: num(formData, "percLucroDesejado"),
      percRisco: num(formData, "percRisco"),
      percTaxaCartao: num(formData, "percTaxaCartao"),
      percFatorInstalacao: num(formData, "percFatorInstalacao"),
      comissaoGlobal: num(formData, "comissaoGlobal"),
      comissaoIndicacao: num(formData, "comissaoIndicacao"),
      comissaoMC: num(formData, "comissaoMC"),
      custoComercialMes: num(formData, "custoComercialMes")
    },
    create: {
      empresaId,
      regimeTributario: String(formData.get("regimeTributario") || "Simples Nacional"),
      horasUteisMes: num(formData, "horasUteisMes"),
      percImpostos: num(formData, "percImpostos"),
      percLucroDesejado: num(formData, "percLucroDesejado"),
      percRisco: num(formData, "percRisco"),
      percTaxaCartao: num(formData, "percTaxaCartao"),
      percFatorInstalacao: num(formData, "percFatorInstalacao"),
      comissaoGlobal: num(formData, "comissaoGlobal"),
      comissaoIndicacao: num(formData, "comissaoIndicacao"),
      comissaoMC: num(formData, "comissaoMC"),
      custoComercialMes: num(formData, "custoComercialMes")
    }
  });

  revalidatePath("/parametros");
  revalidatePath("/precificacao");
}
