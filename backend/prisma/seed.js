import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Crear departamento de Transporte
  const transportDept = await prisma.department.upsert({
    where: { name: "Transporte" },
    update: {},
    create: { name: "Transporte" },
  });

  console.log("Departamento creado:", transportDept.name);

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
      departmentId: transportDept.id,
    },
  });

  console.log("SuperAdmin creado:", superAdmin.email);
  console.log("Contraseña temporal: admin123");
  console.log("¡Cambiá esta contraseña después del primer login!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
