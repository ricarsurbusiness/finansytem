import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../../../../../database/pgConfig";

export const RegisterUser = async (req: Request, res: Response) => {
  try {
    const { fullname, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        fullname,
        email,
        password: hashedPassword,
      },
    });
    res
      .status(201)
      .json({ message: "User registered successfully", userId: newUser.id });
  } catch (error: any) {
    console.error("Error al registrar usuario:", error);
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Este usuario ya existe" });
    }
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullname: true,
        email: true,
      },
    });
    res.status(200).json(users);
  } catch (error: any) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        fullname: true,
        email: true,
      },
    });
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.status(200).json(user);
  } catch (error: any) {
    console.error("Error al obtener usuario:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { fullname, email, password } = req.body;
    const data: any = {};
    if (fullname) data.fullname = fullname;
    if (email) data.email = email;
    if (password) data.password = password;
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data,
    });
    res.status(200).json(user);
  } catch (error: any) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.delete({
      where: { id: Number(id) },
    });
    res.status(200).json(user);
  } catch (error: any) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};
