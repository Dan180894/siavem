import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Crear solicitud de gira
export const createTripRequest = async (req, res) => {
  try {
    const {
      objective,
      vehicleType,
      driverId,
      departureAt,
      returnAt,
      destination,
      observations,
    } = req.body;

    // El departamento y solicitante vienen del usuario logueado
    const requestedById = req.user.id;
    const departmentId = req.user.departmentId;

    // Verificar que el conductor existe y no está bloqueado
    const driver = await prisma.employee.findUnique({
      where: { id: parseInt(driverId) },
    });
    if (!driver) {
      return res.status(404).json({ error: "Conductor no encontrado" });
    }
    if (driver.isBlocked) {
      return res
        .status(400)
        .json({
          error:
            "El conductor tiene la licencia vencida y no puede ser asignado",
        });
    }

    const tripRequest = await prisma.tripRequest.create({
      data: {
        requestedById,
        departmentId,
        driverId: parseInt(driverId),
        objective,
        vehicleType,
        destination,
        departureAt: new Date(departureAt),
        returnAt: new Date(returnAt),
        observations,
        status: "PENDING",
      },
      include: {
        requestedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            departmentId: true,
          },
        },
        department: true,
        driver: true,
        vehicle: true,
      },
    });

    res
      .status(201)
      .json({ message: "Solicitud de gira creada exitosamente", tripRequest });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Error al crear solicitud de gira",
        details: error.message,
      });
  }
};

// Listar solicitudes de gira
export const getTripRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};

    // Aislamiento por departamento para ADMIN_DEPARTMENT
    if (req.user.role === "ADMIN_DEPARTMENT") {
      where.departmentId = req.user.departmentId;
    }

    if (status) {
      where.status = status;
    }

    const tripRequests = await prisma.tripRequest.findMany({
      where,
      include: {
        requestedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            departmentId: true,
          },
        },
        department: true,
        driver: true,
        vehicle: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ total: tripRequests.length, tripRequests });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Error al listar solicitudes de gira",
        details: error.message,
      });
  }
};

// Obtener solicitud por ID
export const getTripRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const tripRequest = await prisma.tripRequest.findUnique({
      where: { id: parseInt(id) },
      include: {
        requestedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            departmentId: true,
          },
        },
        department: true,
        driver: true,
        vehicle: true,
      },
    });

    if (!tripRequest) {
      return res.status(404).json({ error: "Solicitud de gira no encontrada" });
    }

    // Aislamiento por departamento
    if (
      req.user.role === "ADMIN_DEPARTMENT" &&
      tripRequest.departmentId !== req.user.departmentId
    ) {
      return res
        .status(403)
        .json({ error: "No tenés acceso a esta solicitud" });
    }

    res.json(tripRequest);
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Error al obtener solicitud de gira",
        details: error.message,
      });
  }
};

// Aprobar solicitud y asignar vehículo (solo ADMIN_TRANSPORT)
export const approveTripRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { vehicleId } = req.body;

    const existing = await prisma.tripRequest.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existing) {
      return res.status(404).json({ error: "Solicitud de gira no encontrada" });
    }
    if (existing.status !== "PENDING") {
      return res
        .status(400)
        .json({
          error: "Solo se pueden aprobar solicitudes en estado Pendiente",
        });
    }

    // Verificar que el vehículo existe y está disponible
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: parseInt(vehicleId) },
    });
    if (!vehicle) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }
    if (vehicle.status !== "ACTIVE") {
      return res.status(400).json({ error: "El vehículo no está disponible" });
    }

    const tripRequest = await prisma.tripRequest.update({
      where: { id: parseInt(id) },
      data: {
        status: "APPROVED",
        vehicleId: parseInt(vehicleId),
      },
      include: {
        requestedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            departmentId: true,
          },
        },
        department: true,
        driver: true,
        vehicle: true,
      },
    });

    res.json({
      message: "Solicitud de gira aprobada exitosamente",
      tripRequest,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Error al aprobar solicitud de gira",
        details: error.message,
      });
  }
};

// Rechazar solicitud (solo ADMIN_TRANSPORT)
export const rejectTripRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.tripRequest.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existing) {
      return res.status(404).json({ error: "Solicitud de gira no encontrada" });
    }
    if (existing.status !== "PENDING") {
      return res
        .status(400)
        .json({
          error: "Solo se pueden rechazar solicitudes en estado Pendiente",
        });
    }

    const tripRequest = await prisma.tripRequest.update({
      where: { id: parseInt(id) },
      data: { status: "REJECTED" },
    });

    res.json({ message: "Solicitud de gira rechazada", tripRequest });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Error al rechazar solicitud de gira",
        details: error.message,
      });
  }
};

// Actualizar solicitud (solo si está PENDING)
export const updateTripRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const existing = await prisma.tripRequest.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existing) {
      return res.status(404).json({ error: "Solicitud de gira no encontrada" });
    }
    if (existing.status !== "PENDING") {
      return res
        .status(400)
        .json({
          error: "Solo se pueden editar solicitudes en estado Pendiente",
        });
    }

    const tripRequest = await prisma.tripRequest.update({
      where: { id: parseInt(id) },
      data,
    });

    res.json({
      message: "Solicitud de gira actualizada exitosamente",
      tripRequest,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Error al actualizar solicitud de gira",
        details: error.message,
      });
  }
};
