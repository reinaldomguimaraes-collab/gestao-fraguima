const MAP: Record<string, { cls: string; label: string }> = {
  ATIVO: { cls: "chip-open", label: "Ativo" },
  PENDENTE: { cls: "chip-pending", label: "Aguardando 1º acesso" },
  BLOQUEADO: { cls: "chip-negative", label: "Bloqueado" },
  REMOVIDO: { cls: "chip-negative", label: "Removido" }
};

export function StatusChip({ status }: { status: string }) {
  const info = MAP[status] ?? { cls: "chip-pending", label: status };
  return <span className={`chip ${info.cls}`}>{info.label}</span>;
}
