"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserId } from "./user.actions";

// Schema de validação para contas bancárias
const AccountSchema = z.object({
  bank: z.enum([
    "BANCO_DO_BRASIL", "ITAU", "ITI", "PICPAY", "NUBANK", 
    "BRADESCO", "SANTANDER", "CAIXA", "INTER", "C6"
  ]),
  description: z.string().min(1, "Descrição é obrigatória"),
  amount: z.number().min(0, "Valor deve ser maior ou igual a zero"),
});

const UpdateAccountSchema = AccountSchema.partial().extend({
  id: z.string().min(1, "ID é obrigatório"),
});

// Buscar contas do usuário (apenas ativas)
export async function getAccounts(userId: string) {
  try {
    const accounts = await prisma.accountBanks.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: {
        description: "asc",
      },
    });

    return { success: true, data: accounts };
  } catch (error) {
    console.error("Erro ao buscar contas:", error);
    return { success: false, error: "Erro ao buscar contas" };
  }
}

// Buscar conta por ID (apenas ativa)
export async function getAccountById(id: string) {
  try {
    const account = await prisma.accountBanks.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!account) {
      return { success: false, error: "Conta não encontrada" };
    }

    return { success: true, data: account };
  } catch (error) {
    console.error("Erro ao buscar conta:", error);
    return { success: false, error: "Erro ao buscar conta" };
  }
}

// Criar nova conta
export async function createAccount(formData: FormData) {
  const userId = await getUserId();
  if (!userId) {
    redirect("/auth/signin");
  }

  try {
    const rawData = {
      bank: formData.get("bank") as any,
      description: formData.get("description") as string,
      amount: Number(formData.get("amount")),
    };

    const validatedData = AccountSchema.parse(rawData);

    // Verificar se já existe uma conta com a mesma descrição (não deletada)
    const existingAccount = await prisma.accountBanks.findFirst({
      where: {
        description: validatedData.description,
        userId,
        deletedAt: null,
      },
    });

    if (existingAccount) {
      return { success: false, error: "Já existe uma conta com esta descrição" };
    }

    const account = await prisma.accountBanks.create({
      data: {
        ...validatedData,
        userId,
      },
    });

    revalidatePath("/accounts");
    revalidatePath("/transactions");
    return { success: true, data: account };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error("Erro ao criar conta:", error);
    return { success: false, error: "Erro ao criar conta" };
  }
}

// Atualizar conta
export async function updateAccount(formData: FormData) {
  const userId = await getUserId();
  if (!userId) {
    redirect("/auth/signin");
  }

  try {
    const rawData = {
      id: formData.get("id") as string,
      bank: formData.get("bank") as any,
      description: formData.get("description") as string,
      amount: formData.get("amount") ? Number(formData.get("amount")) : undefined,
    };

    const validatedData = UpdateAccountSchema.parse(rawData);

    // Verificar se a conta existe, pertence ao usuário e não foi deletada
    const existingAccount = await prisma.accountBanks.findFirst({
      where: {
        id: validatedData.id,
        userId,
        deletedAt: null,
      },
    });

    if (!existingAccount) {
      return { success: false, error: "Conta não encontrada" };
    }

    // Verificar se já existe outra conta com a mesma descrição (se a descrição foi alterada)
    if (validatedData.description && validatedData.description !== existingAccount.description) {
      const duplicateAccount = await prisma.accountBanks.findFirst({
        where: {
          description: validatedData.description,
          userId,
          deletedAt: null,
          id: { not: validatedData.id },
        },
      });

      if (duplicateAccount) {
        return { success: false, error: "Já existe uma conta com esta descrição" };
      }
    }

    const { id, ...updateData } = validatedData;
    const account = await prisma.accountBanks.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/accounts");
    revalidatePath("/transactions");
    return { success: true, data: account };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error("Erro ao atualizar conta:", error);
    return { success: false, error: "Erro ao atualizar conta" };
  }
}

