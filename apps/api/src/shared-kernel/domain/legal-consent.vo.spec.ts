import {
  LegalConsent,
  LegalConsentRequiredError,
  PRIVACY_POLICY_VERSION,
  TERMS_OF_USE_VERSION,
} from "./legal-consent.vo";

describe("LegalConsent", () => {
  const all = { acceptTerms: true, acceptPrivacyPolicy: true, confirmAdult: true };

  it("registra as versões vigentes quando tudo é aceito", () => {
    const consent = LegalConsent.accept(all);
    expect(consent.termsVersion).toBe(TERMS_OF_USE_VERSION);
    expect(consent.privacyVersion).toBe(PRIVACY_POLICY_VERSION);
    expect(consent.ageConfirmed).toBe(true);
  });

  it.each([
    ["Termos de Uso", { ...all, acceptTerms: false }],
    ["Política de Privacidade", { ...all, acceptPrivacyPolicy: false }],
    ["maiores de 18 anos", { ...all, confirmAdult: false }],
  ])("recusa o cadastro sem %s", (message, input) => {
    expect(() => LegalConsent.accept(input)).toThrow(LegalConsentRequiredError);
    expect(() => LegalConsent.accept(input)).toThrow(message);
  });
});
