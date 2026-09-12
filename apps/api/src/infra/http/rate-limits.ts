// Limites mais rígidos que o padrão global (100/min — ver app.module.ts),
// aplicados via @Throttle() em endpoints de autenticação/cadastro (alvo
// comum de força bruta e criação de contas em massa) e no webhook do Pix.
export const AUTH_THROTTLE = {
  default: { limit: 5, ttl: 60_000 },
};

export const WEBHOOK_THROTTLE = {
  default: { limit: 30, ttl: 60_000 },
};
