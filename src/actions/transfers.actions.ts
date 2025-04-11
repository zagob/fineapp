"use server";

import { prisma } from "@/lib/prisma";
import { getUserId } from "./user.actions";
import { getFirstAndLastDayOfMonth, transformToCents } from "@/lib/utils";

export const getTransfers = async (date: Date) => {
  try {
    const userId = await getUserId();

    if (!userId) throw new Error("User ID not found");

    const { firstDayOfLastMonth, lastDayOfLastMonth } =
      getFirstAndLastDayOfMonth(date);

    const transfers = await prisma.transfers.findMany({
      where: {
        userId,
        date: {
          gte: firstDayOfLastMonth,
          lte: lastDayOfLastMonth,
        },
      },
      select: {
        id: true,
        date: true,
        bankInitial: {
          select: {
            id: true,
            bank: true,
          },
        },
        bankDestine: {
          select: {
            id: true,
            bank: true,
          },
        },
        value: true,
      },
    });

    if (!transfers) throw new Error("No transfers found");

    const groupedTransfers = transfers.reduce(
      (acc: { [key: string]: typeof transfers }, transfer) => {
        const dateKey = transfer.date.toISOString().split("T")[0];

        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }

        acc[dateKey].push(transfer);

        return acc;
      },
      {} as { [key: string]: typeof transfers }
    );

    const transfersByDate = Object.entries(groupedTransfers).map(
      ([date, transfers]) => ({
        date,
        transfers,
      })
    );

    return {
      success: true,
      transfers,
      transfersByDate
    };
  } catch (error) {
    return { success: false, error };
  }
};

interface CreateTransferProps {
  date: Date;
  bankInitial: string;
  bankDestine: string;
  value: string;
}

export const createTransfer = async ({
  date,
  bankInitial,
  bankDestine,
  value,
}: CreateTransferProps) => {
  try {
    const valueCents = transformToCents(value);
    const userId = await getUserId();

    if (!userId) throw new Error("User ID not found");

    const existBankInitial = await prisma.accountBanks.findUnique({
      where: {
        id: bankInitial,
      },
    });

    if (!existBankInitial) throw new Error("Bank initial not found");

    const existBankDestine = await prisma.accountBanks.findUnique({
      where: {
        id: bankDestine,
      },
    });

    if (!existBankDestine) throw new Error("Bank destine not found");

    await prisma.transfers.create({
      data: {
        userId,
        date,
        bankInitialId: bankInitial,
        bankDestineId: bankDestine,
        value: valueCents,
      },
    });

    await prisma.$transaction(async (tx) => {
      await tx.accountBanks.update({
        where: { id: bankInitial, userId },
        data: { amount: { decrement: valueCents } },
      });

      await tx.accountBanks.update({
        where: { id: bankDestine, userId },
        data: { amount: { increment: valueCents } },
      });
    });

    return {
      success: true,
      message: "Transfer created successfully",
    };
  } catch (error) {
    return { success: false, error };
  }
};

interface UpdateTransferProps {
  id: string;
  date: Date;
  bankInitial: string;
  bankDestine: string;
  value: string;
}
export const updateTransfer = async ({
  id,
  date,
  bankInitial,
  bankDestine,
  value,
}: UpdateTransferProps) => {
  try {
    const valueCents = transformToCents(value);
    const userId = await getUserId();

    if (!userId) throw new Error("User ID not found");

    const existBankInitial = await prisma.accountBanks.findUnique({
      where: {
        id: bankInitial,
        userId,
      },
    });

    if (!existBankInitial) throw new Error("Bank initial not found");

    const existBankDestine = await prisma.accountBanks.findUnique({
      where: {
        id: bankDestine,
        userId,
      },
    });

    if (!existBankDestine) throw new Error("Bank destine not found");

    const transfer = await prisma.transfers.findUnique({
      where: {
        id,
        userId,
      },
    });

    if (!transfer) throw new Error("Transfer not found");

    await prisma.transfers.update({
      where: {
        id,
        userId,
      },
      data: {
        date,
        bankInitialId: bankInitial,
        bankDestineId: bankDestine,
        value: valueCents,
      },
    });

    await prisma.$transaction(async (tx) => {
      await tx.accountBanks.update({
        where: { id: transfer.bankInitialId, userId },
        data: { amount: { increment: transfer.value } },
      });

      await tx.accountBanks.update({
        where: { id: transfer.bankDestineId, userId },
        data: { amount: { decrement: transfer.value } },
      });

      await tx.accountBanks.update({
        where: { id: bankInitial, userId },
        data: { amount: { decrement: valueCents } },
      });

      await tx.accountBanks.update({
        where: { id: bankDestine, userId },
        data: { amount: { increment: valueCents } },
      });
    });

    return {
      success: true,
      message: "Transfer updated successfully",
    };
  } catch (error) {
    return { success: false, error };
  }
};

export const deleteTransfer = async (id: string) => {
  try {
    const userId = await getUserId();

    if (!userId) throw new Error("User ID not found");

    const transfer = await prisma.transfers.findUnique({
      where: { id, userId },
    });

    if (!transfer) throw new Error("Transfer not found");

    await prisma.transfers.delete({
      where: { id, userId },
    });

    await prisma.$transaction(async (tx) => {
      await tx.accountBanks.update({
        where: { id: transfer.bankInitialId, userId },
        data: { amount: { increment: transfer.value } },
      });

      await tx.accountBanks.update({
        where: { id: transfer.bankDestineId, userId },
        data: { amount: { decrement: transfer.value } },
      });
    });

    return {
      success: true,
      message: "Transfer deleted successfully",
    };
  } catch (error) {
    console.log(error);
  }
};
