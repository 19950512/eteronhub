import "dotenv/config";
import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { loadEnv } from "./infra/config/env";
import { DomainErrorFilter } from "./infra/http/domain-error.filter";

async function bootstrap(): Promise<void> {
  const env = loadEnv();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // why: atrás de load balancer/proxy, sem confiar no X-Forwarded-For o rate
  // limit vê o IP do proxy e todos os usuários dividem o mesmo limite. Confiar
  // em mais saltos do que existem permite falsificar o IP — ajuste ao deploy.
  if (env.trustProxyHops > 0) {
    app.set("trust proxy", env.trustProxyHops);
  }
  app.enableCors({ origin: env.corsOrigins });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new DomainErrorFilter());
  await app.listen(env.port);
}

bootstrap();
