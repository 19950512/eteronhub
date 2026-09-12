import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../auth/current-user.decorator";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { Roles } from "../../auth/roles.decorator";
import { RolesGuard } from "../../auth/roles.guard";
import { AuthTokenPayload } from "../../shared-kernel/application/auth-token-service.port";
import { CreatePixChargeOutput, CreatePixChargeUseCase } from "./application/use-cases/create-pix-charge.use-case";
import { GetPaymentStatusUseCase, PaymentStatusOutput } from "./application/use-cases/get-payment-status.use-case";
import { CreatePixChargeDto } from "./dto/create-pix-charge.dto";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("WORKER")
@Controller("workers/me/payments")
export class PaymentController {
  constructor(
    private readonly createPixChargeUseCase: CreatePixChargeUseCase,
    private readonly getPaymentStatusUseCase: GetPaymentStatusUseCase,
  ) {}

  @Post()
  async create(
    @CurrentUser() user: AuthTokenPayload,
    @Body() dto: CreatePixChargeDto,
  ): Promise<CreatePixChargeOutput> {
    return this.createPixChargeUseCase.execute({ workerId: user.subject, creditPackageId: dto.creditPackageId });
  }

  @Get(":id")
  async status(@CurrentUser() user: AuthTokenPayload, @Param("id") id: string): Promise<PaymentStatusOutput> {
    return this.getPaymentStatusUseCase.execute(user.subject, id);
  }
}
