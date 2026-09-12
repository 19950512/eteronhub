import { JobPosting } from "../domain/job-posting.entity";
import { JobPostingNotFoundError, JobPostingNotOwnedByCompanyError } from "./errors";
import { JobPostingRepository } from "./ports/job-posting-repository.port";

export async function loadOwnedJobPosting(
  jobPostingRepository: JobPostingRepository,
  companyId: string,
  jobPostingId: string,
): Promise<JobPosting> {
  const jobPosting = await jobPostingRepository.findById(jobPostingId);
  if (!jobPosting) {
    throw new JobPostingNotFoundError(`Vaga não encontrada: ${jobPostingId}`);
  }
  if (jobPosting.companyId !== companyId) {
    throw new JobPostingNotOwnedByCompanyError("Esta vaga não pertence à empresa autenticada");
  }
  return jobPosting;
}
