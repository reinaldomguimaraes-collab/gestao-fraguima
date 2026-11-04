"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export type LoginState = { ok: true } | { ok: false; erro: string } | null;

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false
    });
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.message?.includes("ACESSO_BLOQUEADO")) return { ok: false, erro: "bloqueado" };
      if (error.message?.includes("ACESSO_REMOVIDO")) return { ok: false, erro: "removido" };
      if (error.type === "CredentialsSignin") return { ok: false, erro: "credenciais" };
      return { ok: false, erro: "geral" };
    }
    throw error;
  }
  return { ok: true };
}

export async function loginGoogleAction() {
  await signIn("google", { redirectTo: "/" });
}