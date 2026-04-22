import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET || "siavem_secret_key_2026";

// Registro de usuario
export const register = async (req, res) => {
  try {
    const { email, password, name, role, departmentId } = req.body;

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "El correo ya está registrado" });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || "EMPLOYEE",
        departmentId: parseInt(departmentId),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        createdAt: true,
      },
    });

    res.status(201).json({ message: "Usuario creado exitosamente", user });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al crear usuario", details: error.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email },
      include: { department: true },
    });

    if (!user) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    // Verificar si está activo
    if (!user.isActive) {
      return res.status(403).json({ error: "Usuario desactivado" });
    }

    // Comparar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        departmentId: user.departmentId,
      },
      JWT_SECRET,
      { expiresIn: "8h" },
    );

    res.json({
      message: "Login exitoso",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Error en login", details: error.message });
  }
};
