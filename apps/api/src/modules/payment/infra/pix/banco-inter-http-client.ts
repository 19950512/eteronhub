import * as fs from "node:fs";
import * as https from "node:https";

export interface BancoInterHttpClientConfig {
  baseUrl: string;
  certPath: string;
  keyPath: string;
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 15_000;

export interface BancoInterHttpRequest {
  method: string;
  path: string;
  headers?: Record<string, string>;
  body?: string;
}

// Cliente HTTP mínimo com mTLS (certificado cliente + chave privada), usado
// tanto para obter o token OAuth2 quanto para chamar os endpoints de Pix do
// Banco Inter — ver docs/03-arquitetura-tecnica.md, seção 4.1. Implementado
// com `https` nativo (sem axios/undici) para não adicionar dependências só
// por causa do agente mTLS.
export class BancoInterHttpClient {
  private readonly agent: https.Agent;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(config: BancoInterHttpClientConfig) {
    this.baseUrl = config.baseUrl;
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.agent = new https.Agent({
      cert: fs.readFileSync(config.certPath),
      key: fs.readFileSync(config.keyPath),
    });
  }

  request<T>(options: BancoInterHttpRequest): Promise<T> {
    const url = new URL(options.path, this.baseUrl);

    return new Promise<T>((resolve, reject) => {
      const req = https.request(
        url,
        { method: options.method, agent: this.agent, headers: options.headers },
        (res) => {
          let data = "";
          res.setEncoding("utf8");
          res.on("data", (chunk: string) => {
            data += chunk;
          });
          res.on("end", () => {
            const statusCode = res.statusCode ?? 0;
            if (statusCode < 200 || statusCode >= 300) {
              reject(new Error(`Banco Inter respondeu ${statusCode}: ${data}`));
              return;
            }
            try {
              resolve((data ? JSON.parse(data) : undefined) as T);
            } catch (error) {
              reject(error);
            }
          });
        },
      );

      // why: sem timeout, um Inter lento prende a requisição do usuário e o
      // job de reconciliação indefinidamente.
      req.setTimeout(this.timeoutMs, () => {
        req.destroy(
          new Error(
            `Banco Inter não respondeu em ${this.timeoutMs}ms (${options.method} ${options.path})`,
          ),
        );
      });
      req.on("error", reject);
      if (options.body) {
        req.write(options.body);
      }
      req.end();
    });
  }
}
