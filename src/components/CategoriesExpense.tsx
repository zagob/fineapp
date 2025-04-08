"use client";

import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/actions/categories.actions";
import { Button } from "./ui/button";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { RegisterCategory } from "./RegisterCategory";
import { Category } from "./Category";
import { cn } from "@/lib/utils";

export const CategoriesExpense = () => {
  const [isOpenCreateCategory, setIsOpenCreateCategory] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ["categories-expense"],
    queryFn: async () => getCategories({ type: "EXPENSE" }),
    enabled: !isOpenCreateCategory,
  });

  const isEmptyCategories = categories?.length === 0;

  return (
    <>
      <RegisterCategory
        open={isOpenCreateCategory}
        setOpen={setIsOpenCreateCategory}
        type="EXPENSE"
      />

      <div className="mt-4 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg text-red-500 py-2">Saídas</span>
          <Button size="icon" onClick={() => setIsOpenCreateCategory(true)}>
            <PlusIcon />
          </Button>
        </div>

        <div
          className={cn(
            "overflow-scroll flex-1 pb-10 border pt-2 px-2 rounded border-neutral-700 bg-neutral-900",
            {
              "flex items-center justify-center": isEmptyCategories,
            }
          )}
        >
          <p
            className={cn("text-neutral-500", {
              hidden: !isEmptyCategories,
            })}
          >
            Nenhuma categoria cadastrada
          </p>

          {categories?.map((category) => {
            return <Category category={category} key={category.id} />;
          })}
        </div>
      </div>
    </>
  );
};
