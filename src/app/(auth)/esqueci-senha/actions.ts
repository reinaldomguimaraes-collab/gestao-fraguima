"use server";

import { redirect } from "next/navigation";
import { enviarResetSenhaCliente } from "@/lib/invites";

export async function solicitarResetAction(formData: FormData) {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();

  if (email) {
    // Nunca revela se o e-mail existe ou não — mesma tela de confirmação nos dois casos.
    await enviarResetSenhaCliente(email);
  }
  redirect("/esqueci-senha?enviado=1");
}
