import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { requireCliente } from "@/lib/session";
import { SidebarCliente } from "@/components/SidebarCliente";

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const { empresaId, nome, email } = await requireCliente();
  const pathname = headers().get("x-pathname") || "/dashboard";

  const empresa = await prisma.empresa.findUnique({
    where: { id: empresaId },
    include: { aceiteTermos: true }
  });
  if (!empresa) redirect("/login");

  // Defesa em profundidade: mesmo que a pessoa chegue aqui direto pela URL,
  // sem ter passado pela tela de aceite, ela é mandada de volta pra lá.
  if (!empresa.aceiteTermos && pathname !== "/aceite-termos") {
    redirect("/aceite-termos");
  }

  return (
    <div className="flex min-h-screen bg-surface-100">
      <SidebarCliente active={pathname} empresaNome={empresa.nome} usuarioNome={nome} />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
