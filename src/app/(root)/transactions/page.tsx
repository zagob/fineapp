"use client";

import { exportTransctions, getTransactions } from "@/actions/transactions.actions";
import { DialogDeleteTransaction } from "@/components/DialogDeleteTransaction";
import { ImageBank } from "@/components/ImageBank";
import { ImageCategory } from "@/components/ImageCategory";
import { Loading } from "@/components/Loading";
import { RegisterTransactionDialog } from "@/components/RegisterTransactionDialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, transformToCurrency } from "@/lib/utils";
import { useDateStore } from "@/store";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileDown } from "lucide-react";

export default function Page() {
  const date = useDateStore((state) => state.date);

  const { mutate } = useMutation({
    mutationFn: async () => {
      const csvBase64 = await exportTransctions(date)

      console.log('filePath',csvBase64)

      if(!csvBase64) return

      const csvBlob = new Blob([atob(csvBase64 as string)], { type: "text/csv" })
      const url = URL.createObjectURL(csvBlob)

      const link = document.createElement('a')
      link.href = url
      link.download = 'transacoes.csv'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(url)
    }
  })

  const { data: transactions, isPending } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { transactionsByDate } = await getTransactions({ date });

      return transactionsByDate;
    },
  });

  console.log("transactions", transactions);

  const isTransactionsEmpty = transactions?.length === 0;

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

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={() => mutate()} variant="dark" size="sm">
                  <FileDown className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Exportar transações</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {isTransactionsEmpty && (
        <div className="mt-8 text-neutral-600">
          Nenhuma transação encontrada no mês de{" "}
          {format(date, " MMMM", { locale: ptBR })}
        </div>
      )}

      {transactions?.map((transaction) => (
        <div key={transaction.date} className="mt-8 flex flex-col gap-3">
          <div>
            <p className="text-sm font-light text-neutral-300">
              {format(new Date(transaction.date + "T00:00"), "dd 'de' MMMM", {
                locale: ptBR,
              })}
            </p>

            <div className="border-l border-l-neutral-700 ml-2 pl-4 pt-2 mt-2 flex flex-col gap-3">
              {transaction.transactions.map((item) => {
                const isNotDescription =
                  item.description?.length === 0 || !item.description;

                return (
                  <div
                    key={item.id}
                    className="flex w-fit items-center gap-4 text-xs text-neutral-400"
                  >
                    <ImageBank bank={item.bank.bank} width={20} height={20} />
                    <ImageCategory
                      color={item.category.color}
                      icon={item.category.icon as string}
                      classNameBackground="size-5"
                      classNameIcon="size-3"
                    />
                    <span
                      className={cn("w-[200px]", {
                        "text-neutral-700 text-center": isNotDescription,
                      })}
                    >
                      {isNotDescription ? "sem descrição" : item.description}
                    </span>
                    <span
                      className={cn("w-12", {
                        "text-red-400": item.type === "EXPENSE",
                        "text-green-400": item.type === "INCOME",
                      })}
                    >
                      {item.type === "INCOME" ? "Entrada" : "Saída"}
                    </span>
                    <span
                      className={cn("w-fit text-base", {
                        "text-red-400": item.type === "EXPENSE",
                        "text-green-400": item.type === "INCOME",
                      })}
                    >
                      {transformToCurrency(item.value)}
                    </span>

                    <div className="flex gap-2">
                      <RegisterTransactionDialog
                        transactionId={item.id}
                        type={item.type}
                        actions="EDIT"
                        bankId={item.bank.id}
                        category={item.category.id}
                        description={item.description ?? ""}
                        value={transformToCurrency(item.value)}
                        datetime={item.date}
                      />
                      <RegisterTransactionDialog
                        type={item.type}
                        actions="COPY"
                        bankId={item.bank.id}
                        category={item.category.id}
                        description={item.description ?? ""}
                        value={transformToCurrency(item.value)}
                        datetime={item.date}
                      />
                      <DialogDeleteTransaction id={item.id} />
                    </div>
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
