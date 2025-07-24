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

    // Verificar se a conta existe, pertence ao usuário e foi deletada
    const existingAccount = await prisma.accountBanks.findFirst({
      where: {
        id,
        userId,
        deletedAt: { not: null },
      },
    });

    if (!existingAccount) {
      return NextResponse.json(
        { success: false, error: "Conta não encontrada ou não foi deletada" },
        { status: 404 }
      );
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
      return NextResponse.json(
        { 
          success: false, 
          error: "Já existe uma conta ativa com esta descrição. Renomeie a conta antes de restaurar." 
        },
        { status: 400 }
      );
    }

    // Restaurar - remover marcação de deletada
    const account = await prisma.accountBanks.update({
      where: { id },
      data: { deletedAt: null },
    });

    return NextResponse.json({
      success: true,
      data: account,
    });
  } catch (error) {
    console.error("Erro ao restaurar conta:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
} 