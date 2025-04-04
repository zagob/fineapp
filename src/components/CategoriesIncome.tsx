"use client";

import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/actions/categories.actions";
import { Button } from "./ui/button";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { RegisterCategory } from "./RegisterCategory";
import { Category } from "./Category";

export const CategoriesIncome = () => {
  const [isOpenCreateCategory, setIsOpenCreateCategory] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ["categories-income"],
    queryFn: async () => getCategories({ type: "INCOME" }),
    enabled: !isOpenCreateCategory,
  });

  return (
    <>
      <RegisterCategory
        open={isOpenCreateCategory}
        setOpen={setIsOpenCreateCategory}
        type="INCOME"
      />

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg">INCOME</span>
          <Button size="icon" onClick={() => setIsOpenCreateCategory(true)}>
            <PlusIcon />
          </Button>
        </div>

        {categories?.map((category) => {
          return <Category category={category} key={category.id} />;
        })}
      </div>
    </>
  );
};
