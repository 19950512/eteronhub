import { Injectable } from "@nestjs/common";
import { BancoInterHttpClient } from "./banco-inter-http-client";
import { requiredEnv } from "./required-env";

interface OAuthTokenResponse {
  access_token: string;
  expires_in: number;
}

interface CachedToken {
  accessToken: string;
  expiresAt: number;
}

const OAUTH_SCOPES = "cob.write cob.read webhook.write webhook.read pix.read";

// A leitura das variáveis de ambiente e do certificado mTLS é sempre tardia
// (só no primeiro uso real) para que a aplicação suba normalmente em
// desenvolvimento/teste mesmo sem credenciais do Banco Inter configuradas —
// só falha quando alguém de fato tenta criar uma cobrança Pix.
@Injectable()
export class BancoInterAuthService {
  private httpClient: BancoInterHttpClient | null = null;
  private cachedToken: CachedToken | null = null;

  getHttpClient(): BancoInterHttpClient {
    if (!this.httpClient) {
      this.httpClient = new BancoInterHttpClient({
        baseUrl: requiredEnv("BANCO_INTER_BASE_URL"),
        certPath: requiredEnv("BANCO_INTER_CERT_PATH"),
        keyPath: requiredEnv("BANCO_INTER_KEY_PATH"),
      });
    }
    return this.httpClient;
  }

  async getAccessToken(): Promise<string> {
    if (this.cachedToken && this.cachedToken.expiresAt > Date.now()) {
      return this.cachedToken.accessToken;
    }

    const body = new URLSearchParams({
      client_id: requiredEnv("BANCO_INTER_CLIENT_ID"),
      client_secret: requiredEnv("BANCO_INTER_CLIENT_SECRET"),
      grant_type: "client_credentials",
      scope: OAUTH_SCOPES,
    }).toString();

    const response = await this.getHttpClient().request<OAuthTokenResponse>({
      method: "POST",
      path: "/oauth/v2/token",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    this.cachedToken = {
      accessToken: response.access_token,
      // Renova 60s antes de expirar para não correr o risco de usar um token
      // vencido em uma chamada concorrente.
      expiresAt: Date.now() + Math.max(0, response.expires_in - 60) * 1000,
    };

    return this.cachedToken.accessToken;
  }
}
