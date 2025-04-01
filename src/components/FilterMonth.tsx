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

export const FilterMonth = () => {
  const date = useDateStore((state) => state.date);

  console.log('date',date)

  return (
    <Select
      value={getMonth(new Date(date)).toString()}
      onValueChange={(value) =>
        useDateStore.getState().setDate(new Date(2025, Number(value)))
      }
    >
      <SelectTrigger className="w-[100px] bg-transparent dark:hover:bg-neutral-800 dark:bg-transparent dark:border-neutral-700">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className=" dark:bg-neutral-400 border-none">
        {Array.from({ length: 12 }).map((_, index) => (
          <SelectItem key={index} value={index.toString()}>
            {format(new Date(2025, index), "MMMM")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
