import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SubmitButton } from "@/components/SubmitButton";
import { solicitarResetAction } from "./actions";

export default function EsqueciSenhaPage({ searchParams }: { searchParams: { enviado?: string } }) {
  const enviado = searchParams.enviado === "1";

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-100 px-4">
      <div className="card w-full max-w-sm">
        <div className="mb-5 flex items-center gap-2">
          <Logo />
          <div>
            <div className="font-display text-base font-bold text-ink">
              Duo <span className="text-accent-2">Fraguima</span>
            </div>
            <div className="caption">Gestão Empresarial</div>
          </div>
        </div>

        {enviado ? (
          <>
            <div className="font-display mb-1 text-lg font-bold text-ink">Verifique seu e-mail</div>
            <p className="caption">
              Se existir uma conta com esse e-mail, enviamos um link para redefinir a senha — válido por 1 hora.
            </p>
          </>
        ) : (
          <>
            <div className="font-display mb-1 text-lg font-bold text-ink">Esqueci minha senha</div>
            <p className="caption mb-5">Informe seu e-mail de acesso e enviaremos um link para redefinir a senha.</p>
            <form action={solicitarResetAction} className="flex flex-col gap-4">
              <div>
                <label className="label" htmlFor="email">
                  E-mail
                </label>
                <input
                  className="input"
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="voce@suaempresa.com.br"
                />
              </div>
              <SubmitButton pendingText="Enviando..." className="btn btn-primary justify-center">
                Enviar link de redefinição
              </SubmitButton>
            </form>
          </>
        )}

        <p className="caption mt-5 text-center">
          <Link href="/login" className="underline">
            Voltar para o login
          </Link>
        </p>
      </div>
    </div>
  );
}
