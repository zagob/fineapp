"use client";

import { useMemo, useState } from "react";
import { Button } from "./ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
// import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const iconNames = [
  "Home",
  "Settings",
  "User",
  "Bell",
  "Star",
  "Heart",
  "Camera",
  "Music",
  "Lock",
  "Globe",
];

export function IconSelect() {
  //   const iconNames = Object.keys(LucideIcons.icons);
  const [selectedIcon, setSelectedIcon] = useState(iconNames[0]);
  const [open, setOpen] = useState(false);

  //   const IconComponentSelected = LucideIcons[
  //     selectedIcon as keyof typeof LucideIcons
  //   ] as React.ElementType;

  const IconComponentSelected = useMemo(
    () =>
      dynamic(() => import("lucide-react").then((mod) => mod[selectedIcon]), {
        ssr: false,
      }),
    [selectedIcon]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          <IconComponentSelected />
          <LucideIcons.ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Pesquisar icone..." />
          <CommandList>
            <CommandEmpty>Nenhum icone encontrado.</CommandEmpty>
            <CommandGroup>
              {iconNames.map((icon) => {
                const IconComponent = LucideIcons[
                  icon as keyof typeof LucideIcons
                ] as React.ElementType;

                return (
                  <CommandItem
                    key={icon}
                    value={icon}
                    onSelect={(currentValue) => {
                      setSelectedIcon(currentValue);
                      setOpen(false);
                    }}
                  >
                    <LucideIcons.Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedIcon === icon ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {icon}
                    <IconComponent />
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
