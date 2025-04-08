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
import { FormEvent, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBank } from "@/actions/banks.actions";
import { transformToCents } from "@/lib/utils";
import { Loading } from "./Loading";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import Image from "next/image";
import { bankIcons } from "@/variants/accountBanks";

const banks = [
  "BANCO_DO_BRASIL",
  "ITAU",
  "ITI",
  "PICPAY",
  "NUBANK",
  "BRADESCO",
  "SANTANDER",
  "CAIXA",
  "INTER",
  "C6",
] as const;

const formSchema = z.object({
  bank: z.enum(banks),
  description: z.string(),
  amount: z.string(),
});

type FormSchemaProps = z.infer<typeof formSchema>;

export const RegisterAccountBank = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<FormSchemaProps>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bank: "ITAU",
      description: "Poupança",
      amount: "",
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
    mutationFn: async ({ bank, description, amount }: FormSchemaProps) => {
      return await createBank({
        bank,
        description,
        amount: transformToCents(amount),
      });
    },
    onSuccess: (data) => {
      console.log("data", data);

      if (!data) return toast.error("Erro ao criar banco");

      toast.success("Banco criado com sucesso!");

      queryClient.invalidateQueries({
        queryKey: ["banks"],
      });
      setIsOpen(false);
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex w-full cursor-pointer flex-col leading-0 items-center justify-center min-h-full">
          <Plus className="size-8 text-zinc-600 " strokeWidth={1} />
          {/* <span className="text-zinc-600">Adicionar primeiro banco</span> */}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-800 border-zinc-700 w-[300px]">
        <DialogHeader>
          <DialogTitle>Registrar Banco</DialogTitle>
          <DialogDescription asChild>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((values) =>
                  handleSubmitForm(values)
                )}
                className="flex flex-col items-center gap-2"
              >
                <div className="flex gap-4 w-full">
                  <div className="flex flex-col gap-4 w-full">
                    <FormField
                      control={form.control}
                      name="bank"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome:</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger className="dark:text-neutral-200 w-full dark:hover:bg-neutral-900 dark:bg-neutral-900 dark:border-neutral-700">
                                <SelectValue placeholder="Select a bank" />
                              </SelectTrigger>
                              <SelectContent className="dark:bg-neutral-400 border-none">
                                {banks.map((bank) => (
                                  <SelectItem key={bank} value={bank}>
                                    <Image
                                      src={
                                        bankIcons[bank] ||
                                        "../assets/icons/default.svg"
                                      }
                                      alt={bank}
                                      width={20}
                                      height={20}
                                      className="rounded-sm"
                                    />
                                    {bank}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo:</FormLabel>
                          <FormControl>
                            <Input
                              className="dark:bg-neutral-900 dark:border-neutral-700"
                              placeholder="Débit"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor:</FormLabel>
                          <FormControl>
                            <Input
                              className="dark:bg-neutral-900 dark:border-neutral-700"
                              placeholder="R$1.000,00"
                              onInput={handleOnInput}
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <Button
                      disabled={isPending}
                      type="submit"
                      className="w-full"
                      size="lg"
                    >
                      {isPending ? <Loading /> : "Criar"}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
