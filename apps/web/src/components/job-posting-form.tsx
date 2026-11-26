"use client";

import { Save } from "lucide-react";
import { useState, type FormEvent } from "react";
import { JobPostingFormInput } from "../lib/api/job-postings";
import { Alert } from "./ui/alert";
import { Field } from "./ui/field";
import { Spinner } from "./ui/spinner";

interface JobPostingFormProps {
  initialValues?: Partial<JobPostingFormInput>;
  submitLabel: string;
  onSubmit: (input: JobPostingFormInput) => Promise<void>;
}

function toReais(cents: number | undefined): string {
  return cents === undefined ? "" : String(cents / 100);
}

function toCents(reais: string): number {
  return Math.round(Number(reais.replace(",", ".")) * 100);
}

export function JobPostingForm({
  initialValues,
  submitLabel,
  onSubmit,
}: JobPostingFormProps): JSX.Element {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [requirements, setRequirements] = useState(initialValues?.requirements ?? "");
  const [location, setLocation] = useState(initialValues?.location ?? "");
  const [salaryMin, setSalaryMin] = useState(toReais(initialValues?.salaryMinCents));
  const [salaryMax, setSalaryMax] = useState(toReais(initialValues?.salaryMaxCents));
  const [unlockCost, setUnlockCost] = useState(String(initialValues?.unlockCost ?? 10));
  const [contactEmail, setContactEmail] = useState(initialValues?.contactEmail ?? "");
  const [contactPhone, setContactPhone] = useState(initialValues?.contactPhone ?? "");
  const [contactApplicationUrl, setContactApplicationUrl] = useState(
    initialValues?.contactApplicationUrl ?? "",
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        title,
        description,
        requirements,
        location,
        salaryMinCents: toCents(salaryMin),
        salaryMaxCents: toCents(salaryMax),
        unlockCost: Number(unlockCost),
        contactEmail: contactEmail || undefined,
        contactPhone: contactPhone || undefined,
        contactApplicationUrl: contactApplicationUrl || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar a vaga");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <fieldset className="fieldset">
        <legend className="fieldset-legend">Sobre a vaga</legend>
        <Field
          id="title"
          label="Título"
          hint="Ex.: Soldador MIG/MAG — estruturas metálicas"
        >
          <input
            id="title"
            required
            aria-describedby="title-hint"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>
        <Field
          id="description"
          label="Descrição"
          hint="Atividades, jornada, benefícios e tipo de contratação."
        >
          <textarea
            id="description"
            required
            rows={5}
            aria-describedby="description-hint"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
        <Field
          id="requirements"
          label="Requisitos"
          hint="Experiência, certificações (ex.: NR-34, NR-35) e ferramentas."
        >
          <textarea
            id="requirements"
            required
            rows={4}
            aria-describedby="requirements-hint"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
          />
        </Field>
        <Field
          id="location"
          label="Localização"
          hint="Cidade e estado, ou a região da obra."
        >
          <input
            id="location"
            required
            autoComplete="address-level2"
            aria-describedby="location-hint"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </Field>
      </fieldset>

      <fieldset className="fieldset">
        <legend className="fieldset-legend">Remuneração e desbloqueio</legend>
        <div className="field-row">
          <Field id="salaryMin" label="Salário mínimo">
            <div className="input-group">
              <span className="input-affix" aria-hidden="true">
                R$
              </span>
              <input
                id="salaryMin"
                inputMode="decimal"
                placeholder="0,00"
                required
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
              />
            </div>
          </Field>
          <Field id="salaryMax" label="Salário máximo">
            <div className="input-group">
              <span className="input-affix" aria-hidden="true">
                R$
              </span>
              <input
                id="salaryMax"
                inputMode="decimal"
                placeholder="0,00"
                required
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
              />
            </div>
          </Field>
        </div>
        <Field
          id="unlockCost"
          label="Custo de desbloqueio (créditos)"
          hint="Quantos créditos o trabalhador usa para ver o contato da empresa."
        >
          <input
            id="unlockCost"
            type="number"
            inputMode="numeric"
            min={0}
            required
            aria-describedby="unlockCost-hint"
            value={unlockCost}
            onChange={(e) => setUnlockCost(e.target.value)}
          />
        </Field>
      </fieldset>

      <fieldset className="fieldset">
        <legend className="fieldset-legend">Contato</legend>
        <p className="hint" style={{ marginTop: "calc(-1 * var(--space-2))" }}>
          Informe ao menos um meio de contato. Ele só aparece para quem desbloquear a
          vaga.
        </p>
        <Field id="contactEmail" label="E-mail de contato" optional>
          <input
            id="contactEmail"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
        </Field>
        <Field id="contactPhone" label="Telefone / WhatsApp" optional>
          <input
            id="contactPhone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(00) 00000-0000"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />
        </Field>
        <Field id="contactApplicationUrl" label="Link para candidatura" optional>
          <input
            id="contactApplicationUrl"
            inputMode="url"
            placeholder="https://"
            value={contactApplicationUrl}
            onChange={(e) => setContactApplicationUrl(e.target.value)}
          />
        </Field>
      </fieldset>

      {error && <Alert tone="error">{error}</Alert>}

      <button className="btn btn-primary btn-lg" type="submit" disabled={submitting}>
        {submitting ? <Spinner /> : <Save aria-hidden="true" />}
        {submitting ? "Salvando..." : submitLabel}
      </button>
    </form>
  );
}
