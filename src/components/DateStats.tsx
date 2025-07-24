"use client";

import { useQuery } from "@tanstack/react-query";
import { useDateStore } from "@/store";
import { getTransactions } from "@/actions/transactions.actions";
import { format, getDaysInMonth, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent } from "./ui/card";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign,
  Activity,
  Target
} from "lucide-react";
import { transformToCurrency } from "@/lib/utils";

export const DateStats = () => {
  const date = useDateStore((state) => state.date);

  const { data: transactions, isPending } = useQuery({
    queryKey: ["transactions", date],
    queryFn: async () => await getTransactions({ date }),
  });

  if (isPending) {
    return (
      <div className="flex items-center gap-4">
        <div className="w-24 h-8 bg-neutral-800/50 rounded-md animate-pulse"></div>
        <div className="w-32 h-8 bg-neutral-800/50 rounded-md animate-pulse"></div>
        <div className="w-28 h-8 bg-neutral-800/50 rounded-md animate-pulse"></div>
      </div>
    );
  }

  const totalTransactions = transactions?.transactions?.length || 0;
  const daysInMonth = getDaysInMonth(date);
  const averagePerDay = totalTransactions / daysInMonth;
  
  const totalIncome = transactions?.resume?.totalIncome || 0;
  const totalExpense = transactions?.resume?.totalExpense || 0;
  const balance = transactions?.resume?.balance || 0;

  const currentMonthName = format(date, "MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="flex items-center gap-3 text-sm">
      {/* Período Atual */}
      <div className="flex items-center gap-2 px-3 py-2 bg-neutral-800/60 rounded-lg border border-neutral-700/50 shadow-sm">
        <Calendar className="w-4 h-4 text-neutral-300" />
        <span className="text-neutral-200 capitalize font-medium">{currentMonthName}</span>
      </div>

      {/* Total de Transações */}
      <div className="flex items-center gap-2 px-3 py-2 bg-neutral-800/60 rounded-lg border border-neutral-700/50 shadow-sm">
        <Activity className="w-4 h-4 text-blue-300" />
        <span className="text-neutral-200 font-medium">{totalTransactions} transações</span>
      </div>

      {/* Média por Dia */}
      <div className="flex items-center gap-2 px-3 py-2 bg-neutral-800/60 rounded-lg border border-neutral-700/50 shadow-sm">
        <Target className="w-4 h-4 text-purple-300" />
        <span className="text-neutral-200 font-medium">{averagePerDay.toFixed(1)}/dia</span>
      </div>

      {/* Saldo do Período */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border shadow-sm ${
        balance >= 0 
          ? 'bg-emerald-500/15 border-emerald-500/40' 
          : 'bg-red-500/15 border-red-500/40'
      }`}>
        <DollarSign className={`w-4 h-4 ${balance >= 0 ? 'text-emerald-300' : 'text-red-300'}`} />
        <span className={`font-semibold ${balance >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
          {transformToCurrency(balance)}
        </span>
      </div>
    </div>
  );
}; 