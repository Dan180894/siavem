import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Crear mantenimiento
export const createMaintenance = async (req, res) => {
  try {
    const {
      vehicleId,
      workshopId,
      type,
      maintenanceDate,
      description,
      mileage,
      nextServiceKm,
      amount,
      departureDate,
      problemDetail,
    } = req.body;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: parseInt(vehicleId) },
    });
    if (!vehicle) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }

    const workshop = await prisma.workshop.findUnique({
      where: { id: parseInt(workshopId) },
    });
    if (!workshop) {
      return res.status(404).json({ error: "Taller no encontrado" });
    }
    if (workshop.isBlocked) {
      return res.status(400).json({
        error:
          "El taller tiene el contrato vencido y no puede recibir vehículos",
      });
    }

    const maintenance = await prisma.maintenance.create({
      data: {
        vehicleId: parseInt(vehicleId),
        workshopId: parseInt(workshopId),
        type,
        maintenanceDate: new Date(maintenanceDate),
        description,
        mileage: parseInt(mileage),
        nextServiceKm: nextServiceKm ? parseInt(nextServiceKm) : null,
        amount: parseFloat(amount),
        departureDate: new Date(departureDate),
        problemDetail: problemDetail || null,
      },
      include: {
        vehicle: true,
        workshop: true,
      },
    });

    if (type === "CORRECTIVE") {
      await prisma.vehicle.update({
        where: { id: parseInt(vehicleId) },
        data: { status: "MAINTENANCE" },
      });
    }

    res.status(201).json({
      message: "Mantenimiento registrado exitosamente",
      maintenance,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al crear mantenimiento",
      details: error.message,
    });
  }
};

// Listar mantenimientos
export const getMaintenances = async (req, res) => {
  try {
    const { type, vehicleId } = req.query;
    const where = {};

    if (type) where.type = type;
    if (vehicleId) where.vehicleId = parseInt(vehicleId);

    const maintenances = await prisma.maintenance.findMany({
      where,
      include: {
        vehicle: true,
        workshop: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ total: maintenances.length, maintenances });
  } catch (error) {
    res.status(500).json({
      error: "Error al listar mantenimientos",
      details: error.message,
    });
  }
};

// Obtener mantenimiento por ID
export const getMaintenanceById = async (req, res) => {
  try {
    const { id } = req.params;

    const maintenance = await prisma.maintenance.findUnique({
      where: { id: parseInt(id) },
      include: {
        vehicle: true,
        workshop: true,
      },
    });

    if (!maintenance) {
      return res.status(404).json({ error: "Mantenimiento no encontrado" });
    }

    res.json(maintenance);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener mantenimiento",
      details: error.message,
    });
  }
};

// Registrar retorno del vehículo
export const registerReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const { returnDate } = req.body;

    const existing = await prisma.maintenance.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existing) {
      return res.status(404).json({ error: "Mantenimiento no encontrado" });
    }
    if (existing.type !== "CORRECTIVE") {
      return res.status(400).json({
        error: "Solo los mantenimientos correctivos tienen fecha de retorno",
      });
    }
    if (existing.returnDate) {
      return res.status(400).json({
        error: "Este mantenimiento ya tiene fecha de retorno registrada",
      });
    }

    const maintenance = await prisma.maintenance.update({
      where: { id: parseInt(id) },
      data: { returnDate: new Date(returnDate) },
      include: {
        vehicle: true,
        workshop: true,
      },
    });

    await prisma.vehicle.update({
      where: { id: existing.vehicleId },
      data: { status: "ACTIVE" },
    });

    res.json({
      message: "Retorno registrado. Vehículo vuelto a estado Activo.",
      maintenance,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al registrar retorno",
      details: error.message,
    });
  }
};
