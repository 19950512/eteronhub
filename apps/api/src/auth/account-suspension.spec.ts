import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import {
  AccountSuspendedError,
  InvalidCredentialsError,
} from "../shared-kernel/application/errors";
import { AccountStatusReader } from "../shared-kernel/application/account-status-reader.port";
import {
  AuthTokenPayload,
  AuthTokenService,
} from "../shared-kernel/application/auth-token-service.port";
import { PasswordHasher } from "../shared-kernel/application/password-hasher.port";
import { Cnpj } from "../shared-kernel/domain/cnpj.vo";
import { Cpf } from "../shared-kernel/domain/cpf.vo";
import { Email } from "../shared-kernel/domain/email.vo";
import { CompanyRepository } from "../modules/company/application/ports/company-repository.port";
import { AuthenticateCompanyUseCase } from "../modules/company/application/use-cases/authenticate-company.use-case";
import { Company } from "../modules/company/domain/company.entity";
import { WorkerRepository } from "../modules/worker/application/ports/worker-repository.port";
import { AuthenticateWorkerUseCase } from "../modules/worker/application/use-cases/authenticate-worker.use-case";
import { Worker } from "../modules/worker/domain/worker.entity";
import { AuthenticatedRequest, JwtAuthGuard } from "./jwt-auth.guard";
import { OptionalJwtAuthGuard } from "./optional-jwt-auth.guard";

const passwordHasher: PasswordHasher = {
  hash: async (plain) => `hashed:${plain}`,
  compare: async (plain, hash) => hash === `hashed:${plain}`,
};
const tokenService: AuthTokenService = {
  sign: (payload) => `token-for-${payload.subject}`,
};

function worker(suspended: boolean): Worker {
  const entity = Worker.register({
    cpf: Cpf.create("529.982.247-25"),
    nome: "Trabalhador",
    email: Email.create("t@teste.com"),
    passwordHash: "hashed:senha-segura",
  });
  if (suspended) entity.suspend();
  return entity;
}

function company(suspended: boolean): Company {
  const entity = Company.register({
    cnpj: Cnpj.create("11.222.333/0001-81"),
    razaoSocial: "Metalúrgica Teste",
    email: Email.create("e@teste.com"),
    passwordHash: "hashed:senha-segura",
  });
  if (suspended) entity.suspend();
  return entity;
}

describe("login de conta suspensa", () => {
  it("recusa login de trabalhador suspenso, mesmo com a senha certa", async () => {
    const repository = {
      findByEmail: async () => worker(true),
    } as unknown as WorkerRepository;
    const useCase = new AuthenticateWorkerUseCase(
      repository,
      passwordHasher,
      tokenService,
    );

    await expect(
      useCase.execute({ email: "t@teste.com", password: "senha-segura" }),
    ).rejects.toThrow(AccountSuspendedError);
  });

  it("não revela a suspensão para quem erra a senha", async () => {
    const repository = {
      findByEmail: async () => worker(true),
    } as unknown as WorkerRepository;
    const useCase = new AuthenticateWorkerUseCase(
      repository,
      passwordHasher,
      tokenService,
    );

    await expect(
      useCase.execute({ email: "t@teste.com", password: "errada" }),
    ).rejects.toThrow(InvalidCredentialsError);
  });

  it("recusa login de empresa suspensa e aceita a ativa", async () => {
    const suspended = new AuthenticateCompanyUseCase(
      { findByEmail: async () => company(true) } as unknown as CompanyRepository,
      passwordHasher,
      tokenService,
    );
    const active = new AuthenticateCompanyUseCase(
      { findByEmail: async () => company(false) } as unknown as CompanyRepository,
      passwordHasher,
      tokenService,
    );

    await expect(
      suspended.execute({ email: "e@teste.com", password: "senha-segura" }),
    ).rejects.toThrow(AccountSuspendedError);
    await expect(
      active.execute({ email: "e@teste.com", password: "senha-segura" }),
    ).resolves.toHaveProperty("accessToken");
  });
});

describe("guards com token emitido antes da suspensão", () => {
  const jwtService = new JwtService({ secret: "segredo-de-teste" });
  const payload: AuthTokenPayload = { subject: "worker-1", role: "WORKER" };

  function contextFor(request: Partial<AuthenticatedRequest>): ExecutionContext {
    return {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
  }

  function readerSaying(active: boolean): AccountStatusReader {
    return { isActive: async () => active };
  }

  function requestWithToken(): Partial<AuthenticatedRequest> {
    return { headers: { authorization: `Bearer ${jwtService.sign(payload)}` } };
  }

  it("JwtAuthGuard recusa o token de uma conta suspensa", async () => {
    const guard = new JwtAuthGuard(jwtService, readerSaying(false));
    await expect(guard.canActivate(contextFor(requestWithToken()))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it("JwtAuthGuard aceita o token de uma conta ativa e anexa o usuário", async () => {
    const guard = new JwtAuthGuard(jwtService, readerSaying(true));
    const request = requestWithToken();
    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(request.user).toMatchObject(payload);
  });

  it("OptionalJwtAuthGuard trata a conta suspensa como anônima", async () => {
    const guard = new OptionalJwtAuthGuard(jwtService, readerSaying(false));
    const request = requestWithToken();
    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(request.user).toBeUndefined();
  });
});
