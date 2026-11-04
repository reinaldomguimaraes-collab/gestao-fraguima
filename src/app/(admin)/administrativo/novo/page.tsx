import Link from "next/link";
import { criarClienteAction } from "./actions";
import { TelefoneInput } from "@/components/TelefoneInput";

const ERROS: Record<string, string> = {
  obrigatorio: "Preencha nome da empresa, responsável e e-mail."
};

export default function NovoClientePage({ searchParams }: { searchParams: { erro?: string } }) {
  const erro = searchParams.erro ? ERROS[searchParams.erro] ?? null : null;

  return (
    <div className="max-w-lg">
      <h1 className="font-display mb-1 text-xl font-bold text-ink">Novo cliente</h1>
      <p className="caption mb-6">O acesso é criado pela equipe Duo Fraguima.</p>

      {erro && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-negative">{erro}</div>}

      <form action={criarClienteAction} className="card flex flex-col gap-4">
        <div>
          <label className="label">Nome da empresa</label>
          <input className="input" name="nome" required placeholder="Instaladora Boa Vista" />
        </div>
        <div>
          <label className="label">CNPJ</label>
          <input className="input font-mono" name="cnpj" placeholder="00.000.000/0001-00" />
        </div>
        <div>
          <label className="label">Responsável</label>
          <input className="input" name="responsavel" required placeholder="Nome do dono" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">E-mail</label>
            <input className="input" type="email" name="email" required placeholder="contato@empresa.com.br" />
          </div>
          <div>
            <label className="label">Telefone</label>
            <TelefoneInput name="telefone" />
          </div>
        </div>
        <p className="caption">
          O ID do cliente é gerado automaticamente ao criar o acesso. O responsável recebe um e-mail para criar a
          senha — ou pode entrar direto com login do Google.
        </p>
        <div className="mt-2 flex justify-end gap-3">
          <Link href="/administrativo" className="btn btn-ghost">
            Cancelar
          </Link>
          <button className="btn btn-primary" type="submit">
            Criar acesso
          </button>
        </div>
      </form>
    </div>
  );
}