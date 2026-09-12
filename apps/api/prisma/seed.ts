import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const email = process.env.ADMIN_EMAIL ?? "admin@eteronhub.com";
  const password = process.env.ADMIN_PASSWORD ?? "changeme123";
  const name = process.env.ADMIN_NAME ?? "Admin";

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.admin.upsert({
    where: { email },
    create: { id: randomUUID(), name, email, passwordHash },
    update: {},
  });

  console.log(`Admin garantido: ${email}`);

  const creditPackages = [
    { id: "5-creditos", name: "5 créditos", priceCents: 1000, creditsAmount: 5 },
    { id: "20-creditos", name: "20 créditos", priceCents: 3500, creditsAmount: 20 },
    { id: "50-creditos", name: "50 créditos", priceCents: 7500, creditsAmount: 50 },
  ];

  for (const creditPackage of creditPackages) {
    await prisma.creditPackage.upsert({
      where: { id: creditPackage.id },
      create: creditPackage,
      update: creditPackage,
    });
  }

  console.log(`Pacotes de créditos garantidos: ${creditPackages.map((p) => p.id).join(", ")}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
