import Link from "next/link";

export function Footer(): JSX.Element {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span>© {new Date().getFullYear()} EteronHub</span>
        <nav className="footer-links">
          <Link href="/politica-de-privacidade">Política de Privacidade</Link>
        </nav>
      </div>
    </footer>
  );
}
