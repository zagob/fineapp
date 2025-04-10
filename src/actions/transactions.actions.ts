"use server";

import { FormSchemaProps } from "@/components/RegisterTransactionDialog";
import { getUserId } from "./user.actions";
import { prisma } from "@/lib/prisma";
import { transformToCents } from "@/lib/utils";
import { parse } from 'csv-parse/sync'

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

interface GetTransactionsProps {
  date: Date
  type?: "INCOME" | "EXPENSE"
  categoryId?: string
  bankId?: string
}

export async function getTransactions({ date, type, categoryId, bankId }: GetTransactionsProps) {
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
        type,
        categoryId,
        accountBanksId: bankId
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

    const groupedTransactions = transactions.reduce(
      (acc: { [key: string]: typeof transactions }, transaction) => {
        const dateKey = transaction.date.toISOString().split("T")[0];

        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }

        acc[dateKey].push(transaction);

        return acc;
      },
      {} as { [key: string]: typeof transactions }
    );

    const transactionsByDate = Object.entries(groupedTransactions).map(
      ([date, transactions]) => ({
        date,
        transactions,
      })
    );

    const transactionsFormatted = transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === "INCOME") {
          acc.totalIncome += transaction.value;
          acc.balance += transaction.value;
        } else {
          acc.totalExpense += transaction.value;
          acc.balance -= transaction.value;
        }

        return acc;
      },
      {
        balance: 0,
        totalIncome: 0,
        totalExpense: 0,
      }
    );

    return {
      success: true,
      transactions,
      resume: transactionsFormatted,
      transactionsByDate,
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

interface UpdatedTransactionProps extends FormSchemaProps {
  transactionId: string;
  type: "INCOME" | "EXPENSE";
}

export async function updatedTransaction({
  transactionId,
  bank,
  category,
  date,
  value,
  description,
  type,
}: UpdatedTransactionProps) {
  try {
    const userId = await getUserId();

    if (!userId) throw new Error("User ID not found");

    const transaction = await prisma.transactions.findUnique({
      where: {
        id: transactionId,
      },
    });

    if (!transaction) throw new Error("Transaction not found");

    const updatedTransaction = await prisma.transactions.update({
      where: {
        id: transactionId,
      },
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

      await prisma.accountBanks.update({
        where: {
          userId,
          id: updatedTransaction.accountBanksId,
        },
        data: {
          amount: {
            increment: updatedTransaction.value,
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

      await prisma.accountBanks.update({
        where: {
          userId,
          id: updatedTransaction.accountBanksId,
        },
        data: {
          amount: {
            decrement: updatedTransaction.value,
          },
        },
      });
    }

    return {
      success: true,
      message: "Transaction updated successfully",
    };
  } catch (error) {
    console.log(error);
  }
}

export async function deleteTransaction(idTransaction: string) {
  try {
    const userId = await getUserId();

    if (!userId) throw new Error("User ID not found");

    const transaction = await prisma.transactions.findUnique({
      where: {
        id: idTransaction,
      },
    });

    if (!transaction) throw new Error("Transaction not found");

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

    await prisma.transactions.delete({
      where: {
        userId,
        id: idTransaction,
      },
    });

    return {
      success: true,
      message: "Transaction deleted successfully",
    };
  } catch (error) {
    return { success: false, error };
  }
}

export async function exportTransctions(date: Date) {
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

    if (!transactions.length)
      return {
        success: false,
        message: "Nenhuma transação encontrada",
      };

    const csvHeader = "ID,BancoID,Banco,CategoriaID,Categoria,Tipo,Data,Descricao,Valor";
    const csvRows = transactions.map(
      (transaction) =>`
      ${transaction.id},
      ${transaction.bank.id},${transaction.bank.bank},
      ${transaction.category.id},${transaction.category.name},
      ${transaction.type},${transaction.date.toISOString()},
      ${transaction.description},${transaction.value}
    `);

    const csvContent = `${csvHeader}\n${csvRows.join("\n")}`;

    const csvBuffer = Buffer.from(csvContent, "utf-8").toString("base64")

    return csvBuffer
  } catch (error) {
    console.log(error);
  }
}

export async function importTransactions(file: File) {
  try {
    const userId = await getUserId();

    if (!userId) throw new Error("User ID not found");

    const csvContent = await file.text();

    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
    })

    const transactions = records.map((row: any) => ({
      id: row.ID,
      accountBanksId: row.BancoID,
      category: row.CategoriaID,
      type: row.Tipo,
      description: row.Descricao,
      value: parseFloat(row.Valor), 
      date: new Date(row.Data),
    }));

    console.log(transactions)

    // await prisma.transactions.createMany({
    //   data: transactions,
    // });

  } catch (error) {
    console.log(error)
  }
}
