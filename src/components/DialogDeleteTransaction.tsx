"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import * as LucideIcon from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTransaction } from "@/actions/transactions.actions";
import { Loading } from "./Loading";
import { useState } from "react";

interface DialogDeleteTransactionProps {
  id: string;
}

export const DialogDeleteTransaction = ({
  id,
}: DialogDeleteTransactionProps) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutate: handleDelete, isPending } = useMutation({
    mutationFn: async () => await deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["transactions"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["banks"],
        exact: false,
      });

      setOpen(false)
    },
  });

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div>
            <Button
              size="sm"
              variant="dark"
            >
              <LucideIcon.Trash className="size-3 text-neutral-500" />
            </Button>
          </div>
        </DialogTrigger>
        <DialogContent className="bg-zinc-800 border-zinc-700">
          <DialogHeader>
            <DialogTitle>Deseja remover essa transação?</DialogTitle>
            <DialogDescription asChild>
              <div className="p-4 pb-0 flex justify-center items-center gap-2">
                <Button disabled={isPending} onClick={() => setOpen(false)}>
                  Nâo
                </Button>
                <Button variant="destructive" disabled={isPending} onClick={() => handleDelete()}>
                  {isPending ? <Loading /> : "Sim"}
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};
