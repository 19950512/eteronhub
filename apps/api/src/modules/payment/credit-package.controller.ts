import { Controller, Get } from "@nestjs/common";
import { CreditPackageView, ListActiveCreditPackagesUseCase } from "./application/use-cases/list-active-credit-packages.use-case";

@Controller("credit-packages")
export class CreditPackageController {
  constructor(private readonly listActiveCreditPackagesUseCase: ListActiveCreditPackagesUseCase) {}

  @Get()
  async list(): Promise<CreditPackageView[]> {
    return this.listActiveCreditPackagesUseCase.execute();
  }
}
