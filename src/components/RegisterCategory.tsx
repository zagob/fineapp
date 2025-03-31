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
import { PlusIcon } from "lucide-react";
import * as LucideIcon from "lucide-react";
import { ICONS_CATEGORIES_EXPENSE } from "@/variants/iconsCategories";
import COLORS from "@/variants/colorCategories";

const iconNames = Object.keys(
  ICONS_CATEGORIES_EXPENSE
) as (keyof typeof ICONS_CATEGORIES_EXPENSE)[];

const formSchema = z.object({
  name: z.string(),
  icon: z.string(),
  color: z.string(),
  typeaccount: z.string(),
  value: z.string(),
});

type FormSchemaProps = z.infer<typeof formSchema>;

export const RegisterCategory = () => {
  const form = useForm<FormSchemaProps>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      typeaccount: "Poupança",
      name: "",
      icon: "",
      color: "",
      value: "",
    },
  });

  const handleSubmitForm = (values: FormSchemaProps) => {
    console.log(values);
  };

  const IconSelected = LucideIcon[
    form.watch("icon") as keyof typeof LucideIcon
  ] as React.ElementType;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" className="border dark:border-neutral-700">
          <PlusIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-800 border-zinc-700 w-[300px]">
        <DialogHeader>
          <DialogTitle>Categoria</DialogTitle>
          <DialogDescription asChild>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmitForm)}
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
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <SelectTrigger className="dark:text-neutral-200 w-full dark:hover:bg-neutral-900 dark:bg-neutral-900 dark:border-neutral-700">
                                  <SelectValue placeholder="icone" />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-neutral-200 border-none">
                                  {iconNames.map((icon) => {
                                    const IconComponent =
                                      ICONS_CATEGORIES_EXPENSE[icon];

                                    return (
                                      <SelectItem
                                        key={icon}
                                        value={icon}
                                        className="my-px h-6 aria-selected:text-white"
                                      >
                                        <IconComponent />
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
                    <Button className="w-full" type="submit">
                      Criar Categoria
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
