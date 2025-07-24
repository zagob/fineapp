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
        { success: false, error: "ID da transação é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se a transação existe, pertence ao usuário e foi deletada
    const existingTransaction = await prisma.transactions.findFirst({
      where: {
        id,
        userId,
        deletedAt: { not: null },
      },
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { success: false, error: "Transação não encontrada ou não foi deletada" },
        { status: 404 }
      );
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

    return NextResponse.json({
      success: true,
      data: transaction,
      message: "Transação restaurada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao restaurar transação:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
} 