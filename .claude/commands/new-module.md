---
description: Cria o esqueleto de Clean Architecture para um novo módulo de domínio em apps/api
argument-hint: <nome-do-modulo>
---

Crie o esqueleto de um novo módulo de domínio chamado `$1` em
`apps/api/src/modules/$1`, seguindo exatamente o padrão dos módulos existentes
(veja `apps/api/src/modules/worker` ou `apps/api/src/modules/company` como
referência):

- `domain/` — entidades, value objects e portas (interfaces) do módulo. Sem
  imports de Prisma ou NestJS.
- `application/` — casos de uso, orquestram o domínio via as portas.
- `infra/` — implementação concreta das portas (repositório Prisma, etc.) e o
  módulo NestJS (controller/provider) que liga tudo.

Depois de criar os arquivos, rode `pnpm --filter api run prisma:generate` se
houver schema novo, e `/check` para validar lint e testes.
