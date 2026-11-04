import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/Logo";
import { GoogleIcon } from "@/components/GoogleIcon";
import { definirSenhaGoogleAction } from "./actions";
import { DefinirSenhaForm } from "./DefinirSenhaForm";
import { SubmitButton } from "@/components/SubmitButton";

const ERROS: Record<string, string> = {
  curta: "A senha precisa ter pelo menos 8 caracteres.",
  diferente: "As senhas não conferem."
};

export default async function DefinirSenhaPage({
  searchParams
}: {
  searchParams: { token?: string; erro?: string };
}) {
  const token = searchParams.token || "";
  const erro = searchParams.erro ? ERROS[searchParams.erro] : null;

  let contexto = "Seu acesso ao Duo Fraguima";
  if (token) {
    const usuario = await prisma.usuario.findUnique({ where: { conviteToken: token }, include: { empresa: true } });
    if (usuario) contexto = `${usuario.empresa.nome} · ${usuario.nome}`;
    else {
      const interno = await prisma.usuarioInterno.findUnique({ where: { conviteToken: token } });
      if (interno) contexto = `Equipe Duo Fraguima · ${interno.nome}`;
    }
  }

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
        <div className="font-display text-lg font-bold text-ink">Crie sua senha de acesso</div>
        <p className="caption mb-5">{contexto}</p>

        {!token && (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-negative">
            Link de convite inválido ou incompleto.
          </div>
        )}
        {erro && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-negative">{erro}</div>}

        <DefinirSenhaForm token={token} />

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="caption">ou</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form action={definirSenhaGoogleAction}>
          <SubmitButton pendingText="Conectando..." className="btn btn-ghost w-full justify-center">
            <GoogleIcon /> Entrar com Google
          </SubmitButton>
        </form>

        <p className="caption mt-5 text-center leading-relaxed">
          Colaboradores da equipe Duo Fraguima passam por esta mesma etapa, mas vão direto para o Administrativo —
          sem a tela de aceite de termos, que é só para clientes.
        </p>
      </div>
    </div>
  );
}