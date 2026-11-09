"use client";

import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import { convidarMembroAction, type ConvidarMembroState } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

const ERROS: Record<string, string> = {
  obrigatorio: "Preencha nome e e-mail.",
  existente: "Já existe um acesso com esse e-mail.",
  geral: "Não foi possível enviar o convite."
};

export function ConvidarMembroForm() {
  const [state, formAction] = useFormState<ConvidarMembroState, FormData>(convidarMembroAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2 border-t border-border pt-3">
      <div className="text-sm font-semibold text-ink">Convidar usuário</div>
      {state && !state.ok && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-negative">{ERROS[state.erro] ?? ERROS.geral}</div>
      )}
      {state?.ok && (
        <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-positive">Convite enviado.</div>
      )}
      <input className="input" name="nome" placeholder="Nome" required />
      <input className="input" name="email" type="email" placeholder="email@empresa.com.br" required />
      <SubmitButton pendingText="Enviando..." className="btn btn-primary self-start">
        Enviar convite
      </SubmitButton>
    </form>
  );
}
