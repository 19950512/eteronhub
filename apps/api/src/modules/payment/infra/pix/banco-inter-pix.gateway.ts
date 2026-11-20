import { Injectable } from "@nestjs/common";
import * as QRCode from "qrcode";
import { Money } from "../../../../shared-kernel/domain/money.vo";
import {
  CreatePixChargeInput,
  CreatePixChargeOutput,
  PixChargeDetails,
  PixChargeStatus,
  PixPaymentGateway,
} from "../../application/ports/pix-payment-gateway.port";
import { BancoInterAuthService } from "./banco-inter-auth.service";
import { requiredEnv } from "./required-env";

interface CobrancaResponse {
  pixCopiaECola: string;
}

interface CobrancaDetailsResponse {
  status: PixChargeStatus;
  pix?: Array<{ endToEndId: string; valor: string }>;
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

    const expiracaoSegundos = Math.max(
      1,
      Math.round((input.expiresAt.getTime() - Date.now()) / 1000),
    );

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

  async getCharge(pixTxId: string): Promise<PixChargeDetails> {
    const accessToken = await this.authService.getAccessToken();
    const cobranca = await this.authService
      .getHttpClient()
      .request<CobrancaDetailsResponse>({
        method: "GET",
        path: `/pix/v2/cob/${encodeURIComponent(pixTxId)}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    // why: `valor.original` é o valor que nós mesmos pedimos na cobrança; o
    // que o pagador de fato pagou está em `pix[].valor`. Sem Pix recebido
    // ainda (ATIVA), não há valor pago a comparar.
    const paidCents = (cobranca.pix ?? []).reduce(
      (total, pix) => total + parseBrlAmountToCents(pix.valor),
      0,
    );
    return {
      status: cobranca.status,
      amount: Money.fromCents(paidCents),
      e2eId: cobranca.pix?.[0]?.endToEndId ?? null,
    };
  }
}

// why: a API Pix devolve valores como string decimal ("20.00"); converter via
// float arriscaria erro de arredondamento justamente na comparação de valor
// que protege contra crédito indevido.
export function parseBrlAmountToCents(value: string): number {
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(value.trim());
  if (!match) {
    throw new Error(`Valor Pix em formato inesperado: ${value}`);
  }
  const [, reais, centavos = ""] = match;
  return Number(reais) * 100 + Number(centavos.padEnd(2, "0"));
}
