import { $Enums } from "@prisma/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Transactions } from "./Transactions";

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
  transactionsByDate: {
    date: string;
    transactions: TransctionType[];
  }[];
}

export const TransactionsByDate = ({
  transactionsByDate,
}: TransactionsByDateProps) => {
  return (
    <div className="w-[650px] h-[calc(100vh-230px)] overflow-scroll mt-4 pr-4 pb-10 border-r border-r-neutral-800">
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
