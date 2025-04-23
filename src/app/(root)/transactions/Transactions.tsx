import { ImageBank } from "@/components/ImageBank";
import { TransctionType } from "./TransactionsByDate";
import { ImageCategory } from "@/components/ImageCategory";
import { cn, transformToCurrency } from "@/lib/utils";
import { RegisterTransactionDialog } from "@/components/RegisterTransactionDialog";
import { DialogDeleteTransaction } from "@/components/DeleteTransaction";

interface TransactionsProps {
  transactions: TransctionType[];
}

export const Transactions = ({ transactions }: TransactionsProps) => {
  return (
    <div className="border-l border-l-neutral-700 ml-2 pl-4 pt-2 mt-2 flex flex-col gap-3">
      {transactions.map((item) => {
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
              className={cn("text-base w-[100px]", {
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
  );
};
