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
import {
  createTransaction,
  updatedTransaction,
} from "@/actions/transactions.actions";
import { Loading } from "./Loading";
import { CalendarInput } from "./CalendarInput";
import { FieldSelectBanks } from "./FieldSelectBanks";

interface RegisterTransactionDialogProps {
  transactionId?: string;
  actions?: "COPY" | "EDIT";
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
  transactionId,
  actions,
  type = "EXPENSE",
  bankId,
  category,
  description,
  value,
  datetime,
}: RegisterTransactionDialogProps) => {
  console.log(datetime);
  const [isOpen, setIsOpen] = useState<boolean>(false);
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
      date: new Date("26/03/2025"),
      bank: bankId ?? "",
      category: category ?? "",
      description: description ?? "",
      value: value ?? "",
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
      bank,
      category,
      date,
      value,
      description,
    }: FormSchemaProps) => {
      if (actions === "EDIT") {
        await updatedTransaction({
          transactionId: transactionId!,
          bank,
          category,
          type,
          date,
          value,
          description,
        });
        return;
      }

      await createTransaction({
        bank,
        category,
        type,
        date,
        value,
        description,
      });
    },
    onSuccess: () => {
      form.reset();
      queryClient.invalidateQueries({
        queryKey: ["banks"],
        exact: true,
      });
      queryClient.invalidateQueries({
        queryKey: ["transactions"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["transactions-type"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["transactions-categories"],
        exact: false,
      });
      setIsOpen(false);
    },
  });

  return (
    <>
      <RegisterCategory
        open={openDialogCreateCategory}
        setOpen={setOpenDialogCreateCategory}
        type={type}
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div>
            {actions === undefined ? (
              <React.Fragment>
                {type === "INCOME" ? (
                  <Button
                    variant="dark"
                    size="sm"
                    className="flex cursor-pointer items-center justify-center shadow-xl dark:bg-emerald-900 dark:border-emerald-800 dark:hover:bg-emerald-800"
                  >
                    <LucideIcon.Banknote className="size-5" />
                    Entrada
                  </Button>
                ) : (
                  <Button
                    variant="dark"
                    size="sm"
                    className="flex cursor-pointer items-center justify-center shadow-xl dark:bg-red-900 dark:border-red-800 dark:hover:bg-red-800"
                  >
                    <LucideIcon.Banknote className="size-5" />
                    Saída
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

                {actions === "EDIT" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="dark:bg-transparent dark:border-neutral-700"
                  >
                    <LucideIcon.Edit className="size-3" />
                  </Button>
                )}
              </>
            )}
          </div>
        </DialogTrigger>
        <DialogContent className="bg-zinc-800 border-zinc-700">
          <DialogHeader>
            <DialogTitle className="text-center mb-2">
              {actions === "EDIT" ? "Editar " : "Adicionar "}
              {type === "EXPENSE" ? "Saída" : "Entrada"}
            </DialogTitle>
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
                    <CalendarInput name="date" control={form.control} />

                    <div className="flex flex-col gap-4">
                      <FieldSelectBanks
                        name="bank"
                        control={form.control}
                        banks={
                          banks?.banks.map((bank) => ({
                            id: bank.id,
                            name: bank.bank,
                          })) ?? []
                        }
                        label="Banco"
                      />

                      <div className="flex items-end gap-1">
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Categorias:</FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <SelectTrigger
                                    disabled={categories?.length === 0}
                                    className="w-[150px] dark:text-neutral-200 dark:text-ellipsis dark:hover:bg-neutral-900 dark:bg-neutral-900 dark:border-neutral-700"
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
                                            className="size-6 min-h-6 min-w-6 rounded-full flex items-center justify-center"
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
                            <FormLabel>Descrição:</FormLabel>
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
                            <FormLabel>Preço:</FormLabel>
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
                    {isPending && <Loading />}
                    {actions === "EDIT" ? "Atualizar " : "Adicionar "}
                    Transação
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
