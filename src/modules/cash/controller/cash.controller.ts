import { prisma } from "../../../../database/pgConfig";
import type { Request, Response } from "express";

export const openCashRegister = async (req: Request, res: Response) => {
  try {
    const { openingCash } = req.body;
    const today = new Date();
    const start = new Date(today.setHours(0, 0, 0, 0));
    const end = new Date(today.setHours(23, 59, 59, 999));

    const existingCashRegister = await prisma.dailyCash.findFirst({
      where: {
        date: { gte: start, lte: end },
        isOpen: true,
      },
    });
    if (existingCashRegister) {
      return res
        .status(400)
        .json({ error: "Cash register already open today" });
    }
    const cashRegister = await prisma.dailyCash.create({
      data: {
        openingCash,
      },
    });
    return res.status(201).json(cashRegister);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// export const closeCashRegister = async (req: Request, res: Response) => {
//   const { id } = req.params;

//   const cashRegister = await prisma.dailyCash.findUnique({
//     where: {
//       id,
//     },
//   });
//   if (!cashRegister) {
//     return res.status(404).json({ error: "Cash register not found" });
//   }
//   if (!cashRegister.isOpen) {
//     return res.status(400).json({ error: "Cash register already closed" });
//   }
//   const closingDailyCash = await prisma.dailyCash.update({
//     where: {
//       id,
//     },
//     data: {
//       closingCash: cashRegister.openingCash,
//       isOpen: false,
//     },
//   });
//   return res.status(200).json(closingDailyCash);
// };
