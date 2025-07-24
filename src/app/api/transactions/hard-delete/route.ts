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

    // Verificar se a transação existe e pertence ao usuário
    const existingTransaction = await prisma.transactions.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { success: false, error: "Transação não encontrada" },
        { status: 404 }
      );
    }

    // Hard delete - deletar permanentemente
    await prisma.transactions.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Transação deletada permanentemente",
    });
  } catch (error) {
    console.error("Erro ao deletar transação permanentemente:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
} 