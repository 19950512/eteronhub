"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { registerCompany } from "../../../lib/api/auth";
import { ApiRequestError } from "../../../lib/api/client";

export default function RegisterCompanyPage(): JSX.Element {
  const router = useRouter();
  const [form, setForm] = useState({ cnpj: "", razaoSocial: "", nomeFantasia: "", email: "", password: "" });
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
      setError(err instanceof ApiRequestError ? err.message : "Não foi possível cadastrar a empresa");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 480, margin: "0 auto" }}>
      <h1>Cadastro de empresa</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="cnpj">CNPJ</label>
          <input
            id="cnpj"
            required
            value={form.cnpj}
            onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
          />
        </div>
        <div className="form-field">
          <label htmlFor="razaoSocial">Razão social</label>
          <input
            id="razaoSocial"
            required
            value={form.razaoSocial}
            onChange={(e) => setForm({ ...form, razaoSocial: e.target.value })}
          />
        </div>
        <div className="form-field">
          <label htmlFor="nomeFantasia">Nome fantasia (opcional)</label>
          <input
            id="nomeFantasia"
            value={form.nomeFantasia}
            onChange={(e) => setForm({ ...form, nomeFantasia: e.target.value })}
          />
        </div>
        <div className="form-field">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="form-field">
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            minLength={8}
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <button className="button" type="submit" disabled={submitting}>
          {submitting ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>
    </div>
  );
}
