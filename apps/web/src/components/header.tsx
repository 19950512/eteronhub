"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth/auth-context";

export function Header(): JSX.Element {
  const { payload, logout } = useAuth();
  const router = useRouter();

  function handleLogout(): void {
    logout();
    router.push("/");
  }

  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="header-brand">
          EteronHub
        </Link>
        <nav className="nav-links">
          {!payload && (
            <>
              <Link href="/login">Entrar</Link>
              <Link href="/cadastro/trabalhador">Sou trabalhador</Link>
              <Link href="/cadastro/empresa">Sou empresa</Link>
            </>
          )}
          {payload?.role === "COMPANY" && (
            <>
              <Link href="/empresa">Minhas vagas</Link>
              <button className="button button-secondary" onClick={handleLogout}>
                Sair
              </button>
            </>
          )}
          {payload?.role === "WORKER" && (
            <>
              <Link href="/painel">Meu painel</Link>
              <Link href="/painel/creditos">Créditos</Link>
              <button className="button button-secondary" onClick={handleLogout}>
                Sair
              </button>
            </>
          )}
          {payload?.role === "ADMIN" && (
            <>
              <Link href="/admin">Moderação</Link>
              <Link href="/admin/contas">Contas</Link>
              <button className="button button-secondary" onClick={handleLogout}>
                Sair
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
