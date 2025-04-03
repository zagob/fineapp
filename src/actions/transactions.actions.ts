"use server";

import { FormSchemaProps } from "@/components/RegisterTransactionDialog";
import { getUserId } from "./user.actions";
import { prisma } from "@/lib/prisma";
import { transformToCents } from "@/lib/utils";

export async function getTypeTransactions(type: "INCOME" | "EXPENSE") {
  try {
    const userId = await getUserId();

    if (!userId) throw new Error("User ID not found");

    const transactions = await prisma.transactions.findMany({
      where: {
        userId,
        type,
      },
      select: {
        id: true,
        date: true,
        value: true,
        description: true,
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
        bank: {
          select: {
            bank: true,
            id: true,
          },
        },
      },
    });

    const transactionsFormattedObjectKeys = transactions.reduce(
      (
        acc: {
          [key: string]: {
            name: string;
            icon: string | null;
            color: string;
            total: number;
          };
        },
        transaction
      ) => {
        const { id, icon, name, color } = transaction.category;

        if (!acc[id]) {
          acc[id] = { name, icon, color, total: 0 };
        }

        acc[id].total += transaction.value;

        return acc;
      },
      {}
    );

    const transactionsFormattedToCategories = Object.values(
      transactionsFormattedObjectKeys
    );

    return {
      success: true,
      transactionsFormattedToCategories,
      transactions,
    };
  } catch (error) {
    return { success: false, error };
  }
}

export async function getTransactions({ date }: { date: Date }) {
  try {
    const userId = await getUserId();

    if (!userId) throw new Error("User ID not found");

    const firstDayOfLastMonth = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), 1, 0, 0, 0)
    );
    const lastDayOfLastMonth = new Date(
      Date.UTC(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)
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

    const transactionsFormatted = transactions.reduce((acc, transaction) => {
      if(transaction.type === "INCOME") {
        acc.totalIncome += transaction.value;
        acc.balance += transaction.value;
      } else {
        acc.totalExpense += transaction.value;
        acc.balance -= transaction.value;
      }

      return acc
    }, {
      balance: 0,
      totalIncome: 0,
      totalExpense: 0
    })

    return {
      success: true,
      transactions,
      resume: transactionsFormatted
    };
  } catch (error) {
    console.log(error);
    return { success: false };
  }
}

interface CreateTransactionProps extends FormSchemaProps {
  type: "INCOME" | "EXPENSE";
}

export async function createTransaction({
  bank,
  category,
  date,
  value,
  description,
  type,
}: CreateTransactionProps) {
  try {
    const userId = await getUserId();

    if (!userId) throw new Error("User ID not found");

    const transaction = await prisma.transactions.create({
      data: {
        userId,
        date,
        type,
        accountBanksId: bank,
        value: transformToCents(value),
        categoryId: category,
        description,
      },
    });

    if (type === "INCOME") {
      await prisma.accountBanks.update({
        where: {
          userId,
          id: bank,
        },
        data: {
          amount: {
            increment: transaction.value,
          },
        },
      });
    }

    if (type === "EXPENSE") {
      await prisma.accountBanks.update({
        where: {
          userId,
          id: bank,
        },
        data: {
          amount: {
            decrement: transaction.value,
          },
        },
      });
    }

    return {
      success: true,
      message: "Transaction created successfully",
    };
  } catch (error) {
    console.log(error);
  }
}

export async function deleteTransaction(idTransaction: string) {
  try {
    const userId = await getUserId();

    if (!userId) throw new Error("User ID not found");

    const transaction = await prisma.transactions.delete({
      where: {
        userId,
        id: idTransaction,
      },
    });

    if (transaction.type === "INCOME") {
      await prisma.accountBanks.update({
        where: {
          userId,
          id: transaction.accountBanksId,
        },
        data: {
          amount: {
            decrement: transaction.value,
          },
        },
      });
    }

    if (transaction.type === "EXPENSE") {
      await prisma.accountBanks.update({
        where: {
          userId,
          id: transaction.accountBanksId,
        },
        data: {
          amount: {
            increment: transaction.value,
          },
        },
      });
    }

    return {
      success: true,
      message: "Transaction deleted successfully",
    };
  } catch (error) {
    return { success: false, error };
  }
}
