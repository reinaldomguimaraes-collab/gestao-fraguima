import { encerrarImpersonacaoAction } from "@/lib/auth-actions";

/**
 * Faixa fixa mostrada em toda tela do painel do cliente enquanto alguém da
 * equipe Duo Fraguima está "Representando" a empresa (ver administrativo e
 * src/auth.ts). Deixa claro, o tempo todo, que isto não é o dono da empresa
 * logado — e dá uma saída explícita, além da expiração automática em 30min.
 */
export function BannerModoSuporte({
  empresaNome,
  internoNome,
  expiraEm
}: {
  empresaNome: string;
  internoNome: string;
  expiraEm: number;
}) {
  const horaExpira = new Date(expiraEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-100 px-6 py-2 text-sm text-amber-900">
      <span>
        <strong>Modo suporte:</strong> {internoNome} (equipe Duo Fraguima) está representando{" "}
        <strong>{empresaNome}</strong>. Encerra sozinho às {horaExpira}.
      </span>
      <form action={encerrarImpersonacaoAction}>
        <button className="whitespace-nowrap font-semibold underline" type="submit">
          Encerrar atendimento
        </button>
      </form>
    </div>
  );
}
