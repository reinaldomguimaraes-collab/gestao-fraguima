import Link from "next/link";
import { Logo } from "./Logo";
import { signOutAction } from "@/lib/auth-actions";

const ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/parametros", label: "Parâmetros da Empresa" },
  { href: "/cadastros", label: "Cadastros" },
  { href: "/custos-fixos", label: "Custos Fixos" },
  { href: "/metas", label: "Metas Comerciais" },
  { href: "/vendas", label: "Vendas" },
  { href: "/precificacao", label: "Precificação" },
  { href: "/fluxo-caixa", label: "Fluxo de Caixa" },
  { href: "/plano-negocio", label: "Plano de Negócio" },
  { href: "/configuracoes", label: "Configurações" }
];

export function SidebarCliente({
  active,
  empresaNome,
  usuarioNome
}: {
  active: string;
  empresaNome: string;
  usuarioNome: string;
}) {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-white p-4">
      <div className="mb-6 flex items-center gap-2 px-2">
        <Logo />
        <div>
          <div className="font-display text-sm font-bold text-ink">
            Duo <span className="text-accent-2">Fraguima</span>
          </div>
          <div className="caption">Gestão Empresarial</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1">
        {ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${active.startsWith(item.href) ? "nav-item-active" : ""}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-border pt-3">
        <div className="text-sm font-semibold text-ink">{empresaNome}</div>
        <div className="caption">{usuarioNome}</div>
        <form action={signOutAction}>
          <button className="mt-2 text-sm text-ink-muted underline">Sair</button>
        </form>
      </div>
    </aside>
  );
}
