import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Crear departamentos
  const departments = [
    "Transporte",
    "Administrativo",
    "Obras Públicas",
    "Financiero",
    "Recursos Humanos",
  ];

  for (const name of departments) {
    await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log("Departamentos creados:", departments.join(", "));

  // Crear SuperAdmin
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@siavem.go.cr" },
    update: {},
    create: {
      email: "admin@siavem.go.cr",
      password: hashedPassword,
      name: "Administrador del Sistema",
      role: "SUPER_ADMIN",
      departmentId: 1,
    },
  });

  console.log("SuperAdmin:", superAdmin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
