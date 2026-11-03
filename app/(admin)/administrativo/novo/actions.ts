"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireInterno } from "@/lib/session";
import { enviarConviteCliente } from "@/lib/invites";
import { gerarTokenConvite, expiraEm7Dias } from "@/lib/tokens";

export async function criarClienteAction(formData: FormData) {
  const interno = await requireInterno(); // Proprietário OU Colaborador podem criar clientes

  const nome = String(formData.get("nome") || "").trim();
  const cnpj = String(formData.get("cnpj") || "").trim();
  const responsavel = String(formData.get("responsavel") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const telefone = String(formData.get("telefone") || "").trim();

  if (!nome || !responsavel || !email) {
    redirect("/administrativo/novo?erro=obrigatorio");
  }

  const totalEmpresas = await prisma.empresa.count();
  const codigo = `CLI-${String(totalEmpresas + 1).padStart(4, "0")}`;

  const empresa = await prisma.empresa.create({
    data: {
      codigo,
      nome,
      cnpj: cnpj || null,
      responsavel,
      email,
      telefone: telefone || null,
      status: "PENDENTE",
      criadoPorId: interno.id,
      parametros: { create: {} }, // valores padrão (ver schema), ajustáveis em Parâmetros da Empresa
      usuarios: {
        create: {
          nome: responsavel,
          email,
          conviteToken: gerarTokenConvite(),
          conviteExpira: expiraEm7Dias()
        }
      }
    },
    include: { usuarios: true }
  });

  await enviarConviteCliente(empresa.usuarios[0].id);

  redirect("/administrativo");
}
