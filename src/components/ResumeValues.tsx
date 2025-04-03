"use client"

import { CircleDollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { CardValue } from "./CardValue";
import { useQuery } from "@tanstack/react-query";
import { useDateStore } from "@/store";
import { getTransactions } from "@/actions/transactions.actions";
import { transformToCurrency } from "@/lib/utils";

export const ResumeValues = () => {
  const date = useDateStore((state) => state.date);

  const { data: transactions } = useQuery({
    queryKey: ["transactions", date],
    queryFn: async () => await getTransactions({ date }),
  });

  return (
    <>
      <CardValue
        title="Balance"
        value={transformToCurrency(transactions?.resume?.balance as number) ?? "R$0,00"}
        icon={CircleDollarSign}
      />
      <CardValue
        title="Income"
        value={transformToCurrency(transactions?.resume?.totalIncome as number) ?? "R$0,00"}
        icon={TrendingUp}
        classNameIcon="text-green-300"
      />
      <CardValue
        title="Expense"
        value={transformToCurrency(transactions?.resume?.totalExpense as number) ?? "R$0,00"}
        icon={TrendingDown}
        classNameIcon="text-red-300"
      />
    </>
  );
};
