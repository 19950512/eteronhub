export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDate(value: string | Date | null): string {
  if (!value) return "-";
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
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
  DRAFT: "badge-neutral",
  IN_MODERATION: "badge-warning",
  PUBLISHED: "badge-success",
  REJECTED: "badge-danger",
  CLOSED: "badge-neutral",
  EXPIRED: "badge-danger",
};

export function statusBadgeClass(status: string): string {
  return STATUS_BADGE_CLASS[status] ?? "badge-neutral";
}

export function formatSalaryRange(range: { min: number; max: number }): string {
  if (range.min === range.max) return formatBRL(range.min);
  return `${formatBRL(range.min)} – ${formatBRL(range.max)}`;
}
