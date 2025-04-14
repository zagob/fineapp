"use client";

import { CircleDollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { CardValue } from "./CardValue";
import { useQuery } from "@tanstack/react-query";
import { useDateStore } from "@/store";
import { getTransactions } from "@/actions/transactions.actions";
import { transformToCurrency } from "@/lib/utils";

export const ResumeValues = () => {
  const date = useDateStore((state) => state.date);

  const { data: transactions, isPending } = useQuery({
    queryKey: ["transactions", date],
    queryFn: async () => await getTransactions({ date }),
  });

  const BalanceValue = transformToCurrency(
    transactions?.resume?.balance as number
  );
  const IncomeValue = transformToCurrency(
    transactions?.resume?.totalIncome as number
  );
  const ExpenseValue = transformToCurrency(
    transactions?.resume?.totalExpense as number
  );

  return (
    <>
      <CardValue
        title="Balanço"
        value={isPending ? "R$ 0,00" : BalanceValue}
        icon={CircleDollarSign}
      />
      <CardValue
        title="Entrada"
        value={isPending ? "R$ 0,00" : IncomeValue}
        icon={TrendingUp}
        classNameIcon="text-green-300"
      />
      <CardValue
        title="Saída"
        value={isPending ? "R$ 0,00" : ExpenseValue}
        icon={TrendingDown}
        classNameIcon="text-red-300"
      />
    </>
  );
};
