import Link from "next/link";

export default function NotFound(): JSX.Element {
  return (
    <div className="center-screen">
      <div>
        <p className="code-mark" aria-hidden="true">
          404
        </p>
        <h1>Essa página não existe</h1>
        <p className="text-muted">
          O endereço pode ter mudado ou a página saiu do ar. As vagas continuam no mesmo
          lugar.
        </p>
        <div className="cluster">
          <Link href="/vagas" className="btn btn-primary">
            Ver vagas
          </Link>
          <Link href="/" className="btn btn-secondary">
            Página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}
