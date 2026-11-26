import { Body, Controller, Get, Header, HttpCode, Post, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { CurrentUser } from "../../auth/current-user.decorator";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { Roles } from "../../auth/roles.decorator";
import { RolesGuard } from "../../auth/roles.guard";
import { AUTH_THROTTLE } from "../../infra/http/rate-limits";
import { AuthTokenPayload } from "../../shared-kernel/application/auth-token-service.port";
import { ConsentSubjectRole } from "../../shared-kernel/application/consent-log.port";
import { DeleteCompanyAccountUseCase } from "./application/use-cases/delete-company-account.use-case";
import { DeleteWorkerAccountUseCase } from "./application/use-cases/delete-worker-account.use-case";
import {
  ExportPersonalDataUseCase,
  PersonalDataExport,
} from "./application/use-cases/export-personal-data.use-case";
import { DeleteAccountDto } from "./dto/delete-account.dto";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("WORKER", "COMPANY")
@Controller("me/privacy")
export class PrivacyController {
  constructor(
    private readonly exportPersonalDataUseCase: ExportPersonalDataUseCase,
    private readonly deleteWorkerAccountUseCase: DeleteWorkerAccountUseCase,
    private readonly deleteCompanyAccountUseCase: DeleteCompanyAccountUseCase,
  ) {}

  @Get("export")
  @Header("Cache-Control", "no-store")
  async export(@CurrentUser() user: AuthTokenPayload): Promise<PersonalDataExport> {
    return this.exportPersonalDataUseCase.execute(
      user.role as ConsentSubjectRole,
      user.subject,
    );
  }

  @Throttle(AUTH_THROTTLE)
  @Post("account-deletion")
  @HttpCode(204)
  async deleteAccount(
    @CurrentUser() user: AuthTokenPayload,
    @Body() dto: DeleteAccountDto,
  ): Promise<void> {
    if (user.role === "WORKER") {
      await this.deleteWorkerAccountUseCase.execute(user.subject, dto.password);
    } else {
      await this.deleteCompanyAccountUseCase.execute(user.subject, dto.password);
    }
  }
}
