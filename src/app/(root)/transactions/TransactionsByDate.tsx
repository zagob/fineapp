import { $Enums } from "@prisma/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Transactions } from "./Transactions";
import { Loading } from "@/components/Loading";

export type TransctionType = {
  id: string;
  type: $Enums.Type;
  date: Date;
  value: number;
  bank: {
    id: string;
    bank: $Enums.BankName;
  };
  category: {
    color: string;
    id: string;
    name: string;
    icon: string | null;
  };
  description: string | null;
};

interface TransactionsByDateProps {
  isLoading: boolean;
  date: Date;
  transactionsByDate: {
    date: string;
    transactions: TransctionType[];
  }[];
}

export const TransactionsByDate = ({
  transactionsByDate,
  isLoading,
  date,
}: TransactionsByDateProps) => {
  const isTransactionsEmpty = transactionsByDate?.length === 0;

  if (isLoading) {
    return (
      <>
        {isLoading && (
          <div className="mt-8 w-[650px]">
            <Loading />
          </div>
        )}
      </>
    );
  }

  return (
    <div className="w-[650px] h-[calc(100vh-300px)] overflow-scroll mt-4 pr-4 pb-10 border-r border-r-neutral-800">
      {isTransactionsEmpty && !isLoading && (
        <div className="mt-8 text-neutral-600">
          Nenhuma transação encontrada no mês de{" "}
          {format(date, " MMMM", { locale: ptBR })}
        </div>
      )}

      {transactionsByDate?.map((transaction) => (
        <div key={transaction.date} className="mt-8 flex flex-col gap-3">
          <div>
            <p className="text-sm font-light text-neutral-300">
              {format(new Date(transaction.date + "T00:00"), "dd 'de' MMMM", {
                locale: ptBR,
              })}
            </p>

            <Transactions transactions={transaction.transactions} />
          </div>
        </div>
      ))}
    </div>
  );
};
