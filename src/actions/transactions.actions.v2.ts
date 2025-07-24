"use server";

import { prisma } from "@/lib/prisma";
import { getUserId } from "./user.actions";
import { transformToCents } from "@/lib/utils";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";
import { 
  createTransactionSchema, 
  updateTransactionSchema, 
  getTransactionsSchema,
  type CreateTransactionInput,
  type UpdateTransactionInput,
  type GetTransactionsInput
} from "@/lib/validations";
import { z } from "zod";

// Tipos de resposta padronizados
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface PaginatedResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Função helper para tratamento de erros
function handleError(error: unknown, action: string, context?: any): ApiResponse {
  if (error instanceof z.ZodError) {
    const message = error.errors.map(e => e.message).join(", ");
    logger.actionError(action, new Error(message), context);
    return { success: false, error: message };
  }
  
  if (error instanceof Error) {
    logger.actionError(action, error, context);
    return { success: false, error: error.message };
  }
  
  const unknownError = new Error("Erro desconhecido");
  logger.actionError(action, unknownError, context);
  return { success: false, error: "Erro interno do servidor" };
}

// Função helper para validação de usuário
async function validateUser(): Promise<string> {
  const userId = await getUserId();
  if (!userId) {
    throw new Error("Usuário não autenticado");
  }
  return userId;
}

// GET - Buscar transações com paginação e filtros
export async function getTransactionsV2(input: GetTransactionsInput): Promise<PaginatedResponse<any>> {
  const startTime = Date.now();
  const action = "getTransactionsV2";
  
  try {
    logger.actionStart(action, { input });
    
    // Validar input
    const validatedInput = getTransactionsSchema.parse(input);
    const userId = await validateUser();
    
    // Calcular datas
    const firstDayOfMonth = new Date(
      Date.UTC(validatedInput.date.getFullYear(), validatedInput.date.getMonth(), 1, 0, 0, 0)
    );
    const lastDayOfMonth = new Date(
      Date.UTC(validatedInput.date.getFullYear(), validatedInput.date.getMonth() + 1, 0, 23, 59, 59)
    );
    
    // Construir where clause
    const where: any = {
      userId,
      date: {
        gte: firstDayOfMonth,
        lte: lastDayOfMonth,
      },
    };
    
    if (validatedInput.type) where.type = validatedInput.type;
    if (validatedInput.categoryId) where.categoryId = validatedInput.categoryId;
    if (validatedInput.bankId) where.accountBanksId = validatedInput.bankId;
    
    // Contar total de registros
    const total = await prisma.transactions.count({ where });
    
    // Calcular paginação
    const skip = (validatedInput.page - 1) * validatedInput.limit;
    const totalPages = Math.ceil(total / validatedInput.limit);
    
    // Buscar transações
    const transactions = await prisma.transactions.findMany({
      where,
      select: {
        id: true,
        date: true,
        type: true,
        value: true,
        description: true,
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
      },
      orderBy: { date: 'desc' },
      skip,
      take: validatedInput.limit,
    });
    
    // Agrupar por data
    const groupedTransactions = transactions.reduce((acc, transaction) => {
      const dateKey = transaction.date.toISOString().split("T")[0];
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(transaction);
      return acc;
    }, {} as Record<string, typeof transactions>);
    
    const transactionsByDate = Object.entries(groupedTransactions)
      .map(([date, transactions]) => ({ date, transactions }))
      .sort((a, b) => b.date.localeCompare(a.date));
    
    // Calcular resumo
    const summary = transactions.reduce(
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
      { balance: 0, totalIncome: 0, totalExpense: 0 }
    );
    
    const duration = Date.now() - startTime;
    logger.actionSuccess(action, { 
      userId, 
      total, 
      page: validatedInput.page, 
      duration 
    });
    
    const response: PaginatedResponse<any> = {
      success: true,
      data: {
        transactions,
        transactionsByDate,
        summary,
      },
      pagination: {
        page: validatedInput.page,
        limit: validatedInput.limit,
        total,
        totalPages,
        hasNext: validatedInput.page < totalPages,
        hasPrev: validatedInput.page > 1,
      },
    };
    
    return response;
    
  } catch (error) {
    return handleError(error, action, { input });
  }
}

// POST - Criar transação
export async function createTransactionV2(input: CreateTransactionInput): Promise<ApiResponse> {
  const startTime = Date.now();
  const action = "createTransactionV2";
  
  try {
    logger.actionStart(action, { input });
    
    // Validar input
    const validatedInput = createTransactionSchema.parse(input);
    const userId = await validateUser();
    
    // Converter valor para centavos
    const valueCents = transformToCents(validatedInput.value);
    
    // Verificar se categoria existe
    const category = await prisma.categories.findUnique({
      where: { id: validatedInput.category, userId },
    });
    
    if (!category) {
      throw new Error("Categoria não encontrada");
    }
    
    // Verificar se banco existe
    const bank = await prisma.accountBanks.findUnique({
      where: { id: validatedInput.bank, userId },
    });
    
    if (!bank) {
      throw new Error("Conta bancária não encontrada");
    }
    
    // Criar transação
    const transaction = await prisma.transactions.create({
      data: {
        userId,
        date: validatedInput.date,
        type: validatedInput.type,
        value: valueCents,
        description: validatedInput.description,
        categoryId: validatedInput.category,
        accountBanksId: validatedInput.bank,
      },
      include: {
        category: true,
        bank: true,
      },
    });
    
    // Atualizar saldo da conta
    await prisma.accountBanks.update({
      where: { id: validatedInput.bank },
      data: {
        amount: {
          increment: validatedInput.type === "INCOME" ? valueCents : -valueCents,
        },
      },
    });
    
    const duration = Date.now() - startTime;
    logger.actionSuccess(action, { 
      userId, 
      transactionId: transaction.id, 
      duration 
    });
    
    revalidatePath("/");
    revalidatePath("/transactions");
    
    return {
      success: true,
      data: transaction,
      message: "Transação criada com sucesso",
    };
    
  } catch (error) {
    return handleError(error, action, { input });
  }
}

