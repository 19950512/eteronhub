"use client";

import { Building2, HardHat, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { marketImages } from "../../assets/images";
import { AuthShell } from "../../components/auth/auth-shell";
import { Alert } from "../../components/ui/alert";
import { Field } from "../../components/ui/field";
import { Spinner } from "../../components/ui/spinner";
import { login } from "../../lib/api/auth";
import { ApiRequestError } from "../../lib/api/client";
import { useAuth } from "../../lib/auth/auth-context";

type LoginRole = "COMPANY" | "WORKER";

function LoginForm(): JSX.Element {
  const router = useRouter();
  const auth = useAuth();
  const searchParams = useSearchParams();
  const registered = searchParams.get("cadastro");
  const accountDeleted = searchParams.get("conta") === "excluida";
  const [role, setRole] = useState<LoginRole>(
    registered === "empresa" ? "COMPANY" : "WORKER",
  );
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

  const options: { value: LoginRole; label: string; icon: typeof HardHat }[] = [
    { value: "WORKER", label: "Trabalhador", icon: HardHat },
    { value: "COMPANY", label: "Empresa", icon: Building2 },
  ];

  return (
    <>
      <div className="auth-card-header">
        <h1>Entrar</h1>
        <p className="text-muted">
          Bem-vindo de volta. Escolha como você usa o Eteron Hub.
        </p>
      </div>

      {accountDeleted && (
        <Alert tone="success" title="Conta excluída">
          Seus dados pessoais foram apagados. Guardamos só os registros financeiros e de
          aceite que a lei manda manter.
        </Alert>
      )}

      {registered && (
        <Alert tone="success" title="Cadastro concluído!">
          Agora é só entrar com o e-mail e a senha que você cadastrou.
        </Alert>
      )}

      <div className="segmented" role="radiogroup" aria-label="Tipo de conta">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={role === option.value}
            className="segmented-option"
            onClick={() => setRole(option.value)}
          >
            <option.icon aria-hidden="true" />
            {option.label}
          </button>
        ))}
      </div>

      <form className="form" onSubmit={handleSubmit}>
        <Field id="email" label="E-mail">
          <input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
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
          {submitting ? <Spinner /> : <LogIn aria-hidden="true" />}
          {submitting ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="text-sm text-muted text-center">
        Ainda não tem conta?{" "}
        <Link href={role === "COMPANY" ? "/cadastro/empresa" : "/cadastro/trabalhador"}>
          Cadastre-se
        </Link>
      </p>
      <p className="text-xs text-muted text-center">
        É da equipe Eteron Hub? <Link href="/admin/login">Acesso administrativo</Link>
      </p>
    </>
  );
}

export default function LoginPage(): JSX.Element {
  return (
    <AuthShell
      image={marketImages.weldingFrame}
      headline="O ponto de encontro da metalurgia."
      description="Trabalhadores encontram vagas revisadas; empresas recebem contato de quem tem interesse real."
      highlights={[
        "Vagas moderadas pela equipe",
        "Créditos via Pix",
        "Contato direto com a empresa",
      ]}
    >
      <Suspense fallback={<Spinner label="Carregando..." />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
