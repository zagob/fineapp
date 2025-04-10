"use client";

import { ForwardRefExoticComponent } from "react";
import { FormItem } from "./ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import * as LucideIcon from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getEveryCategories } from "@/actions/categories.actions";

interface SelectCategoriesProps {
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export const SelectEveryCategories = ({
  defaultValue,
  onValueChange,
}: SelectCategoriesProps) => {
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => await getEveryCategories(),
  });

  return (
    <FormItem>
      <Select onValueChange={onValueChange} value={defaultValue}>
        <SelectTrigger
          disabled={categories?.length === 0}
          className="w-full dark:text-neutral-200 dark:border-neutral-600 dark:bg-neutral-800 dark:hover:bg-neutral-700"
        >
          <SelectValue placeholder="selecione uma categoria" />
        </SelectTrigger>
        <SelectContent className="dark:bg-neutral-400 border-none">
          {categories?.map((category) => {
            const IconName = LucideIcon[
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
    </FormItem>
  );
};
