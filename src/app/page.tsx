import { columns, Transaction } from "@/components/columnsResumoTransactions";
import { ResumeTransactions } from "@/components/resumeTransactions";
import { SignOut } from "@/components/signOut";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth, signIn } from "@/lib/auth";
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

      <div className="flex items-center gap-12">
        <div className="flex items-start gap-4">
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
        </div>
      </div>

      <div>
        <Card className="bg-transparent text-zinc-50 border-neutral-800">
          <CardHeader className="px-2">
            <CardTitle className="p-0">Transactions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ResumeTransactions columns={columns} data={data} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
