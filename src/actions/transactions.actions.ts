"use server";

import { FormSchemaProps } from "@/components/RegisterTransactionDialog";
import { getUserId } from "./user.actions";
import { prisma } from "@/lib/prisma";
import { transformToCents } from "@/lib/utils";
import { parse } from "csv-parse/sync";
import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import { Type } from "@prisma/client";
import { ptBR } from "date-fns/locale";
import { revalidatePath } from "next/cache";

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
  date: Date;
  type?: "INCOME" | "EXPENSE";
  categoryId?: string;
  bankId?: string;
}

export async function getTransactions({
  date,
  type,
  categoryId,
  bankId,
}: GetTransactionsProps) {
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
        accountBanksId: bankId,
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

    const transactionsByDate = Object.entries(groupedTransactions)
      .map(([date, transactions]) => ({
        date,
        transactions,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));

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

    console.log({
      transactionsByDate,
    });

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

    const csvHeader =
      "ID,BancoID,Banco,CategoriaID,Categoria,Tipo,Data,Descricao,Valor";
    const csvRows = transactions.map(
      (transaction) => `
      ${transaction.id},
      ${transaction.bank.id},${transaction.bank.bank},
      ${transaction.category.id},${transaction.category.name},
      ${transaction.type},${transaction.date.toISOString()},
      ${transaction.description},${transaction.value}
    `
    );

    const csvContent = `${csvHeader}\n${csvRows.join("\n")}`;

    const csvBuffer = Buffer.from(csvContent, "utf-8").toString("base64");

    return csvBuffer;
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
    });

    const transactions = records.map((row: any) => ({
      id: row.ID,
      accountBanksId: row.BancoID,
      category: row.CategoriaID,
      type: row.Tipo,
      description: row.Descricao,
      value: parseFloat(row.Valor),
      date: new Date(row.Data),
    }));

    console.log(transactions);

    // await prisma.transactions.createMany({
    //   data: transactions,
    // });
  } catch (error) {
    console.log(error);
  }
}

export async function getSpendingComparison(date: Date) {
  try {
    const userId = await getUserId();

    if (!userId) throw new Error("User ID not found");

    const currentDate = new Date(date);
    const previousMonthDate = subMonths(currentDate, 1);

    const firstDayCurrentMonth = startOfMonth(currentDate);
    const lastDayCurrentMonth = endOfMonth(currentDate);

    const firstDayPreviousMonth = startOfMonth(previousMonthDate);
    const lastDayPreviousMonth = endOfMonth(previousMonthDate);

    const currentMonthExpenses = await prisma.transactions.findMany({
      where: {
        userId,
        type: Type.EXPENSE,
        date: {
          gte: firstDayCurrentMonth,
          lte: lastDayCurrentMonth,
        },
      },
    });

    const previousMonthExpenses = await prisma.transactions.findMany({
      where: {
        userId,
        type: Type.EXPENSE,
        date: {
          gte: firstDayPreviousMonth,
          lte: lastDayPreviousMonth,
        },
      },
    });

    const currentMonthTotal = currentMonthExpenses.reduce(
      (acc, transaction) => acc + transaction.value,
      0
    );
    const previousMonthTotal = previousMonthExpenses.reduce(
      (acc, transaction) => acc + transaction.value,
      0
    );

    let percentageChange = 0;

    if (previousMonthTotal > 0) {
      percentageChange =
        ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;
    } else if (currentMonthTotal > 0) {
      percentageChange = 100;
    }

    const formattedPercentage = Number(percentageChange.toFixed(1));

    const trend =
      percentageChange > 0
        ? "increase"
        : percentageChange < 0
        ? "decrease"
        : "stable";

    const currentMonthName = format(currentDate, "MMMM", { locale: ptBR });
    const previousMonthName = format(previousMonthDate, "MMMM", {
      locale: ptBR,
    });

    revalidatePath("/");

    return {
      currentMonth: {
        name: currentMonthName,
        total: currentMonthTotal,
      },
      previousMonth: {
        name: previousMonthName,
        total: previousMonthTotal,
      },
      percentageChange: formattedPercentage,
      trend,
      status: 200,
    };
  } catch (error) {
    console.error(error);
  }
}

