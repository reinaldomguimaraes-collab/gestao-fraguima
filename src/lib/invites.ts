import { prisma } from "@/lib/prisma";
import { enviarConvite } from "@/lib/mail";
import { gerarTokenConvite, expiraEm7Dias } from "@/lib/tokens";

function baseUrl() {
  return process.env.NEXTAUTH_URL || "http://localhost:3000";
}

/** Gera (ou renova) o convite de uma empresa cliente e dispara o e-mail. */
export async function enviarConviteCliente(usuarioId: string) {
  const token = gerarTokenConvite();
  const usuario = await prisma.usuario.update({
    where: { id: usuarioId },
    data: { conviteToken: token, conviteExpira: expiraEm7Dias() }
  });
  await enviarConvite({
    paraNome: usuario.nome,
    paraEmail: usuario.email,
    linkDefinirSenha: `${baseUrl()}/definir-senha?token=${token}`
  });
}

/** Gera (ou renova) o convite de um colaborador da equipe interna e dispara o e-mail. */
export async function enviarConviteInterno(usuarioInternoId: string) {
  const token = gerarTokenConvite();
  const interno = await prisma.usuarioInterno.update({
    where: { id: usuarioInternoId },
    data: { conviteToken: token, conviteExpira: expiraEm7Dias() }
  });
  await enviarConvite({
    paraNome: interno.nome,
    paraEmail: interno.email,
    linkDefinirSenha: `${baseUrl()}/definir-senha?token=${token}`
  });
}
