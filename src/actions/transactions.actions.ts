"use server";

import { FormSchemaProps } from "@/components/RegisterTransactionDialog";
import { getUserId } from "./user.actions";
import { prisma } from "@/lib/prisma";
import { transformToCents } from "@/lib/utils";

export async function getTransactions({ date }: { date: Date }) {
  try {
    const userId = await getUserId();

    if (!userId) throw new Error("User ID not found");

    const firstDayOfLastMonth = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), 1, 0, 0, 0)
    );
    const lastDayOfLastMonth = new Date(
      Date.UTC(date.getFullYear(), date.getMonth()+1, 0, 23, 59, 59)
    );

    const transactions = await prisma.transactions.findMany({
      where: {
        userId,
        date: {
          gte: firstDayOfLastMonth,
          lte: lastDayOfLastMonth,
        },
      },
      select: {
        date: true,
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
        bank: {
          select: {
            id: true,
            bank: true,
          },
        },
        type: true,
        value: true,
        description: true,
        id: true,
      },
    });

    return {
      success: true,
      transactions,
    };
  } catch (error) {
    console.log(error);
    return { success: false };
  }
}

export async function createTransaction({
  bank,
  category,
  date,
  value,
  description,
}: FormSchemaProps) {
  try {
    const userId = await getUserId();

    if (!userId) throw new Error("User ID not found");

    await prisma.transactions.create({
      data: {
        userId,
        date,
        accountBanksId: bank,
        value: transformToCents(value),
        categoryId: category,
        description,
      },
    });

    return {
      success: true,
      message: "Transaction created successfully",
    };
  } catch (error) {
    console.log(error);
  }
}
