import { ValidationError } from "../../../shared-kernel/domain/domain-error";

export class InvalidWorkerSoftwareError extends ValidationError {}

const NAME_MAX_LENGTH = 100;
const VERSION_MAX_LENGTH = 50;

export class WorkerSoftware {
  private constructor(
    private readonly softwareName: string,
    private readonly softwareVersion: string | null,
  ) {}

  static create(input: { name: string; version?: string | null }): WorkerSoftware {
    const name = input.name.trim().replace(/\s+/g, " ");
    const version = input.version?.trim() || null;

    if (!name) {
      throw new InvalidWorkerSoftwareError("Informe o nome do software");
    }
    if (name.length > NAME_MAX_LENGTH) {
      throw new InvalidWorkerSoftwareError(
        `Nome do software deve ter no máximo ${NAME_MAX_LENGTH} caracteres`,
      );
    }
    if (version && version.length > VERSION_MAX_LENGTH) {
      throw new InvalidWorkerSoftwareError(
        `Versão do software deve ter no máximo ${VERSION_MAX_LENGTH} caracteres`,
      );
    }
    return new WorkerSoftware(name, version);
  }

  get name(): string {
    return this.softwareName;
  }

  get version(): string | null {
    return this.softwareVersion;
  }

  isSameSoftware(other: WorkerSoftware): boolean {
    return this.softwareName.toLowerCase() === other.softwareName.toLowerCase();
  }
}
