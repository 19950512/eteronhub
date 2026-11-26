import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

type AlertTone = "info" | "success" | "warning" | "error";

const ICONS = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  error: CircleAlert,
};

interface AlertProps {
  tone?: AlertTone;
  title?: string;
  children?: ReactNode;
}

export function Alert({ tone = "info", title, children }: AlertProps): JSX.Element {
  const Icon = ICONS[tone];
  return (
    <div className={`alert alert-${tone}`} role={tone === "error" ? "alert" : "status"}>
      <Icon aria-hidden="true" />
      <div className="stack-sm" style={{ gap: 2 }}>
        {title && <p className="alert-title">{title}</p>}
        {children && <div>{children}</div>}
      </div>
    </div>
  );
}
