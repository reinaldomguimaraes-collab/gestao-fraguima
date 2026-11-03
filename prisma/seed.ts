import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

/**
 * Bootstrap: cria a PRIMEIRA conta da equipe Duo Fraguima (Proprietário).
 * É o único jeito de entrar no sistema pela primeira vez — depois disso, esse
 * Proprietário convida colaboradores pelo próprio painel /administrativo/equipe.
 *
 * Uso: SEED_OWNER_EMAIL="voce@fraguima.com.br" SEED_OWNER_NOME="Reinaldo" npm run db:seed
 */
async function main() {
  const email = process.env.SEED_OWNER_EMAIL;
  const nome = process.env.SEED_OWNER_NOME || "Proprietário";

  if (!email) {
    console.log("Defina SEED_OWNER_EMAIL (e opcionalmente SEED_OWNER_NOME) antes de rodar o seed. Veja o SETUP.md.");
    return;
  }

  const existente = await prisma.usuarioInterno.findUnique({ where: { email } });
  if (existente) {
    console.log(`Já existe uma conta interna para ${email} — nada a fazer.`);
    return;
  }

  const token = randomBytes(24).toString("hex");
  await prisma.usuarioInterno.create({
    data: {
      nome,
      email,
      papel: "PROPRIETARIO",
      status: "PENDENTE",
      conviteToken: token,
      conviteExpira: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  console.log("\nConta de Proprietário criada!");
  console.log("Acesse o link abaixo para criar sua senha (ou, na mesma tela, entrar direto com login do Google usando este e-mail):\n");
  console.log(`${base}/definir-senha?token=${token}\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
