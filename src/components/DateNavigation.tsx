"use client";

import { useDateStore } from "@/store";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export const DateNavigation = () => {
  const date = useDateStore((state) => state.date);
  const setDate = useDateStore((state) => state.setDate);

  const goToPreviousMonth = () => {
    const newDate = subMonths(date, 1);
    setDate(newDate);
  };

  const goToNextMonth = () => {
    const newDate = addMonths(date, 1);
    setDate(newDate);
  };

  const goToCurrentMonth = () => {
    setDate(new Date());
  };

  const currentMonthName = format(date, "MMMM 'de' yyyy", { locale: ptBR });
  const isCurrentMonth = format(date, "yyyy-MM") === format(new Date(), "yyyy-MM");

  return (
    <div className="flex items-center gap-2">
      {/* Botão Anterior */}
      <Button
        variant="outline"
        size="sm"
        onClick={goToPreviousMonth}
        className="h-8 w-8 p-0 border-neutral-700 hover:bg-neutral-700/50 hover:border-neutral-600 text-neutral-300"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {/* Período Atual */}
      <div className="flex items-center gap-2 px-3 py-2 bg-neutral-800/60 rounded-lg border border-neutral-700/50 shadow-sm min-w-[140px] justify-center">
        <Calendar className="w-4 h-4 text-neutral-300" />
        <span className="text-neutral-200 text-sm capitalize font-medium">{currentMonthName}</span>
      </div>

      {/* Botão Próximo */}
      <Button
        variant="outline"
        size="sm"
        onClick={goToNextMonth}
        className="h-8 w-8 p-0 border-neutral-700 hover:bg-neutral-700/50 hover:border-neutral-600 text-neutral-300"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>

      {/* Botão Hoje */}
      <Button
        variant="outline"
        size="sm"
        onClick={goToCurrentMonth}
        disabled={isCurrentMonth}
        className={`h-8 px-3 text-xs border-neutral-700 hover:bg-neutral-700/50 hover:border-neutral-600 text-neutral-300 ${
          isCurrentMonth ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        Hoje
      </Button>
    </div>
  );
}; 