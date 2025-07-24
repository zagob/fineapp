"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserId } from "./user.actions";

// Schema de validação para categorias
const CategorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  type: z.enum(["INCOME", "EXPENSE"]),
  color: z.string().min(1, "Cor é obrigatória"),
  icon: z.string().optional(),
});

const UpdateCategorySchema = CategorySchema.partial().extend({
  id: z.string().min(1, "ID é obrigatório"),
});

// Buscar categorias do usuário (apenas ativas)
export async function getCategories(userId: string) {
  try {
    const categories = await prisma.categories.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: {
        name: "asc",
      },
    });

    return { success: true, data: categories };
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return { success: false, error: "Erro ao buscar categorias" };
  }
}

// Buscar categoria por ID (apenas ativa)
export async function getCategoryById(id: string) {
  try {
    const category = await prisma.categories.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!category) {
      return { success: false, error: "Categoria não encontrada" };
    }

    return { success: true, data: category };
  } catch (error) {
    console.error("Erro ao buscar categoria:", error);
    return { success: false, error: "Erro ao buscar categoria" };
  }
}

// Criar nova categoria
export async function createCategory(formData: FormData) {
  const userId = await getUserId();
  if (!userId) {
    redirect("/auth/signin");
  }

  try {
    const rawData = {
      name: formData.get("name") as string,
      type: formData.get("type") as "INCOME" | "EXPENSE",
      color: formData.get("color") as string,
      icon: formData.get("icon") as string,
    };

    const validatedData = CategorySchema.parse(rawData);

    // Verificar se já existe uma categoria com o mesmo nome (não deletada)
    const existingCategory = await prisma.categories.findFirst({
      where: {
        name: validatedData.name,
        userId,
        deletedAt: null,
      },
    });

    if (existingCategory) {
      return { success: false, error: "Já existe uma categoria com este nome" };
    }

    const category = await prisma.categories.create({
      data: {
        ...validatedData,
        userId,
      },
    });

    revalidatePath("/categories");
    revalidatePath("/transactions");
    return { success: true, data: category };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error("Erro ao criar categoria:", error);
    return { success: false, error: "Erro ao criar categoria" };
  }
}

// Atualizar categoria
export async function updateCategory(formData: FormData) {
  const userId = await getUserId();
  if (!userId) {
    redirect("/auth/signin");
  }

  try {
    const rawData = {
      id: formData.get("id") as string,
      name: formData.get("name") as string,
      type: formData.get("type") as "INCOME" | "EXPENSE" | undefined,
      color: formData.get("color") as string,
      icon: formData.get("icon") as string,
    };

    const validatedData = UpdateCategorySchema.parse(rawData);

    // Verificar se a categoria existe, pertence ao usuário e não foi deletada
    const existingCategory = await prisma.categories.findFirst({
      where: {
        id: validatedData.id,
        userId,
        deletedAt: null,
      },
    });

    if (!existingCategory) {
      return { success: false, error: "Categoria não encontrada" };
    }

    // Verificar se já existe outra categoria com o mesmo nome (se o nome foi alterado)
    if (validatedData.name && validatedData.name !== existingCategory.name) {
      const duplicateCategory = await prisma.categories.findFirst({
        where: {
          name: validatedData.name,
          userId,
          deletedAt: null,
          id: { not: validatedData.id },
        },
      });

      if (duplicateCategory) {
        return { success: false, error: "Já existe uma categoria com este nome" };
      }
    }

    const { id, ...updateData } = validatedData;
    const category = await prisma.categories.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/categories");
    revalidatePath("/transactions");
    return { success: true, data: category };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error("Erro ao atualizar categoria:", error);
    return { success: false, error: "Erro ao atualizar categoria" };
  }
}

