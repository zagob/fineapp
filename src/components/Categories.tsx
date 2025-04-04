// "use client"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { CategoriesIncome } from "./CategoriesIncome";

export const Categories = async () => {
  return (
    <Sheet>
      <SheetTrigger className="text-sm p-2 dark:hover:bg-transparent dark:hover:text-neutral-100 dark:text-neutral-400">
        Categories
      </SheetTrigger>
      <SheetContent className="bg-zinc-800 dark:text-zinc-50 dark:border-b-zinc-600">
        <SheetHeader>
          <SheetTitle className="text-zinc-50">Categorias</SheetTitle>
          <SheetDescription>test</SheetDescription>

          <div className="space-y-4">
            <CategoriesIncome />
            <Separator className="bg-zinc-600" />
            <Label className="text-lg">EXPENSE</Label>
          </div>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};
