"use client";

import { ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Alert } from "../../../components/ui/alert";
import { Field } from "../../../components/ui/field";
import { Spinner } from "../../../components/ui/spinner";
import { loginAdmin } from "../../../lib/api/auth";
import { ApiRequestError } from "../../../lib/api/client";
import { useAuth } from "../../../lib/auth/auth-context";

export default function AdminLoginPage(): JSX.Element {
  const router = useRouter();
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { accessToken } = await loginAdmin({ email, password });
      auth.login(accessToken);
      router.push("/admin");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Não foi possível entrar");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="center-screen">
      <div
        className="card auth-card"
        style={{ marginTop: 0, alignItems: "stretch", textAlign: "left" }}
      >
        <div className="auth-card-header">
          <span className="icon-tile icon-tile-lg">
            <ShieldCheck aria-hidden="true" />
          </span>
          <h1>Acesso administrativo</h1>
          <p className="text-muted">Área restrita à equipe de moderação do Eteron Hub.</p>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          <Field id="email" label="E-mail">
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field id="password" label="Senha">
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>

          {error && <Alert tone="error">{error}</Alert>}

          <button
            className="btn btn-primary btn-lg btn-block"
            type="submit"
            disabled={submitting}
          >
            {submitting && <Spinner />}
            {submitting ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
