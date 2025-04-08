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
    });

    if (!transfers) throw new Error("No transfers found");

    return {
      success: true,
      transfers,
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
    const userId = await getUserId();

    if (!userId) throw new Error("User ID not found");

    const t = await prisma.transfers.create({
      data: {
        userId,
        date,
        bankInitialId: bankInitial,
        bankDestineId: bankDestine,
        value: transformToCents(value),
      },
    });

    console.log('t', t)

    await prisma.accountBanks.update({
      where: {
        id: bankInitial,
        userId,
      },
      data: {
        amount: {
          decrement: transformToCents(value),
        },
      },
    });

    await prisma.accountBanks.update({
      where: {
        id: bankDestine,
        userId,
      },
      data: {
        amount: {
          increment: transformToCents(value),
        },
      },
    });

    return {
      success: true,
      message: "Transfer created successfully",
    };
  } catch (error) {
    return { success: false, error };
  }
};
