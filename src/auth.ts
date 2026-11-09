import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

/**
 * Autenticação única para dois mundos diferentes:
 *  - "cliente": login de uma empresa cliente (tabela Usuario), sempre preso a um empresaId.
 *  - "interno": login da equipe Duo Fraguima (tabela UsuarioInterno), com papel
 *    Proprietário ou Colaborador — usado só no painel /administrativo.
 *
 * Em ambos os casos, a conta já precisa existir (criada pelo Administrativo, ou
 * convidada por um Proprietário) — não é permitido se autocadastrar, nem por
 * e-mail/senha nem por Google. Isso é o que torna o convite por e-mail obrigatório.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login"
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
          })
        ]
      : []),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        const email = String(credentials?.email || "")
          .toLowerCase()
          .trim();
        const senha = String(credentials?.password || "");
        if (!email || !senha) return null;

        const usuario = await prisma.usuario.findUnique({
          where: { email },
          include: { empresa: true }
        });
        if (usuario?.senhaHash) {
          const ok = await bcrypt.compare(senha, usuario.senhaHash);
          if (ok) {
            if (usuario.empresa.status === "BLOQUEADO") {
              throw new Error("ACESSO_BLOQUEADO");
            }
            if (usuario.removidoEm) {
              throw new Error("ACESSO_REMOVIDO");
            }
            return {
              id: usuario.id,
              name: usuario.nome,
              email: usuario.email,
              userType: "cliente",
              empresaId: usuario.empresaId,
              papelCliente: usuario.papel
            } as any;
          }
        }

        const interno = await prisma.usuarioInterno.findUnique({ where: { email } });
        if (interno?.senhaHash) {
          const ok = await bcrypt.compare(senha, interno.senhaHash);
          if (ok) {
            if (interno.status === "REMOVIDO") {
              throw new Error("ACESSO_REMOVIDO");
            }
            return {
              id: interno.id,
              name: interno.nome,
              email: interno.email,
              userType: "interno",
              papel: interno.papel
            } as any;
          }
        }

        return null;
      }
    }),
    // Handshake de "Representar" (admin acessando o painel do cliente para dar
    // suporte). Nunca confia no empresaId por si só: re-verifica, dentro do
    // próprio authorize(), que quem está chamando isto já está autenticado
    // como "interno" — a sessão interna que chamou signIn("impersonate", ...)
    // no mesmo request ainda está presente e é lida aqui via auth().
    Credentials({
      id: "impersonate",
      name: "impersonate",
      credentials: { empresaId: { label: "empresaId", type: "text" } },
      async authorize(credentials) {
        const empresaId = String(credentials?.empresaId || "");
        if (!empresaId) return null;

        const session = await auth();
        const solicitante = session?.user as any;
        if (!session || solicitante?.userType !== "interno") return null;

        const empresa = await prisma.empresa.findUnique({ where: { id: empresaId } });
        if (!empresa || empresa.status === "BLOQUEADO") return null;

        await prisma.impersonacaoLog.create({
          data: { usuarioInternoId: solicitante.id, empresaId }
        });

        return {
          id: `impersonacao:${empresaId}`,
          name: `${empresa.nome} (modo suporte)`,
          email: empresa.email,
          userType: "cliente",
          empresaId,
          impersonadoPor: { id: solicitante.id, nome: solicitante.name, papel: solicitante.papel },
          impersonaExpiraEm: Date.now() + 30 * 60 * 1000
        } as any;
      }
    }),
    // Handshake inverso: sai do modo suporte e devolve a sessão interna original,
    // sem pedir senha de novo — quem é "original" vem de dentro da própria sessão
    // de impersonação atual (user.impersonadoPor), nunca de um valor enviado pelo form.
    Credentials({
      id: "restaurar-interno",
      name: "restaurar-interno",
      credentials: {},
      async authorize() {
        const session = await auth();
        const atual = session?.user as any;
        if (!session || atual?.userType !== "cliente" || !atual?.impersonadoPor?.id) return null;

        const interno = await prisma.usuarioInterno.findUnique({ where: { id: atual.impersonadoPor.id } });
        if (!interno || interno.status === "REMOVIDO") return null;

        await prisma.impersonacaoLog.updateMany({
          where: { usuarioInternoId: interno.id, empresaId: atual.empresaId, encerradoEm: null },
          data: { encerradoEm: new Date() }
        });

        return {
          id: interno.id,
          name: interno.nome,
          email: interno.email,
          userType: "interno",
          papel: interno.papel
        } as any;
      }
    })
  ],
  callbacks: {
    // Login via Google: só entra quem já foi convidado (existe como Usuario ou UsuarioInterno)
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;
      const email = (user.email || "").toLowerCase();
      if (!email) return false;

      const usuario = await prisma.usuario.findUnique({
        where: { email },
        include: { empresa: true }
      });
      if (usuario) {
        if (usuario.empresa.status === "BLOQUEADO") return false;
        if (usuario.removidoEm) return false;
        await prisma.usuario.update({
          where: { id: usuario.id },
          data: { googleId: account.providerAccountId }
        });
        if (usuario.empresa.status === "PENDENTE") {
          await prisma.empresa.update({
            where: { id: usuario.empresaId },
            data: { status: "ATIVO" }
          });
        }
        return true;
      }

      const interno = await prisma.usuarioInterno.findUnique({ where: { email } });
      if (interno) {
        if (interno.status === "REMOVIDO") return false;
        await prisma.usuarioInterno.update({
          where: { id: interno.id },
          data: {
            googleId: account.providerAccountId,
            status: interno.status === "PENDENTE" ? "ATIVO" : interno.status
          }
        });
        return true;
      }

      // E-mail sem convite correspondente: nega — aqui não existe autocadastro.
      return false;
    },
    async jwt({ token, user }) {
      if (user) {
        token.userType = (user as any).userType;
        token.empresaId = (user as any).empresaId;
        token.papel = (user as any).papel;
        token.papelCliente = (user as any).papelCliente ?? null;
        // Qualquer login "de verdade" (incl. a restauração pós-modo-suporte) começa
        // sem resquício de impersonação; só o provider "impersonate" preenche isto.
        token.impersonadoPor = (user as any).impersonadoPor ?? null;
        token.impersonaExpiraEm = (user as any).impersonaExpiraEm ?? null;
      }

      // Expirou o modo suporte (30min): volta a sessão para o interno original
      // sozinha, na próxima requisição, sem precisar logar de novo.
      if (token.impersonadoPor && token.impersonaExpiraEm && Date.now() > (token.impersonaExpiraEm as number)) {
        const internoId = (token.impersonadoPor as any).id;
        const empresaIdEncerrada = token.empresaId as string;
        await prisma.impersonacaoLog
          .updateMany({
            where: { usuarioInternoId: internoId, empresaId: empresaIdEncerrada, encerradoEm: null },
            data: { encerradoEm: new Date() }
          })
          .catch(() => {});
        token.userType = "interno";
        token.papel = (token.impersonadoPor as any).papel;
        token.empresaId = undefined;
        token.papelCliente = null;
        token.impersonadoPor = null;
        token.impersonaExpiraEm = null;
      }

      // O fluxo do Google não passa pelo authorize() acima — resolve aqui pelo e-mail.
      if (!token.userType && token.email) {
        const email = token.email.toLowerCase();
        const usuario = await prisma.usuario.findUnique({ where: { email } });
        if (usuario) {
          token.userType = "cliente";
          token.empresaId = usuario.empresaId;
          token.papelCliente = usuario.papel;
        } else {
          const interno = await prisma.usuarioInterno.findUnique({ where: { email } });
          if (interno) {
            token.userType = "interno";
            token.papel = interno.papel;
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).userType = token.userType;
        (session.user as any).empresaId = token.empresaId;
        (session.user as any).papel = token.papel;
        (session.user as any).papelCliente = token.papelCliente ?? null;
        (session.user as any).impersonadoPor = token.impersonadoPor ?? null;
        (session.user as any).impersonaExpiraEm = token.impersonaExpiraEm ?? null;
      }
      return session;
    }
  }
});
