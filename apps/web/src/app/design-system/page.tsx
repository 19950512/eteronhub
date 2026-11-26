import {
  ArrowRight,
  Building2,
  ClipboardCheck,
  Coins,
  HardHat,
  History,
  LockKeyhole,
  LockOpen,
  MapPin,
  Plus,
  QrCode,
  Search,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import type { Metadata } from "next";
import { Logo, LogoMark } from "../../components/brand/logo";
import { JobCard, JobCardSkeleton } from "../../components/jobs/job-card";
import { Alert } from "../../components/ui/alert";
import { EmptyState } from "../../components/ui/empty-state";
import { Field } from "../../components/ui/field";
import { PageHeader } from "../../components/ui/page-header";
import { StatusBadge } from "../../components/ui/status-badge";

export const metadata: Metadata = {
  title: "Design System",
  description: "Tokens, componentes e padrões visuais do Eteron Hub.",
  robots: { index: false },
};

const COLOR_GROUPS: { title: string; tokens: { name: string; label: string }[] }[] = [
  {
    title: "Marca — Fagulha",
    tokens: [
      { name: "--spark-50", label: "Spark 50" },
      { name: "--spark-300", label: "Spark 300" },
      { name: "--spark-500", label: "Spark 500" },
      { name: "--spark-700", label: "Spark 700 · ação" },
      { name: "--spark-800", label: "Spark 800" },
    ],
  },
  {
    title: "Neutros — Aço",
    tokens: [
      { name: "--steel-50", label: "Steel 50" },
      { name: "--steel-200", label: "Steel 200" },
      { name: "--steel-500", label: "Steel 500" },
      { name: "--steel-800", label: "Steel 800" },
      { name: "--steel-900", label: "Steel 900 · tinta" },
    ],
  },
  {
    title: "Semânticas (seguem o tema claro/escuro)",
    tokens: [
      { name: "--color-primary", label: "Primary" },
      { name: "--color-success", label: "Success" },
      { name: "--color-warning", label: "Warning" },
      { name: "--color-danger", label: "Danger" },
      { name: "--color-info", label: "Info" },
      { name: "--color-surface", label: "Surface" },
      { name: "--color-bg", label: "Background" },
    ],
  },
];

const ICONS = [
  { icon: HardHat, name: "HardHat" },
  { icon: Building2, name: "Building2" },
  { icon: Search, name: "Search" },
  { icon: MapPin, name: "MapPin" },
  { icon: LockKeyhole, name: "LockKeyhole" },
  { icon: LockOpen, name: "LockOpen" },
  { icon: Wallet, name: "Wallet" },
  { icon: Coins, name: "Coins" },
  { icon: QrCode, name: "QrCode" },
  { icon: History, name: "History" },
  { icon: ClipboardCheck, name: "ClipboardCheck" },
  { icon: ShieldCheck, name: "ShieldCheck" },
];

const SAMPLE_JOB = {
  id: "exemplo",
  title: "Soldador MIG/MAG — estruturas metálicas",
  description: "",
  requirements: "",
  salaryRangeCents: { min: 350000, max: 480000 },
  location: "Joinville, SC",
  unlockCost: 10,
  publishedAt: null,
  expiresAt: null,
};

export default function DesignSystemPage(): JSX.Element {
  return (
    <div className="container page">
      <PageHeader
        eyebrow="Eteron Hub"
        title="Design System"
        description="Fonte da verdade visual do produto: tokens, componentes e padrões. Mobile-first, cores de texto e ação com contraste AA e tema claro/escuro automático."
      />

      <section className="ds-section" aria-labelledby="ds-marca">
        <h2 id="ds-marca">Marca</h2>
        <p className="text-muted">
          A porca sextavada representa a indústria metalúrgica; o “E” é formado por perfis
          como vigas, com um ponto de solda. Use o laranja Fagulha com moderação: ele
          sinaliza ação.
        </p>
        <div className="grid-3">
          <div
            className="card cluster"
            style={{ justifyContent: "center", minHeight: 120 }}
          >
            <Logo size={40} />
          </div>
          <div
            className="card card-inverse cluster"
            style={{ justifyContent: "center", minHeight: 120 }}
          >
            <Logo size={40} />
          </div>
          <div
            className="card cluster"
            style={{ justifyContent: "center", minHeight: 120 }}
          >
            <LogoMark size={64} />
            <LogoMark size={32} />
            <LogoMark size={16} />
          </div>
        </div>
      </section>

      <section className="ds-section" aria-labelledby="ds-cores">
        <h2 id="ds-cores">Cores</h2>
        {COLOR_GROUPS.map((group) => (
          <div key={group.title} className="stack-sm">
            <h3 className="text-sm">{group.title}</h3>
            <div className="swatch-grid">
              {group.tokens.map((token) => (
                <div key={token.name} className="swatch">
                  <div
                    className="swatch-color"
                    style={{ background: `var(${token.name})` }}
                  />
                  <div className="swatch-meta">
                    <strong>{token.label}</strong>
                    <code>{token.name}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="ds-section" aria-labelledby="ds-tipografia">
        <h2 id="ds-tipografia">Tipografia</h2>
        <p className="text-muted">
          Uma família só, <strong>Archivo</strong>: títulos estreitados pelo eixo de
          largura (<code>font-stretch</code>) em peso 800, texto na largura normal.
          Tamanhos fluidos com <code>clamp()</code>.
        </p>
        <div className="card stack">
          <p
            className="intro-title font-display"
            style={{ fontSize: "var(--text-display)" }}
          >
            Display
          </p>
          <h1>Título 1 — Encontre sua próxima obra</h1>
          <h2>Título 2 — Vagas recentes</h2>
          <h3>Título 3 — Soldador MIG/MAG</h3>
          <p>Corpo — Toda vaga passa por moderação antes de ir ao ar.</p>
          <p className="text-sm text-muted">Pequeno / muted — Publicada em 12/11/2026</p>
          <span className="eyebrow">Eyebrow</span>
        </div>
      </section>

      <section className="ds-section" aria-labelledby="ds-botoes">
        <h2 id="ds-botoes">Botões</h2>
        <p className="text-muted">
          Altura mínima de 44px (alvo de toque). Um único botão primário por bloco.
        </p>
        <div className="cluster">
          <button className="btn btn-primary">
            <Plus aria-hidden="true" />
            Primário
          </button>
          <button className="btn btn-secondary">Secundário</button>
          <button className="btn btn-ghost">Ghost</button>
          <button className="btn btn-danger">Perigo</button>
          <button className="btn btn-danger-outline">Perigo contorno</button>
          <button className="btn btn-primary" disabled>
            Desabilitado
          </button>
        </div>
        <div className="cluster">
          <button className="btn btn-primary btn-sm">Pequeno</button>
          <button className="btn btn-primary">Padrão</button>
          <button className="btn btn-primary btn-lg">
            Grande
            <ArrowRight aria-hidden="true" />
          </button>
        </div>
        <div className="card card-inverse cluster">
          <button className="btn btn-primary">Sobre fundo escuro</button>
          <button className="btn btn-on-dark">Secundário escuro</button>
        </div>
      </section>

      <section className="ds-section" aria-labelledby="ds-formularios">
        <h2 id="ds-formularios">Formulários</h2>
        <p className="text-muted">
          Campos com 16px de fonte (evita zoom no iOS), rótulo sempre visível e dica
          abaixo do campo.
        </p>
        <div className="card form" style={{ maxWidth: 560 }}>
          <Field id="ds-nome" label="Nome completo">
            <input id="ds-nome" placeholder="Maria da Silva" />
          </Field>
          <Field
            id="ds-local"
            label="Localização"
            hint="Cidade e estado, ou a região da obra."
          >
            <div className="input-group">
              <MapPin aria-hidden="true" />
              <input
                id="ds-local"
                placeholder="Cidade, estado ou região"
                aria-describedby="ds-local-hint"
              />
            </div>
          </Field>
          <div className="field-row">
            <Field id="ds-min" label="Salário mínimo">
              <div className="input-group">
                <span className="input-affix" aria-hidden="true">
                  R$
                </span>
                <input id="ds-min" inputMode="decimal" placeholder="0,00" />
              </div>
            </Field>
            <Field id="ds-obs" label="Turno" optional>
              <select id="ds-obs" defaultValue="">
                <option value="">Selecione</option>
                <option>Diurno</option>
                <option>Noturno</option>
              </select>
            </Field>
          </div>
          <div
            className="segmented"
            role="radiogroup"
            aria-label="Tipo de conta (exemplo)"
          >
            <button
              type="button"
              role="radio"
              aria-checked="true"
              className="segmented-option"
            >
              <HardHat aria-hidden="true" />
              Trabalhador
            </button>
            <button
              type="button"
              role="radio"
              aria-checked="false"
              className="segmented-option"
            >
              <Building2 aria-hidden="true" />
              Empresa
            </button>
          </div>
        </div>
      </section>

      <section className="ds-section" aria-labelledby="ds-status">
        <h2 id="ds-status">Status, badges e chips</h2>
        <div className="cluster">
          {["DRAFT", "IN_MODERATION", "PUBLISHED", "REJECTED", "CLOSED", "EXPIRED"].map(
            (status) => (
              <StatusBadge key={status} status={status} />
            ),
          )}
        </div>
        <div className="cluster">
          <span className="chip">
            <LockKeyhole aria-hidden="true" />
            Empresa oculta · 10 créditos
          </span>
          <span className="chip chip-primary">
            <MapPin aria-hidden="true" />
            Joinville, SC
          </span>
        </div>
      </section>

      <section className="ds-section" aria-labelledby="ds-alertas">
        <h2 id="ds-alertas">Alertas</h2>
        <div className="stack">
          <Alert tone="info">Toda vaga passa por moderação antes de ir ao ar.</Alert>
          <Alert tone="success" title="Pagamento confirmado!">
            Seus créditos já estão na carteira.
          </Alert>
          <Alert tone="warning">Nossa equipe está revisando esta vaga.</Alert>
          <Alert tone="error" title="Saldo insuficiente">
            Compre créditos para desbloquear esta vaga.
          </Alert>
        </div>
      </section>

      <section className="ds-section" aria-labelledby="ds-cards">
        <h2 id="ds-cards">Cards</h2>
        <div className="job-list">
          <JobCard jobPosting={SAMPLE_JOB} />
          <JobCardSkeleton />
        </div>
        <div className="grid-3">
          <div className="card card-inverse stack">
            <span className="stat-label" style={{ color: "var(--steel-300)" }}>
              Saldo de créditos
            </span>
            <div className="balance-value">
              <strong>40</strong>
              <span>créditos</span>
            </div>
          </div>
        </div>
        <EmptyState
          icon={Search}
          title="Estado vazio"
          description="Explique o porquê e ofereça o próximo passo."
          action={<button className="btn btn-primary">Ação principal</button>}
        />
      </section>

      <section className="ds-section" aria-labelledby="ds-icones">
        <h2 id="ds-icones">Ícones</h2>
        <p className="text-muted">
          Biblioteca <strong>lucide-react</strong>, traço 2px. Ícones decorativos levam{" "}
          <code>aria-hidden</code>.
        </p>
        <div className="ds-icons">
          {ICONS.map(({ icon: Icon, name }) => (
            <div key={name} className="ds-icon">
              <Icon aria-hidden="true" />
              {name}
            </div>
          ))}
        </div>
      </section>

      <section className="ds-section" aria-labelledby="ds-espacos">
        <h2 id="ds-espacos">Espaçamento, raios e sombras</h2>
        <div className="cluster" style={{ alignItems: "flex-end" }}>
          {[1, 2, 3, 4, 6, 8, 12, 16].map((step) => (
            <div key={step} className="stack-sm" style={{ alignItems: "center" }}>
              <span
                style={{
                  width: `var(--space-${step})`,
                  height: `var(--space-${step})`,
                  background: "var(--color-accent)",
                  borderRadius: 2,
                }}
              />
              <code className="text-xs">{step}</code>
            </div>
          ))}
        </div>
        <div className="grid-4">
          {["--radius-sm", "--radius", "--radius-lg", "--radius-xl"].map((radius) => (
            <div
              key={radius}
              className="card text-sm"
              style={{ borderRadius: `var(${radius})`, boxShadow: "var(--shadow)" }}
            >
              <code>{radius}</code>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
