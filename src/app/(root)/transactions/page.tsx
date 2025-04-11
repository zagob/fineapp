"use client";

import { getTransactions } from "@/actions/transactions.actions";
import { DialogDeleteTransaction } from "@/components/DeleteTransaction";
import { ExportTransactions } from "@/components/ExportTransactions";
import { FilterMonth } from "@/components/FilterMonth";
import { ImageBank } from "@/components/ImageBank";
import { ImageCategory } from "@/components/ImageCategory";
import { Loading } from "@/components/Loading";
import { RegisterTransactionDialog } from "@/components/RegisterTransactionDialog";
import { SelectBanksTransaction } from "@/components/SelectBanksTransaction";
import { SelectEveryCategories } from "@/components/SelectEveryCategories";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { cn, transformToCurrency } from "@/lib/utils";
import { useDateStore, useTransactionStore } from "@/store";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { X } from "lucide-react";

export default function Page() {
  const date = useDateStore((state) => state.date);
  const {
    typeTransaction,
    setTypeTransaction,
    category,
    setCategory,
    bank,
    setBank,
  } = useTransactionStore();

  const { data: transactions, isPending } = useQuery({
    queryKey: ["transactions", date, typeTransaction, category, bank],
    queryFn: async () => {
      const { transactionsByDate } = await getTransactions({
        date,
        type: typeTransaction ?? undefined,
        categoryId: category.length > 0 ? category : undefined,
        bankId: !bank || bank.length === 0 ? undefined : bank,
      });

      return transactionsByDate;
    },
  });

  const isTransactionsEmpty = transactions?.length === 0;

  return (
    <div className="">
      <div className="flex items-start gap-8">
        <div>
          <h1>Transações Geral</h1>
          <p className="text-xs text-neutral-500">
            Essa página é uma visão geral de todas as transações do mês
          </p>

          <div className="flex gap-4 mt-4">
            <RegisterTransactionDialog type="INCOME" />
            <RegisterTransactionDialog type="EXPENSE" />

            <ExportTransactions />
          </div>
        </div>

        <div className="">
          <h1 className="leading-relaxed">Filtros</h1>
          <p className="text-xs text-neutral-500">
            Utilize os filtros abaixo para filtrar as transações
          </p>

          <div className="flex items-center gap-4 mt-4">
            <FilterMonth />

            <div className="flex items-center gap-px">
              <Select
                value={typeTransaction ?? ""}
                onValueChange={(value) =>
                  setTypeTransaction(value as "INCOME" | "EXPENSE" | undefined)
                }
              >
                <SelectTrigger
                  className="dark:border-neutral-600 dark:bg-neutral-800 dark:hover:bg-neutral-700 w-[170px]"
                  size="sm"
                >
                  <SelectValue placeholder="selecione um tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="INCOME">Entradas</SelectItem>
                    <SelectItem value="EXPENSE">Saídas</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button
                className="cursor-pointer"
                hidden={typeTransaction === undefined}
                size="sm"
                onClick={() => setTypeTransaction(undefined)}
              >
                <X className="size-3" />
              </Button>
            </div>

            <div className="flex items-center gap-px">
              <SelectEveryCategories
                defaultValue={category}
                onValueChange={setCategory}
              />
              <Button
                className="cursor-pointer"
                hidden={category === ""}
                size="sm"
                onClick={() => setCategory("")}
              >
                <X className="size-3" />
              </Button>
            </div>

            <div className="flex items-center gap-px">
              <SelectBanksTransaction value={bank} onChange={setBank} />
              <Button
                className="cursor-pointer"
                hidden={bank === ""}
                size="sm"
                onClick={() => setBank("")}
              >
                <X className="size-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isPending && (
        <div className="mt-8">
          <Loading />
        </div>
      )}

      {isTransactionsEmpty && !isPending && (
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
