import { Construction } from "lucide-react";
import Link from "next/link";

export default function NotFound(): JSX.Element {
  return (
    <div className="center-screen">
      <div>
        <span className="icon-tile icon-tile-lg">
          <Construction aria-hidden="true" />
        </span>
        <p className="eyebrow">Erro 404</p>
        <h1>Página não encontrada</h1>
        <p className="text-muted">
          O endereço pode ter mudado ou a página saiu do ar. Que tal voltar às vagas?
        </p>
        <div className="cluster" style={{ justifyContent: "center" }}>
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
