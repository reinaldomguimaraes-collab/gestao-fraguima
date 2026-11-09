import Link from "next/link";
import { Logo } from "@/components/Logo";
import { loginGoogleAction } from "./actions";
import { GoogleIcon } from "@/components/GoogleIcon";
import { SubmitButton } from "@/components/SubmitButton";
import { LoginForm } from "./LoginForm";

const ERROS: Record<string, string> = {
  credenciais: "E-mail ou senha incorretos.",
  bloqueado: "O acesso desta empresa está bloqueado. Fale com a Duo Fraguima.",
  removido: "Este acesso foi removido da equipe Duo Fraguima.",
  geral: "Não foi possível entrar. Tente novamente."
};

export default function LoginPage({ searchParams }: { searchParams: { erro?: string } }) {
  const erro = searchParams.erro ? ERROS[searchParams.erro] ?? ERROS.geral : null;

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
        <div className="font-display mb-1 text-lg font-bold text-ink">Entrar</div>
        <p className="caption mb-5">Acesse o painel da sua empresa</p>

        {erro && (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-negative">{erro}</div>
        )}

        <LoginForm />

        <p className="caption mt-3 text-right">
          <Link href="/esqueci-senha" className="underline">
            Esqueci minha senha
          </Link>
        </p>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="caption">ou</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form action={loginGoogleAction}>
          <SubmitButton pendingText="Conectando..." className="btn btn-ghost w-full justify-center">
            <GoogleIcon /> Entrar com Google
          </SubmitButton>
        </form>

        <p className="caption mt-5 text-center">Ainda não tem acesso? Fale com seu consultor Duo Fraguima.</p>
      </div>
    </div>
  );
}
