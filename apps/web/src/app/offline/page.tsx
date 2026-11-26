import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sem conexão",
  robots: { index: false },
};

// invariant: página 100% estática — o service worker (public/sw.js) a guarda
// em cache para servir quando a navegação falha por falta de rede.
export default function OfflinePage(): JSX.Element {
  return (
    <div className="center-screen">
      <div>
        <p className="code-mark" aria-hidden="true">
          Sem sinal
        </p>
        <h1>Você está sem conexão</h1>
        <p className="text-muted">
          Verifique o Wi-Fi ou os dados móveis. Assim que a internet voltar, é só tentar
          de novo.
        </p>
        <a href="/" className="btn btn-primary btn-lg">
          Tentar novamente
        </a>
      </div>
    </div>
  );
}
