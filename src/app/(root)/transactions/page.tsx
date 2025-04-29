"use client";

import { getTransactions } from "@/actions/transactions.actions";
import { ExportTransactions } from "@/components/ExportTransactions";
import { FilterMonth } from "@/components/FilterMonth";
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

import { useDateStore, useTransactionStore } from "@/store";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { X } from "lucide-react";
import { RechartExpense } from "./RechartExpense";
import { TransactionsByDate } from "./TransactionsByDate";

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

  const { data, isPending } = useQuery({
    queryKey: ["transactions", date, typeTransaction, category, bank],
    queryFn: async () => {
      const { transactionsByDate, resume } = await getTransactions({
        date,
        type: typeTransaction ?? undefined,
        categoryId: category.length > 0 ? category : undefined,
        bankId: !bank || bank.length === 0 ? undefined : bank,
      });

      return { transactionsByDate, resume };
    },
  });

  return (
    <div className="flex flex-col">
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

      <div className="flex gap-4">
        <TransactionsByDate
          date={date}
          isLoading={isPending}
          transactionsByDate={data?.transactionsByDate ?? []}
        />

        <div className="flex-1 flex flex-col gap-3 mt-12">
          <h1 className="text-2xl text-neutral-400 capitalize">
            {format(date, "MMMM 'de ' yyyy", { locale: ptBR })}
          </h1>
          <div className="grid grid-cols-1 gap-4">
            <RechartExpense
              type="INCOME"
              totalValue={data?.resume?.totalIncome}
            />
            <RechartExpense
              type="EXPENSE"
              totalValue={data?.resume?.totalExpense}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
