"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { login } from "../../lib/api/auth";
import { ApiRequestError } from "../../lib/api/client";
import { useAuth } from "../../lib/auth/auth-context";

export default function LoginPage(): JSX.Element {
  const router = useRouter();
  const auth = useAuth();
  const [role, setRole] = useState<"COMPANY" | "WORKER">("WORKER");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { accessToken } = await login({ role, email, password });
      auth.login(accessToken);
      router.push(role === "COMPANY" ? "/empresa" : "/painel");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Não foi possível entrar");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 420, margin: "0 auto" }}>
      <h1>Entrar</h1>

      <div className="button-row" style={{ marginBottom: "1rem" }}>
        <button
          type="button"
          className={role === "WORKER" ? "button" : "button button-secondary"}
          onClick={() => setRole("WORKER")}
        >
          Sou trabalhador
        </button>
        <button
          type="button"
          className={role === "COMPANY" ? "button" : "button button-secondary"}
          onClick={() => setRole("COMPANY")}
        >
          Sou empresa
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="email">E-mail</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="form-field">
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <button className="button" type="submit" disabled={submitting}>
          {submitting ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="text-muted" style={{ marginTop: "1rem" }}>
        É admin? <a href="/admin/login">Entre por aqui</a>.
      </p>
    </div>
  );
}
