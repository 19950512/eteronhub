import { Global, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { requireJwtSecret } from "../infra/config/env";
import { PrismaAccountStatusReader } from "../infra/prisma/prisma-account-status.reader";
import { BcryptPasswordHasher } from "./infra/bcrypt-password-hasher";
import { JwtAuthTokenService } from "./infra/jwt-auth-token.service";
import { ACCOUNT_STATUS_READER, AUTH_TOKEN_SERVICE, PASSWORD_HASHER } from "./tokens";

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: requireJwtSecret(),
        signOptions: { expiresIn: "1d" },
      }),
    }),
  ],
  providers: [
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
    { provide: AUTH_TOKEN_SERVICE, useClass: JwtAuthTokenService },
    { provide: ACCOUNT_STATUS_READER, useClass: PrismaAccountStatusReader },
  ],
  exports: [PASSWORD_HASHER, AUTH_TOKEN_SERVICE, ACCOUNT_STATUS_READER, JwtModule],
})
export class SharedKernelModule {}
