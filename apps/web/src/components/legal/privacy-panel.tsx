"use client";

import { Download, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ApiRequestError } from "../../lib/api/client";
import { deleteMyAccount, exportMyData } from "../../lib/api/privacy";
import { useAuth } from "../../lib/auth/auth-context";
import { PRIVACY_CONTACT_EMAIL } from "../../lib/legal";
import { Alert } from "../ui/alert";
import { Field } from "../ui/field";
import { Spinner } from "../ui/spinner";

const DELETION_CONSEQUENCES = {
  WORKER: [
    "Seu nome, e-mail, telefone e perfil profissional são apagados e você perde o acesso.",
    "Créditos que sobraram na carteira deixam de poder ser usados.",
    "Ficam guardados, sem uso comercial, o CPF e o histórico de pagamentos Pix e desbloqueios, pelo prazo que a lei exige.",
  ],
  COMPANY: [
    "Nome fantasia, e-mail, WhatsApp, site e localização são apagados e a empresa perde o acesso.",
    "Todas as vagas abertas, em moderação ou em rascunho são encerradas na hora.",
    "Ficam guardados CNPJ, razão social e o histórico das vagas, pelo prazo que a lei exige.",
  ],
} as const;

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiRequestError ? err.message : fallback;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function PrivacyPanel({ role }: { role: "WORKER" | "COMPANY" }): JSX.Element {
  const { token, logout } = useAuth();
  const router = useRouter();
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [deletionOpen, setDeletionOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [understood, setUnderstood] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletionError, setDeletionError] = useState<string | null>(null);

  async function handleExport(): Promise<void> {
    if (!token) return;
    setExporting(true);
    setExportError(null);
    try {
      const data = await exportMyData(token);
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `eteronhub-meus-dados-${today()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportError(errorMessage(err, "Não foi possível gerar o arquivo"));
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (!token) return;
    setDeleting(true);
    setDeletionError(null);
    try {
      await deleteMyAccount(token, password);
      // why: navega antes de limpar a sessão — se o logout viesse primeiro, o
      // RequireRole desta página redirecionaria para /login sem o aviso.
      router.replace("/login?conta=excluida");
      logout();
    } catch (err) {
      setDeletionError(errorMessage(err, "Não foi possível excluir a conta"));
      setDeleting(false);
    }
  }

  return (
    <section className="card stack" aria-labelledby="privacidade-titulo">
      <div className="stack-sm">
        <h2 id="privacidade-titulo" className="card-title" style={{ margin: 0 }}>
          Privacidade e dados
        </h2>
        <p className="text-sm text-muted">
          Direitos garantidos pela LGPD. Detalhes na{" "}
          <Link href="/politica-de-privacidade">Política de Privacidade</Link>; dúvidas em{" "}
          <a href={`mailto:${PRIVACY_CONTACT_EMAIL}`}>{PRIVACY_CONTACT_EMAIL}</a>.
        </p>
      </div>

      <div className="card-section stack-sm">
        <h3 className="privacy-heading">Cópia dos seus dados</h3>
        <p className="text-sm text-muted">
          Um arquivo JSON com tudo o que guardamos sobre a sua conta: cadastro, aceites
          dos termos e o histórico de uso.
        </p>
        {exportError && <Alert tone="error">{exportError}</Alert>}
        <div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? <Spinner /> : <Download aria-hidden="true" />}
            {exporting ? "Gerando arquivo..." : "Baixar meus dados"}
          </button>
        </div>
      </div>

      <div className="card-section stack-sm">
        <h3 className="privacy-heading">Excluir conta</h3>
        {!deletionOpen ? (
          <>
            <p className="text-sm text-muted">
              Apaga seus dados pessoais e encerra o acesso. Não dá para desfazer.
            </p>
            <div>
              <button
                type="button"
                className="btn btn-danger-outline"
                onClick={() => setDeletionOpen(true)}
              >
                <Trash2 aria-hidden="true" />
                Excluir minha conta
              </button>
            </div>
          </>
        ) : (
          <form className="form" onSubmit={handleDelete}>
            <ul className="deletion-list text-sm">
              {DELETION_CONSEQUENCES[role].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Field id="delete-password" label="Confirme com sua senha">
              <input
                id="delete-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            <label className="check">
              <input
                type="checkbox"
                required
                checked={understood}
                onChange={(e) => setUnderstood(e.target.checked)}
              />
              <span>Entendo que a exclusão é definitiva.</span>
            </label>
            {deletionError && <Alert tone="error">{deletionError}</Alert>}
            <div className="cluster">
              <button
                type="submit"
                className="btn btn-danger"
                disabled={deleting || !understood || password.length === 0}
              >
                {deleting && <Spinner />}
                {deleting ? "Excluindo..." : "Excluir definitivamente"}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setDeletionOpen(false);
                  setPassword("");
                  setUnderstood(false);
                  setDeletionError(null);
                }}
                disabled={deleting}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
