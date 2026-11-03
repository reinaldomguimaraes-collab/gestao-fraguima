import { requireInterno } from "@/lib/session";
import { SidebarInterno } from "@/components/SidebarInterno";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const interno = await requireInterno();

  return (
    <div className="flex min-h-screen bg-surface-100">
      {/* O caminho ativo exato é resolvido pelo próprio nav-item no cliente de navegação do Next;
          aqui passamos só um valor simples — cada página marca sua própria seção se precisar. */}
      <SidebarInternoServer nome={interno.nome} papel={interno.papel} />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}

// Pequeno wrapper para decidir o item ativo a partir do segmento de rota atual.
import { headers } from "next/headers";
function SidebarInternoServer({ nome, papel }: { nome: string; papel: "PROPRIETARIO" | "COLABORADOR" }) {
  const pathname = headers().get("x-pathname") || "/administrativo";
  return <SidebarInterno active={pathname} nome={nome} papel={papel} />;
}
