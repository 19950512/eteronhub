"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { marketImages } from "../../../assets/images";
import { AuthShell } from "../../../components/auth/auth-shell";
import { Alert } from "../../../components/ui/alert";
import { Field } from "../../../components/ui/field";
import { Spinner } from "../../../components/ui/spinner";
import { registerWorker } from "../../../lib/api/auth";
import { ApiRequestError } from "../../../lib/api/client";

export default function RegisterWorkerPage(): JSX.Element {
  const router = useRouter();
  const [form, setForm] = useState({ cpf: "", nome: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await registerWorker(form);
      router.push("/login?cadastro=trabalhador");
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Não foi possível cadastrar o trabalhador",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      image={marketImages.grindingSparks}
      headline="Sua próxima obra começa aqui."
      description="Vagas de soldagem, caldeiraria, montagem e estruturas metálicas, com salário à vista e contato direto com a empresa."
      highlights={[
        "Busque vagas sem precisar de cadastro",
        "Créditos via Pix",
        "Contato direto com quem contrata",
      ]}
    >
      <div className="auth-card-header">
        <span className="eyebrow">Para trabalhadores</span>
        <h1>Crie sua conta</h1>
        <p className="text-muted">
          Com a conta você compra créditos e desbloqueia o contato das empresas.
        </p>
      </div>
      <form className="form" onSubmit={handleSubmit}>
        <Field id="nome" label="Nome completo">
          <input
            id="nome"
            autoComplete="name"
            required
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />
        </Field>
        <Field id="cpf" label="CPF">
          <input
            id="cpf"
            inputMode="numeric"
            autoComplete="off"
            placeholder="000.000.000-00"
            required
            value={form.cpf}
            onChange={(e) => setForm({ ...form, cpf: e.target.value })}
          />
        </Field>
        <Field id="email" label="E-mail">
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
          {submitting ? "Cadastrando..." : "Criar minha conta"}
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
