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

    // Verificar se a transação existe, pertence ao usuário e não foi deletada
    const existingTransaction = await prisma.transactions.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { success: false, error: "Transação não encontrada" },
        { status: 404 }
      );
    }

    // Soft delete - marcar como deletada
    await prisma.transactions.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: "Transação deletada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao deletar transação:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
} 