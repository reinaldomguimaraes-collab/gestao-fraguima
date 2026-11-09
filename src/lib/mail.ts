import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST;
const from = process.env.SMTP_FROM || "Duo Fraguima <contato@fraguima.com.br>";

const transporter = host
  ? nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
        : undefined
    })
  : null;

/**
 * Envia o e-mail de convite (criação de empresa cliente ou convite de colaborador).
 * Se nenhum SMTP estiver configurado (.env), o convite só é registrado no log do
 * servidor — útil em desenvolvimento/teste antes de ligar um provedor de e-mail de verdade.
 */
export async function enviarConvite(params: {
  paraNome: string;
  paraEmail: string;
  linkDefinirSenha: string;
}) {
  const assunto = "Seu acesso ao Duo Fraguima está pronto";
  const corpo = `Olá, ${params.paraNome}!\n\nVocê foi convidado a acessar o Duo Fraguima Gestão Empresarial.\nClique no link abaixo para criar sua senha de acesso (ou entrar direto com sua conta Google na própria tela):\n\n${params.linkDefinirSenha}\n\nSe você não esperava este e-mail, pode ignorá-lo com segurança.`;

  if (!transporter) {
    console.log(
      `[convite simulado — configure SMTP_* no .env para enviar de verdade]\nPara: ${params.paraEmail}\nAssunto: ${assunto}\nLink: ${params.linkDefinirSenha}`
    );
    return { enviado: false, motivo: "SMTP não configurado — veja o log do servidor" };
  }

  await transporter.sendMail({
    from,
    to: params.paraEmail,
    subject: assunto,
    text: corpo
  });
  return { enviado: true };
}

/** E-mail de redefinição de senha — mesma mecânica de token do convite, texto diferente. */
export async function enviarResetSenha(params: { paraNome: string; paraEmail: string; linkRedefinir: string }) {
  const assunto = "Redefinição de senha — Duo Fraguima";
  const corpo = `Olá, ${params.paraNome}!\n\nRecebemos um pedido para redefinir a senha da sua conta no Duo Fraguima Gestão Empresarial.\nClique no link abaixo para escolher uma nova senha (válido por 1 hora):\n\n${params.linkRedefinir}\n\nSe você não pediu essa redefinição, pode ignorar este e-mail com segurança — sua senha atual continua valendo.`;

  if (!transporter) {
    console.log(
      `[reset de senha simulado — configure SMTP_* no .env para enviar de verdade]\nPara: ${params.paraEmail}\nAssunto: ${assunto}\nLink: ${params.linkRedefinir}`
    );
    return { enviado: false, motivo: "SMTP não configurado — veja o log do servidor" };
  }

  await transporter.sendMail({
    from,
    to: params.paraEmail,
    subject: assunto,
    text: corpo
  });
  return { enviado: true };
}
