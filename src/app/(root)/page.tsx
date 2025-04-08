import { FilterMonth } from "@/components/FilterMonth";

import { RegisterTransactionDialog } from "@/components/RegisterTransactionDialog";
import { RegisterTransfer } from "@/components/RegisterTransfer";
import { ResumeAccountBanks } from "@/components/ResumeAccountBanks";
import { ResumeChartCategories } from "@/components/resumeChartCategories";
import { ResumeTransactions } from "@/components/ResumeTransactions";
import { ResumeTransfers } from "@/components/ResumeTransfers";
import { ResumeValues } from "@/components/ResumeValues";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Banknote, BanknoteIcon, PlusCircle } from "lucide-react";

export default async function Home() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-12">
        <div className="flex items-center gap-2 uppercase text-sm text-neutral-400">
          <FilterMonth />

          {new Date().toLocaleDateString("pt-BR", {
            year: "numeric",
          })}
        </div>

        <ResumeValues />
      </div>

      <div className="flex gap-8">
        <ResumeAccountBanks />

        <div className="flex-1 space-y-8">
          <Card className="flex-1 p-0 bg-transparent text-zinc-50 border-neutral-800">
            <CardHeader className="px-2 pb-0 pt-4 flex items-center justify-between">
              <CardTitle className="pt-px flex items-center justify-between">
                <h2 className="leading-0">Ultimas Transações</h2>
                {/* <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="dark"
                      size="sm"
                      className="cursor-pointer mt-2"
                    >
                      <PlusCircle />
                      Adicionar Lançamento
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    className="w-fit flex flex-col gap-2 dark:bg-neutral-700 dark:border-neutral-600"
                  >
                    <RegisterTransactionDialog type="EXPENSE" />
                    <RegisterTransactionDialog type="INCOME" />
                  </PopoverContent>
                </Popover> */}
              </CardTitle>

              <div className="flex items-center gap-2">
                <Button
                  variant="dark"
                  size="sm"
                  className="flex items-center justify-center shadow-xl dark:bg-emerald-900 dark:border-emerald-800"
                >
                  <Banknote className="size-5" />
                  Entrada
                </Button>
                <Button
                  variant="dark"
                  size="sm"
                  className="flex items-center justify-center shadow-xl dark:bg-red-900 dark:border-red-800"
                >
                  <Banknote className="size-5" />
                  Saída
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ResumeTransactions />
            </CardContent>
          </Card>

          <Card className="flex-1 bg-transparent text-zinc-50 border-neutral-800">
            <CardHeader className="px-2">
              <CardTitle className="p-0 flex items-center justify-between">
                <div>
                  <h2>Ultimas Tranferências</h2>
                </div>

                <RegisterTransfer />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ResumeTransfers />
            </CardContent>
          </Card>
        </div>

        <ResumeChartCategories />
      </div>
    </div>
  );
}
