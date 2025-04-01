"use client";

import { EyeIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
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
    <Card className="w-[300px] bg-transparent text-zinc-50 border-neutral-800">
      <CardHeader className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle>Banks</CardTitle>
          <CardDescription>
            {data?.totalAmount
              ? transformToCurrency(data.totalAmount)
              : "R$0,00"}
          </CardDescription>
        </div>
        <EyeIcon className="size-5 text-neutral-500" />
      </CardHeader>
      <CardContent className="p-0">
        {data?.success && (
          <>
            {data.banks.map((bank) => {
              return (
                <CardContentAccountBank
                  key={bank.id}
                  bankId={bank.id}
                  title={bank.bank}
                  type_account={bank.description}
                  value={transformToCurrency(bank.amount)}
                />
              );
            })}
          </>
        )}
        <div className="p-4">
          <RegisterAccountBank />
        </div>
      </CardContent>
    </Card>
  );
}
