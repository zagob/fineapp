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
import { Input } from "./ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getBanks } from "@/actions/banks.actions";
import { Loading } from "./Loading";
import { Edit } from "lucide-react";
import { CalendarInput } from "./CalendarInput";
import { FieldSelectBanks } from "./FieldSelectBanks";
import { toast } from "sonner";
import { handleOnInput } from "@/lib/utils";
import { updateTransfer } from "@/actions/transfers.actions";

const formSchema = z
  .object({
    date: z.date({ message: "É necessário uma data" }),
    bankInitial: z.string({ message: "É necessário um banco" }),
    bankDestine: z.string({ message: "É necessário um banco" }),
    value: z.string({ message: "É necessário um valor" }),
  })
  .refine((data) => data.bankInitial !== data.bankDestine, {
    message: "Os bancos precisam ser diferentes",
    path: ["bankDestine"],
  });

export type FormSchemaProps = z.infer<typeof formSchema>;

interface UpdatedTransferProps extends FormSchemaProps {
  id: string;
}

export const UpdatedTransfer = ({
  id,
  date,
  bankInitial,
  bankDestine,
  value,
}: UpdatedTransferProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: banks } = useQuery({
    queryKey: ["banks"],
    queryFn: async () => await getBanks(),
    staleTime: 1000,
  });

  const banksName =
    banks?.banks.map((bank) => ({
      id: bank.id,
      name: bank.bank,
    })) ?? [];

  const form = useForm<FormSchemaProps>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date,
      bankInitial,
      bankDestine,
      value,
    },
  });

  const { mutate: handleSubmitForm, isPending } = useMutation({
    mutationFn: async ({
      bankInitial,
      bankDestine,
      date,
      value,
    }: FormSchemaProps) => {
      await updateTransfer({
        id,
        bankInitial,
        bankDestine,
        date,
        value,
      });
    },
    onSuccess: () => {
      toast.success("Transferência atualizada com sucesso!");
      form.reset();
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
          <Button
            size="sm"
            variant="outline"
            className="dark:bg-transparent dark:border-neutral-700"
          >
            <Edit className="size-3" />
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-zinc-800 border-zinc-700">
          <DialogHeader>
            <DialogTitle>Transferência</DialogTitle>
            <DialogDescription asChild>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((values) =>
                    handleSubmitForm(values)
                  )}
                  className="flex flex-col gap-2"
                >
                  <div className="flex gap-4">
                    <CalendarInput name="date" control={form.control} />

                    <div className="flex flex-col gap-4">
                      <FieldSelectBanks
                        name="bankInitial"
                        label="Banco Saída"
                        control={form.control}
                        banks={banksName}
                      />

                      <FieldSelectBanks
                        name="bankDestine"
                        label="Banco Destino"
                        control={form.control}
                        banks={banksName}
                      />

                      <FormField
                        control={form.control}
                        name="value"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount:</FormLabel>
                            <FormControl>
                              <Input
                                className="dark:bg-neutral-900 dark:border-neutral-700"
                                placeholder="R$1.000,00"
                                onChange={(e) => {
                                  handleOnInput(e);
                                  field.onChange(e);
                                }}
                                value={field.value}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button disabled={isPending} type="submit">
                    {isPending ? <Loading /> : "Atualizar Transferência"}
                  </Button>
                </form>
              </Form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};
