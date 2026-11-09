import { prisma } from "@/lib/prisma";
import { enviarConvite, enviarResetSenha } from "@/lib/mail";
import { gerarTokenConvite, expiraEm7Dias, expiraEm1Hora } from "@/lib/tokens";

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

/**
 * Gera um token de redefinição de senha para um Usuario (cliente) já existente
 * e dispara o e-mail. Reusa o mesmíssimo mecanismo de conviteToken/conviteExpira
 * e a tela /definir-senha — só a validade (1h) e o texto do e-mail são diferentes.
 * Não revela ao chamador se o e-mail existe ou não (ver uso em esqueci-senha).
 */
export async function enviarResetSenhaCliente(email: string) {
  const usuario = await prisma.usuario.findUnique({ where: { email: email.toLowerCase() } });
  if (!usuario || usuario.removidoEm) return;

  const token = gerarTokenConvite();
  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { conviteToken: token, conviteExpira: expiraEm1Hora() }
  });
  await enviarResetSenha({
    paraNome: usuario.nome,
    paraEmail: usuario.email,
    linkRedefinir: `${baseUrl()}/definir-senha?token=${token}`
  });
}
