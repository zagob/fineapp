"use client";

import { cn, transformToCurrency } from "@/lib/utils";
import { ICONS_CATEGORIES_EXPENSE } from "@/variants/iconsCategories";
import { $Enums } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { RegisterTransactionDialog } from "./RegisterTransactionDialog";
import { DialogDeleteTransaction } from "./DeleteTransaction";
import { ImageBank } from "./ImageBank";

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
    bank: BankNamesProps;
    id: string;
  };
  category: {
    name: string;
    id: string;
    color: string;
    icon: string;
  };
};

export const columns: ColumnDef<Transaction>[] = [
  {
    header: "Data",
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
    header: "Banco",
    cell: ({ row }) => (
      <ImageBank bank={row.original.bank.bank} width={28} height={28} />
    ),
  },
  {
    header: "Tipo",
    accessorKey: "type",
    cell: ({ row }) => {
      return (
        <span
          className={cn(
            "rounded px-2 text-sm font-semibold backdrop-blur-sm bg-opacity-10 text-white",
            row.original.type === "EXPENSE" ? "bg-red-500" : "bg-green-600"
          )}
        >
          {row.original.type === "EXPENSE" ? "Saída" : "Entrada"}
        </span>
      );
    },
  },
  {
    header: "Categoria",
    cell: ({ row }) => {
      const IconComponent =
        ICONS_CATEGORIES_EXPENSE[
          row.original.category.icon as keyof typeof ICONS_CATEGORIES_EXPENSE
        ];

      return (
        <div className="flex items-center gap-2">
          <div className="flex gap-2 items-center">
            <div
              className={cn(
                "bg-neutral-800 border border-neutral-600 rounded-full size-5 flex items-center justify-center"
              )}
              style={{ backgroundColor: row.original.category.color }}
            >
              <IconComponent className="size-3 text-white" />
            </div>
          </div>
          <span>{row.original.category.name}</span>
        </div>
      );
    },
  },
  {
    header: 'Descrição',
    cell: ({ row }) => {
      return (
        <span className="text-sm text-neutral-400">
          {row.original.description ?? ""}
        </span>
      );
    }
  },
  {
    header: "Valor",
    cell: ({ row }) => transformToCurrency(row.original.value),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2 justify-end">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <RegisterTransactionDialog
                  type={row.original.type}
                  actions="COPY"
                  bankId={row.original.bank.id}
                  category={row.original.category.id}
                  description={row.original.description ?? ""}
                  value={transformToCurrency(row.original.value)}
                  datetime={row.original.date}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>Copiar transação</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DialogDeleteTransaction id={row.original.id} />
        </div>
      );
    },
  },
];
