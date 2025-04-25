"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Cell, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useQuery } from "@tanstack/react-query";
import { getTypeTransactions } from "@/actions/transactions.actions";
import { transformToCurrency } from "@/lib/utils";
import { useDateStore } from "@/store";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ImageCategory } from "./ImageCategory";

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "hsl(var(--chart-1))",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
  firefox: {
    label: "Firefox",
    color: "hsl(var(--chart-3))",
  },
  edge: {
    label: "Edge",
    color: "hsl(var(--chart-4))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

export function ResumeChartCategories() {
  const date = useDateStore((state) => state.date);

  const { data: chartDataIncome } = useQuery({
    queryKey: ["transactions-income", date],
    queryFn: async () => await getTypeTransactions({ type: "INCOME", date }),
  });

  const { data: chartDataExpense } = useQuery({
    queryKey: ["transactions-expense", date],
    queryFn: async () => await getTypeTransactions({ type: "EXPENSE", date }),
  });

  return (
    <Card className="flex flex-col bg-neutral-200">
      <CardHeader className="items-center pb-0">
        <CardTitle>Resumo Financeiro</CardTitle>
        <CardDescription className="capitalize">
          {format(date, "MMMM yyyy", {
            locale: ptBR,
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <p className="text-xs text-neutral-600">Categorias de entradas</p>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
              formatter={(value, name, item) => (
                <div className="flex items-center gap-2">
                  <ImageCategory
                    color={item.payload.color}
                    icon={item.payload.icon}
                  />
                  <span>{name}</span>
                  <span>{transformToCurrency(Number(value))}</span>
                </div>
              )}
            />

            <Pie
              data={chartDataIncome?.transactionsFormattedToCategories || []}
              dataKey="total"
              label={({ value }) => `${transformToCurrency(value)}`}
              startAngle={180}
              endAngle={0}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
            >
              {chartDataIncome?.transactions &&
                chartDataIncome?.transactions.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.category.color} />
                ))}
            </Pie>
            <Pie
              data={chartDataExpense?.transactionsFormattedToCategories || []}
              dataKey="total"
              label={({ value }) => `${transformToCurrency(value)}`}
              cy={125}
              startAngle={0}
              endAngle={-180}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
            >
              {chartDataExpense?.transactions &&
                chartDataExpense?.transactions.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.category.color} />
                ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <p className="text-xs text-neutral-600">Categoria de saídas</p>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Tendência de 5.2% este mês <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Exibindo categorias de entradas e gastos
        </div>
      </CardFooter>
    </Card>
  );
}
