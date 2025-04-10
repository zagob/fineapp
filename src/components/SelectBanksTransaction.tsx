"use client";

import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useQuery } from "@tanstack/react-query";
import { getBanks } from "@/actions/banks.actions";
import { bankIcons } from "@/variants/accountBanks";

interface SelectBanksTransactionProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

export const SelectBanksTransaction = ({
  onChange,
  value,
}: SelectBanksTransactionProps) => {
  const { data } = useQuery({
    queryKey: ["banks"],
    queryFn: async () => await getBanks(),
  });

  return (
    <Select onValueChange={onChange} value={value}>
      <SelectTrigger className="dark:text-neutral-200 w-full dark:border-neutral-600 dark:bg-neutral-800 dark:hover:bg-neutral-700">
        <SelectValue placeholder="Selecione um banco" />
      </SelectTrigger>
      <SelectContent className="dark:bg-neutral-400 border-none">
        {data?.banks.map((bank) => (
          <SelectItem key={bank.id} value={bank.id}>
            <Image
              src={bankIcons[bank.bank] || "../assets/icons/default.svg"}
              alt={bank.bank.toString()}
              width={20}
              height={20}
              className="rounded-sm"
            />
            {bank.bank.toString()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
