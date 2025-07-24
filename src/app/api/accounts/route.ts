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
        deletedAt: null,
      },
      orderBy: {
        description: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: { accounts },
    });
  } catch (error) {
    console.error("Erro ao buscar contas:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
} 