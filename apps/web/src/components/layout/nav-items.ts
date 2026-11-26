import {
  BriefcaseBusiness,
  Building2,
  ClipboardCheck,
  History,
  House,
  LayoutDashboard,
  type LucideIcon,
  Plus,
  Search,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import type { Role } from "../../lib/auth/auth-context";

export interface NavItem {
  href: string;
  label: string;
  shortLabel?: string;
  icon: LucideIcon;
}

type Audience = Role | "GUEST";

export const NAV_ITEMS: Record<Audience, NavItem[]> = {
  GUEST: [
    { href: "/", label: "Início", icon: House },
    { href: "/vagas", label: "Vagas", icon: Search },
    {
      href: "/cadastro/empresa",
      label: "Para empresas",
      shortLabel: "Empresas",
      icon: Building2,
    },
    { href: "/login", label: "Entrar", icon: UserRound },
  ],
  WORKER: [
    { href: "/vagas", label: "Vagas", icon: Search },
    { href: "/painel", label: "Meu painel", shortLabel: "Painel", icon: LayoutDashboard },
    { href: "/painel/creditos", label: "Créditos", icon: Wallet },
    {
      href: "/painel/desbloqueios",
      label: "Desbloqueios",
      shortLabel: "Histórico",
      icon: History,
    },
  ],
  COMPANY: [
    {
      href: "/empresa",
      label: "Minhas vagas",
      shortLabel: "Minhas vagas",
      icon: BriefcaseBusiness,
    },
    { href: "/empresa/vagas/nova", label: "Nova vaga", icon: Plus },
    { href: "/vagas", label: "Vagas publicadas", shortLabel: "Publicadas", icon: Search },
  ],
  ADMIN: [
    { href: "/admin", label: "Moderação", icon: ClipboardCheck },
    { href: "/admin/contas", label: "Contas", icon: Users },
    { href: "/vagas", label: "Vagas", icon: Search },
  ],
};

export function navItemsFor(role: Role | undefined): NavItem[] {
  return NAV_ITEMS[role ?? "GUEST"];
}

// why: "/painel" não pode ficar ativo em "/painel/creditos" — só rotas sem
// filhos na navegação usam prefixo.
export function isActive(pathname: string, href: string, items: NavItem[]): boolean {
  if (pathname === href) return true;
  if (href === "/") return false;
  const hasChildInNav = items.some(
    (item) => item.href !== href && item.href.startsWith(`${href}/`),
  );
  return !hasChildInNav && pathname.startsWith(`${href}/`);
}
