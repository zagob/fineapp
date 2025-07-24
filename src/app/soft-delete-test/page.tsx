import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SoftDeleteTest from "@/components/SoftDeleteTest";

export default async function SoftDeleteTestPage() {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  // Buscar usuário
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  // Buscar transações (incluindo deletadas para demonstração)
  const transactions = await prisma.transactions.findMany({
    where: { userId: user.id },
    include: {
      bank: true,
      category: true,
    },
    orderBy: { date: "desc" },
  });

  // Converter para o formato esperado pelo componente
  const formattedTransactions = transactions.map(t => ({
    id: t.id,
    description: t.description || "",
    value: t.value,
    type: t.type,
    date: t.date.toISOString(),
    deletedAt: t.deletedAt?.toISOString() || null,
  }));

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          🗑️ Teste do Soft Delete
        </h1>
        
        <SoftDeleteTest transactions={formattedTransactions} />
        
        <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">
            ⚠️ Nota Importante
          </h3>
          <p className="text-yellow-700 text-sm">
            Este é um ambiente de teste. As transações mostradas aqui incluem tanto as ativas quanto as deletadas 
            para demonstrar o funcionamento do soft delete. Em um ambiente de produção, apenas as transações ativas 
            seriam exibidas normalmente.
          </p>
        </div>
      </div>
    </div>
  );
} 