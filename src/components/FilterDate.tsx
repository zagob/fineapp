"use client";

import { format, getMonth, getYear } from "date-fns";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useDateStore } from "@/store";
import { Calendar, ChevronDown } from "lucide-react";
import { ptBR } from "date-fns/locale";

export const FilterDate = () => {
  const date = useDateStore((state) => state.date);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-[120px] h-8 bg-neutral-800 border border-neutral-600 rounded-md animate-pulse"></div>
        <div className="w-[100px] h-8 bg-neutral-800 border border-neutral-600 rounded-md animate-pulse"></div>
      </div>
    );
  }

  // Gera anos de 2020 até 2030
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  const handleMonthChange = (value: string) => {
    const currentDate = new Date(date);
    const newDate = new Date(currentDate.getFullYear(), Number(value));
    useDateStore.getState().setDate(newDate);
  };

  const handleYearChange = (value: string) => {
    const currentDate = new Date(date);
    const newDate = new Date(Number(value), currentDate.getMonth());
    useDateStore.getState().setDate(newDate);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Filtro de Mês */}
      <Select
        value={getMonth(new Date(date)).toString()}
        onValueChange={handleMonthChange}
      >
        <SelectTrigger
          size="sm"
          className="w-[120px] capitalize text-start bg-neutral-800/60 border-neutral-700/50 hover:bg-neutral-700/60 hover:border-neutral-600/70 transition-all duration-200 text-neutral-200"
        >
          <Calendar className="w-4 h-4 text-neutral-300" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="dark:bg-neutral-800/95 border-neutral-700/50 shadow-lg">
          {Array.from({ length: 12 }).map((_, index) => (
            <SelectItem
              key={index}
              value={index.toString()}
              className="capitalize hover:bg-neutral-700/50 text-neutral-200"
            >
              {format(new Date(2025, index), "MMMM", {
                locale: ptBR,
              })}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Filtro de Ano */}
      <Select
        value={getYear(new Date(date)).toString()}
        onValueChange={handleYearChange}
      >
        <SelectTrigger
          size="sm"
          className="w-[100px] capitalize text-start bg-neutral-800/60 border-neutral-700/50 hover:bg-neutral-700/60 hover:border-neutral-600/70 transition-all duration-200 text-neutral-200"
        >
          <ChevronDown className="w-4 h-4 text-neutral-300" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="dark:bg-neutral-800/95 border-neutral-700/50 shadow-lg">
          {years.map((year) => (
            <SelectItem
              key={year}
              value={year.toString()}
              className="capitalize hover:bg-neutral-700/50 text-neutral-200"
            >
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}; 