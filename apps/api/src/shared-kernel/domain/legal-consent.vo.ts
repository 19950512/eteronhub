import { ValidationError } from "./domain-error";

// invariant: as mesmas versões aparecem no topo das páginas públicas
// (apps/web/src/lib/legal.ts). Ao mudar o texto dos Termos ou da Política,
// suba a versão nos dois lugares — o registro de consentimento guarda a versão
// que o usuário aceitou.
export const TERMS_OF_USE_VERSION = "2026-11-25";
export const PRIVACY_POLICY_VERSION = "2026-11-25";

export class LegalConsentRequiredError extends ValidationError {}

export interface LegalConsentInput {
  acceptTerms: boolean;
  acceptPrivacyPolicy: boolean;
  confirmAdult: boolean;
}

export class LegalConsent {
  private constructor(
    readonly termsVersion: string,
    readonly privacyVersion: string,
  ) {}

  static accept(input: LegalConsentInput): LegalConsent {
    if (input.acceptTerms !== true) {
      throw new LegalConsentRequiredError("Aceite os Termos de Uso para criar a conta");
    }
    if (input.acceptPrivacyPolicy !== true) {
      throw new LegalConsentRequiredError(
        "Aceite a Política de Privacidade para criar a conta",
      );
    }
    if (input.confirmAdult !== true) {
      throw new LegalConsentRequiredError(
        "O cadastro é permitido apenas para maiores de 18 anos",
      );
    }
    return new LegalConsent(TERMS_OF_USE_VERSION, PRIVACY_POLICY_VERSION);
  }

  get ageConfirmed(): boolean {
    return true;
  }
}
