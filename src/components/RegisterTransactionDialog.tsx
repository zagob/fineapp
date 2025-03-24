"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";

interface RegisterTransactionDialogProps {
  type: "income" | "expense";
}

export const RegisterTransactionDialog = ({
  type,
}: RegisterTransactionDialogProps) => {
  const [date, setDate] = useState<Date>();

  return (
    <Dialog>
      <DialogTrigger asChild>
        {type === "income" ? (
          <Button
            variant="outline"
            className="dark:bg-green-300 dark:hover:bg-green-200 dark:hover:text-green-950 dark:border-green-200 dark:text-green-950"
          >
            Income
          </Button>
        ) : (
          <Button
            variant="outline"
            className="dark:bg-red-400 dark:hover:bg-red-300 dark:hover:text-red-50 dark:border-red-300 dark:text-red-50 "
          >
            Expense
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-zinc-800 border-zinc-700">
        <DialogHeader>
          <DialogTitle>Add {type}</DialogTitle>
          <DialogDescription>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>

            <Input placeholder="value" />

            <Button>Register Transaction</Button>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
