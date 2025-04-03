
import { FilterMonth } from "@/components/FilterMonth";

import { RegisterTransactionDialog } from "@/components/RegisterTransactionDialog";
import { ResumeAccountBanks } from "@/components/ResumeAccountBanks";
import { ResumeChartCategories } from "@/components/resumeChartCategories";
import { ResumeTransactions } from "@/components/ResumeTransactions";
import { ResumeValues } from "@/components/ResumeValues";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

        <Card className="flex-1 bg-transparent text-zinc-50 border-neutral-800">
          <CardHeader className="px-2">
            <CardTitle className="p-0 flex items-center justify-between">
              <h2>Lastest Transactions</h2>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="default" className="cursor-pointer">
                    Add Transaction
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  className="w-fit flex flex-col gap-2 dark:bg-neutral-700 dark:border-neutral-600"
                >
                  <RegisterTransactionDialog type="EXPENSE" />
                  <RegisterTransactionDialog type="INCOME" />
                </PopoverContent>
              </Popover>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ResumeTransactions />
          </CardContent>
        </Card>

        <ResumeChartCategories />
      </div>
    </div>
  );
}
