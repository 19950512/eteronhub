import { Module } from "@nestjs/common";
import { AuthenticateWorkerUseCase } from "./application/use-cases/authenticate-worker.use-case";
import { ReactivateWorkerUseCase } from "./application/use-cases/reactivate-worker.use-case";
import { RegisterWorkerUseCase } from "./application/use-cases/register-worker.use-case";
import { SuspendWorkerUseCase } from "./application/use-cases/suspend-worker.use-case";
import { PrismaWorkerRepository } from "./infra/persistence/prisma-worker.repository";
import { WORKER_REPOSITORY } from "./worker.tokens";
import { WorkerController } from "./worker.controller";

@Module({
  controllers: [WorkerController],
  providers: [
    { provide: WORKER_REPOSITORY, useClass: PrismaWorkerRepository },
    RegisterWorkerUseCase,
    SuspendWorkerUseCase,
    ReactivateWorkerUseCase,
    AuthenticateWorkerUseCase,
  ],
  exports: [SuspendWorkerUseCase, ReactivateWorkerUseCase, AuthenticateWorkerUseCase],
})
export class WorkerModule {}
