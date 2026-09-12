"use client";

import { useState, type FormEvent } from "react";
import { JobPostingFormInput } from "../lib/api/job-postings";

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

export function JobPostingForm({ initialValues, submitLabel, onSubmit }: JobPostingFormProps): JSX.Element {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [requirements, setRequirements] = useState(initialValues?.requirements ?? "");
  const [location, setLocation] = useState(initialValues?.location ?? "");
  const [salaryMin, setSalaryMin] = useState(toReais(initialValues?.salaryMinCents));
  const [salaryMax, setSalaryMax] = useState(toReais(initialValues?.salaryMaxCents));
  const [unlockCost, setUnlockCost] = useState(String(initialValues?.unlockCost ?? 10));
  const [contactEmail, setContactEmail] = useState(initialValues?.contactEmail ?? "");
  const [contactPhone, setContactPhone] = useState(initialValues?.contactPhone ?? "");
  const [contactApplicationUrl, setContactApplicationUrl] = useState(initialValues?.contactApplicationUrl ?? "");
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
    <form onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="title">Título</label>
        <input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="form-field">
        <label htmlFor="description">Descrição</label>
        <textarea id="description" required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="form-field">
        <label htmlFor="requirements">Requisitos</label>
        <textarea id="requirements" required rows={3} value={requirements} onChange={(e) => setRequirements(e.target.value)} />
      </div>
      <div className="form-field">
        <label htmlFor="location">Localização</label>
        <input id="location" required value={location} onChange={(e) => setLocation(e.target.value)} />
      </div>
      <div className="button-row">
        <div className="form-field" style={{ flex: 1 }}>
          <label htmlFor="salaryMin">Salário mínimo (R$)</label>
          <input id="salaryMin" required value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} />
        </div>
        <div className="form-field" style={{ flex: 1 }}>
          <label htmlFor="salaryMax">Salário máximo (R$)</label>
          <input id="salaryMax" required value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} />
        </div>
      </div>
      <div className="form-field">
        <label htmlFor="unlockCost">Custo de desbloqueio (créditos)</label>
        <input
          id="unlockCost"
          type="number"
          min={0}
          required
          value={unlockCost}
          onChange={(e) => setUnlockCost(e.target.value)}
        />
      </div>
      <div className="form-field">
        <label htmlFor="contactEmail">E-mail de contato</label>
        <input id="contactEmail" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
      </div>
      <div className="form-field">
        <label htmlFor="contactPhone">Telefone de contato</label>
        <input id="contactPhone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
      </div>
      <div className="form-field">
        <label htmlFor="contactApplicationUrl">Link para candidatura</label>
        <input
          id="contactApplicationUrl"
          value={contactApplicationUrl}
          onChange={(e) => setContactApplicationUrl(e.target.value)}
        />
      </div>

      <p className="text-muted">Informe ao menos um meio de contato (e-mail, telefone ou link).</p>

      {error && <p className="error-message">{error}</p>}

      <button className="button" type="submit" disabled={submitting}>
        {submitting ? "Salvando..." : submitLabel}
      </button>
    </form>
  );
}
