import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CategoriesIncome } from "./CategoriesIncome";
import { CategoriesExpense } from "./CategoriesExpense";

export const Categories = async () => {
  return (
    <Sheet>
      <SheetTrigger className="text-sm p-2 dark:hover:bg-transparent dark:hover:text-neutral-100 dark:text-neutral-400">
        Categories
      </SheetTrigger>
      <SheetContent className="bg-zinc-800 border-l border-l-neutral-700 dark:text-zinc-50 dark:border-b-zinc-600">
        <SheetHeader className="h-full">
          <SheetTitle className="text-zinc-50">Categorias</SheetTitle>

          <div className="pb-10 h-full grid grid-rows-[1fr_1fr]">
            <CategoriesIncome />
            <CategoriesExpense />
          </div>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};
