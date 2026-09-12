"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
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
      setError(err instanceof ApiRequestError ? err.message : "Não foi possível cadastrar o trabalhador");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 480, margin: "0 auto" }}>
      <h1>Cadastro de trabalhador</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="cpf">CPF</label>
          <input id="cpf" required value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} />
        </div>
        <div className="form-field">
          <label htmlFor="nome">Nome</label>
          <input id="nome" required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
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
