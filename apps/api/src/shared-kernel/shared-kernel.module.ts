import { Global, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { BcryptPasswordHasher } from "./infra/bcrypt-password-hasher";
import { JwtAuthTokenService } from "./infra/jwt-auth-token.service";
import { AUTH_TOKEN_SERVICE, PASSWORD_HASHER } from "./tokens";

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? "dev-secret-change-me",
      signOptions: { expiresIn: "1d" },
    }),
  ],
  providers: [
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
    { provide: AUTH_TOKEN_SERVICE, useClass: JwtAuthTokenService },
  ],
  exports: [PASSWORD_HASHER, AUTH_TOKEN_SERVICE, JwtModule],
})
export class SharedKernelModule {}
