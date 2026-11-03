"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";

export async function loginAction(formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/"
    });
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") redirect("/login?erro=credenciais");
      if (error.message?.includes("ACESSO_BLOQUEADO")) redirect("/login?erro=bloqueado");
      if (error.message?.includes("ACESSO_REMOVIDO")) redirect("/login?erro=removido");
      redirect("/login?erro=geral");
    }
    throw error;
  }
}

export async function loginGoogleAction() {
  await signIn("google", { redirectTo: "/" });
}
