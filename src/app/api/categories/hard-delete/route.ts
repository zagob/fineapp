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

    // Verificar se a categoria existe e pertence ao usuário
    const existingCategory = await prisma.categories.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: "Categoria não encontrada" },
        { status: 404 }
      );
    }

    // Verificar se há transações usando esta categoria
    const transactionsCount = await prisma.transactions.count({
      where: {
        categoryId: id,
      },
    });

    if (transactionsCount > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Não é possível deletar permanentemente esta categoria. Ela está sendo usada em ${transactionsCount} transação(ões).` 
        },
        { status: 400 }
      );
    }

    // Hard delete - deletar permanentemente
    await prisma.categories.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Categoria deletada permanentemente",
    });
  } catch (error) {
    console.error("Erro ao deletar categoria permanentemente:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
} 