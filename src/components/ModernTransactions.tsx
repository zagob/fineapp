"use client";

import { memo, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { LoadingCard } from "./ui/loading-spinner";
import { useQuery } from "@tanstack/react-query";
import { useDateStore } from "@/store";
import { getTransactions } from "@/actions/transactions.actions";
import { transformToCurrency } from "@/lib/utils";
import { 
  Receipt, 
  TrendingUp, 
  TrendingDown, 
  Plus,
  Eye,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Search
} from "lucide-react";

// Componente de item de transação moderna
const ModernTransactionItem = memo(({ transaction }: { transaction: any }) => {
  const isIncome = transaction.type === 'INCOME';
  
  return (
    <div className="flex items-center justify-between p-3 bg-neutral-800/30 rounded-lg hover:bg-neutral-800/50 transition-all duration-200 border border-neutral-700/30 hover:border-neutral-600/50">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${isIncome ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
          {isIncome ? (
            <TrendingUp className="w-4 h-4 text-green-400" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-400" />
          )}
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-white truncate max-w-[150px]">
            {transaction.description || 'Transação'}
          </h4>
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Calendar className="w-3 h-3" />
            <span>{new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
            <Clock className="w-3 h-3 ml-2" />
            <span>{new Date(transaction.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="text-right">
          <p className={`text-sm font-semibold ${isIncome ? 'text-green-400' : 'text-red-400'}`}>
            {isIncome ? '+' : '-'} {transformToCurrency(transaction.value)}
          </p>
          <p className="text-xs text-neutral-500">{transaction.category?.name || 'Sem categoria'}</p>
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-white/10">
          <Eye className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
});

ModernTransactionItem.displayName = "ModernTransactionItem";

// Componente principal de Transações Modernas
export const ModernTransactions = () => {
  const date = useDateStore((state) => state.date);

  const { data: transactions, isPending } = useQuery({
    queryKey: ["transactions", date],
    queryFn: async () => await getTransactions({ date }),
  });

  const recentTransactions = transactions?.transactions?.slice(0, 5) || [];

  if (isPending) {
    return (
      <Card className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 border-neutral-700/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <Receipt className="w-5 h-5" />
            Últimas Transações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingCard />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 border-neutral-700/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <Receipt className="w-5 h-5" />
            Últimas Transações
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-neutral-700 hover:bg-neutral-800">
              <Filter className="w-4 h-4 mr-1" />
              Filtrar
            </Button>
            <Button variant="outline" size="sm" className="border-neutral-700 hover:bg-neutral-800">
              <Search className="w-4 h-4 mr-1" />
              Buscar
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {recentTransactions.length === 0 ? (
          <div className="text-center py-8">
            <Receipt className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
            <p className="text-neutral-400 mb-2">Nenhuma transação encontrada</p>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-1" />
              Nova Transação
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {recentTransactions.map((transaction: any) => (
                <ModernTransactionItem key={transaction.id} transaction={transaction} />
              ))}
            </div>
            
            {transactions?.transactions && transactions.transactions.length > 5 && (
              <div className="pt-3 border-t border-neutral-700/50">
                <Button variant="ghost" size="sm" className="w-full text-neutral-400 hover:text-white">
                  Ver todas as transações ({transactions.transactions.length})
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}; 