// Soft Delete - Marcar conta como deletada
export async function deleteAccount(id: string) {
  const userId = await getUserId();
  if (!userId) {
    redirect("/auth/signin");
  }

  try {
    // Verificar se a conta existe, pertence ao usuário e não foi deletada
    const existingAccount = await prisma.accountBanks.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
    });

    if (!existingAccount) {
      return { success: false, error: "Conta não encontrada" };
    }

    // Verificar se há transações usando esta conta
    const transactionsCount = await prisma.transactions.count({
      where: {
        accountBanksId: id,
        deletedAt: null,
      },
    });

    if (transactionsCount > 0) {
      return { 
        success: false, 
        error: `Não é possível deletar esta conta. Ela está sendo usada em ${transactionsCount} transação(ões).` 
      };
    }

    // Verificar se há transferências usando esta conta
    const transfersCount = await prisma.transfers.count({
      where: {
        OR: [
          { bankInitialId: id },
          { bankDestineId: id }
        ],
        deletedAt: null,
      },
    });

    if (transfersCount > 0) {
      return { 
        success: false, 
        error: `Não é possível deletar esta conta. Ela está sendo usada em ${transfersCount} transferência(ões).` 
      };
    }

    // Soft delete - marcar como deletada
    await prisma.accountBanks.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    revalidatePath("/accounts");
    revalidatePath("/transactions");
    return { success: true, message: "Conta deletada com sucesso" };
  } catch (error) {
    console.error("Erro ao deletar conta:", error);
    return { success: false, error: "Erro ao deletar conta" };
  }
}

// Restaurar conta deletada
export async function restoreAccount(id: string) {
  const userId = await getUserId();
  if (!userId) {
    redirect("/auth/signin");
  }

  try {
    // Verificar se a conta existe, pertence ao usuário e foi deletada
    const existingAccount = await prisma.accountBanks.findFirst({
      where: {
        id,
        userId,
        deletedAt: { not: null },
      },
    });

    if (!existingAccount) {
      return { success: false, error: "Conta não encontrada ou não foi deletada" };
    }

    // Verificar se já existe uma conta ativa com a mesma descrição
    const duplicateAccount = await prisma.accountBanks.findFirst({
      where: {
        description: existingAccount.description,
        userId,
        deletedAt: null,
        id: { not: id },
      },
    });

    if (duplicateAccount) {
      return { 
        success: false, 
        error: "Já existe uma conta ativa com esta descrição. Renomeie a conta antes de restaurar." 
      };
    }

    // Restaurar - remover marcação de deletada
    const account = await prisma.accountBanks.update({
      where: { id },
      data: { deletedAt: null },
    });

    revalidatePath("/accounts");
    revalidatePath("/transactions");
    return { success: true, data: account };
  } catch (error) {
    console.error("Erro ao restaurar conta:", error);
    return { success: false, error: "Erro ao restaurar conta" };
  }
}

// Buscar contas deletadas (para administração)
export async function getDeletedAccounts(userId: string) {
  try {
    const accounts = await prisma.accountBanks.findMany({
      where: {
        userId,
        deletedAt: { not: null },
      },
      orderBy: {
        deletedAt: "desc",
      },
    });

    return { success: true, data: accounts };
  } catch (error) {
    console.error("Erro ao buscar contas deletadas:", error);
    return { success: false, error: "Erro ao buscar contas deletadas" };
  }
}

// Hard Delete - Deletar permanentemente (apenas para administração)
export async function hardDeleteAccount(id: string) {
  const userId = await getUserId();
  if (!userId) {
    redirect("/auth/signin");
  }

  try {
    // Verificar se a conta existe e pertence ao usuário
    const existingAccount = await prisma.accountBanks.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingAccount) {
      return { success: false, error: "Conta não encontrada" };
    }

    // Verificar se há transações usando esta conta
    const transactionsCount = await prisma.transactions.count({
      where: {
        accountBanksId: id,
      },
    });

    if (transactionsCount > 0) {
      return { 
        success: false, 
        error: `Não é possível deletar permanentemente esta conta. Ela está sendo usada em ${transactionsCount} transação(ões).` 
      };
    }

    // Verificar se há transferências usando esta conta
    const transfersCount = await prisma.transfers.count({
      where: {
        OR: [
          { bankInitialId: id },
          { bankDestineId: id }
        ],
      },
    });

    if (transfersCount > 0) {
      return { 
        success: false, 
        error: `Não é possível deletar permanentemente esta conta. Ela está sendo usada em ${transfersCount} transferência(ões).` 
      };
    }

    // Hard delete - deletar permanentemente
    await prisma.accountBanks.delete({
      where: { id },
    });

    revalidatePath("/accounts");
    revalidatePath("/transactions");
    return { success: true, message: "Conta deletada permanentemente" };
  } catch (error) {
    console.error("Erro ao deletar conta permanentemente:", error);
    return { success: false, error: "Erro ao deletar conta permanentemente" };
  }
} 