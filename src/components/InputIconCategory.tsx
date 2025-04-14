"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ICONS_CATEGORIES_EXPENSE } from "@/variants/iconsCategories";
import { ChevronDown } from "lucide-react";

export type IconProps = keyof typeof ICONS_CATEGORIES_EXPENSE;

const iconNames = Object.keys(ICONS_CATEGORIES_EXPENSE) as IconProps[];

interface InputIconCategoryProps {
  value: IconProps;
  onChange: (val: IconProps) => void;
}

export const InputIconCategory = ({
  value,
  onChange,
}: InputIconCategoryProps) => {
  const [open, setOpen] = useState(false);

  const IconComponentSelected = ICONS_CATEGORIES_EXPENSE[value];

  const onChangeValue = (icon: IconProps) => {
    onChange(icon);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button className="w-full flex justify-between dark:bg-neutral-900 dark:border-neutral-700">
          {value.length === 0 ? "Selecionar icone" : <IconComponentSelected />}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 bg-zinc-800 border-zinc-700 flex flex-wrap gap-2">
        {iconNames.map((icon) => {
          const IconComponent = ICONS_CATEGORIES_EXPENSE[icon];

          return (
            <Button
              key={icon}
              value={icon}
              className="m-px h-6 aria-selected:text-white"
              onClick={() => onChangeValue(icon)}
            >
              <IconComponent />
            </Button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
};
