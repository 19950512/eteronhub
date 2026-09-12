import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { HealthController } from "./health.controller";
import { PrismaService } from "./infra/prisma/prisma.service";
import { PrismaUnitOfWork } from "./infra/prisma/prisma-unit-of-work";

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [HealthController],
  providers: [PrismaService, PrismaUnitOfWork],
})
export class AppModule {}
