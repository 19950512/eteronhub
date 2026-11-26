import { LegalConsent } from "../domain/legal-consent.vo";

export type ConsentSubjectRole = "WORKER" | "COMPANY";

export interface RequestContext {
  ipAddress: string | null;
  userAgent: string | null;
}

export interface ConsentEntry {
  subjectRole: ConsentSubjectRole;
  subjectId: string;
  consent: LegalConsent;
  context: RequestContext;
}

export interface ConsentLog {
  append(entry: ConsentEntry): Promise<void>;
}
