"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserId } from "./user.actions";

// Schema de validação para transações
const TransactionSchema = z.object({
  date: z.date(),
  type: z.enum(["INCOME", "EXPENSE"]),
  accountBanksId: z.string().min(1, "Conta é obrigatória"),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  description: z.string().optional(),
  value: z.number().positive("Valor deve ser positivo"),
});

const UpdateTransactionSchema = TransactionSchema.partial().extend({
  id: z.string().min(1, "ID é obrigatório"),
});

// Buscar transações do usuário (apenas ativas)
export async function getTransactions(userId: string) {
  try {
    const transactions = await prisma.transactions.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      include: {
        bank: true,
        category: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return { success: true, data: transactions };
  } catch (error) {
    console.error("Erro ao buscar transações:", error);
    return { success: false, error: "Erro ao buscar transações" };
  }
}

// Buscar transação por ID (apenas ativa)
export async function getTransactionById(id: string) {
  try {
    const transaction = await prisma.transactions.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        bank: true,
        category: true,
      },
    });

    if (!transaction) {
      return { success: false, error: "Transação não encontrada" };
    }

    return { success: true, data: transaction };
  } catch (error) {
    console.error("Erro ao buscar transação:", error);
    return { success: false, error: "Erro ao buscar transação" };
  }
}

// Criar nova transação
export async function createTransaction(formData: FormData) {
  const userId = await getUserId();
  if (!userId) {
    redirect("/auth/signin");
  }

  try {
    const rawData = {
      date: new Date(formData.get("date") as string),
      type: formData.get("type") as "INCOME" | "EXPENSE",
      accountBanksId: formData.get("accountBanksId") as string,
      categoryId: formData.get("categoryId") as string,
      description: formData.get("description") as string,
      value: Number(formData.get("value")),
    };

    const validatedData = TransactionSchema.parse(rawData);

    // Verificar se a conta e categoria existem
    const [account, category] = await Promise.all([
      prisma.accountBanks.findFirst({
        where: { id: validatedData.accountBanksId, userId },
      }),
      prisma.categories.findFirst({
        where: { id: validatedData.categoryId, userId },
      }),
    ]);

    if (!account) {
      return { success: false, error: "Conta não encontrada" };
    }

    if (!category) {
      return { success: false, error: "Categoria não encontrada" };
    }

    const transaction = await prisma.transactions.create({
      data: {
        ...validatedData,
        userId,
      },
      include: {
        bank: true,
        category: true,
      },
    });

    revalidatePath("/transactions");
    return { success: true, data: transaction };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error("Erro ao criar transação:", error);
    return { success: false, error: "Erro ao criar transação" };
  }
}

// Atualizar transação
export async function updateTransaction(formData: FormData) {
  const userId = await getUserId();
  if (!userId) {
    redirect("/auth/signin");
  }

  try {
    const rawData = {
      id: formData.get("id") as string,
      date: formData.get("date") ? new Date(formData.get("date") as string) : undefined,
      type: formData.get("type") as "INCOME" | "EXPENSE" | undefined,
      accountBanksId: formData.get("accountBanksId") as string,
      categoryId: formData.get("categoryId") as string,
      description: formData.get("description") as string,
      value: formData.get("value") ? Number(formData.get("value")) : undefined,
    };

    const validatedData = UpdateTransactionSchema.parse(rawData);

    // Verificar se a transação existe, pertence ao usuário e não foi deletada
    const existingTransaction = await prisma.transactions.findFirst({
      where: {
        id: validatedData.id,
        userId,
        deletedAt: null,
      },
    });

    if (!existingTransaction) {
      return { success: false, error: "Transação não encontrada" };
    }

    // Verificar se a conta e categoria existem (se foram fornecidas)
    if (validatedData.accountBanksId) {
      const account = await prisma.accountBanks.findFirst({
        where: { id: validatedData.accountBanksId, userId },
      });
      if (!account) {
        return { success: false, error: "Conta não encontrada" };
      }
    }

    if (validatedData.categoryId) {
      const category = await prisma.categories.findFirst({
        where: { id: validatedData.categoryId, userId },
      });
      if (!category) {
        return { success: false, error: "Categoria não encontrada" };
      }
    }

    const { id, ...updateData } = validatedData;
    const transaction = await prisma.transactions.update({
      where: { id },
      data: updateData,
      include: {
        bank: true,
        category: true,
      },
    });

    revalidatePath("/transactions");
    return { success: true, data: transaction };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error("Erro ao atualizar transação:", error);
    return { success: false, error: "Erro ao atualizar transação" };
  }
}

// Soft Delete - Marcar transação como deletada
export async function deleteTransaction(id: string) {
  const userId = await getUserId();
  if (!userId) {
    redirect("/auth/signin");
  }

  try {
    // Verificar se a transação existe, pertence ao usuário e não foi deletada
    const existingTransaction = await prisma.transactions.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
    });

    if (!existingTransaction) {
      return { success: false, error: "Transação não encontrada" };
    }

    // Soft delete - marcar como deletada
    await prisma.transactions.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    revalidatePath("/transactions");
    return { success: true, message: "Transação deletada com sucesso" };
  } catch (error) {
    console.error("Erro ao deletar transação:", error);
    return { success: false, error: "Erro ao deletar transação" };
  }
}

// Restaurar transação deletada
export async function restoreTransaction(id: string) {
  const userId = await getUserId();
  if (!userId) {
    redirect("/auth/signin");
  }

  try {
    // Verificar se a transação existe, pertence ao usuário e foi deletada
    const existingTransaction = await prisma.transactions.findFirst({
      where: {
        id,
        userId,
        deletedAt: { not: null },
      },
    });

    if (!existingTransaction) {
      return { success: false, error: "Transação não encontrada ou não foi deletada" };
    }

    // Restaurar - remover marcação de deletada
    const transaction = await prisma.transactions.update({
      where: { id },
      data: { deletedAt: null },
      include: {
        bank: true,
        category: true,
      },
    });

    revalidatePath("/transactions");
    return { success: true, data: transaction };
  } catch (error) {
    console.error("Erro ao restaurar transação:", error);
    return { success: false, error: "Erro ao restaurar transação" };
  }
}

// Buscar transações deletadas (para administração)
export async function getDeletedTransactions(userId: string) {
  try {
    const transactions = await prisma.transactions.findMany({
      where: {
        userId,
        deletedAt: { not: null },
      },
      include: {
        bank: true,
        category: true,
      },
      orderBy: {
        deletedAt: "desc",
      },
    });

    return { success: true, data: transactions };
  } catch (error) {
    console.error("Erro ao buscar transações deletadas:", error);
    return { success: false, error: "Erro ao buscar transações deletadas" };
  }
}

// Hard Delete - Deletar permanentemente (apenas para administração)
export async function hardDeleteTransaction(id: string) {
  const userId = await getUserId();
  if (!userId) {
    redirect("/auth/signin");
  }

  try {
    // Verificar se a transação existe e pertence ao usuário
    const existingTransaction = await prisma.transactions.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingTransaction) {
      return { success: false, error: "Transação não encontrada" };
    }

    // Hard delete - deletar permanentemente
    await prisma.transactions.delete({
      where: { id },
    });

    revalidatePath("/transactions");
    return { success: true, message: "Transação deletada permanentemente" };
  } catch (error) {
    console.error("Erro ao deletar transação permanentemente:", error);
    return { success: false, error: "Erro ao deletar transação permanentemente" };
  }
} 