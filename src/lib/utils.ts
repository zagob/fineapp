import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function transformToCents(value: string) {
  return Number(value.replace("R$", "").replace(",", ".").trim()) * 100;
}

export function transformToCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value / 100);
}

export function getFirstAndLastDayOfMonth(date: Date) {
  const firstDayOfLastMonth = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), 1, 0, 0, 0)
  );
  const lastDayOfLastMonth = new Date(
    Date.UTC(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)
  );

  return {
    firstDayOfLastMonth,
    lastDayOfLastMonth,
  };
}
