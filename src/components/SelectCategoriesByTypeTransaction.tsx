import { ForwardRefExoticComponent } from "react";
import { FormControl, FormItem, FormLabel } from "./ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import * as LucideIcon from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/actions/categories.actions";

interface SelectCategoriesProps {
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  type: "EXPENSE" | "INCOME";
}

export const SelectCategoriesByTypeTransaction = ({
  type,
  defaultValue,
  onValueChange,
}: SelectCategoriesProps) => {
  const { data: categories } = useQuery({
    queryKey: ["categories", type],
    queryFn: async () => await getCategories({ type }),
  });

  return (
    <FormItem>
      <FormLabel>Categorias:</FormLabel>
      <FormControl>
        <Select onValueChange={onValueChange} defaultValue={defaultValue}>
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
  );
};
