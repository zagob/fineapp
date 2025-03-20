"use client"

import { ColumnDef } from "@tanstack/react-table";

export type Transaction = {
  id: string;
  date: string;
  bank: string;
  type: "income" | "expense";
  description: string;
  value: number;
};

export const columns: ColumnDef<Transaction>[] = [
  {
    header: "Date",
    cell: ({ row }) => row.original.date,
  },
  {
    header: "Bank",
    accessorKey: "bank",
  },
  {
    header: "Type",
    accessorKey: "type",
  },
  {
    header: "Value",
    cell: ({ row }) => row.original.value,
  },
];
