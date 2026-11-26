"use client";

import { Plus, Save, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Alert } from "../../../components/ui/alert";
import { Field } from "../../../components/ui/field";
import { PrivacyPanel } from "../../../components/legal/privacy-panel";
import { PageHeader } from "../../../components/ui/page-header";
import { Spinner } from "../../../components/ui/spinner";
import { ApiRequestError } from "../../../lib/api/client";
import {
  getWorkerProfile,
  updateWorkerProfile,
  WorkerProfile,
  WorkerSoftware,
} from "../../../lib/api/profile";
import { useAuth } from "../../../lib/auth/auth-context";
import { RequireRole } from "../../../lib/auth/require-role";
import { formatPhone } from "../../../lib/format";
import {
  WORKER_BIO_MAX_LENGTH,
  WORKER_MAX_SEGMENTS,
  WORKER_MAX_SOFTWARES,
  WORKER_SEGMENT_LABELS,
} from "../../../lib/profile-options";

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiRequestError ? err.message : fallback;
}

function WorkerProfileForm({ profile }: { profile: WorkerProfile }): JSX.Element {
  const { token } = useAuth();
  const [phone, setPhone] = useState(formatPhone(profile.phone));
  const [bio, setBio] = useState(profile.bio ?? "");
  const [segments, setSegments] = useState<string[]>(profile.segments);
  const [softwares, setSoftwares] = useState<WorkerSoftware[]>(profile.softwares);
  const [softwareName, setSoftwareName] = useState("");
  const [softwareVersion, setSoftwareVersion] = useState("");
  const [softwareError, setSoftwareError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function toggleSegment(code: string): void {
    setSaved(false);
    setSegments((current) =>
      current.includes(code)
        ? current.filter((item) => item !== code)
        : [...current, code],
    );
  }

  function addSoftware(): void {
    const name = softwareName.trim();
    if (!name) {
      setSoftwareError("Informe o nome do software.");
      return;
    }
    if (softwares.some((item) => item.name.toLowerCase() === name.toLowerCase())) {
      setSoftwareError("Esse software já está na lista.");
      return;
    }
    setSoftwares([...softwares, { name, version: softwareVersion.trim() || null }]);
    setSoftwareName("");
    setSoftwareVersion("");
    setSoftwareError(null);
    setSaved(false);
  }

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setError(null);
    setSaved(false);
    try {
      const updated = await updateWorkerProfile(token, {
        phone: phone.trim() || null,
        bio: bio.trim() || null,
        segments,
        softwares,
      });
      setPhone(formatPhone(updated.phone));
      setBio(updated.bio ?? "");
      setSegments(updated.segments);
      setSoftwares(updated.softwares);
      setSaved(true);
    } catch (err) {
      setError(errorMessage(err, "Não foi possível salvar o perfil"));
    } finally {
      setSubmitting(false);
    }
  }

  const segmentLimitReached = segments.length >= WORKER_MAX_SEGMENTS;

  return (
    <form className="form" onSubmit={handleSubmit}>
      <fieldset className="fieldset">
        <legend className="fieldset-legend">Contato</legend>
        <Field
          id="phone"
          label="Telefone / WhatsApp"
          hint="Com DDD. Ex.: (11) 98765-4321"
          optional
        >
          <input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(00) 00000-0000"
            aria-describedby="phone-hint"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setSaved(false);
            }}
          />
        </Field>
      </fieldset>

      <fieldset className="fieldset">
        <legend className="fieldset-legend">Sobre mim</legend>
        <Field
          id="bio"
          label="Apresentação"
          hint={`${bio.length}/${WORKER_BIO_MAX_LENGTH} caracteres`}
          optional
        >
          <textarea
            id="bio"
            rows={5}
            maxLength={WORKER_BIO_MAX_LENGTH}
            placeholder="Conte um pouco sobre você, sua experiência e especialidades..."
            aria-describedby="bio-hint"
            value={bio}
            onChange={(e) => {
              setBio(e.target.value);
              setSaved(false);
            }}
          />
        </Field>
      </fieldset>

      <fieldset className="fieldset">
        <legend className="fieldset-legend">
          Segmentos de atuação ({segments.length}/{WORKER_MAX_SEGMENTS})
        </legend>
        <p className="hint">Selecione os tipos de obra e serviço em que você trabalha.</p>
        <div className="cluster">
          {Object.entries(WORKER_SEGMENT_LABELS).map(([code, label]) => {
            const selected = segments.includes(code);
            return (
              <button
                key={code}
                type="button"
                className="chip chip-toggle"
                aria-pressed={selected}
                disabled={!selected && segmentLimitReached}
                onClick={() => toggleSegment(code)}
              >
                {label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="fieldset">
        <legend className="fieldset-legend">Softwares utilizados</legend>
        {softwares.length > 0 ? (
          <ul
            className="cluster"
            aria-label="Softwares adicionados"
            style={{ padding: 0, listStyle: "none" }}
          >
            {softwares.map((software) => (
              <li key={software.name} className="chip chip-primary">
                {software.name}
                {software.version && <span> v{software.version}</span>}
                <button
                  type="button"
                  className="chip-remove"
                  aria-label={`Remover ${software.name}`}
                  onClick={() => {
                    setSoftwares(softwares.filter((item) => item.name !== software.name));
                    setSaved(false);
                  }}
                >
                  <X aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="hint">Nenhum software adicionado.</p>
        )}
        {softwares.length < WORKER_MAX_SOFTWARES && (
          <>
            <div className="field-row">
              <Field id="softwareName" label="Nome do software">
                <input
                  id="softwareName"
                  placeholder="Ex.: Tekla Structures"
                  maxLength={100}
                  value={softwareName}
                  onChange={(e) => setSoftwareName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSoftware();
                    }
                  }}
                />
              </Field>
              <Field id="softwareVersion" label="Versão" optional>
                <input
                  id="softwareVersion"
                  placeholder="Ex.: 2024.1"
                  maxLength={50}
                  value={softwareVersion}
                  onChange={(e) => setSoftwareVersion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSoftware();
                    }
                  }}
                />
              </Field>
            </div>
            {softwareError && <Alert tone="error">{softwareError}</Alert>}
            <div>
              <button type="button" className="btn btn-secondary" onClick={addSoftware}>
                <Plus aria-hidden="true" />
                Adicionar software
              </button>
            </div>
          </>
        )}
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

function WorkerProfilePage(): JSX.Element {
  const { token } = useAuth();
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    getWorkerProfile(token)
      .then(setProfile)
      .catch((err: unknown) => setError(errorMessage(err, "Erro ao carregar o perfil")));
  }, [token]);

  return (
    <div className="container container-narrow page">
      <PageHeader
        eyebrow="Área do trabalhador"
        title="Meu perfil"
        description="Conte para as empresas no que você trabalha e quais ferramentas domina."
      />

      {error && <Alert tone="error">{error}</Alert>}

      {!profile && !error && (
        <div className="card stack" aria-busy="true">
          <span className="skeleton" style={{ height: 20, width: "50%" }} />
          <span className="skeleton" style={{ height: 44 }} />
          <span className="skeleton" style={{ height: 120 }} />
        </div>
      )}

      {profile && (
        <div className="stack-lg">
          <section className="card" aria-labelledby="conta-titulo">
            <h2 id="conta-titulo" className="card-title">
              Dados da conta
            </h2>
            <dl className="data-list">
              <div>
                <dt>Nome</dt>
                <dd>{profile.nome}</dd>
              </div>
              <div>
                <dt>CPF</dt>
                <dd>{profile.cpf}</dd>
              </div>
              <div>
                <dt>E-mail</dt>
                <dd>{profile.email}</dd>
              </div>
            </dl>
          </section>

          <section className="card" aria-label="Perfil profissional">
            <WorkerProfileForm profile={profile} />
          </section>

          <PrivacyPanel role="WORKER" />
        </div>
      )}
    </div>
  );
}

export default function WorkerProfileRoute(): JSX.Element {
  return (
    <RequireRole role="WORKER" redirectTo="/login">
      <WorkerProfilePage />
    </RequireRole>
  );
}
