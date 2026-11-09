"use server";

import { signIn, signOut } from "@/auth";

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}

/** Sai do "modo suporte" e devolve a sessão de quem estava representando a empresa. */
export async function encerrarImpersonacaoAction() {
  await signIn("restaurar-interno", { redirectTo: "/administrativo" });
}
