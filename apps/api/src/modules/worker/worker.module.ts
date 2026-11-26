import { Module } from "@nestjs/common";
import { AuthenticateWorkerUseCase } from "./application/use-cases/authenticate-worker.use-case";
import { ReactivateWorkerUseCase } from "./application/use-cases/reactivate-worker.use-case";
import { RegisterWorkerUseCase } from "./application/use-cases/register-worker.use-case";
import { SuspendWorkerUseCase } from "./application/use-cases/suspend-worker.use-case";
import { PrismaWorkerRepository } from "./infra/persistence/prisma-worker.repository";
import { WORKER_REPOSITORY } from "./worker.tokens";
import { GetWorkerProfileUseCase } from "./application/use-cases/get-worker-profile.use-case";
import { UpdateWorkerProfileUseCase } from "./application/use-cases/update-worker-profile.use-case";
import { WorkerController } from "./worker.controller";
import { WorkerProfileController } from "./worker-profile.controller";

@Module({
  controllers: [WorkerController, WorkerProfileController],
  providers: [
    { provide: WORKER_REPOSITORY, useClass: PrismaWorkerRepository },
    RegisterWorkerUseCase,
    SuspendWorkerUseCase,
    ReactivateWorkerUseCase,
    AuthenticateWorkerUseCase,
    GetWorkerProfileUseCase,
    UpdateWorkerProfileUseCase,
  ],
  exports: [SuspendWorkerUseCase, ReactivateWorkerUseCase, AuthenticateWorkerUseCase],
})
export class WorkerModule {}
