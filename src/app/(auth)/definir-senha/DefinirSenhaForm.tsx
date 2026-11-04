"use client";

import { useEffect } from "react";
import { useFormState } from "react-dom";
import { definirSenhaAction, type DefinirSenhaState } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

export function DefinirSenhaForm({ token }: { token: string }) {
  const [state, formAction] = useFormState<DefinirSenhaState, FormData>(definirSenhaAction, null);

  useEffect(() => {
    if (state?.ok) {
      window.location.href = state.destino;
    }
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      <div>
        <label className="label" htmlFor="senha">
          Senha
        </label>
        <input className="input" id="senha" name="senha" type="password" required minLength={8} placeholder="••••••••" />
      </div>
      <div>
        <label className="label" htmlFor="confirmar">
          Confirmar senha
        </label>
        <input className="input" id="confirmar" name="confirmar" type="password" required minLength={8} placeholder="••••••••" />
      </div>
      <SubmitButton disabled={!token} pendingText="Criando conta..." className="btn btn-primary justify-center">
        Criar conta
      </SubmitButton>
    </form>
  );
}