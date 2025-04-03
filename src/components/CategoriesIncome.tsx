"use client";

import { useQuery } from "@tanstack/react-query";
import { Label } from "./ui/label";
import { getCategories } from "@/actions/categories.actions";
import { ICONS_CATEGORIES_EXPENSE } from "@/variants/iconsCategories";
import { Button } from "./ui/button";
import { PlusIcon } from "lucide-react";

export const CategoriesIncome = () => {
  const { data: categories } = useQuery({
    queryKey: ["categories-income"],
    queryFn: async () => getCategories({ type: "INCOME" }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label className="text-lg">INCOME</Label>
        <Button size="icon">
          <PlusIcon />
        </Button>
      </div>

      {categories?.map((category) => {
        const IconComponent =
          ICONS_CATEGORIES_EXPENSE[
            category.icon as keyof typeof ICONS_CATEGORIES_EXPENSE
          ];

        return (
          <div
            className="flex items-center gap-2 border px-2 py-3 rounded border-zinc-500"
            key={category.id}
          >
            <div
              className="flex items-center justify-center size-6 rounded-full"
              style={{
                backgroundColor: category.color,
              }}
            >
              <IconComponent className="text-zinc-50" strokeWidth={1} />
            </div>
            <span className="text-zinc-50">{category.name}</span>
          </div>
        );
      })}
    </div>
  );
};
