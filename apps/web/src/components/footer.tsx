import Link from "next/link";
import { Logo } from "./brand/logo";

export function Footer(): JSX.Element {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="stack">
            <span style={{ color: "#fff" }}>
              <Logo />
            </span>
            <p style={{ maxWidth: "36ch" }}>
              O marketplace da metalurgia e das estruturas metálicas. Vagas moderadas,
              pagamento via Pix e contato direto com quem contrata.
            </p>
          </div>
          <div>
            <h2 className="footer-title">Trabalhadores</h2>
            <ul className="footer-links">
              <li>
                <Link href="/vagas">Buscar vagas</Link>
              </li>
              <li>
                <Link href="/cadastro/trabalhador">Criar conta</Link>
              </li>
              <li>
                <Link href="/painel/creditos">Comprar créditos</Link>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="footer-title">Empresas</h2>
            <ul className="footer-links">
              <li>
                <Link href="/cadastro/empresa">Cadastrar empresa</Link>
              </li>
              <li>
                <Link href="/empresa/vagas/nova">Publicar vaga</Link>
              </li>
              <li>
                <Link href="/login">Entrar</Link>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="footer-title">Institucional</h2>
            <ul className="footer-links">
              <li>
                <Link href="/termos-de-uso">Termos de Uso</Link>
              </li>
              <li>
                <Link href="/politica-de-privacidade">Política de Privacidade</Link>
              </li>
              <li>
                <Link href="/creditos-de-imagens">Créditos das imagens</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} Eteron Hub. Todos os direitos reservados.
          </span>
          <span>Pagamentos via Pix · Banco Inter</span>
        </div>
      </div>
    </footer>
  );
}
