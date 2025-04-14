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

  const { data: categories, isPending } = useQuery({
    queryKey: ["categories-expense"],
    queryFn: async () => getCategories({ type: "EXPENSE" }),
    enabled: !isOpenCreateCategory,
  });

  const isEmptyCategories = categories?.length === 0;

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-neutral-500">Carregando...</p>
      </div>
    );
  }

  return (
    <>
      <RegisterCategory
        open={isOpenCreateCategory}
        setOpen={setIsOpenCreateCategory}
        type="EXPENSE"
      />

      <div className="flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg text-red-500">Saídas</span>
          <Button size="icon" onClick={() => setIsOpenCreateCategory(true)}>
            <PlusIcon />
          </Button>
        </div>

        <div
          className={cn("overflow-scroll flex-1 pb-10 pt-2", {
            "flex items-center justify-center": isEmptyCategories,
          })}
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
