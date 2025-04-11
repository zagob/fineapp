"use client";

import { getTransfers } from "@/actions/transfers.actions";
import { DeleteTransfer } from "@/components/DeleteTransfer";
import { ImageBank } from "@/components/ImageBank";
import { Loading } from "@/components/Loading";
import { RegisterTransfer } from "@/components/RegisterTransfer";
import { UpdatedTransfer } from "@/components/UpdatedTransfer";

import { cn, transformToCurrency } from "@/lib/utils";
import { useDateStore } from "@/store";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Shuffle } from "lucide-react";

export default function Page() {
  const date = useDateStore((state) => state.date);

  const { data: transfersByDate, isPending } = useQuery({
    queryKey: ["transfers", date],
    queryFn: async () => {
      const { transfersByDate } = await getTransfers(date);

      return transfersByDate;
    },
  });

  const isTransfersEmpty = transfersByDate?.length === 0;

  return (
    <div className="">
      <div className="flex items-start gap-8">
        <div>
          <h1>Transferências Geral</h1>
          <p className="text-xs text-neutral-500">
            Essa página é uma visão geral de todas as transferências do mês
          </p>

          <div className="flex gap-4 mt-4">
            <RegisterTransfer />
          </div>
        </div>

        {/* <div className="">
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
        </div> */}
      </div>

      {isPending && (
        <div className="mt-8">
          <Loading />
        </div>
      )}

      {isTransfersEmpty && !isPending && (
        <div className="mt-8 text-neutral-600">
          Nenhuma transação encontrada no mês de{" "}
          {format(date, " MMMM", { locale: ptBR })}
        </div>
      )}

      {transfersByDate?.map((transferByDate) => (
        <div key={transferByDate.date} className="mt-8 flex flex-col gap-3">
          <div>
            <p className="text-sm font-light text-neutral-300">
              {format(
                new Date(transferByDate.date + "T00:00"),
                "dd 'de' MMMM",
                {
                  locale: ptBR,
                }
              )}
            </p>

            <div className="border-l border-l-neutral-700 ml-2 pl-4 pt-2 mt-2 flex flex-col gap-3">
              {transferByDate.transfers.map((item) => {
                return (
                  <div
                    key={item.id}
                    className="flex w-fit items-center gap-4 text-xs text-neutral-400"
                  >
                    <ImageBank
                      bank={item.bankInitial.bank}
                      width={20}
                      height={20}
                    />
                    <Shuffle className="size-3" />
                    <ImageBank
                      bank={item.bankDestine.bank}
                      width={20}
                      height={20}
                    />
                    <span className={cn("w-[100px] text-base")}>
                      {transformToCurrency(item.value)}
                    </span>

                    <div className="flex gap-2">
                      <UpdatedTransfer
                        id={item.id}
                        bankInitial={item.bankInitial.bank}
                        bankDestine={item.bankDestine.bank}
                        date={item.date}
                        value={transformToCurrency(item.value)}
                      />
                      <DeleteTransfer id={item.id} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
