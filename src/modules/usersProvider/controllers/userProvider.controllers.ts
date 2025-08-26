import type { Request, Response } from "express";
import { prisma } from "../../../../database/pgConfig";

export const createProvider = async (req: Request, res: Response) => {
  try {
    const { name, num_tel } = req.body;

    const userProvider = await prisma.userProvider.create({
      data: {
        name,
        num_tel,
      },
    });

    res.status(201).json(userProvider);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateUserProvider = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, num_tel } = req.body;
    const data: any = {};
    if (name) data.name = name;
    if (num_tel) data.num_tel = num_tel;
    const userProvider = await prisma.userProvider.update({
      where: { id: Number(id) },
      data,
    });

    res.status(200).json(userProvider);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAllUserProviders = async (req: Request, res: Response) => {
  try {
    const userProviders = await prisma.userProvider.findMany();

    res.status(200).json(userProviders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getUserProvidersById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userProvider = await prisma.userProvider.findUnique({
      where: { id: Number(id) },
    });

    if (!userProvider) {
      return res.status(404).json({ error: "User Provider not found" });
    }

    res.status(200).json(userProvider);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteUserProvider = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userProvider = await prisma.userProvider.delete({
      where: { id: Number(id) },
    });

    res.status(200).json(userProvider);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