export async function getSpendingComparisonFilter({
  months = 1,
  categoryId = null,
  bankId = null,
  path = '/'
}) {
  try {
    const userId = await getUserId();
    
    if (!userId) {
      return { error: 'Usuário não encontrado', status: 404 };
    }
    
    const currentDate = new Date();
    const previousMonthDate = subMonths(currentDate, months);
    
    const firstDayCurrentMonth = startOfMonth(currentDate);
    const lastDayCurrentMonth = endOfMonth(currentDate);
    
    const firstDayPreviousMonth = startOfMonth(previousMonthDate);
    const lastDayPreviousMonth = endOfMonth(previousMonthDate);
    
    const baseFilter = {
      userId,
      type: Type.EXPENSE,
    };
    
    if (categoryId) {
      baseFilter['categoryId'] = categoryId;
    }
    
    if (bankId) {
      baseFilter['accountBanksId'] = bankId;
    }
    
    const currentMonthExpenses = await prisma.transactions.findMany({
      where: {
        ...baseFilter,
        date: {
          gte: firstDayCurrentMonth,
          lte: lastDayCurrentMonth,
        },
      },
      include: {
        category: true,
        bank: true,
      },
    });
    
    // Buscar transações do mês anterior (despesas)
    const previousMonthExpenses = await prisma.transactions.findMany({
      where: {
        ...baseFilter,
        date: {
          gte: firstDayPreviousMonth,
          lte: lastDayPreviousMonth,
        },
      },
      include: {
        category: true,
        bank: true,
      },
    });
    
    // Calcular o total de despesas para cada mês
    const currentMonthTotal = currentMonthExpenses.reduce((acc, transaction) => acc + transaction.value, 0);
    const previousMonthTotal = previousMonthExpenses.reduce((acc, transaction) => acc + transaction.value, 0);
    
    // Calcular a variação percentual
    let percentageChange = 0;
    
    if (previousMonthTotal > 0) {
      // ((atual - anterior) / anterior) * 100
      percentageChange = ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;
    } else if (currentMonthTotal > 0) {
      // Se o mês anterior for zero e o atual for maior que zero, considera 100% de aumento
      percentageChange = 100;
    }
    
    // Formatar o valor para 1 casa decimal
    const formattedPercentage = Number(percentageChange.toFixed(1));
    
    // Determinar se o usuário gastou mais ou menos
    const trend = percentageChange > 0 ? 'increase' : percentageChange < 0 ? 'decrease' : 'stable';
    
    // Nome dos meses em português usando date-fns
    const currentMonthName = format(currentDate, 'MMMM', { locale: ptBR });
    const previousMonthName = format(previousMonthDate, 'MMMM', { locale: ptBR });
    
    // Obtenha detalhes de filtro para mostrar no resultado
    let filterDetails = {};
    
    if (categoryId) {
      const category = await prisma.categories.findUnique({
        where: { id: categoryId },
      });
      filterDetails['category'] = category ? category.name : 'Categoria desconhecida';
    }
    
    if (bankId) {
      const bank = await prisma.accountBanks.findUnique({
        where: { id: bankId },
      });
      filterDetails['bank'] = bank ? bank.description : 'Banco desconhecido';
    }
    
    // Agrupar dados por categoria para análise detalhada
    const categorySummary = {};
    
    // Agrupa as despesas do mês atual por categoria
    currentMonthExpenses.forEach(transaction => {
      const categoryName = transaction.category.name;
      if (!categorySummary[categoryName]) {
        categorySummary[categoryName] = {
          current: 0,
          previous: 0,
          color: transaction.category.color,
        };
      }
      categorySummary[categoryName].current += transaction.value;
    });
    
    // Agrupa as despesas do mês anterior por categoria
    previousMonthExpenses.forEach(transaction => {
      const categoryName = transaction.category.name;
      if (!categorySummary[categoryName]) {
        categorySummary[categoryName] = {
          current: 0,
          previous: transaction.value,
          color: transaction.category.color,
        };
      } else {
        categorySummary[categoryName].previous += transaction.value;
      }
    });
    
    // Calcular variação percentual para cada categoria
    Object.keys(categorySummary).forEach(category => {
      const { current, previous } = categorySummary[category];
      let categoryPercentage = 0;
      
      if (previous > 0) {
        categoryPercentage = ((current - previous) / previous) * 100;
      } else if (current > 0) {
        categoryPercentage = 100;
      }
      
      categorySummary[category].percentageChange = Number(categoryPercentage.toFixed(1));
      categorySummary[category].trend = 
        categoryPercentage > 0 ? 'increase' : 
        categoryPercentage < 0 ? 'decrease' : 'stable';
    });
    
    // Revalidar o caminho para atualizar os dados em cache
    revalidatePath(path);
    
    return {
      currentMonth: {
        name: currentMonthName,
        total: currentMonthTotal,
        date: currentDate,
      },
      previousMonth: {
        name: previousMonthName,
        total: previousMonthTotal,
        date: previousMonthDate,
      },
      percentageChange: formattedPercentage,
      trend,
      filter: filterDetails,
      categories: categorySummary,
      status: 200
    };
    
  } catch (error) {
    console.error('Erro ao calcular comparação de gastos:', error);
    return { error: 'Erro ao processar requisição', status: 500 };
  }
}
