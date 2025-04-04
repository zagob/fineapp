"use client";

import { ColumnDef } from "@tanstack/react-table";

export type TransferProps = {
  id: string;
};

export const columnsTransfer: ColumnDef<TransferProps>[] = [
  {
    id: 'date'
  }
];
