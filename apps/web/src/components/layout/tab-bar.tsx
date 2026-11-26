"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../lib/auth/auth-context";
import { isActive, navItemsFor } from "./nav-items";

export function TabBar(): JSX.Element {
  const { payload } = useAuth();
  const pathname = usePathname();
  const items = navItemsFor(payload?.role);

  return (
    <nav className="tabbar" aria-label="Navegação rápida">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="tabbar-item"
          aria-current={isActive(pathname, item.href, items) ? "page" : undefined}
        >
          <item.icon aria-hidden="true" size={22} />
          {item.shortLabel ?? item.label}
        </Link>
      ))}
    </nav>
  );
}