// PUT - Atualizar transação
export async function updateTransactionV2(input: UpdateTransactionInput): Promise<ApiResponse> {
  const startTime = Date.now();
  const action = "updateTransactionV2";
  
  try {
    logger.actionStart(action, { input });
    
    // Validar input
    const validatedInput = updateTransactionSchema.parse(input);
    const userId = await validateUser();
    
    // Buscar transação existente
    const existingTransaction = await prisma.transactions.findUnique({
      where: { id: validatedInput.transactionId, userId },
      include: { bank: true },
    });
    
    if (!existingTransaction) {
      throw new Error("Transação não encontrada");
    }
    
    // Converter valor para centavos
    const newValueCents = transformToCents(validatedInput.value);
    const oldValueCents = existingTransaction.value;
    
    // Calcular diferença no saldo
    const oldBalanceChange = existingTransaction.type === "INCOME" ? oldValueCents : -oldValueCents;
    const newBalanceChange = validatedInput.type === "INCOME" ? newValueCents : -newValueCents;
    const balanceDifference = newBalanceChange - oldBalanceChange;
    
    // Atualizar transação
    const transaction = await prisma.transactions.update({
      where: { id: validatedInput.transactionId },
      data: {
        date: validatedInput.date,
        type: validatedInput.type,
        value: newValueCents,
        description: validatedInput.description,
        categoryId: validatedInput.category,
        accountBanksId: validatedInput.bank,
      },
      include: {
        category: true,
        bank: true,
      },
    });
    
    // Atualizar saldo da conta
    await prisma.accountBanks.update({
      where: { id: validatedInput.bank },
      data: {
        amount: { increment: balanceDifference },
      },
    });
    
    const duration = Date.now() - startTime;
    logger.actionSuccess(action, { 
      userId, 
      transactionId: transaction.id, 
      duration 
    });
    
    revalidatePath("/");
    revalidatePath("/transactions");
    
    return {
      success: true,
      data: transaction,
      message: "Transação atualizada com sucesso",
    };
    
  } catch (error) {
    return handleError(error, action, { input });
  }
}

// DELETE - Deletar transação
export async function deleteTransactionV2(transactionId: string): Promise<ApiResponse> {
  const startTime = Date.now();
  const action = "deleteTransactionV2";
  
  try {
    logger.actionStart(action, { transactionId });
    
    const userId = await validateUser();
    
    // Buscar transação
    const transaction = await prisma.transactions.findUnique({
      where: { id: transactionId, userId },
      include: { bank: true },
    });
    
    if (!transaction) {
      throw new Error("Transação não encontrada");
    }
    
    // Calcular ajuste no saldo
    const balanceAdjustment = transaction.type === "INCOME" ? -transaction.value : transaction.value;
    
    // Deletar transação
    await prisma.transactions.delete({
      where: { id: transactionId },
    });
    
    // Atualizar saldo da conta
    await prisma.accountBanks.update({
      where: { id: transaction.accountBanksId },
      data: {
        amount: { increment: balanceAdjustment },
      },
    });
    
    const duration = Date.now() - startTime;
    logger.actionSuccess(action, { 
      userId, 
      transactionId, 
      duration 
    });
    
    revalidatePath("/");
    revalidatePath("/transactions");
    
    return {
      success: true,
      message: "Transação deletada com sucesso",
    };
    
  } catch (error) {
    return handleError(error, action, { transactionId });
  }
}

// GET - Relatório de transações por categoria
export async function getTransactionsByCategory(date: Date): Promise<ApiResponse> {
  const startTime = Date.now();
  const action = "getTransactionsByCategory";
  
  try {
    logger.actionStart(action, { date });
    
    const userId = await validateUser();
    
    const firstDayOfMonth = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), 1, 0, 0, 0)
    );
    const lastDayOfMonth = new Date(
      Date.UTC(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)
    );
    
    const transactions = await prisma.transactions.findMany({
      where: {
        userId,
        date: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
      include: {
        category: true,
      },
    });
    
    // Agrupar por categoria
    const byCategory = transactions.reduce((acc, transaction) => {
      const categoryId = transaction.category.id;
      if (!acc[categoryId]) {
        acc[categoryId] = {
          category: transaction.category,
          total: 0,
          count: 0,
          transactions: [],
        };
      }
      
      acc[categoryId].total += transaction.value;
      acc[categoryId].count += 1;
      acc[categoryId].transactions.push(transaction);
      
      return acc;
    }, {} as Record<string, any>);
    
    const duration = Date.now() - startTime;
    logger.actionSuccess(action, { userId, duration });
    
    return {
      success: true,
      data: Object.values(byCategory),
    };
    
  } catch (error) {
    return handleError(error, action, { date });
  }
} 