// Soft Delete - Marcar categoria como deletada
export async function deleteCategory(id: string) {
  const userId = await getUserId();
  if (!userId) {
    redirect("/auth/signin");
  }

  try {
    // Verificar se a categoria existe, pertence ao usuário e não foi deletada
    const existingCategory = await prisma.categories.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
    });

    if (!existingCategory) {
      return { success: false, error: "Categoria não encontrada" };
    }

    // Verificar se há transações usando esta categoria
    const transactionsCount = await prisma.transactions.count({
      where: {
        categoryId: id,
        deletedAt: null,
      },
    });

    if (transactionsCount > 0) {
      return { 
        success: false, 
        error: `Não é possível deletar esta categoria. Ela está sendo usada em ${transactionsCount} transação(ões).` 
      };
    }

    // Soft delete - marcar como deletada
    await prisma.categories.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    revalidatePath("/categories");
    revalidatePath("/transactions");
    return { success: true, message: "Categoria deletada com sucesso" };
  } catch (error) {
    console.error("Erro ao deletar categoria:", error);
    return { success: false, error: "Erro ao deletar categoria" };
  }
}

// Restaurar categoria deletada
export async function restoreCategory(id: string) {
  const userId = await getUserId();
  if (!userId) {
    redirect("/auth/signin");
  }

  try {
    // Verificar se a categoria existe, pertence ao usuário e foi deletada
    const existingCategory = await prisma.categories.findFirst({
      where: {
        id,
        userId,
        deletedAt: { not: null },
      },
    });

    if (!existingCategory) {
      return { success: false, error: "Categoria não encontrada ou não foi deletada" };
    }

    // Verificar se já existe uma categoria ativa com o mesmo nome
    const duplicateCategory = await prisma.categories.findFirst({
      where: {
        name: existingCategory.name,
        userId,
        deletedAt: null,
        id: { not: id },
      },
    });

    if (duplicateCategory) {
      return { 
        success: false, 
        error: "Já existe uma categoria ativa com este nome. Renomeie a categoria antes de restaurar." 
      };
    }

    // Restaurar - remover marcação de deletada
    const category = await prisma.categories.update({
      where: { id },
      data: { deletedAt: null },
    });

    revalidatePath("/categories");
    revalidatePath("/transactions");
    return { success: true, data: category };
  } catch (error) {
    console.error("Erro ao restaurar categoria:", error);
    return { success: false, error: "Erro ao restaurar categoria" };
  }
}

// Buscar categorias deletadas (para administração)
export async function getDeletedCategories(userId: string) {
  try {
    const categories = await prisma.categories.findMany({
      where: {
        userId,
        deletedAt: { not: null },
      },
      orderBy: {
        deletedAt: "desc",
      },
    });

    return { success: true, data: categories };
  } catch (error) {
    console.error("Erro ao buscar categorias deletadas:", error);
    return { success: false, error: "Erro ao buscar categorias deletadas" };
  }
}

// Hard Delete - Deletar permanentemente (apenas para administração)
export async function hardDeleteCategory(id: string) {
  const userId = await getUserId();
  if (!userId) {
    redirect("/auth/signin");
  }

  try {
    // Verificar se a categoria existe e pertence ao usuário
    const existingCategory = await prisma.categories.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingCategory) {
      return { success: false, error: "Categoria não encontrada" };
    }

    // Verificar se há transações usando esta categoria
    const transactionsCount = await prisma.transactions.count({
      where: {
        categoryId: id,
      },
    });

    if (transactionsCount > 0) {
      return { 
        success: false, 
        error: `Não é possível deletar permanentemente esta categoria. Ela está sendo usada em ${transactionsCount} transação(ões).` 
      };
    }

    // Hard delete - deletar permanentemente
    await prisma.categories.delete({
      where: { id },
    });

    revalidatePath("/categories");
    revalidatePath("/transactions");
    return { success: true, message: "Categoria deletada permanentemente" };
  } catch (error) {
    console.error("Erro ao deletar categoria permanentemente:", error);
    return { success: false, error: "Erro ao deletar categoria permanentemente" };
  }
} 