import { Body, Controller, Get, HttpCode, HttpStatus, Inject, NotFoundException, Param, Post, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { CurrentUser } from "../../auth/current-user.decorator";
import { AUTH_THROTTLE } from "../../infra/http/rate-limits";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { Roles } from "../../auth/roles.decorator";
import { RolesGuard } from "../../auth/roles.guard";
import { AuthTokenPayload } from "../../shared-kernel/application/auth-token-service.port";
import { ReactivateCompanyUseCase } from "../company/application/use-cases/reactivate-company.use-case";
import { SuspendCompanyUseCase } from "../company/application/use-cases/suspend-company.use-case";
import { ReactivateWorkerUseCase } from "../worker/application/use-cases/reactivate-worker.use-case";
import { SuspendWorkerUseCase } from "../worker/application/use-cases/suspend-worker.use-case";
import { ADMIN_REPOSITORY } from "./admin.tokens";
import { AuthenticateAdminUseCase } from "./application/use-cases/authenticate-admin.use-case";
import { AdminRepository } from "./application/ports/admin-repository.port";
import { AdminLoginDto } from "./dto/admin-login.dto";

@Controller("admin")
export class AdminController {
  constructor(
    private readonly authenticateAdminUseCase: AuthenticateAdminUseCase,
    @Inject(ADMIN_REPOSITORY) private readonly adminRepository: AdminRepository,
    private readonly suspendCompanyUseCase: SuspendCompanyUseCase,
    private readonly reactivateCompanyUseCase: ReactivateCompanyUseCase,
    private readonly suspendWorkerUseCase: SuspendWorkerUseCase,
    private readonly reactivateWorkerUseCase: ReactivateWorkerUseCase,
  ) {}

  @Throttle(AUTH_THROTTLE)
  @Post("auth/login")
  async login(@Body() dto: AdminLoginDto): Promise<{ accessToken: string }> {
    return this.authenticateAdminUseCase.execute(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Get("me")
  async me(@CurrentUser() user: AuthTokenPayload): Promise<{ id: string; name: string; email: string }> {
    const admin = await this.adminRepository.findById(user.subject);
    if (!admin) {
      throw new NotFoundException("Admin não encontrado");
    }
    return { id: admin.id, name: admin.name, email: admin.email.value };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Post("companies/:id/suspend")
  @HttpCode(HttpStatus.NO_CONTENT)
  async suspendCompany(@Param("id") id: string): Promise<void> {
    await this.suspendCompanyUseCase.execute(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Post("companies/:id/reactivate")
  @HttpCode(HttpStatus.NO_CONTENT)
  async reactivateCompany(@Param("id") id: string): Promise<void> {
    await this.reactivateCompanyUseCase.execute(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Post("workers/:id/suspend")
  @HttpCode(HttpStatus.NO_CONTENT)
  async suspendWorker(@Param("id") id: string): Promise<void> {
    await this.suspendWorkerUseCase.execute(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Post("workers/:id/reactivate")
  @HttpCode(HttpStatus.NO_CONTENT)
  async reactivateWorker(@Param("id") id: string): Promise<void> {
    await this.reactivateWorkerUseCase.execute(id);
  }
}
