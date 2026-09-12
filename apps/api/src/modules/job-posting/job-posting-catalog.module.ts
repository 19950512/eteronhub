import { Module } from "@nestjs/common";
import { JobUnlockModule } from "../job-unlock/job-unlock.module";
import { JobPostingPublicController } from "./job-posting-public.controller";
import { JobPostingModule } from "./job-posting.module";

// Módulo "folha": importa job-posting e job-unlock só para registrar o
// controller público, que precisa de casos de uso dos dois. Mantê-lo
// separado de JobPostingModule evita que job-posting e job-unlock
// dependam um do outro (job-unlock já depende de job-posting) — ver o
// comentário em job-posting.module.ts.
@Module({
  imports: [JobPostingModule, JobUnlockModule],
  controllers: [JobPostingPublicController],
})
export class JobPostingCatalogModule {}
