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
import { Calendar } from "./ui/calendar";
import React, { FormEvent, useState } from "react";
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
// import { Textarea } from "./ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { getCategories } from "@/actions/categories.actions";
import { getBanks } from "@/actions/banks.actions";
import { Loading } from "./Loading";
import { useDateStore } from "@/store";
import { createTransfer } from "@/actions/transfers.actions";
// import { BANKS } from "@/variants/accountBanks";
import { PlusCircle } from "lucide-react";

const formSchema = z.object({
  date: z.date(),
  bankInitial: z.string(),
  bankDestine: z.string(),
  // description: z.string().optional(),
  value: z.string(),
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

  const form = useForm<FormSchemaProps>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: dateTimeStore,
      bankInitial: "",
      bankDestine: "",
      // description: "",
      value: "",
    }
  });

  console.log(form.formState.errors)

  const [date, setDate] = useState<Date>(dateTimeStore);

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
    }: FormSchemaProps) =>
      await createTransfer({
        bankInitial,
        bankDestine,
        date,
        value,
      }),
    onSuccess: () => {
      form.reset();
      queryClient.invalidateQueries({
        queryKey: ["transactions"],
        exact: false,
      });
    },
  });

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-2" />
            Add Transfer
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-zinc-800 border-zinc-700">
          <DialogHeader>
            <DialogTitle>Add Transfer</DialogTitle>
            <DialogDescription asChild>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((values) =>
                    handleSubmitForm(values)
                  )}
                  className="flex flex-col gap-2"
                >
                  <div className="flex gap-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <Calendar
                          mode="single"
                          disableNavigation
                          selected={date}
                          onSelect={(selectedDate: Date | undefined) =>
                            setDate(selectedDate ?? new Date())
                          }
                          className="rounded-md mx-auto border border-neutral-700 text-center"
                          {...field}
                        />
                      )}
                    />

                    <div className="flex flex-col gap-4">
                      <FormField
                        control={form.control}
                        name="bankInitial"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bank Initial:</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <SelectTrigger className="dark:text-neutral-200 w-full dark:hover:bg-neutral-900 dark:bg-neutral-900 dark:border-neutral-700">
                                  <SelectValue placeholder="Select a bank" />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-neutral-400 border-none">
                                  {banks?.banks.map((bank) => {
                                    return (
                                      <SelectItem key={bank.id} value={bank.id}>
                                        {bank.bank}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bankDestine"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bank Destine:</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <SelectTrigger className="dark:text-neutral-200 w-full dark:hover:bg-neutral-900 dark:bg-neutral-900 dark:border-neutral-700">
                                  <SelectValue placeholder="Select a bank" />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-neutral-400 border-none">
                                  {banks?.banks.map((bank) => {
                                    return (
                                      <SelectItem key={bank.id} value={bank.id}>
                                        {bank.bank}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {/* <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description:</FormLabel>
                            <FormControl>
                              <Textarea
                                className="resize-none dark:bg-neutral-900 dark:border-neutral-700"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      /> */}

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
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button
                    disabled={isPending}
                    type="submit"
                  >
                    {isPending ? <Loading /> : "Register Transfer"}
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
