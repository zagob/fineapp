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
import React, { FormEvent, ForwardRefExoticComponent, useState } from "react";
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
import { Textarea } from "./ui/textarea";
import { RegisterCategory } from "./RegisterCategory";
import * as LucideIcon from "lucide-react";
import { PlusIcon } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCategories } from "@/actions/categories.actions";
import { getBanks } from "@/actions/banks.actions";
import { createTransaction } from "@/actions/transactions.actions";
import { Loading } from "./Loading";

interface RegisterTransactionDialogProps {
  actions?: "COPY";
  type: "INCOME" | "EXPENSE";
  datetime?: Date;
  bankId?: string;
  category?: string;
  description?: string;
  value?: string;
}

const formSchema = z.object({
  date: z.date(),
  bank: z.string(),
  category: z.string(),
  description: z.string().optional(),
  value: z.string(),
});

export type FormSchemaProps = z.infer<typeof formSchema>;

export const RegisterTransactionDialog = ({
  actions,
  type = "EXPENSE",
  bankId,
  category,
  description,
  value,
  datetime,
}: RegisterTransactionDialogProps) => {
  const queryClient = useQueryClient();

  const { data: banks } = useQuery({
    queryKey: ["banks"],
    queryFn: async () => await getBanks(),
    staleTime: 1000,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories", type],
    queryFn: async () => await getCategories({ type }),
  });

  const [openDialogCreateCategory, setOpenDialogCreateCategory] =
    useState(false);
  const form = useForm<FormSchemaProps>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: datetime ? new Date(datetime) : new Date(),
      bank: bankId ?? "",
      category: category ?? "",
      description: description ?? "",
      value: value ?? "",
    },
  });
  const [date, setDate] = useState<Date>(() =>
    datetime ? new Date(datetime) : new Date()
  );

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
      bank,
      category,
      date,
      value,
      description,
    }: FormSchemaProps) =>
      await createTransaction({
        bank,
        category,
        type,
        date,
        value,
        description,
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
      <RegisterCategory
        open={openDialogCreateCategory}
        setOpen={setOpenDialogCreateCategory}
        type={type}
      />

      <Dialog>
        <DialogTrigger asChild>
          <div>
            {actions === undefined ? (
              <React.Fragment>
                {type === "INCOME" ? (
                  <Button
                    variant="outline"
                    className="dark:bg-green-300 dark:hover:bg-green-200 dark:hover:text-green-950 dark:border-green-200 dark:text-green-950"
                  >
                    Income
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="dark:bg-red-400 dark:hover:bg-red-300 dark:hover:text-red-50 dark:border-red-300 dark:text-red-50 "
                  >
                    Expense
                  </Button>
                )}
              </React.Fragment>
            ) : (
              <>
                {actions === "COPY" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="dark:bg-transparent dark:border-neutral-700"
                  >
                    <LucideIcon.Copy className="size-3" />
                  </Button>
                )}
              </>
            )}
          </div>
        </DialogTrigger>
        <DialogContent className="bg-zinc-800 border-zinc-700">
          <DialogHeader>
            <DialogTitle>Add {type}</DialogTitle>
            <DialogDescription asChild>
              <Form {...form}>
                <form
                  id="register-transaction-form"
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
                        name="bank"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bank:</FormLabel>
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

                      <div className="flex items-end gap-1">
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Categories:</FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <SelectTrigger
                                    disabled={categories?.length === 0}
                                    className="w-full dark:text-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-900 dark:border-neutral-700"
                                  >
                                    <SelectValue placeholder="Select a category" />
                                  </SelectTrigger>
                                  <SelectContent className="dark:bg-neutral-400 border-none">
                                    {categories?.map((category) => {
                                      const IconName = LucideIcon[
                                        category.icon as keyof typeof LucideIcon
                                      ] as ForwardRefExoticComponent<
                                        Omit<LucideIcon.LucideProps, "ref">
                                      >;

                                      return (
                                        <SelectItem
                                          key={category.id}
                                          value={category.id}
                                          className="flex items-center gap-2"
                                        >
                                          <div
                                            className="size-6 rounded-full flex items-center justify-center"
                                            style={{
                                              backgroundColor: category.color,
                                            }}
                                          >
                                            {category.icon && IconName && (
                                              <IconName className="size-3 text-white" />
                                            )}
                                          </div>
                                          {category.name}
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <Button
                          type="button"
                          className="border dark:border-neutral-700"
                          onClick={() => setOpenDialogCreateCategory(true)}
                        >
                          <PlusIcon />
                        </Button>
                      </div>

                      <FormField
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
                      />

                      <FormField
                        control={form.control}
                        name="value"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price:</FormLabel>
                            <FormControl>
                              <Input
                                className="dark:bg-neutral-900 dark:border-neutral-700"
                                placeholder="R$10,00"
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
                    form="register-transaction-form"
                  >
                    {isPending ? <Loading /> : "Register Transaction"}
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
