<!-- Eteron Hub: marketplace B2B de metalurgia que conecta empresas a trabalhadores. -->

# Eteron Hub

Marketplace B2B do setor de metalurgia e estruturas metálicas: conecta empresas a
trabalhadores/prestadores de serviço. Vagas passam por moderação e são publicadas de
forma anônima; trabalhadores compram créditos via Pix para desbloquear os dados de
contato da empresa.

## Documentação

- [Produto e Regras de Negócio](docs/01-produto-e-regras-de-negocio.md) — personas,
  fluxo ponta a ponta, regras de negócio, glossário.
- [Modelo de Domínio](docs/02-modelo-de-dominio.md) — entidades, value objects, casos
  de uso e portas por módulo.
- [Arquitetura Técnica](docs/03-arquitetura-tecnica.md) — stack, camadas de Clean
  Architecture, estrutura de pastas, contratos de API.
- [Roadmap do MVP](docs/04-roadmap-mvp.md) — fases de execução.
- [Operação e Lançamento](docs/05-operacao-e-lancamento.md) — checklist de produção,
  runbook de reconciliação e plano de rollback.

## Stack

NestJS (backend) + Next.js (frontend) + PostgreSQL/Prisma, com Clean Architecture
(Domain → Application → Infra → Container) e integração direta com a API Pix do Banco
Inter.
