import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Crear taller
export const createWorkshop = async (req, res) => {
  try {
    const {
      contractCode,
      name,
      address,
      specialty,
      contractExpiry,
      licitationDocument,
    } = req.body;

    const existingContract = await prisma.workshop.findUnique({
      where: { contractCode },
    });
    if (existingContract) {
      return res
        .status(400)
        .json({ error: "El código de contrato ya está registrado" });
    }

    const isBlocked = new Date(contractExpiry) < new Date();

    const workshop = await prisma.workshop.create({
      data: {
        contractCode,
        name,
        address,
        specialty,
        contractExpiry: new Date(contractExpiry),
        licitationDocument,
        isBlocked,
      },
    });

    res
      .status(201)
      .json({ message: "Taller registrado exitosamente", workshop });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al crear taller", details: error.message });
  }
};

// Listar talleres
export const getWorkshops = async (req, res) => {
  try {
    const { search, available } = req.query;
    const where = {};

    if (available === "true") {
      where.isBlocked = false;
    }

    if (search) {
      where.OR = [
        { contractCode: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { specialty: { contains: search, mode: "insensitive" } },
      ];
    }

    const workshops = await prisma.workshop.findMany({
      where,
      orderBy: { contractCode: "asc" },
    });

    res.json({ total: workshops.length, workshops });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al listar talleres", details: error.message });
  }
};

// Obtener taller por ID
export const getWorkshopById = async (req, res) => {
  try {
    const { id } = req.params;

    const workshop = await prisma.workshop.findUnique({
      where: { id: parseInt(id) },
    });

    if (!workshop) {
      return res.status(404).json({ error: "Taller no encontrado" });
    }

    res.json(workshop);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener taller", details: error.message });
  }
};

// Actualizar taller
export const updateWorkshop = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const existing = await prisma.workshop.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existing) {
      return res.status(404).json({ error: "Taller no encontrado" });
    }

    if (data.contractExpiry) {
      data.contractExpiry = new Date(data.contractExpiry);
      data.isBlocked = data.contractExpiry < new Date();
    }

    const workshop = await prisma.workshop.update({
      where: { id: parseInt(id) },
      data,
    });

    res.json({ message: "Taller actualizado exitosamente", workshop });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al actualizar taller", details: error.message });
  }
};

// Eliminar taller
export const deleteWorkshop = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.workshop.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existing) {
      return res.status(404).json({ error: "Taller no encontrado" });
    }

    await prisma.workshop.delete({ where: { id: parseInt(id) } });

    res.json({ message: "Taller eliminado exitosamente" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al eliminar taller", details: error.message });
  }
};
