import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Crear empleado
export const createEmployee = async (req, res) => {
  try {
    const {
      name,
      identification,
      identificationType,
      position,
      email,
      licenseType,
      licenseExpiry,
      departmentId,
    } = req.body;

    // Verificar identificación duplicada
    const existingId = await prisma.employee.findUnique({
      where: { identification },
    });
    if (existingId) {
      return res
        .status(400)
        .json({ error: "La identificación ya está registrada" });
    }

    // Verificar email duplicado
    const existingEmail = await prisma.employee.findUnique({
      where: { email },
    });
    if (existingEmail) {
      return res.status(400).json({ error: "El correo ya está registrado" });
    }

    // Verificar si la licencia ya está vencida
    const isBlocked = new Date(licenseExpiry) < new Date();

    // Admin de Departamento solo puede crear en su departamento
    if (
      req.user.role === "ADMIN_DEPARTMENT" &&
      req.user.departmentId !== parseInt(departmentId)
    ) {
      return res
        .status(403)
        .json({ error: "Solo podés registrar empleados de tu departamento" });
    }

    const employee = await prisma.employee.create({
      data: {
        name,
        identification,
        identificationType,
        position,
        email,
        licenseType,
        licenseExpiry: new Date(licenseExpiry),
        isBlocked,
        departmentId: parseInt(departmentId),
      },
      include: { department: true },
    });

    res
      .status(201)
      .json({ message: "Empleado registrado exitosamente", employee });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al crear empleado", details: error.message });
  }
};

// Listar empleados
export const getEmployees = async (req, res) => {
  try {
    const { filter, search } = req.query;
    const where = {};

    // Aislamiento por departamento
    if (req.user.role === "ADMIN_DEPARTMENT") {
      where.departmentId = req.user.departmentId;
    }

    // Filtros por estado de licencia
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    if (filter === "vigentes") {
      where.licenseExpiry = { gt: thirtyDaysFromNow };
    } else if (filter === "por_vencer") {
      where.licenseExpiry = { gt: now, lte: thirtyDaysFromNow };
    } else if (filter === "vencidas") {
      where.licenseExpiry = { lte: now };
    }

    // Búsqueda por nombre, cédula o correo
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { identification: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const employees = await prisma.employee.findMany({
      where,
      include: { department: true },
      orderBy: { name: "asc" },
    });

    res.json({ total: employees.length, employees });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al listar empleados", details: error.message });
  }
};

// Obtener un empleado por ID
export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await prisma.employee.findUnique({
      where: { id: parseInt(id) },
      include: { department: true },
    });

    if (!employee) {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }

    // Aislamiento por departamento
    if (
      req.user.role === "ADMIN_DEPARTMENT" &&
      employee.departmentId !== req.user.departmentId
    ) {
      return res.status(403).json({ error: "No tenés acceso a este empleado" });
    }

    res.json(employee);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener empleado", details: error.message });
  }
};

// Actualizar empleado
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const existing = await prisma.employee.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existing) {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }

    // Aislamiento por departamento
    if (
      req.user.role === "ADMIN_DEPARTMENT" &&
      existing.departmentId !== req.user.departmentId
    ) {
      return res.status(403).json({ error: "No tenés acceso a este empleado" });
    }

    // Si actualizan la fecha de licencia, recalcular bloqueo
    if (data.licenseExpiry) {
      data.licenseExpiry = new Date(data.licenseExpiry);
      data.isBlocked = data.licenseExpiry < new Date();
    }

    const employee = await prisma.employee.update({
      where: { id: parseInt(id) },
      data,
      include: { department: true },
    });

    res.json({ message: "Empleado actualizado exitosamente", employee });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al actualizar empleado", details: error.message });
  }
};

// Eliminar empleado
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.employee.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existing) {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }

    // Aislamiento por departamento
    if (
      req.user.role === "ADMIN_DEPARTMENT" &&
      existing.departmentId !== req.user.departmentId
    ) {
      return res.status(403).json({ error: "No tenés acceso a este empleado" });
    }

    await prisma.employee.delete({ where: { id: parseInt(id) } });

    res.json({ message: "Empleado eliminado exitosamente" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al eliminar empleado", details: error.message });
  }
};
