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
import { Calendar } from "lucide-react";
import { ptBR } from "date-fns/locale";

export const FilterDateModern = () => {
  const date = useDateStore((state) => state.date);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-[180px] h-9 bg-neutral-800/50 border border-neutral-600/50 rounded-lg animate-pulse"></div>
    );
  }

  // Gera anos de 2020 até 2030
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  // Cria opções combinadas de mês/ano
  const dateOptions = years.flatMap(year => 
    Array.from({ length: 12 }, (_, monthIndex) => ({
      value: `${year}-${monthIndex}`,
      label: `${format(new Date(year, monthIndex), "MMMM", { locale: ptBR })} ${year}`,
      year,
      month: monthIndex
    }))
  ).reverse(); // Ordena do mais recente para o mais antigo

  const currentValue = `${getYear(new Date(date))}-${getMonth(new Date(date))}`;

  const handleDateChange = (value: string) => {
    const [year, month] = value.split('-').map(Number);
    const newDate = new Date(year, month);
    useDateStore.getState().setDate(newDate);
  };

  return (
    <Select
      value={currentValue}
      onValueChange={handleDateChange}
    >
      <SelectTrigger
        size="sm"
        className="w-[180px] capitalize text-start bg-neutral-800/60 border-neutral-700/50 hover:bg-neutral-700/60 hover:border-neutral-600/70 transition-all duration-200 text-neutral-200"
      >
        <Calendar className="w-4 h-4 text-neutral-300" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="dark:bg-neutral-800/95 border-neutral-700/50 max-h-[300px] shadow-lg">
        {dateOptions.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="capitalize hover:bg-neutral-700/50 text-neutral-200"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}; 