"use client";

import { EyeIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { CardContentAccountBank } from "./CardContentAccountBank";
import { RegisterAccountBank } from "./RegisterAccountBank";
import { useQuery } from "@tanstack/react-query";
import { getBanks } from "@/actions/banks.actions";
import { transformToCurrency } from "@/lib/utils";

export function ResumeAccountBanks() {
  const { data } = useQuery({
    queryKey: ["banks"],
    queryFn: async () => await getBanks(),
  });

  return (
    <div className="h-[calc(100vh-250px)] flex">
      <Card className="w-[300px] gap-0 flex flex-col border flex-1 p-0 overflow-hidden bg-transparent text-zinc-50 border-neutral-800">
        <CardHeader className="flex items-center justify-between bg-neutral-800 py-3">
          <div className="flex flex-col gap-1">
            <CardTitle>Bancos</CardTitle>
            <CardDescription>
              {data?.totalAmount
                ? transformToCurrency(data.totalAmount)
                : "R$0,00"}
            </CardDescription>
          </div>
          <EyeIcon className="size-5 text-neutral-500" />
        </CardHeader>

        <CardContent className="p-0 flex-1 overflow-auto">
          {data?.success &&
            data.banks.map((bank, index) => (
              <CardContentAccountBank
                key={`${bank.id}-${index}`}
                bankId={bank.id}
                title={bank.bank}
                type_account={bank.description}
                value={transformToCurrency(bank.amount)}
              />
            ))}
        </CardContent>

        <CardFooter className="flex items-center justify-center py-3">
          <RegisterAccountBank />
        </CardFooter>
      </Card>
    </div>
  );
}
