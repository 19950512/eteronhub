import Link from "next/link";

export interface LegalConsentValue {
  acceptTerms: boolean;
  acceptPrivacyPolicy: boolean;
  confirmAdult: boolean;
}

export const EMPTY_LEGAL_CONSENT: LegalConsentValue = {
  acceptTerms: false,
  acceptPrivacyPolicy: false,
  confirmAdult: false,
};

interface LegalConsentFieldsProps {
  value: LegalConsentValue;
  onChange: (value: LegalConsentValue) => void;
  adultLabel: string;
}

// why: caixas separadas e desmarcadas — a LGPD (art. 8º) pede manifestação
// livre e destacada; um "ao se cadastrar você concorda" no rodapé não serve
// como prova de consentimento.
export function LegalConsentFields({
  value,
  onChange,
  adultLabel,
}: LegalConsentFieldsProps): JSX.Element {
  return (
    <fieldset className="fieldset consent-fields">
      <legend className="sr-only">Termos e privacidade</legend>
      <label className="check">
        <input
          type="checkbox"
          required
          checked={value.acceptTerms}
          onChange={(e) => onChange({ ...value, acceptTerms: e.target.checked })}
        />
        <span>
          Li e aceito os{" "}
          <Link href="/termos-de-uso" target="_blank">
            Termos de Uso
          </Link>
        </span>
      </label>
      <label className="check">
        <input
          type="checkbox"
          required
          checked={value.acceptPrivacyPolicy}
          onChange={(e) => onChange({ ...value, acceptPrivacyPolicy: e.target.checked })}
        />
        <span>
          Li e aceito a{" "}
          <Link href="/politica-de-privacidade" target="_blank">
            Política de Privacidade
          </Link>
        </span>
      </label>
      <label className="check">
        <input
          type="checkbox"
          required
          checked={value.confirmAdult}
          onChange={(e) => onChange({ ...value, confirmAdult: e.target.checked })}
        />
        <span>{adultLabel}</span>
      </label>
    </fieldset>
  );
}
