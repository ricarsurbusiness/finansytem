import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { prisma } from "../../../../../database/pgConfig";

const JWT_SECRET = process.env.JWT_SECRET || "secret_key";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "refresh_secret_key";
const JWT_EXPIRES = "15m";
const REFRESH_EXPIRES = "7d";

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario en la BD
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    // Validar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    // Generar token
    const token = jwt.sign(
      { id: user.id, email: user.email }, // payload
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES },
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      REFRESH_SECRET,
      { expiresIn: REFRESH_EXPIRES },
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return res.json({
      message: "Login exitoso",
      token,
      refreshToken,
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error en el login" });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(401).json({ message: "Refresh token requerido" });

    // Verificar si el refresh token está en la BD
    const user = await prisma.user.findFirst({ where: { refreshToken } });
    if (!user)
      return res.status(403).json({ message: "Refresh token inválido" });

    // Validar token
    jwt.verify(refreshToken, REFRESH_SECRET, (err: any, decoded: any) => {
      if (err)
        return res
          .status(403)
          .json({ message: "Refresh token expirado o inválido" });

      // Crear nuevo access token
      const newAccessToken = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES },
      );

      return res.json({ accessToken: newAccessToken });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al refrescar token" });
  }
};
export const logoutUser = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    await prisma.user.update({
      where: { email },
      data: { refreshToken: null },
    });

    return res.json({ message: "Logout exitoso" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error en logout" });
  }
};
