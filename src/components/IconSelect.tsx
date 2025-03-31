"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Command, CommandGroup, CommandItem, CommandList } from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { ICONS_CATEGORIES_EXPENSE } from "@/variants/iconsCategories";

const iconNames = Object.keys(
  ICONS_CATEGORIES_EXPENSE
) as (keyof typeof ICONS_CATEGORIES_EXPENSE)[];

export function IconSelect() {
  const [selectedIcon, setSelectedIcon] =
    useState<keyof typeof ICONS_CATEGORIES_EXPENSE>("House");
  const [open, setOpen] = useState(false);

  const IconComponentSelected = ICONS_CATEGORIES_EXPENSE[selectedIcon];

  console.log({
    ICONS_CATEGORIES_EXPENSE,
    selectedIcon,
    iconNames,
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-fit justify-between"
        >
          <IconComponentSelected />
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {iconNames.map((icon) => {
                const IconComponent = ICONS_CATEGORIES_EXPENSE[icon];

                return (
                  <CommandItem
                    key={icon}
                    value={icon}
                    onSelect={() => {
                      setSelectedIcon(icon);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedIcon === icon ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <IconComponent className="size-4" />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
