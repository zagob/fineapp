import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TrashBin from "@/components/TrashBin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, CreditCard, Tag, ArrowLeftRight } from "lucide-react";
import Link from "next/link";

export default async function AdminTrashPage() {
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

  // Buscar todos os itens deletados
  const [deletedTransactions, deletedCategories, deletedAccounts, deletedTransfers] = await Promise.all([
    prisma.transactions.findMany({
      where: { userId: user.id, deletedAt: { not: null } },
      include: { bank: true, category: true },
      orderBy: { deletedAt: "desc" },
    }),
    prisma.categories.findMany({
      where: { userId: user.id, deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
    }),
    prisma.accountBanks.findMany({
      where: { userId: user.id, deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
    }),
    prisma.transfers.findMany({
      where: { userId: user.id, deletedAt: { not: null } },
      include: { bankInitial: true, bankDestine: true },
      orderBy: { deletedAt: "desc" },
    }),
  ]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              🗑️ Administração da Lixeira
            </h1>
            <p className="text-gray-600">
              Gerencie todos os itens deletados do seu sistema financeiro
            </p>
          </div>
          <Link 
            href="/"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftRight className="h-4 w-4" />
            Voltar ao Dashboard
          </Link>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Transações</p>
                  <p className="text-2xl font-bold">{deletedTransactions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Tag className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Categorias</p>
                  <p className="text-2xl font-bold">{deletedCategories.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CreditCard className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contas</p>
                  <p className="text-2xl font-bold">{deletedAccounts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ArrowLeftRight className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Transferências</p>
                  <p className="text-2xl font-bold">{deletedTransfers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seções da Lixeira */}
        <div className="space-y-8">
          {/* Transações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-500" />
                Transações Deletadas
              </CardTitle>
              <CardDescription>
                Gerencie transações que foram movidas para a lixeira
              </CardDescription>
            </CardHeader>
            <CardContent>
              {deletedTransactions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Nenhuma transação foi deletada
                </p>
              ) : (
                <div className="space-y-3">
                  {deletedTransactions.slice(0, 5).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="p-3 border rounded-lg bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {transaction.description || "Sem descrição"}
                          </p>
                          <p className={`text-sm font-semibold ${
                            transaction.type === "INCOME" ? "text-green-600" : "text-red-600"
                          }`}>
                            {formatCurrency(transaction.value)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {transaction.bank?.description} • {transaction.category?.name}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={transaction.type === "INCOME" ? "default" : "secondary"}>
                            {transaction.type === "INCOME" ? "Receita" : "Despesa"}
                          </Badge>
                          <Badge variant="outline" className="text-gray-500">
                            Deletada
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                  {deletedTransactions.length > 5 && (
                    <p className="text-center text-gray-500 text-sm">
                      ... e mais {deletedTransactions.length - 5} transações
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Categorias */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-blue-500" />
                Categorias Deletadas
              </CardTitle>
              <CardDescription>
                Gerencie categorias que foram movidas para a lixeira
              </CardDescription>
            </CardHeader>
            <CardContent>
              {deletedCategories.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Nenhuma categoria foi deletada
                </p>
              ) : (
                <div className="space-y-3">
                  {deletedCategories.slice(0, 5).map((category) => (
                    <div
                      key={category.id}
                      className="p-3 border rounded-lg bg-gray-50"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <div>
                            <p className="font-medium">{category.name}</p>
                            <p className="text-xs text-gray-500">
                              {category.type === "INCOME" ? "Receita" : "Despesa"}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-gray-500">
                          Deletada
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {deletedCategories.length > 5 && (
                    <p className="text-center text-gray-500 text-sm">
                      ... e mais {deletedCategories.length - 5} categorias
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-green-500" />
                Contas Deletadas
              </CardTitle>
              <CardDescription>
                Gerencie contas bancárias que foram movidas para a lixeira
              </CardDescription>
            </CardHeader>
            <CardContent>
              {deletedAccounts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Nenhuma conta foi deletada
                </p>
              ) : (
                <div className="space-y-3">
                  {deletedAccounts.slice(0, 5).map((account) => (
                    <div
                      key={account.id}
                      className="p-3 border rounded-lg bg-gray-50"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{account.description}</p>
                          <p className="text-sm text-gray-600">{account.bank}</p>
                          <p className="text-sm font-semibold text-green-600">
                            {formatCurrency(account.amount)}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-gray-500">
                          Deletada
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {deletedAccounts.length > 5 && (
                    <p className="text-center text-gray-500 text-sm">
                      ... e mais {deletedAccounts.length - 5} contas
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Aviso Importante */}
        <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">
            ⚠️ Informações Importantes
          </h3>
          <ul className="text-yellow-700 text-sm space-y-2">
            <li>• <strong>Recuperação:</strong> Todos os itens podem ser restaurados a qualquer momento</li>
            <li>• <strong>Limpeza:</strong> Itens podem ser deletados permanentemente quando necessário</li>
            <li>• <strong>Segurança:</strong> Dados nunca são perdidos sem confirmação explícita</li>
            <li>• <strong>Auditoria:</strong> Todas as ações são registradas para fins de auditoria</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 