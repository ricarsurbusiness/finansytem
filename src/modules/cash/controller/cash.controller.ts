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

export const closeCashRegister = async (req: Request, res: Response) => {
  try {
    const { closingCash } = req.body;
    const today = new Date();
    const start = new Date(today.setHours(0, 0, 0, 0));
    const end = new Date(today.setHours(23, 59, 59, 999));

    const existingCashRegister = await prisma.dailyCash.findFirst({
      where: {
        date: { gte: start, lte: end },
        isOpen: true,
      },
      include: {
        transactions: {
          include: {
            payments: true,
          },
        },
      },
    });
    if (!existingCashRegister) {
      return res.status(400).json({ error: "Cash register not open today" });
    }

    const calculations = calculateDayTotals(existingCashRegister.transactions);
    const totalBase =
      existingCashRegister.openingCash + calculations.totalReinforcements;
    const updatedCashRegister = await prisma.dailyCash.update({
      where: {
        id: existingCashRegister.id,
      },
      data: {
        closingCash,
        totalSales: calculations.totalSales,
        totalPurchases: calculations.totalPurchases,
        reinforcements: calculations.totalReinforcements,
        isOpen: false,
        closedAt: new Date(),
      },
    });
    const totalDay = closingCash + calculations.totalPurchases - totalBase;
    return res.status(200).json({
      message: "Cash register closed successfully",
      summary: {
        openingCash: existingCashRegister.openingCash,
        reinforcements: calculations.totalReinforcements,
        totalBase: totalBase,
        closingCash,
        totalSales: calculations.totalSales,
        totalPurchases: calculations.totalPurchases,
        totalDay,
        formula: `Compras(${calculations.totalPurchases}) + Caja(${closingCash}) - Base(${totalBase}) = ${totalDay}`,
      },
    });
  } catch (error) {
    console.error("error closing cash register:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//ver estado actual del cajero
export const getCurrentCash = async (_req: Request, res: Response) => {
  try {
    const today = new Date();
    const start = new Date(today.setHours(0, 0, 0, 0));
    const end = new Date(today.setHours(23, 59, 59, 999));

    const cashRegister = await prisma.dailyCash.findFirst({
      where: {
        date: { gte: start, lte: end },
      },
      include: {
        transactions: {
          include: {
            payments: true,
            provider: {
              select: {
                id: true,
                name: true,
                num_tel: true,
              },
            },
          },
          orderBy: {
            date: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!cashRegister) {
      return res.status(404).json({
        error: "No cash register found for today",
        message: "Please open the cash register first",
      });
    }

    // Calcular totales actuales del día
    const calculations = calculateDayTotals(cashRegister.transactions);

    // Si la caja está abierta, calcular el "total estimado"
    let estimatedTotal = null;
    if (cashRegister.isOpen) {
      // Para caja abierta, usamos una estimación basada en las transacciones actuales
      const totalBase =
        cashRegister.openingCash + calculations.totalReinforcements;

      // Estimamos que el dinero en caja actual es:
      // Base inicial + ventas - compras + refuerzos - lo que haya sacado para gastos
      const estimatedCashInRegister =
        cashRegister.openingCash +
        calculations.totalSales -
        calculations.totalPurchases +
        calculations.totalReinforcements;

      estimatedTotal = {
        totalBase,
        estimatedCashInRegister,
        pendingToClose: true,
        message:
          "Estos son cálculos estimados. Ingrese el efectivo real al cerrar la caja.",
      };
    } else {
      // Caja cerrada - usar datos finales
      const totalBase =
        cashRegister.openingCash +
        (cashRegister.reinforcements || calculations.totalReinforcements);
      const finalTotal =
        (cashRegister.totalPurchases || calculations.totalPurchases) +
        (cashRegister.closingCash || 0) -
        totalBase;

      estimatedTotal = {
        totalBase,
        finalCashAmount: cashRegister.closingCash,
        finalDayTotal: finalTotal,
        isClosed: true,
        closedAt: cashRegister.closedAt,
      };
    }

    return res.status(200).json({
      cashRegister: {
        id: cashRegister.id,
        date: cashRegister.date,
        isOpen: cashRegister.isOpen,
        openingCash: cashRegister.openingCash,
        closingCash: cashRegister.closingCash,
        createdAt: cashRegister.createdAt,
        closedAt: cashRegister.closedAt,

        // Totales almacenados (si existen) vs calculados en tiempo real
        storedTotals: {
          totalSales: cashRegister.totalSales,
          totalPurchases: cashRegister.totalPurchases,
          reinforcements: cashRegister.reinforcements,
        },

        currentTotals: calculations,

        // Resumen del día
        summary: estimatedTotal,

        // Conteo de transacciones por tipo
        transactionCount: {
          sales: cashRegister.transactions.filter((t: any) => t.type === "SALE")
            .length,
          purchases: cashRegister.transactions.filter(
            (t: any) => t.type === "PURCHASE",
          ).length,
          reinforcements: cashRegister.transactions.filter(
            (t: any) => t.type === "REINFORCEMENT",
          ).length,
          total: cashRegister.transactions.length,
        },

        // Lista de transacciones del día
        transactions: cashRegister.transactions.map((transaction: any) => ({
          id: transaction.id,
          type: transaction.type,
          description: transaction.description,
          amount: transaction.amount,
          date: transaction.date,
          provider: transaction.provider,
          payments: transaction.payments,
        })),
      },
    });
  } catch (error) {
    console.error("Error getting current cash:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getCashHistory = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, page = 1, limit = 10 } = req.query;

    const where: any = {};

    // Filtros de fecha
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    } else if (startDate) {
      where.date = {
        gte: new Date(startDate as string),
      };
    } else if (endDate) {
      where.date = {
        lte: new Date(endDate as string),
      };
    }

    const cashRegisters = await prisma.dailyCash.findMany({
      where,
      include: {
        transactions: {
          include: {
            payments: true,
            provider: {
              select: {
                id: true,
                name: true,
                num_tel: true,
              },
            },
          },
          orderBy: {
            date: "desc",
          },
        },
      },
      orderBy: {
        date: "desc", // Más recientes primero
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    const total = await prisma.dailyCash.count({ where });

    const cashHistory = cashRegisters.map((cash: any) => {
      // Calcular totales dinámicamente
      const calculatedTotals = calculateDayTotals(cash.transactions);

      // Usar totales almacenados si existen, si no usar calculados
      const finalTotals = {
        totalSales: cash.totalSales ?? calculatedTotals.totalSales,
        totalPurchases: cash.totalPurchases ?? calculatedTotals.totalPurchases,
        totalReinforcements:
          cash.reinforcements ?? calculatedTotals.totalReinforcements,
      };

      // Calcular el total del día usando tu fórmula
      const totalBase = cash.openingCash + finalTotals.totalReinforcements;
      const dayTotal = cash.closingCash
        ? finalTotals.totalPurchases + cash.closingCash - totalBase
        : null;

      return {
        id: cash.id,
        date: cash.date,
        isOpen: cash.isOpen,
        openingCash: cash.openingCash,
        closingCash: cash.closingCash,
        createdAt: cash.createdAt,
        closedAt: cash.closedAt,

        // Totales del día
        totals: finalTotals,

        // Cálculo final
        summary: {
          totalBase,
          dayTotal,
          transactionCount: cash.transactions.length,
        },

        // Conteo de transacciones por tipo
        transactionCount: {
          sales: cash.transactions.filter((t: any) => t.type === "SALE").length,
          purchases: cash.transactions.filter((t: any) => t.type === "PURCHASE")
            .length,
          reinforcements: cash.transactions.filter(
            (t: any) => t.type === "REINFORCEMENT",
          ).length,
          total: cash.transactions.length,
        },

        // Desglose por forma de pago
        paymentBreakdown: {
          cash: cash.transactions
            .flatMap((t: any) => t.payments)
            .filter((p: any) => p.paymentMethod === "CASH")
            .reduce((sum: number, p: any) => sum + p.amount, 0),
          transfer: cash.transactions
            .flatMap((t: any) => t.payments)
            .filter((p: any) => p.paymentMethod === "TRANSFER")
            .reduce((sum: number, p: any) => sum + p.amount, 0),
        },
      };
    });

    // Estadísticas generales del período (opcional)
    const periodStats = {
      totalDays: cashHistory.length,
      closedDays: cashHistory.filter((cash: any) => !cash.isOpen).length,
      openDays: cashHistory.filter((cash: any) => cash.isOpen).length,

      totalSales: cashHistory.reduce(
        (sum: number, cash: any) => sum + cash.totals.totalSales,
        0,
      ),
      totalPurchases: cashHistory.reduce(
        (sum: number, cash: any) => sum + cash.totals.totalPurchases,
        0,
      ),
      totalReinforcements: cashHistory.reduce(
        (sum: number, cash: any) => sum + cash.totals.totalReinforcements,
        0,
      ),

      averageDayTotal:
        cashHistory
          .filter((cash: any) => cash.summary.dayTotal !== null)
          .reduce(
            (sum: number, cash: any) => sum + (cash.summary.dayTotal || 0),
            0,
          ) /
        Math.max(
          cashHistory.filter((cash: any) => cash.summary.dayTotal !== null)
            .length,
          1,
        ),
    };

    return res.status(200).json({
      cashHistory,
      periodStats,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
        hasNext: Number(page) * Number(limit) < total,
        hasPrev: Number(page) > 1,
      },
    });
  } catch (error) {
    console.error("Error getting cash history:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Function to calculate day totals
function calculateDayTotals(transactions: any[]) {
  let totalSales = 0;
  let totalPurchases = 0;
  let totalReinforcements = 0;

  transactions.forEach((transaction) => {
    const totalAmount = transaction.payments.reduce(
      (sum: number, payment: any) => sum + payment.amount,
      0,
    );

    switch (transaction.type) {
      case "SALE":
        totalSales += totalAmount;
        break;
      case "PURCHASE":
        totalPurchases += totalAmount;
        break;
      case "REINFORCEMENT":
        totalReinforcements += totalAmount;
        break;
    }
  });

  return {
    totalSales,
    totalPurchases,
    totalReinforcements,
  };
}
