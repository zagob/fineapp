import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/actions/user.actions";

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Não autorizado" },
        { status: 401 }
      );
    }

    const accounts = await prisma.accountBanks.findMany({
      where: {
        userId,
        deletedAt: { not: null },
      },
      orderBy: {
        deletedAt: "desc",
      },
    });

    // Converter para o formato esperado pelo componente
    const formattedAccounts = accounts.map(a => ({
      id: a.id,
      bank: a.bank,
      description: a.description,
      amount: a.amount,
      deletedAt: a.deletedAt?.toISOString() || "",
    }));

    return NextResponse.json({
      success: true,
      data: formattedAccounts,
    });
  } catch (error) {
    console.error("Erro ao buscar contas deletadas:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
} 