import { LoaderCircle } from "lucide-react";

export function Spinner({ label }: { label?: string }): JSX.Element {
  return (
    <>
      <LoaderCircle className="spinner" aria-hidden="true" />
      {label && <span>{label}</span>}
    </>
  );
}

export function PageLoading({
  label = "Carregando...",
}: {
  label?: string;
}): JSX.Element {
  return (
    <div className="center-screen" role="status">
      <div className="cluster text-muted">
        <Spinner label={label} />
      </div>
    </div>
  );
}
