"use client";

import { transformToCurrency } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ImageBank } from "./ImageBank";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { UpdatedTransfer } from "./UpdatedTransfer";
import { DeleteTransfer } from "./DeleteTransfer";

export type TransferProps = {
  id: string;
  date: Date;
  bankInitial: {
    id: string;
    bank: BankNamesProps;
  };
  bankDestine: {
    id: string;
    bank: BankNamesProps;
  };
  value: number;
};

export const columnsTransfer: ColumnDef<TransferProps>[] = [
  {
    accessorKey: "date",
    header: "Data",
    cell: ({ row }) => (
      <div>{format(new Date(row.original.date), "dd/MM/yyyy")}</div>
    ),
  },
  {
    header: "Saída do Banco",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <ImageBank
          height={20}
          width={20}
          bank={row.original.bankInitial.bank}
        />
      </div>
    ),
  },
  {
    header: "Entrada no Banco",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <ImageBank
          height={20}
          width={20}
          bank={row.original.bankDestine.bank}
        />
      </div>
    ),
  },
  {
    header: "Valor",
    cell: ({ row }) => <div>{transformToCurrency(row.original.value)}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 justify-end">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <UpdatedTransfer 
                  id={row.original.id}
                  value={transformToCurrency(row.original.value)}
                  date={row.original.date}
                  bankInitial={row.original.bankInitial.id}
                  bankDestine={row.original.bankDestine.id}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>Atualizar transação</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DeleteTransfer id={row.original.id} />
              </TooltipTrigger>
              <TooltipContent>
                <p>Deletar transação</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
    ),
  }
];
