import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/actions/user.actions";

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID da categoria é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se a categoria existe, pertence ao usuário e foi deletada
    const existingCategory = await prisma.categories.findFirst({
      where: {
        id,
        userId,
        deletedAt: { not: null },
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: "Categoria não encontrada ou não foi deletada" },
        { status: 404 }
      );
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
      return NextResponse.json(
        { 
          success: false, 
          error: "Já existe uma categoria ativa com este nome. Renomeie a categoria antes de restaurar." 
        },
        { status: 400 }
      );
    }

    // Restaurar - remover marcação de deletada
    const category = await prisma.categories.update({
      where: { id },
      data: { deletedAt: null },
    });

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Erro ao restaurar categoria:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
} 