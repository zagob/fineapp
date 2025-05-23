"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
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
import * as LucideIcon from "lucide-react";
import COLORS from "@/variants/colorCategories";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCategory } from "@/actions/categories.actions";
import { toast } from "sonner";
import { InputIconCategory, IconProps } from "./InputIconCategory";

const formSchema = z.object({
  name: z.string(),
  icon: z.string(),
  color: z.string(),
  value: z.string(),
});

type FormSchemaProps = z.infer<typeof formSchema>;

interface RegisterCategoryProps {
  type: "INCOME" | "EXPENSE";
  action?: "CREATED" | "EDITED";
  defaultValues?: FormSchemaProps;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const RegisterCategory = ({
  action = "CREATED",
  defaultValues,
  type,
  open,
  setOpen,
}: RegisterCategoryProps) => {
  const queryClient = useQueryClient();

  const form = useForm<FormSchemaProps>({
    resolver: zodResolver(formSchema),
    defaultValues:
      action === "EDITED"
        ? defaultValues
        : {
            name: "",
            icon: "",
            color: "",
            value: "",
          },
  });

  const { mutate: handleSubmitForm, isPending } = useMutation({
    mutationFn: async (data: FormSchemaProps) => {
      await createCategory({
        ...data,
        typeaccount: type,
      });
    },
    onSuccess: () => {
      toast.success("Categoria criada com sucesso!");
      queryClient.invalidateQueries({
        queryKey: ["categories", type],
        exact: true,
      });
      setOpen(false);
    },
  });

  const IconSelected = LucideIcon[
    form.watch("icon") as keyof typeof LucideIcon
  ] as React.ElementType;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-zinc-800 border-zinc-700 w-[300px]">
        <DialogHeader>
          <DialogTitle>Categoria</DialogTitle>
          <DialogDescription asChild>
            <Form {...form}>
              <form
                id="createCategory"
                onSubmit={form.handleSubmit((data) => handleSubmitForm(data))}
                className="flex flex-col items-center gap-2"
              >
                <div className="flex gap-4 w-full">
                  <div className="flex flex-col gap-4 w-full">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name:</FormLabel>
                          <FormControl>
                            <Input
                              className="dark:bg-neutral-900 dark:border-neutral-700"
                              placeholder="Mercado, Farmacia, etc..."
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="icon"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Icon:</FormLabel>
                            <FormControl>
                              <InputIconCategory
                                value={field.value as IconProps}
                                onChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Color:</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <SelectTrigger
                                  style={{
                                    backgroundColor: field.value,
                                  }}
                                  className="dark:text-neutral-200 w-full dark:hover:bg-neutral-900 dark:bg-neutral-900 dark:border-neutral-700"
                                >
                                  <SelectValue placeholder="color" />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-neutral-200 border-none">
                                  {Object.entries(COLORS)
                                    .flatMap(([, shades]) =>
                                      Object.values(shades)
                                    )
                                    .map((color) => (
                                      <SelectItem
                                        key={color}
                                        value={color}
                                        style={{ backgroundColor: color }}
                                        className="my-px h-6 aria-selected:text-white"
                                      />
                                    ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    {form.watch("color") &&
                      form.watch("icon") &&
                      form.watch("name") && (
                        <div className="flex items-center gap-4 justify-start w-full">
                          <div className="flex items-center gap-2">
                            <div
                              className="size-8 flex items-center justify-center rounded-full border border-zinc-700"
                              style={{
                                backgroundColor: form.watch("color"),
                              }}
                            >
                              <IconSelected className="text-zinc-200 size-4" />
                            </div>
                            <p className="text-md text-zinc-300">
                              {form.watch("name")}
                            </p>
                          </div>
                        </div>
                      )}
                    <Button
                      disabled={isPending}
                      className="w-full"
                      type="submit"
                      form="createCategory"
                    >
                      {isPending ? (
                        <LucideIcon.Loader2 className="mr-2 animate-spin" />
                      ) : (
                        <>
                          {action === "EDITED"
                            ? "Editar Categoria"
                            : "Criar Categoria"}
                        </>
                      )}
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
