import type { ReactNode } from "react";

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  optional?: boolean;
  children: ReactNode;
}

export function Field({ id, label, hint, optional, children }: FieldProps): JSX.Element {
  return (
    <div className="field">
      <label className="label" htmlFor={id}>
        {label}
        {optional && <span className="label-optional"> (opcional)</span>}
      </label>
      {children}
      {hint && (
        <p className="hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
    </div>
  );
}
