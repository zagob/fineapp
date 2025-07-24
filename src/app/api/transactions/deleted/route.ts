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

    const transactions = await prisma.transactions.findMany({
      where: {
        userId,
        deletedAt: { not: null },
      },
      include: {
        bank: true,
        category: true,
      },
      orderBy: {
        deletedAt: "desc",
      },
    });

    // Converter para o formato esperado pelo componente
    const formattedTransactions = transactions.map(t => ({
      id: t.id,
      description: t.description || "",
      value: t.value,
      type: t.type,
      date: t.date.toISOString(),
      deletedAt: t.deletedAt?.toISOString() || "",
      bank: t.bank,
      category: t.category,
    }));

    return NextResponse.json({
      success: true,
      data: formattedTransactions,
    });
  } catch (error) {
    console.error("Erro ao buscar transações deletadas:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
} 