"use client";

import { exportTransctions } from "@/actions/transactions.actions";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDateStore } from "@/store";
import { useMutation } from "@tanstack/react-query";
import { FileDown } from "lucide-react";

export const ExportTransactions = () => {
  const date = useDateStore((state) => state.date);

  const { mutate } = useMutation({
    mutationFn: async () => {
      const csvBase64 = await exportTransctions(date);

      console.log("filePath", csvBase64);

      if (!csvBase64) return;

      const csvBlob = new Blob([atob(csvBase64 as string)], {
        type: "text/csv",
      });
      const url = URL.createObjectURL(csvBlob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "transacoes.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    },
  });

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button onClick={() => mutate()} variant="dark" size="sm">
            <FileDown className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Exportar transações</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
