import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      userType: "cliente" | "interno";
      empresaId?: string;
      papel?: "PROPRIETARIO" | "COLABORADOR";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userType?: "cliente" | "interno";
    empresaId?: string;
    papel?: "PROPRIETARIO" | "COLABORADOR";
  }
}
