import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Crear inspección
export const createInspection = async (req, res) => {
  try {
    const {
      tripRequestId,
      type,
      mileage,
      fuelLevel,
      observations,
      mechanicName,
      mechanicSign,
      driverSign,
      items,
    } = req.body;

    const tripRequest = await prisma.tripRequest.findUnique({
      where: { id: parseInt(tripRequestId) },
    });
    if (!tripRequest) {
      return res.status(404).json({ error: "Solicitud de gira no encontrada" });
    }
    if (tripRequest.status !== "APPROVED") {
      return res.status(400).json({
        error: "Solo se pueden crear inspecciones para solicitudes aprobadas",
      });
    }

    const existingInspection = await prisma.inspection.findFirst({
      where: { tripRequestId: parseInt(tripRequestId), type },
    });
    if (existingInspection) {
      return res.status(400).json({
        error: `Ya existe una inspección de ${type === "DEPARTURE" ? "salida" : "retorno"} para esta solicitud`,
      });
    }

    const inspection = await prisma.inspection.create({
      data: {
        tripRequestId: parseInt(tripRequestId),
        vehicleId: tripRequest.vehicleId,
        type,
        mileage: parseInt(mileage),
        fuelLevel,
        observations,
        mechanicName,
        mechanicSign,
        driverSign,
        items,
      },
      include: {
        tripRequest: true,
        vehicle: true,
      },
    });

    if (type === "RETURN") {
      await prisma.vehicle.update({
        where: { id: tripRequest.vehicleId },
        data: { mileage: parseInt(mileage) },
      });
    }

    res.status(201).json({
      message: `Inspección de ${type === "DEPARTURE" ? "salida" : "retorno"} registrada exitosamente`,
      inspection,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al crear inspección",
      details: error.message,
    });
  }
};

// Listar inspecciones
export const getInspections = async (req, res) => {
  try {
    const { type, tripRequestId } = req.query;
    const where = {};

    if (type) where.type = type;
    if (tripRequestId) where.tripRequestId = parseInt(tripRequestId);

    const inspections = await prisma.inspection.findMany({
      where,
      include: {
        tripRequest: true,
        vehicle: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ total: inspections.length, inspections });
  } catch (error) {
    res.status(500).json({
      error: "Error al listar inspecciones",
      details: error.message,
    });
  }
};

// Obtener inspección por ID
export const getInspectionById = async (req, res) => {
  try {
    const { id } = req.params;

    const inspection = await prisma.inspection.findUnique({
      where: { id: parseInt(id) },
      include: {
        tripRequest: true,
        vehicle: true,
      },
    });

    if (!inspection) {
      return res.status(404).json({ error: "Inspección no encontrada" });
    }

    res.json(inspection);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener inspección",
      details: error.message,
    });
  }
};
