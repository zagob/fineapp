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
        { success: false, error: "ID da conta é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se a conta existe e pertence ao usuário
    const existingAccount = await prisma.accountBanks.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingAccount) {
      return NextResponse.json(
        { success: false, error: "Conta não encontrada" },
        { status: 404 }
      );
    }

    // Verificar se há transações usando esta conta
    const transactionsCount = await prisma.transactions.count({
      where: {
        accountBanksId: id,
      },
    });

    if (transactionsCount > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Não é possível deletar permanentemente esta conta. Ela está sendo usada em ${transactionsCount} transação(ões).` 
        },
        { status: 400 }
      );
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
      return NextResponse.json(
        { 
          success: false, 
          error: `Não é possível deletar permanentemente esta conta. Ela está sendo usada em ${transfersCount} transferência(ões).` 
        },
        { status: 400 }
      );
    }

    // Hard delete - deletar permanentemente
    await prisma.accountBanks.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Conta deletada permanentemente",
    });
  } catch (error) {
    console.error("Erro ao deletar conta permanentemente:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
} 