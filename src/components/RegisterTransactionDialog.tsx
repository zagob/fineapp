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
import { FormEvent, ForwardRefExoticComponent, useState } from "react";
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
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/actions/categories.actions";

interface RegisterTransactionDialogProps {
  type: "INCOME" | "EXPENSE";
}

const formSchema = z.object({
  date: z.date(),
  bank: z.string(),
  categories: z.string(),
  description: z.string(),
  value: z.string(),
});

type FormSchemaProps = z.infer<typeof formSchema>;

export const RegisterTransactionDialog = ({
  type,
}: RegisterTransactionDialogProps) => {
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => await getCategories(),
  });

  const [openDialogCreateCategory, setOpenDialogCreateCategory] =
    useState(false);
  const form = useForm<FormSchemaProps>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categories: "",
      date: new Date(),
    },
  });
  const [date, setDate] = useState<Date>();

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

  console.log({ categories });

  return (
    <>
      <RegisterCategory
        open={openDialogCreateCategory}
        setOpen={setOpenDialogCreateCategory}
        type={type}
      />

      <Dialog>
        <DialogTrigger asChild>
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
        </DialogTrigger>
        <DialogContent className="bg-zinc-800 border-zinc-700">
          <DialogHeader>
            <DialogTitle>Add {type}</DialogTitle>
            <DialogDescription asChild>
              <Form {...form}>
                <form
                  id="register-transaction-form"
                  onSubmit={form.handleSubmit(handleSubmitForm)}
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
                          onSelect={setDate}
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
                                  <SelectItem value="bank1">Bank1</SelectItem>
                                  <SelectItem value="bank2">Bank2</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="flex items-end gap-1">
                        <FormField
                          control={form.control}
                          name="categories"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Categories:</FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <SelectTrigger className="w-full dark:text-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-900 dark:border-neutral-700">
                                    <SelectValue placeholder="Select a category" />
                                  </SelectTrigger>
                                  <SelectContent className="dark:bg-neutral-400 border-none">
                                    {categories?.map((category) => {
                                      const IconName =
                                        LucideIcon[
                                          category.icon as keyof typeof LucideIcon
                                        ] as ForwardRefExoticComponent<Omit<LucideIcon.LucideProps, "ref">>;

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
                                onInput={handleOnInput}
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button type="submit" form="register-transaction-form">
                    Register Transaction
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
