"use client"

import { format, getMonth } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useDateStore } from "@/store";
import { Calendar } from "lucide-react";
import { ptBR } from 'date-fns/locale'

export const FilterMonth = () => {
  const date = useDateStore((state) => state.date);

  return (
    <Select
      value={getMonth(new Date(date)).toString()}
      onValueChange={(value) =>
        useDateStore.getState().setDate(new Date(2025, Number(value)))
      }
    >
      <SelectTrigger size="sm" className="w-[120px] text-start dark:border-neutral-600 dark:bg-neutral-800 dark:hover:bg-neutral-700">
        <Calendar />
        <SelectValue className="text-red-500" />
      </SelectTrigger>
      <SelectContent className=" dark:bg-neutral-400 border-none">
        {Array.from({ length: 12 }).map((_, index) => (
          <SelectItem key={index} value={index.toString()}>
            {format(new Date(2025, index), "MMMM", {
              locale: ptBR
            })}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
