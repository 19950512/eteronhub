"use client";

import { LogOut, Menu, UserRoundPlus, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAuth } from "../lib/auth/auth-context";
import { Logo } from "./brand/logo";
import { isActive, navItemsFor } from "./layout/nav-items";

export function Header(): JSX.Element {
  const { payload, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDialogElement>(null);
  const items = navItemsFor(payload?.role);
  const desktopItems = payload
    ? items
    : items.filter((item) => item.href !== "/" && item.href !== "/login");

  useEffect(() => {
    drawerRef.current?.close();
  }, [pathname]);

  function handleLogout(): void {
    drawerRef.current?.close();
    logout();
    router.push("/");
  }

  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" className="header-brand" aria-label="Eteron Hub — página inicial">
          <Logo />
        </Link>

        <nav className="header-nav" aria-label="Principal">
          {desktopItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-link"
              aria-current={isActive(pathname, item.href, items) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          {payload ? (
            <button
              type="button"
              className="btn btn-ghost btn-sm header-cta-desktop"
              onClick={handleLogout}
            >
              <LogOut aria-hidden="true" />
              Sair
            </button>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost btn-sm header-cta-desktop">
                Entrar
              </Link>
              <Link href="/cadastro/trabalhador" className="btn btn-primary btn-sm">
                Criar conta
              </Link>
            </>
          )}
          <button
            type="button"
            className="icon-btn header-menu-button"
            aria-label="Abrir menu"
            aria-haspopup="dialog"
            onClick={() => drawerRef.current?.showModal()}
          >
            <Menu aria-hidden="true" />
          </button>
        </div>
      </div>

      <dialog
        ref={drawerRef}
        className="drawer"
        aria-label="Menu"
        onClick={(event) => {
          if (event.target === drawerRef.current) drawerRef.current.close();
        }}
      >
        <div className="drawer-inner">
          <div className="cluster-between">
            <Logo />
            <button
              type="button"
              className="icon-btn"
              aria-label="Fechar menu"
              onClick={() => drawerRef.current?.close()}
            >
              <X aria-hidden="true" />
            </button>
          </div>

          <nav className="drawer-nav" aria-label="Menu principal">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="nav-link"
                aria-current={isActive(pathname, item.href, items) ? "page" : undefined}
              >
                <item.icon aria-hidden="true" size={20} />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="drawer-footer">
            {payload ? (
              <button
                type="button"
                className="btn btn-secondary btn-block"
                onClick={handleLogout}
              >
                <LogOut aria-hidden="true" />
                Sair da conta
              </button>
            ) : (
              <>
                <Link href="/cadastro/trabalhador" className="btn btn-primary btn-block">
                  <UserRoundPlus aria-hidden="true" />
                  Criar conta de trabalhador
                </Link>
                <Link href="/cadastro/empresa" className="btn btn-secondary btn-block">
                  Cadastrar minha empresa
                </Link>
              </>
            )}
            <Link
              href="/politica-de-privacidade"
              className="text-sm text-muted text-center"
            >
              Política de Privacidade
            </Link>
          </div>
        </div>
      </dialog>
    </header>
  );
}
