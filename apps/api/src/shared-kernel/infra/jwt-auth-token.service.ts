import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthTokenPayload, AuthTokenService } from "../application/auth-token-service.port";

@Injectable()
export class JwtAuthTokenService implements AuthTokenService {
  constructor(private readonly jwtService: JwtService) {}

  sign(payload: AuthTokenPayload): string {
    return this.jwtService.sign(payload);
  }
}
