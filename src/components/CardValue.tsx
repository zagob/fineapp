import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { twMerge } from "tailwind-merge";

interface CardValueProps {
  title: string;
  value: string;
  icon: LucideIcon;
  classNameIcon?: string
}

export const CardValue = ({ icon: Icon, title, value, classNameIcon }: CardValueProps) => {
  return (
    <Card className="gap-1 w-[220px] relative dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="font-normal text-sm dark:text-neutral-400">
          {title}
        </CardTitle>
        <Icon className={twMerge('size-5', classNameIcon)} />
      </CardHeader>
      <CardContent>
        <p className="text-xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
};
