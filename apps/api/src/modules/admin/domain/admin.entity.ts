import { randomUUID } from "node:crypto";
import { Email } from "../../../shared-kernel/domain/email.vo";

export interface AdminProps {
  id: string;
  name: string;
  email: Email;
  passwordHash: string;
  createdAt: Date;
}

export class Admin {
  private constructor(private readonly props: AdminProps) {}

  static create(input: { name: string; email: Email; passwordHash: string }): Admin {
    return new Admin({
      id: randomUUID(),
      name: input.name,
      email: input.email,
      passwordHash: input.passwordHash,
      createdAt: new Date(),
    });
  }

  static restore(props: AdminProps): Admin {
    return new Admin(props);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get email(): Email {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
