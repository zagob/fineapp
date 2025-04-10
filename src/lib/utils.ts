import { clsx, type ClassValue } from "clsx";
import { Readable } from "node:stream";
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

export async function streamToArray<T>(stream: Readable): Promise<T[]> {
  return new Promise((resolve, reject) => {
    let data = "";

    stream.on("data", (chunk) => {
      data += chunk.toString();
    });

    stream.on("end", () => {
      try {
        const arrayData: T[] = JSON.parse(data); // Se for JSON
        resolve(arrayData);
      } catch (error) {
        console.log(error)
        reject(new Error("Erro ao converter o Stream para array."));
      }
    });

    stream.on("error", (error) => reject(error));
  });
}