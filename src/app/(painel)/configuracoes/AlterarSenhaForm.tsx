"use client";

import { useFormState } from "react-dom";
import { alterarSenhaAction, type AlterarSenhaState } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

const ERROS: Record<string, string> = {
  curta: "A nova senha precisa ter pelo menos 8 caracteres.",
  diferente: "As senhas não coincidem.",
  senha_atual: "Senha atual incorreta.",
  geral: "Não foi possível alterar a senha."
};

export function AlterarSenhaForm({ temSenha }: { temSenha: boolean }) {
  const [state, formAction] = useFormState<AlterarSenhaState, FormData>(alterarSenhaAction, null);

  return (
    <form action={formAction} className="card flex flex-col gap-3">
      <div className="text-sm font-semibold text-ink">Alterar senha</div>

      {state && !state.ok && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-negative">{ERROS[state.erro] ?? ERROS.geral}</div>
      )}
      {state?.ok && (
        <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-positive">Senha alterada com sucesso.</div>
      )}

      {temSenha && (
        <div>
          <label className="label" htmlFor="senhaAtual">
            Senha atual
          </label>
          <input className="input" id="senhaAtual" name="senhaAtual" type="password" required placeholder="••••••••" />
        </div>
      )}
      {!temSenha && (
        <p className="caption">Você entra com o Google — defina uma senha se também quiser entrar com e-mail e senha.</p>
      )}
      <div>
        <label className="label" htmlFor="novaSenha">
          Nova senha
        </label>
        <input
          className="input"
          id="novaSenha"
          name="novaSenha"
          type="password"
          required
          minLength={8}
          placeholder="••••••••"
        />
      </div>
      <div>
        <label className="label" htmlFor="confirmar">
          Confirmar nova senha
        </label>
        <input
          className="input"
          id="confirmar"
          name="confirmar"
          type="password"
          required
          minLength={8}
          placeholder="••••••••"
        />
      </div>
      <SubmitButton pendingText="Salvando..." className="btn btn-primary mt-1 self-start">
        Salvar nova senha
      </SubmitButton>
    </form>
  );
}
