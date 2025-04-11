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
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loading } from "./Loading";
import { Trash } from "lucide-react";
import { toast } from "sonner";
import { deleteTransfer } from "@/actions/transfers.actions";

interface DeleteTransferProps {
  id: string;
}

export const DeleteTransfer = ({
  id,
}: DeleteTransferProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutate: handleDelete, isPending } = useMutation({
    mutationFn: async () => {
      await deleteTransfer(id);
    },
    onSuccess: () => {
      toast.success("Transferência deletada com sucesso!");
      queryClient.invalidateQueries({
        queryKey: ["transactions"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["banks"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["transfers"],
        exact: false,
      });
      setIsOpen(false);
    },
  });

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="dark" size="sm">
            <Trash />
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-zinc-800 border-zinc-700">
          <DialogHeader>
            <DialogTitle>Deseja deletar a Transferência?</DialogTitle>
            <DialogDescription asChild>
            <div className="p-4 pb-0 flex justify-center items-center gap-2">
                <Button disabled={isPending} onClick={() => setIsOpen(false)}>
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
