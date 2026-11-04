import { requireInterno } from "@/lib/session";
import { SidebarInterno } from "@/components/SidebarInterno";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const interno = await requireInterno();

  return (
    <div className="flex min-h-screen bg-surface-100">
      <SidebarInterno nome={interno.nome} papel={interno.papel} />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}