import { PrismaService } from "../prisma.service";

// why: os testes de integração existem para exercitar corridas reais no
// Postgres; pular em silêncio sem banco esconderia exatamente essas falhas.
export function createIntegrationPrisma(): PrismaService {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL não configurada — os testes de integração precisam de um Postgres com as migrations aplicadas (prisma migrate deploy).",
    );
  }
  return new PrismaService();
}
