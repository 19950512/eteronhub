import { Money } from "../../../../shared-kernel/domain/money.vo";

export type PixChargeStatus =
  "ATIVA" | "CONCLUIDA" | "REMOVIDA_PELO_USUARIO_RECEBEDOR" | "REMOVIDA_PELO_PSP";

export interface CreatePixChargeInput {
  amount: Money;
  externalReferenceId: string;
  expiresAt: Date;
}

export interface CreatePixChargeOutput {
  pixTxId: string;
  qrCode: string;
  qrCodeImageBase64: string;
}

export interface PixChargeDetails {
  status: PixChargeStatus;
  // invariant: valor efetivamente recebido pelo PSP, não o valor pedido na cobrança.
  amount: Money;
  e2eId: string | null;
}

export interface PixPaymentGateway {
  createCharge(input: CreatePixChargeInput): Promise<CreatePixChargeOutput>;
  getCharge(pixTxId: string): Promise<PixChargeDetails>;
}
