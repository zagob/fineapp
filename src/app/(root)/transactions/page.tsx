"use client";

import { getTransactions } from "@/actions/transactions.actions";
import { ImageBank } from "@/components/ImageBank";
import { ImageCategory } from "@/components/ImageCategory";
import { Loading } from "@/components/Loading";
import { RegisterTransactionDialog } from "@/components/RegisterTransactionDialog";
import { cn, transformToCurrency } from "@/lib/utils";
import { useDateStore } from "@/store";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

export default function Page() {
  const date = useDateStore((state) => state.date);

  const { data: transactions, isPending } = useQuery({
    queryKey: ["transactions-by-date"],
    queryFn: async () => {
      const { transactionsByDate } = await getTransactions({ date });

      return transactionsByDate;
    },
  });

  if (isPending) {
    return <Loading />;
  }

  return (
    <div className="">
      <div>
        <h1>Transações Geral</h1>
        <p className="text-xs text-neutral-500">
          Essa página é uma visão geral de todas as transações do mês
        </p>

        <div className="flex gap-4 mt-4">
          <RegisterTransactionDialog type="INCOME" />
          <RegisterTransactionDialog type="EXPENSE" />
        </div>
      </div>

      {transactions?.map((transaction) => (
        <div key={transaction.date} className="mt-8 flex flex-col gap-3">
          <div>
            <p className="text-sm font-light">
              {format(new Date(transaction.date), "dd 'de' MMMM")}
            </p>

            <div className="border-l border-l-neutral-700 ml-2 pl-4 pt-2 mt-2 flex flex-col gap-3">
              {transaction.transactions.map((item) => {
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 text-xs text-neutral-400"
                  >
                    <ImageBank bank={item.bank.bank} width={20} height={20} />
                    <ImageCategory
                      color={item.category.color}
                      icon={item.category.icon as string}
                      classNameBackground="size-5"
                      classNameIcon="size-3"
                    />
                    <span>{item.description ?? "-"}</span>
                    <span
                      className={cn({
                        "text-red-400": item.type === "EXPENSE",
                        "text-green-400": item.type === "INCOME",
                      })}
                    >
                      {item.type === "INCOME" ? "Entrada" : "Saída"}
                    </span>
                    <span
                      className={cn("", {
                        "text-red-400": item.type === "EXPENSE",
                        "text-green-400": item.type === "INCOME",
                      })}
                    >
                      {transformToCurrency(item.value)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
