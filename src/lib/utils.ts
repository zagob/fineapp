import { clsx, type ClassValue } from "clsx";
import { FormEvent } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function transformToCents(value: string) {
  return Number(value.replace(/[^0-9,]/g, "").replace(",", ".")) * 100;
}

export function transformToCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value / 100);
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatYear(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    year: "numeric",
  }).format(date);
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

export const handleOnInput = (event: FormEvent<HTMLInputElement>) => {
  const input = event.target as HTMLInputElement;
  const rawValue = input.value.replace(/\D/g, "");

  if (!rawValue) return;

  const formattedValue = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(parseFloat(rawValue) / 100);

  input.value = formattedValue;
};
