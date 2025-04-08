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
import React, { FormEvent } from "react";
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
import { useDateStore } from "@/store";
import { createTransfer } from "@/actions/transfers.actions";
import { PlusCircle } from "lucide-react";
import { CalendarInput } from "./CalendarInput";
import { FieldSelectBanks } from "./FieldSelectBanks";
import { toast } from "sonner";

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

export const RegisterTransfer = () => {
  const dateTimeStore = useDateStore((state) => state.date);

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
      date: dateTimeStore,
      bankInitial: "",
      bankDestine: "",
      value: "",
    },
  });

  const handleOnInput = (event: FormEvent<HTMLInputElement>) => {
    const input = event.target as HTMLInputElement;
    const rawValue = input.value.replace(/\D/g, "");

    if (!rawValue) return;

    const formattedValue = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(parseFloat(rawValue) / 100);

    input.value = formattedValue;
  };

  const { mutate: handleSubmitForm, isPending } = useMutation({
    mutationFn: async ({
      bankInitial,
      bankDestine,
      date,
      value,
    }: FormSchemaProps) => {
      console.log("create", {
        bankInitial,
        bankDestine,
        date,
        value,
      });
      await createTransfer({
        bankInitial,
        bankDestine,
        date,
        value,
      });
    },
    onSuccess: () => {
      toast.success("Transferência criada com sucesso!");
      form.reset();
      queryClient.invalidateQueries({
        queryKey: ["transactions"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["banks"],
        exact: false,
      });
    },
  });

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="dark" size="sm">
            <PlusCircle className="mr-2" />
            Adicionar Transferência
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
                                value={field.value ?? ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button disabled={isPending} type="submit">
                    {isPending ? <Loading /> : "Registrar Transferência"}
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
