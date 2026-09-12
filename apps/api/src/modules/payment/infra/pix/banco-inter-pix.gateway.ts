import { Injectable } from "@nestjs/common";
import * as QRCode from "qrcode";
import {
  CreatePixChargeInput,
  CreatePixChargeOutput,
  PixChargeStatus,
  PixPaymentGateway,
} from "../../application/ports/pix-payment-gateway.port";
import { BancoInterAuthService } from "./banco-inter-auth.service";
import { requiredEnv } from "./required-env";

interface CobrancaResponse {
  pixCopiaECola: string;
}

interface CobrancaStatusResponse {
  status: PixChargeStatus;
}

// Implementa a porta PixPaymentGateway (documento 2, seção 7) falando
// diretamente com a API de Pix do Banco Inter. Nenhum outro módulo depende
// desta classe — trocar de provedor no futuro significa escrever um novo
// adapter aqui, sem tocar em regra de negócio nenhuma.
@Injectable()
export class BancoInterPixGateway implements PixPaymentGateway {
  constructor(private readonly authService: BancoInterAuthService) {}

  async createCharge(input: CreatePixChargeInput): Promise<CreatePixChargeOutput> {
    const accessToken = await this.authService.getAccessToken();
    const httpClient = this.authService.getHttpClient();
    const pixKey = requiredEnv("BANCO_INTER_PIX_KEY");

    const expiracaoSegundos = Math.max(1, Math.round((input.expiresAt.getTime() - Date.now()) / 1000));

    await httpClient.request<CobrancaResponse>({
      method: "PUT",
      path: `/pix/v2/cob/${input.externalReferenceId}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        calendario: { expiracao: expiracaoSegundos },
        valor: { original: (input.amount.valueInCents / 100).toFixed(2) },
        chave: pixKey,
        solicitacaoPagador: "Compra de créditos EteronHub",
      }),
    });

    const cobranca = await httpClient.request<CobrancaResponse>({
      method: "GET",
      path: `/pix/v2/cob/${input.externalReferenceId}`,
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const qrCodeImageBase64 = await QRCode.toDataURL(cobranca.pixCopiaECola);

    return {
      pixTxId: input.externalReferenceId,
      qrCode: cobranca.pixCopiaECola,
      qrCodeImageBase64,
    };
  }

  async getChargeStatus(pixTxId: string): Promise<PixChargeStatus> {
    const accessToken = await this.authService.getAccessToken();
    const cobranca = await this.authService.getHttpClient().request<CobrancaStatusResponse>({
      method: "GET",
      path: `/pix/v2/cob/${pixTxId}`,
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return cobranca.status;
  }
}
