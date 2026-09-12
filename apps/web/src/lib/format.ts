export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDate(value: string | Date | null): string {
  if (!value) return "-";
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Rascunho",
  IN_MODERATION: "Em moderação",
  PUBLISHED: "Publicada",
  REJECTED: "Rejeitada",
  CLOSED: "Encerrada",
  EXPIRED: "Expirada",
};

export function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

const STATUS_BADGE_CLASS: Record<string, string> = {
  DRAFT: "badge-draft",
  IN_MODERATION: "badge-moderation",
  PUBLISHED: "badge-published",
  REJECTED: "badge-rejected",
  CLOSED: "badge",
  EXPIRED: "badge-expired",
};

export function statusBadgeClass(status: string): string {
  return STATUS_BADGE_CLASS[status] ?? "badge";
}
