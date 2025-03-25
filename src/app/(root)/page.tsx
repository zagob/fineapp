import { CardContentAccountBank } from "@/components/CardContentAccountBank";
import { CardValue } from "@/components/CardValue";
import { columns, Transaction } from "@/components/columnsResumoTransactions";
import { RegisterAccountBank } from "@/components/RegisterAccountBank";
import { RegisterTransactionDialog } from "@/components/RegisterTransactionDialog";
import { ResumeChartCategories } from "@/components/resumeChartCategories";
import { ResumeTransactions } from "@/components/resumeTransactions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { auth, signIn } from "@/lib/auth";
import { format, getMonth } from "date-fns";
import {
  CircleDollarSign,
  EyeIcon,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

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
            year: "numeric",
          })}
        </div>

        <CardValue title="Balance" value="R$1.023,00" icon={CircleDollarSign} />
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
      </div>

      <div className="flex gap-8">
        <Card className="w-[300px] bg-transparent text-zinc-50 border-neutral-800">
          <CardHeader className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle>Banks</CardTitle>
              <CardDescription>Total: R$42.000,22</CardDescription>
            </div>
            <EyeIcon className="size-5 text-neutral-500" />
          </CardHeader>
          <CardContent className="p-0">
            <CardContentAccountBank
              title="Itaú"
              type_account="Conta Corrente"
              value="R$42.000,22"
            />

            <div className="flex items-center justify-between border-b border-neutral-800 p-4 w-full">
              <div className="flex items-center gap-2">
                <div className="bg-green-400 rounded-full size-10" />
                <div className="flex flex-col">
                  <h2 className="leading-tight">PicPay</h2>
                  <span className="text-xs">Conta Corrente</span>
                </div>
              </div>
              <span>R$42.000,22</span>
            </div>
            <div className="p-4">
              <RegisterAccountBank />
            </div>
          </CardContent>
        </Card>

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
                  <RegisterTransactionDialog type="expense" />
                  <RegisterTransactionDialog type="income" />
                </PopoverContent>
              </Popover>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ResumeTransactions columns={columns} data={data} />
          </CardContent>
        </Card>
        <ResumeChartCategories />
      </div>
    </div>
  );
}
