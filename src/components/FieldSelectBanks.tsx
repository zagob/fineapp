import Image from "next/image";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { FormControl, FormItem, FormLabel, FormMessage } from "./ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { bankIcons } from "@/variants/accountBanks";
import { $Enums } from "@prisma/client";

export const BANKS = [
  "BANCO_DO_BRASIL",
  "ITAU",
  "ITI",
  "PICPAY",
  "NUBANK",
  "BRADESCO",
  "SANTANDER",
  "CAIXA",
  "INTER",
  "C6",
] as const;

interface BankProps {
    id: string;
    name: $Enums.BankName;
}

interface FieldSelectBanksProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string
  banks: BankProps[] | []
}

export const FieldSelectBanks = <T extends FieldValues>({
  name,
  label,
  control,
  banks
}: FieldSelectBanksProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}:</FormLabel>
          <FormControl>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger className="dark:text-neutral-200 w-full dark:hover:bg-neutral-900 dark:bg-neutral-900 dark:border-neutral-700">
                <SelectValue placeholder="Select a bank" />
              </SelectTrigger>
              <SelectContent className="dark:bg-neutral-400 border-none">
                {banks.map((bank) => (
                  <SelectItem key={bank.id} value={bank.id}>
                    <Image
                      src={bankIcons[bank.name] || "../assets/icons/default.svg"}
                      alt={bank.name.toString()}
                      width={20}
                      height={20}
                      className="rounded-sm"
                    />
                    {bank.name.toString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage  />
        </FormItem>
      )}
    />
  );
};
