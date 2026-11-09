import { redirect } from "next/navigation";
import { auth } from "@/auth";

/**
 * Helpers de autorização para páginas e server actions.
 *
 * Regra de ouro do projeto (ver especificação, seção Segurança): todo acesso a
 * dado de empresa usa o empresaId que SAI DAQUI (da sessão autenticada), nunca
 * um id recebido de um form, query string ou parâmetro de rota. As telas do
 * lado do cliente nem precisam saber o empresaId — ele é implícito.
 */

export type SessaoCliente = {
  id: string;
  empresaId: string;
  nome: string;
  email: string;
  // DONO x MEMBRO (fase 2 — múltiplos usuários por empresa). Numa sessão de
  // "modo suporte" (impersonadoPor preenchido) não existe um Usuario real por
  // trás — aqui ela vem como "DONO" por padrão, só para liberar as telas.
  papel: "DONO" | "MEMBRO";
  // Preenchido só durante "Representar" (ver src/auth.ts): quem da equipe
  // Duo Fraguima está vendo o painel do cliente, e até quando.
  impersonadoPor: { id: string; nome: string } | null;
  impersonaExpiraEm: number | null;
};
export type SessaoInterno = {
  id: string;
  nome: string;
  papel: "PROPRIETARIO" | "COLABORADOR";
};

export async function requireCliente(): Promise<SessaoCliente> {
  const session = await auth();
  const user = session?.user as any;
  if (!session || user?.userType !== "cliente") redirect("/login");
  return {
    id: user.id as string,
    empresaId: user.empresaId as string,
    nome: user.name as string,
    email: user.email as string,
    papel: (user.papelCliente as "DONO" | "MEMBRO") ?? "DONO",
    impersonadoPor: user.impersonadoPor ?? null,
    impersonaExpiraEm: user.impersonaExpiraEm ?? null
  };
}

export async function requireDono(): Promise<SessaoCliente> {
  const cliente = await requireCliente();
  if (cliente.papel !== "DONO") redirect("/configuracoes");
  return cliente;
}

export async function requireInterno(): Promise<SessaoInterno> {
  const session = await auth();
  const user = session?.user as any;
  if (!session || user?.userType !== "interno") redirect("/login");
  return { id: user.id as string, nome: user.name as string, papel: user.papel };
}

export async function requireProprietario(): Promise<SessaoInterno> {
  const interno = await requireInterno();
  if (interno.papel !== "PROPRIETARIO") redirect("/administrativo");
  return interno;
}
