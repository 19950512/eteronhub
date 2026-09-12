import { Controller, Get, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../auth/current-user.decorator";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { Roles } from "../../auth/roles.decorator";
import { RolesGuard } from "../../auth/roles.guard";
import { AuthTokenPayload } from "../../shared-kernel/application/auth-token-service.port";
import { GetWalletBalanceUseCase, WalletBalanceOutput } from "./application/use-cases/get-wallet-balance.use-case";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("WORKER")
@Controller("workers/me/credit-wallet")
export class CreditWalletController {
  constructor(private readonly getWalletBalanceUseCase: GetWalletBalanceUseCase) {}

  @Get()
  async balance(@CurrentUser() user: AuthTokenPayload): Promise<WalletBalanceOutput> {
    return this.getWalletBalanceUseCase.execute(user.subject);
  }
}
