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
            return {
              id: usuario.id,
              name: usuario.nome,
              email: usuario.email,
              userType: "cliente",
              empresaId: usuario.empresaId
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
      }
      // O fluxo do Google não passa pelo authorize() acima — resolve aqui pelo e-mail.
      if (!token.userType && token.email) {
        const email = token.email.toLowerCase();
        const usuario = await prisma.usuario.findUnique({ where: { email } });
        if (usuario) {
          token.userType = "cliente";
          token.empresaId = usuario.empresaId;
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
      }
      return session;
    }
  }
});