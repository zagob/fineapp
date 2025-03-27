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
import { FormEvent } from "react";
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

const formSchema = z.object({
  bank: z.string(),
  typeaccount: z.string(),
  value: z.string(),
});

type FormSchemaProps = z.infer<typeof formSchema>;

export const RegisterAccountBank = () => {
  const form = useForm<FormSchemaProps>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bank: "Itau",
      typeaccount: "Poupança",
      value: "",
    },
  });

  const handleSubmitForm = (values: FormSchemaProps) => {
    console.log(values);
  };

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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full dark:bg-neutral-700 dark:border-neutral-600"
        >
          Add Bank
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-800 border-zinc-700 w-[300px]">
        <DialogHeader>
          <DialogTitle>Registrar Banco</DialogTitle>
          <DialogDescription asChild>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmitForm)}
                className="flex flex-col items-center gap-2"
              >
                <div className="flex gap-4">
                  <div className="flex flex-col gap-4">
                    <FormField
                      control={form.control}
                      name="bank"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Bank:</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger className="dark:text-neutral-200 w-full dark:hover:bg-neutral-900 dark:bg-neutral-900 dark:border-neutral-700">
                                <SelectValue placeholder="Select a bank" />
                              </SelectTrigger>
                              <SelectContent className="dark:bg-neutral-400 border-none">
                                <SelectItem value="bank1">Bank1</SelectItem>
                                <SelectItem value="bank2">Bank2</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="typeaccount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type account:</FormLabel>
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
                      name="value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Value:</FormLabel>
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
                  </div>
                </div>

                <Button type="submit">Register Bank</Button>
              </form>
            </Form>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
