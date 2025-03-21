import { CardValue } from "@/components/CardValue";
import { columns, Transaction } from "@/components/columnsResumoTransactions";
import { ResumeChartCategories } from "@/components/resumeChartCategories";
import { ResumeTransactions } from "@/components/resumeTransactions";
import { SignOut } from "@/components/signOut";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { auth, signIn } from "@/lib/auth";
import { format, getMonth } from "date-fns";
import { CircleDollarSign, TrendingDown, TrendingUp } from "lucide-react";

async function getData(): Promise<Transaction[]> {
  return [
    {
      id: "1",
      date: "2023-01-01",
      bank: "Itau",
      type: "expense",
      description: "Aluguel",
      value: 100,
    },
    {
      id: "2",
      date: "2023-01-02",
      bank: "Itau",
      type: "income",
      description: "Salário",
      value: 2000,
    },
  ];
}

export default async function Home() {
  const session = await auth();

  const data = await getData();

  if (!session) {
    return (
      <main>
        <div>Not authenticated</div>
        <button
          onClick={async () => {
            "use server";
            await signIn("google");
          }}
        >
          SignIn
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-12 py-8">
      <div className="flex justify-end">
        <SignOut />
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-2 uppercase text-sm text-neutral-400">
            <Select value={getMonth(new Date()).toString()}>
              <SelectTrigger className="w-[100px] bg-transparent dark:hover:bg-neutral-800 dark:bg-transparent dark:border-neutral-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className=" dark:bg-neutral-400 border-none">
                {Array.from({ length: 12 }).map((_, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {format(new Date(2025, index), "MMMM")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {new Date().toLocaleDateString("pt-BR", {
              // day: "2-digit",
              // month: "long",
              year: "numeric",
            })}
          </div>

          <CardValue
            title="Balance"
            value="R$1.023,00"
            icon={CircleDollarSign}
          />
          <CardValue
            title="Income"
            value="R$123,00"
            icon={TrendingUp}
            classNameIcon="text-green-300"
          />
          <CardValue
            title="Expense"
            value="R$241,00"
            icon={TrendingDown}
            classNameIcon="text-red-300"
          />

          {/* <div className="flex items-start gap-4">
            <CircleDollarSign />
            <div>
              <h3>Balance</h3>
              <span>R$1.023,00</span>
            </div>
          </div>

          <div className="h-full w-2 bg-zinc-200" />

          <div className="flex items-start gap-4">
            <TrendingUp className="text-green-500" />
            <div>
              <h4>Income</h4>
              <span>R$54,00</span>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <TrendingDown className="text-red-500" />
            <div>
              <h4>Expense</h4>
              <span>R$241,00</span>
            </div>
          </div> */}
        </div>

        <div className="flex gap-8">
          <Card className="flex-1 bg-transparent text-zinc-50 border-neutral-800">
            <CardHeader className="px-2">
              <CardTitle className="p-0">Transactions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ResumeTransactions columns={columns} data={data} />
            </CardContent>
          </Card>
          <ResumeChartCategories />
        </div>
      </div>
    </main>
  );
}
