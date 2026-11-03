import { Logo } from "@/components/Logo";
import { aceitarTermosAction } from "./actions";
import { requireCliente } from "@/lib/session";

export default async function AceiteTermosPage() {
  await requireCliente(); // garante que só um cliente autenticado chega aqui

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-100 px-4">
      <div className="card w-full max-w-md">
        <div className="mb-5 flex items-center gap-2">
          <Logo />
          <div>
            <div className="font-display text-base font-bold text-ink">
              Duo <span className="text-accent-2">Fraguima</span>
            </div>
            <div className="caption">Gestão Empresarial</div>
          </div>
        </div>
        <div className="font-display text-lg font-bold text-ink">Antes de continuar</div>
        <p className="caption mb-4">Mostrado só no primeiro acesso — leia e aceite para liberar o seu painel.</p>

        <div className="max-h-44 overflow-y-auto rounded-lg border border-dashed border-border bg-surface-100 p-4 text-[12.5px] leading-relaxed text-ink-muted">
          <strong className="text-ink">Termo de Uso e Armazenamento de Dados</strong>
          <br />A Duo Fraguima armazena os dados financeiros e operacionais que você cadastra neste painel (custos,
          metas, vendas, precificação) para prestar o serviço de gestão contratado. Seus dados pessoais de acesso
          (nome e e-mail) seguem as boas práticas da LGPD. Os dados ficam guardados enquanto sua conta estiver ativa
          e são excluídos mediante solicitação. Ao continuar, você concorda com o uso e armazenamento descritos aqui.
        </div>

        <form action={aceitarTermosAction}>
          <label className="mt-4 flex cursor-pointer items-start gap-2.5">
            <input type="checkbox" required className="mt-0.5 h-4 w-4" />
            <span className="text-sm text-ink">Li e aceito o termo de uso e armazenamento de dados da Duo Fraguima.</span>
          </label>
          <button className="btn btn-primary mt-5 w-full justify-center" type="submit">
            Continuar
          </button>
        </form>
        <p className="caption mt-3 text-center">Registramos seu nome, data/hora e IP no momento do aceite.</p>
      </div>
    </div>
  );
}
