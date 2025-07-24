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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const categories = await prisma.categories.findMany({
      where: {
        userId,
        deletedAt: { not: null },
        ...(type && { type: type as "INCOME" | "EXPENSE" }),
      },
      orderBy: {
        deletedAt: "desc",
      },
    });

    // Converter para o formato esperado pelo componente
    const formattedCategories = categories.map(c => ({
      id: c.id,
      name: c.name,
      type: c.type,
      color: c.color,
      icon: c.icon,
      deletedAt: c.deletedAt?.toISOString() || "",
    }));

    return NextResponse.json({
      success: true,
      data: formattedCategories,
    });
  } catch (error) {
    console.error("Erro ao buscar categorias deletadas:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
} 