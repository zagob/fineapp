import { FilterMonth } from "@/components/FilterMonth";

import { RegisterTransactionDialog } from "@/components/RegisterTransactionDialog";
import { RegisterTransfer } from "@/components/RegisterTransfer";
import { ResumeAccountBanks } from "@/components/ResumeAccountBanks";
import { ResumeChartCategories } from "@/components/resumeChartCategories";
import { ResumeTransactions } from "@/components/ResumeTransactions";
import { ResumeTransfers } from "@/components/ResumeTransfers";
import { ResumeValues } from "@/components/ResumeValues";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
              </CardTitle>

              <div className="flex items-center gap-2">
                <RegisterTransactionDialog type="INCOME" />
                <RegisterTransactionDialog type="EXPENSE" />
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
