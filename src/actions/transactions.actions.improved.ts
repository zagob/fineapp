"use server";

import { prisma } from "@/lib/prisma";
import { getUserId } from "./user.actions";
import { transformToCents } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ========================================
// VALIDAÇÕES COM ZOD
// ========================================

const createTransactionSchema = z.object({
  bank: z.string().cuid("ID do banco inválido"),
  category: z.string().cuid("ID da categoria inválido"),
  date: z.date(),
  value: z.string().min(1, "Valor é obrigatório"),
  description: z.string().optional(),
  type: z.enum(["INCOME", "EXPENSE"], {
    errorMap: () => ({ message: "Tipo deve ser INCOME ou EXPENSE" })
  }),
});

const updateTransactionSchema = createTransactionSchema.extend({
  transactionId: z.string().cuid("ID da transação inválido"),
});

const getTransactionsSchema = z.object({
  date: z.date(),
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  categoryId: z.string().cuid().optional(),
  bankId: z.string().cuid().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

// ========================================
// TIPOS
// ========================================

type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
type GetTransactionsInput = z.infer<typeof getTransactionsSchema>;

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

// ========================================
// FUNÇÕES HELPER
// ========================================

function handleError(error: unknown, action: string): ApiResponse {
  if (error instanceof z.ZodError) {
    const message = error.errors.map(e => e.message).join(", ");
    console.error(`[${action}] Validation error:`, message);
    return { success: false, error: message };
  }
  
  if (error instanceof Error) {
    console.error(`[${action}] Error:`, error.message);
    return { success: false, error: error.message };
  }
  
  console.error(`[${action}] Unknown error:`, error);
  return { success: false, error: "Erro interno do servidor" };
}

async function validateUser(): Promise<string> {
  const userId = await getUserId();
  if (!userId) {
    throw new Error("Usuário não autenticado");
  }
  return userId;
}

// ========================================
// ACTIONS PRINCIPAIS
// ========================================

// GET - Buscar transações com paginação e filtros otimizados
export async function getTransactionsImproved(input: GetTransactionsInput): Promise<PaginatedResponse<any>> {
  const startTime = Date.now();
  const action = "getTransactionsImproved";
  
  try {
    console.log(`[${action}] Starting with input:`, input);
    
    // Validar input
    const validatedInput = getTransactionsSchema.parse(input);
    const userId = await validateUser();
    
    // Calcular datas usando UTC para melhor performance
    const firstDayOfMonth = new Date(
      Date.UTC(validatedInput.date.getFullYear(), validatedInput.date.getMonth(), 1, 0, 0, 0)
    );
    const lastDayOfMonth = new Date(
      Date.UTC(validatedInput.date.getFullYear(), validatedInput.date.getMonth() + 1, 0, 23, 59, 59)
    );
    
    // Construir where clause otimizado
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
    
    // Contar total usando índice otimizado
    const total = await prisma.transactions.count({ where });
    
    // Calcular paginação
    const skip = (validatedInput.page - 1) * validatedInput.limit;
    const totalPages = Math.ceil(total / validatedInput.limit);
    
    // Buscar transações com select otimizado
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
    
    // Agrupar por data para melhor organização
    const groupedTransactions = transactions.reduce((acc, transaction) => {
      const dateKey = transaction.date.toISOString().split("T")[0];
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(transaction);
      return acc;
    }, {} as Record<string, typeof transactions>);
    
    const transactionsByDate = Object.entries(groupedTransactions)
      .map(([date, transactions]) => ({ date, transactions }))
      .sort((a, b) => b.date.localeCompare(a.date));
    
    // Calcular resumo otimizado
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
    console.log(`[${action}] Completed in ${duration}ms - Found ${total} transactions`);
    
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
    return handleError(error, action);
  }
}

// POST - Criar transação com validação completa
export async function createTransactionImproved(input: CreateTransactionInput): Promise<ApiResponse> {
  const startTime = Date.now();
  const action = "createTransactionImproved";
  
  try {
    console.log(`[${action}] Starting with input:`, input);
    
    // Validar input
    const validatedInput = createTransactionSchema.parse(input);
    const userId = await validateUser();
    
    // Converter valor para centavos
    const valueCents = transformToCents(validatedInput.value);
    
    // Verificar se categoria existe (usando índice)
    const category = await prisma.categories.findUnique({
      where: { id: validatedInput.category, userId },
    });
    
    if (!category) {
      throw new Error("Categoria não encontrada");
    }
    
    // Verificar se banco existe (usando índice)
    const bank = await prisma.accountBanks.findUnique({
      where: { id: validatedInput.bank, userId },
    });
    
    if (!bank) {
      throw new Error("Conta bancária não encontrada");
    }
    
    // Criar transação em uma transação para garantir consistência
    const result = await prisma.$transaction(async (tx) => {
      // Criar transação
      const transaction = await tx.transactions.create({
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
      await tx.accountBanks.update({
        where: { id: validatedInput.bank },
        data: {
          amount: {
            increment: validatedInput.type === "INCOME" ? valueCents : -valueCents,
          },
        },
      });
      
      return transaction;
    });
    
    const duration = Date.now() - startTime;
    console.log(`[${action}] Completed in ${duration}ms - Transaction ID: ${result.id}`);
    
    revalidatePath("/");
    revalidatePath("/transactions");
    
    return {
      success: true,
      data: result,
      message: "Transação criada com sucesso",
    };
    
  } catch (error) {
    return handleError(error, action);
  }
}

// PUT - Atualizar transação com validação
export async function updateTransactionImproved(input: UpdateTransactionInput): Promise<ApiResponse> {
  const startTime = Date.now();
  const action = "updateTransactionImproved";
  
  try {
    console.log(`[${action}] Starting with input:`, input);
    
    // Validar input
    const validatedInput = updateTransactionSchema.parse(input);
    const userId = await validateUser();
    
    // Buscar transação existente (usando índice)
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
    
    // Atualizar em transação para garantir consistência
    const result = await prisma.$transaction(async (tx) => {
      // Atualizar transação
      const transaction = await tx.transactions.update({
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
      await tx.accountBanks.update({
        where: { id: validatedInput.bank },
        data: {
          amount: { increment: balanceDifference },
        },
      });
      
      return transaction;
    });
    
    const duration = Date.now() - startTime;
    console.log(`[${action}] Completed in ${duration}ms - Transaction ID: ${result.id}`);
    
    revalidatePath("/");
    revalidatePath("/transactions");
    
    return {
      success: true,
      data: result,
      message: "Transação atualizada com sucesso",
    };
    
  } catch (error) {
    return handleError(error, action);
  }
}

// DELETE - Deletar transação com validação
export async function deleteTransactionImproved(transactionId: string): Promise<ApiResponse> {
  const startTime = Date.now();
  const action = "deleteTransactionImproved";
  
  try {
    console.log(`[${action}] Starting with transaction ID:`, transactionId);
    
    const userId = await validateUser();
    
    // Buscar transação (usando índice)
    const transaction = await prisma.transactions.findUnique({
      where: { id: transactionId, userId },
      include: { bank: true },
    });
    
    if (!transaction) {
      throw new Error("Transação não encontrada");
    }
    
    // Calcular ajuste no saldo
    const balanceAdjustment = transaction.type === "INCOME" ? -transaction.value : transaction.value;
    
    // Deletar em transação para garantir consistência
    await prisma.$transaction(async (tx) => {
      // Deletar transação
      await tx.transactions.delete({
        where: { id: transactionId },
      });
      
      // Atualizar saldo da conta
      await tx.accountBanks.update({
        where: { id: transaction.accountBanksId },
        data: {
          amount: { increment: balanceAdjustment },
        },
      });
    });
    
    const duration = Date.now() - startTime;
    console.log(`[${action}] Completed in ${duration}ms - Transaction ID: ${transactionId}`);
    
    revalidatePath("/");
    revalidatePath("/transactions");
    
    return {
      success: true,
      message: "Transação deletada com sucesso",
    };
    
  } catch (error) {
    return handleError(error, action);
  }
}

// GET - Relatório de transações por categoria (otimizado)
export async function getTransactionsByCategoryImproved(date: Date): Promise<ApiResponse> {
  const startTime = Date.now();
  const action = "getTransactionsByCategoryImproved";
  
  try {
    console.log(`[${action}] Starting with date:`, date);
    
    const userId = await validateUser();
    
    const firstDayOfMonth = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), 1, 0, 0, 0)
    );
    const lastDayOfMonth = new Date(
      Date.UTC(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)
    );
    
    // Query otimizada usando índices
    const transactions = await prisma.transactions.findMany({
      where: {
        userId,
        date: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
      select: {
        value: true,
        type: true,
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });
    
    // Agrupar por categoria otimizado
    const byCategory = transactions.reduce((acc, transaction) => {
      const categoryId = transaction.category.id;
      if (!acc[categoryId]) {
        acc[categoryId] = {
          category: transaction.category,
          total: 0,
          count: 0,
          income: 0,
          expense: 0,
        };
      }
      
      acc[categoryId].total += transaction.value;
      acc[categoryId].count += 1;
      
      if (transaction.type === "INCOME") {
        acc[categoryId].income += transaction.value;
      } else {
        acc[categoryId].expense += transaction.value;
      }
      
      return acc;
    }, {} as Record<string, any>);
    
    const duration = Date.now() - startTime;
    console.log(`[${action}] Completed in ${duration}ms - Found ${Object.keys(byCategory).length} categories`);
    
    return {
      success: true,
      data: Object.values(byCategory),
    };
    
  } catch (error) {
    return handleError(error, action);
  }
} 