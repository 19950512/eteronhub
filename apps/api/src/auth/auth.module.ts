import { Module } from "@nestjs/common";
import { CompanyModule } from "../modules/company/company.module";
import { WorkerModule } from "../modules/worker/worker.module";
import { AuthController } from "./auth.controller";

@Module({
  imports: [CompanyModule, WorkerModule],
  controllers: [AuthController],
})
export class AuthModule {}
