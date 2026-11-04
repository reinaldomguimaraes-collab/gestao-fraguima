"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { signOutAction } from "@/lib/auth-actions";

export function SidebarInterno({
  nome,
  papel
}: {
  nome: string;
  papel: "PROPRIETARIO" | "COLABORADOR";
}) {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r border-border bg-ink p-4 text-white">
      <div className="mb-6 flex items-center gap-2 px-2">
        <Logo dark />
        <div>
          <div className="font-display text-sm font-bold">
            Duo <span className="text-accent-2">Fraguima</span>
          </div>
          <div className="text-[12.5px] text-white/60">Painel interno</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1">
        <Link
          href="/administrativo"
          className={`nav-item !text-white/80 hover:!bg-white/10 hover:!text-white ${
            pathname === "/administrativo" ? "!bg-white/15 !text-white" : ""
          }`}
        >
          Clientes
        </Link>
        {papel === "PROPRIETARIO" && (
          <Link
            href="/administrativo/equipe"
            className={`nav-item !text-white/80 hover:!bg-white/10 hover:!text-white ${
              pathname.startsWith("/administrativo/equipe") ? "!bg-white/15 !text-white" : ""
            }`}
          >
            Equipe
          </Link>
        )}
      </nav>
      <div className="border-t border-white/15 pt-3">
        <div className="text-sm font-semibold">{nome}</div>
        <div className="text-[12.5px] text-white/60">
          {papel === "PROPRIETARIO" ? "Proprietário" : "Colaborador"}
        </div>
        <form action={signOutAction}>
          <button className="mt-2 text-sm text-white/70 underline">Sair</button>
        </form>
      </div>
    </aside>
  );
}