import { ValidationError } from "../../../shared-kernel/domain/domain-error";

export class InvalidContactInfoError extends ValidationError {}

export interface ContactInfoProps {
  email: string | null;
  phone: string | null;
  applicationUrl: string | null;
}

export interface ContactInfoInput {
  email?: string | null;
  phone?: string | null;
  applicationUrl?: string | null;
}

export class ContactInfo {
  private constructor(private readonly props: ContactInfoProps) {}

  static create(input: ContactInfoInput): ContactInfo {
    const email = input.email ?? null;
    const phone = input.phone ?? null;
    const applicationUrl = input.applicationUrl ?? null;

    if (!email && !phone && !applicationUrl) {
      throw new InvalidContactInfoError("Informe ao menos um meio de contato ou aplicação");
    }

    return new ContactInfo({ email, phone, applicationUrl });
  }

  get email(): string | null {
    return this.props.email;
  }

  get phone(): string | null {
    return this.props.phone;
  }

  get applicationUrl(): string | null {
    return this.props.applicationUrl;
  }
}
