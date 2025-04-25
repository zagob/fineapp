"use client";

import { allCategoriesWithTransactions } from "@/actions/categories.actions";
import { getTypeTransactions } from "@/actions/transactions.actions";
import { ImageCategory } from "@/components/ImageCategory";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn, transformToCurrency } from "@/lib/utils";
import { useDateStore, useTransactionStore } from "@/store";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: // eslint-disable-next-line @typescript-eslint/no-explicit-any
any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export const RechartExpense = ({
  type,
  totalValue = 0,
}: {
  type: "INCOME" | "EXPENSE";
  totalValue?: number;
}) => {
  const date = useDateStore((state) => state.date);
    const {
      // typeTransaction,
      // setTypeTransaction,
      category,
      // setCategory,
      bank,
      // setBank,
    } = useTransactionStore();

  const { data: chartDataIncome } = useQuery({
    queryKey: ["transactions-type", type, date, category, bank],
    queryFn: async () => await getTypeTransactions({ type, date, 
      filters: {
        categoryId: category.length > 0 ? category : undefined,
        bankId: !bank || bank.length === 0 ? undefined : bank,
      }
     }),
  });

  const { data: categories } = useQuery({
    queryKey: ["transactions-categories", type, date, category, bank],
    queryFn: async () => await allCategoriesWithTransactions({ type, date, filters: {
      categoryId: category.length > 0 ? category : undefined,
      bankId: !bank || bank.length === 0 ? undefined : bank,
    } }),
  });

  const valuesCategoriesByTransaction = Object.values(
    chartDataIncome?.transactionsFormattedToCategories ?? []
  );

  const isEmptyValue = valuesCategoriesByTransaction?.length === 0;

  return (
    <div>
      <Card className="flex flex-col bg-neutral-300">
        <CardHeader className="items-center pb-0">
          <CardTitle>
            {type === "INCOME"
              ? "Categorias de entrada: "
              : "Categorias de saída: "}
          </CardTitle>
          <CardDescription
            className={cn(
              type === "INCOME" ? "text-green-600" : "text-red-600"
            )}
          >
            {transformToCurrency(totalValue)}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0 flex">
          {isEmptyValue && (
            <div className="text-neutral-600">Nenhuma transação encontrada</div>
          )}
          <PieChart id={`chart-${type}`} width={220} height={220}>
            <Pie
              data={valuesCategoriesByTransaction}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={100}
              dataKey="total"
              suppressHydrationWarning
            >
              {valuesCategoriesByTransaction?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => transformToCurrency(value as number)}
              isAnimationActive
              separator=": "
              labelClassName="bg-neutral-800 text-neutral-200"
            />
          </PieChart>
          <div className="flex flex-col gap-2 pl-12">
            {categories?.categories.map((category) => (
              <div
                key={category.id}
                className="flex gap-2 items-center text-neutral-500"
              >
                <ImageCategory
                  icon={category.icon as string}
                  color={category.color}
                />

                <span>{category.name} - </span>
                <span>
                  {transformToCurrency(
                    category.Transactions.reduce(
                      (acc, item) => acc + item.value,
                      0
                    )
                  )}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
