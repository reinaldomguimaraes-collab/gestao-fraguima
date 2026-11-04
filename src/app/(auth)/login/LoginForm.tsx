"use client";

import { useEffect } from "react";
import { useFormState } from "react-dom";
import { loginAction, type LoginState } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

const ERROS: Record<string, string> = {
  credenciais: "E-mail ou senha incorretos.",
  bloqueado: "O acesso desta empresa está bloqueado. Fale com a Duo Fraguima.",
  removido: "Este acesso foi removido da equipe Duo Fraguima.",
  geral: "Não foi possível entrar. Tente novamente."
};

export function LoginForm() {
  const [state, formAction] = useFormState<LoginState, FormData>(loginAction, null);

  useEffect(() => {
    if (state?.ok) {
      window.location.href = "/";
    }
  }, [state]);

  const mensagemErro = state && !state.ok ? ERROS[state.erro] ?? ERROS.geral : null;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {mensagemErro && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-negative">{mensagemErro}</div>
      )}
      <div>
        <label className="label" htmlFor="email">
          E-mail
        </label>
        <input className="input" id="email" name="email" type="email" required placeholder="voce@suaempresa.com.br" />
      </div>
      <div>
        <label className="label" htmlFor="password">
          Senha
        </label>
        <input className="input" id="password" name="password" type="password" required placeholder="••••••••" />
      </div>
      <SubmitButton pendingText="Entrando..." className="btn btn-primary justify-center">
        Entrar
      </SubmitButton>
    </form>
  );
}