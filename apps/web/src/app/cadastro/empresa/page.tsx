"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { marketImages } from "../../../assets/images";
import { AuthShell } from "../../../components/auth/auth-shell";
import { Alert } from "../../../components/ui/alert";
import { Field } from "../../../components/ui/field";
import { Spinner } from "../../../components/ui/spinner";
import { registerCompany } from "../../../lib/api/auth";
import { ApiRequestError } from "../../../lib/api/client";

export default function RegisterCompanyPage(): JSX.Element {
  const router = useRouter();
  const [form, setForm] = useState({
    cnpj: "",
    razaoSocial: "",
    nomeFantasia: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await registerCompany({ ...form, nomeFantasia: form.nomeFantasia || undefined });
      router.push("/login?cadastro=empresa");
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Não foi possível cadastrar a empresa",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      image={marketImages.steelAssembly}
      headline="Encontre mão de obra qualificada para sua obra."
      description="Publique vagas para soldadores, caldeireiros, montadores e serralheiros. Sua empresa só aparece para quem desbloquear a vaga."
      highlights={[
        "Vagas revisadas antes de publicar",
        "Empresa anônima na listagem",
        "Contato de quem tem interesse real",
      ]}
    >
      <div className="auth-card-header">
        <span className="eyebrow">Para empresas</span>
        <h1>Cadastre sua empresa</h1>
        <p className="text-muted">
          Leva poucos minutos. Depois é só publicar sua primeira vaga.
        </p>
      </div>
      <form className="form" onSubmit={handleSubmit}>
        <Field
          id="cnpj"
          label="CNPJ"
          hint="Somente números ou no formato 00.000.000/0000-00"
        >
          <input
            id="cnpj"
            inputMode="numeric"
            autoComplete="off"
            placeholder="00.000.000/0000-00"
            aria-describedby="cnpj-hint"
            required
            value={form.cnpj}
            onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
          />
        </Field>
        <Field id="razaoSocial" label="Razão social">
          <input
            id="razaoSocial"
            autoComplete="organization"
            required
            value={form.razaoSocial}
            onChange={(e) => setForm({ ...form, razaoSocial: e.target.value })}
          />
        </Field>
        <Field id="nomeFantasia" label="Nome fantasia" optional>
          <input
            id="nomeFantasia"
            value={form.nomeFantasia}
            onChange={(e) => setForm({ ...form, nomeFantasia: e.target.value })}
          />
        </Field>
        <Field id="email" label="E-mail corporativo">
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>
        <Field id="password" label="Senha" hint="Mínimo de 8 caracteres">
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            aria-describedby="password-hint"
            minLength={8}
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </Field>

        {error && <Alert tone="error">{error}</Alert>}

        <button
          className="btn btn-primary btn-lg btn-block"
          type="submit"
          disabled={submitting}
        >
          {submitting && <Spinner />}
          {submitting ? "Cadastrando..." : "Criar conta da empresa"}
        </button>
        <p className="text-xs text-muted text-center">
          Ao se cadastrar, você concorda com a nossa{" "}
          <Link href="/politica-de-privacidade">Política de Privacidade</Link>.
        </p>
      </form>
      <p className="text-sm text-muted text-center">
        Já tem conta? <Link href="/login">Entrar</Link>
      </p>
    </AuthShell>
  );
}
