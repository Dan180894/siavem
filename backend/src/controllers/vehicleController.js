import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Crear vehículo
export const createVehicle = async (req, res) => {
  try {
    const { plate, brand, model, year, color, fuel, mileage, observations } =
      req.body;

    const existingPlate = await prisma.vehicle.findUnique({
      where: { plate },
    });
    if (existingPlate) {
      return res.status(400).json({ error: "La placa ya está registrada" });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        plate,
        brand,
        model,
        year: parseInt(year),
        color,
        fuel,
        mileage: mileage ? parseInt(mileage) : 0,
        observations,
      },
    });

    res
      .status(201)
      .json({ message: "Vehículo registrado exitosamente", vehicle });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al crear vehículo", details: error.message });
  }
};

// Listar vehículos
export const getVehicles = async (req, res) => {
  try {
    const { search, status } = req.query;
    const where = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { plate: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
      ];
    }

    const vehicles = await prisma.vehicle.findMany({
      where,
      orderBy: { plate: "asc" },
    });

    res.json({ total: vehicles.length, vehicles });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al listar vehículos", details: error.message });
  }
};

// Obtener vehículo por ID
export const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: parseInt(id) },
    });

    if (!vehicle) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }

    res.json(vehicle);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener vehículo", details: error.message });
  }
};

// Actualizar vehículo
export const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const existing = await prisma.vehicle.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existing) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }

    const vehicle = await prisma.vehicle.update({
      where: { id: parseInt(id) },
      data,
    });

    res.json({ message: "Vehículo actualizado exitosamente", vehicle });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al actualizar vehículo", details: error.message });
  }
};

// Eliminar vehículo
export const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.vehicle.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existing) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }

    await prisma.vehicle.delete({ where: { id: parseInt(id) } });

    res.json({ message: "Vehículo eliminado exitosamente" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al eliminar vehículo", details: error.message });
  }
};
