"use client";

import { Save } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Alert } from "../../../components/ui/alert";
import { Field } from "../../../components/ui/field";
import { PageHeader } from "../../../components/ui/page-header";
import { Spinner } from "../../../components/ui/spinner";
import { ApiRequestError } from "../../../lib/api/client";
import {
  CompanyProfile,
  getCompanyProfile,
  updateCompanyProfile,
} from "../../../lib/api/profile";
import { useAuth } from "../../../lib/auth/auth-context";
import { RequireRole } from "../../../lib/auth/require-role";
import { formatPhone } from "../../../lib/format";
import { BRAZILIAN_STATES, COMPANY_SECTOR_LABELS } from "../../../lib/profile-options";

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiRequestError ? err.message : fallback;
}

interface FormState {
  nomeFantasia: string;
  sector: string;
  city: string;
  state: string;
  whatsapp: string;
  website: string;
}

function toFormState(profile: CompanyProfile): FormState {
  return {
    nomeFantasia: profile.nomeFantasia ?? "",
    sector: profile.sector ?? "",
    city: profile.city ?? "",
    state: profile.state ?? "",
    whatsapp: formatPhone(profile.whatsapp),
    website: profile.website ?? "",
  };
}

function CompanyProfileForm({ profile }: { profile: CompanyProfile }): JSX.Element {
  const { token } = useAuth();
  const [form, setForm] = useState<FormState>(toFormState(profile));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function update(field: keyof FormState, value: string): void {
    setForm((current) => ({ ...current, [field]: value }));
    setSaved(false);
  }

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setError(null);
    setSaved(false);
    try {
      const updated = await updateCompanyProfile(token, {
        nomeFantasia: form.nomeFantasia.trim() || null,
        sector: form.sector || null,
        city: form.city.trim() || null,
        state: form.state || null,
        whatsapp: form.whatsapp.trim() || null,
        website: form.website.trim() || null,
      });
      setForm(toFormState(updated));
      setSaved(true);
    } catch (err) {
      setError(errorMessage(err, "Não foi possível salvar o perfil"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <fieldset className="fieldset">
        <legend className="fieldset-legend">Identificação</legend>
        <Field
          id="nomeFantasia"
          label="Nome fantasia"
          hint="É o nome que o trabalhador vê depois de desbloquear uma vaga. Sem ele, usamos a razão social."
          optional
        >
          <input
            id="nomeFantasia"
            maxLength={100}
            aria-describedby="nomeFantasia-hint"
            value={form.nomeFantasia}
            onChange={(e) => update("nomeFantasia", e.target.value)}
          />
        </Field>
        <Field id="sector" label="Setor principal" optional>
          <select
            id="sector"
            value={form.sector}
            onChange={(e) => update("sector", e.target.value)}
          >
            <option value="">Selecione o setor</option>
            {Object.entries(COMPANY_SECTOR_LABELS).map(([code, label]) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
        </Field>
      </fieldset>

      <fieldset className="fieldset">
        <legend className="fieldset-legend">Localização</legend>
        <div className="field-row">
          <Field id="city" label="Cidade" optional>
            <input
              id="city"
              autoComplete="address-level2"
              maxLength={100}
              placeholder="Ex.: São Paulo"
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
            />
          </Field>
          <Field id="state" label="Estado (UF)" optional>
            <select
              id="state"
              value={form.state}
              onChange={(e) => update("state", e.target.value)}
            >
              <option value="">UF</option>
              {BRAZILIAN_STATES.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </fieldset>

      <fieldset className="fieldset">
        <legend className="fieldset-legend">Contato da empresa</legend>
        <Field
          id="whatsapp"
          label="WhatsApp"
          hint="Com DDD. Ex.: (11) 98765-4321"
          optional
        >
          <input
            id="whatsapp"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(00) 00000-0000"
            aria-describedby="whatsapp-hint"
            value={form.whatsapp}
            onChange={(e) => update("whatsapp", e.target.value)}
          />
        </Field>
        <Field id="website" label="Site" optional>
          <input
            id="website"
            inputMode="url"
            autoComplete="url"
            placeholder="https://"
            maxLength={200}
            value={form.website}
            onChange={(e) => update("website", e.target.value)}
          />
        </Field>
      </fieldset>

      {error && <Alert tone="error">{error}</Alert>}
      {saved && <Alert tone="success">Perfil atualizado com sucesso.</Alert>}

      <button className="btn btn-primary btn-lg" type="submit" disabled={submitting}>
        {submitting ? <Spinner /> : <Save aria-hidden="true" />}
        {submitting ? "Salvando..." : "Salvar perfil"}
      </button>
    </form>
  );
}

function CompanyProfilePage(): JSX.Element {
  const { token } = useAuth();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    getCompanyProfile(token)
      .then(setProfile)
      .catch((err: unknown) => setError(errorMessage(err, "Erro ao carregar o perfil")));
  }, [token]);

  return (
    <div className="container container-narrow page">
      <PageHeader
        eyebrow="Área da empresa"
        title="Perfil da empresa"
        description="Estes dados não aparecem na listagem de vagas: sua empresa continua anônima. O contato que o trabalhador recebe é o informado em cada vaga."
      />

      {error && <Alert tone="error">{error}</Alert>}

      {!profile && !error && (
        <div className="card stack" aria-busy="true">
          <span className="skeleton" style={{ height: 20, width: "50%" }} />
          <span className="skeleton" style={{ height: 44 }} />
          <span className="skeleton" style={{ height: 44 }} />
        </div>
      )}

      {profile && (
        <div className="stack-lg">
          <section className="card" aria-labelledby="dados-titulo">
            <h2 id="dados-titulo" className="card-title">
              Dados cadastrais
            </h2>
            <dl className="data-list">
              <div>
                <dt>Razão social</dt>
                <dd>{profile.razaoSocial}</dd>
              </div>
              <div>
                <dt>CNPJ</dt>
                <dd>{profile.cnpj}</dd>
              </div>
              <div>
                <dt>E-mail de acesso</dt>
                <dd>{profile.email}</dd>
              </div>
            </dl>
          </section>

          <section className="card" aria-label="Perfil da empresa">
            <CompanyProfileForm profile={profile} />
          </section>
        </div>
      )}
    </div>
  );
}

export default function CompanyProfileRoute(): JSX.Element {
  return (
    <RequireRole role="COMPANY" redirectTo="/login">
      <CompanyProfilePage />
    </RequireRole>
  );
}
