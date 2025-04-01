"use client";

import { transformToCurrency } from "@/lib/utils";
import { $Enums } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";

export type Transaction = {
  id: string;
  value: number;
  type: $Enums.Type;
  date: Date;
  description: string | null;
  userId: string;
  accountBanksId: string;
  categoryId: string;
  bank: {
    bank: string
    id: string
  }
  category: {
    name: string
    id: string
    color: string
    icon: string
  }
};

export const columns: ColumnDef<Transaction>[] = [
  {
    header: "Date",
    cell: ({ row }) => (
      <span>
        {row.original.date.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })}
      </span>
    ),
  },
  {
    header: "Bank",
    cell: ({ row }) => <span>{row.original.bank.bank}</span>,
  },
  {
    header: "Type",
    accessorKey: "type",
  },
  {
    header: "Category",
    cell: ({ row }) => <span>{row.original.category.name}</span>,
  },
  {
    header: "Value",
    cell: ({ row }) => transformToCurrency(row.original.value),
  },
];
