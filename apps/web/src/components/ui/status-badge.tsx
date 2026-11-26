import { statusBadgeClass, statusLabel } from "../../lib/format";

export function StatusBadge({ status }: { status: string }): JSX.Element {
  return (
    <span className={`badge ${statusBadgeClass(status)}`}>{statusLabel(status)}</span>
  );
}
