import Link from "next/link";
import { convidarColaboradorAction } from "./actions";

const ERROS: Record<string, string> = {
  obrigatorio: "Preencha nome e e-mail.",
  existente: "Já existe uma conta da equipe com esse e-mail."
};

export default function NovoColaboradorPage({ searchParams }: { searchParams: { erro?: string } }) {
  const erro = searchParams.erro ? ERROS[searchParams.erro] ?? null : null;

  return (
    <div className="max-w-lg">
      <h1 className="font-display mb-1 text-xl font-bold text-ink">Convidar colaborador</h1>
      <p className="caption mb-6">Ele poderá cadastrar e gerenciar clientes, mas não a equipe.</p>

      {erro && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-negative">{erro}</div>}

      <form action={convidarColaboradorAction} className="card flex flex-col gap-4">
        <div>
          <label className="label">Nome</label>
          <input className="input" name="nome" required placeholder="Nome do colaborador" />
        </div>
        <div>
          <label className="label">E-mail</label>
          <input className="input" type="email" name="email" required placeholder="colaborador@duofraguima.com.br" />
        </div>
        <p className="caption">
          Ele vai receber um e-mail para criar a senha de acesso — ou pode entrar direto com login do Google.
        </p>
        <div className="mt-2 flex justify-end gap-3">
          <Link href="/administrativo/equipe" className="btn btn-ghost">
            Cancelar
          </Link>
          <button className="btn btn-primary" type="submit">
            Enviar convite
          </button>
        </div>
      </form>
    </div>
  );
}
