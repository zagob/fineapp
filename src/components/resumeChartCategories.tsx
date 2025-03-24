"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";

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

const chartData = [
  { category: "Salário", value: 2500, fill: "hsl(140, 70%, 50%)" }, // Verde forte
  { category: "Freelance", value: 800, fill: "hsl(140, 70%, 70%)" }, // Verde claro
  { category: "Aluguel", value: 1200, fill: "hsl(0, 70%, 50%)" }, // Vermelho forte
  { category: "Alimentação", value: 600, fill: "hsl(0, 70%, 70%)" }, // Vermelho médio
  { category: "Lazer", value: 300, fill: "hsl(0, 70%, 90%)" }, // Vermelho claro
];

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
  const totalIncome = chartData
    .filter((item) => ["Salário", "Freelance"].includes(item.category))
    .reduce((acc, curr) => acc + curr.value, 0);

  const totalExpense = chartData
    .filter((item) =>
      ["Aluguel", "Alimentação", "Lazer"].includes(item.category)
    )
    .reduce((acc, curr) => acc + curr.value, 0);

  const remainingBalance = totalIncome - totalExpense;

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Resumo Financeiro</CardTitle>
        <CardDescription>Março 2025</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="category"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          R${remainingBalance.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Saldo Restante
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
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
