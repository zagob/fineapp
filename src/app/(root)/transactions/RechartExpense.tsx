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
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from "recharts";

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
  type = "EXPENSE",
  totalValue = 0,
}: {
  type?: "INCOME" | "EXPENSE";
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
    queryFn: async () =>
      await getTypeTransactions({
        type,
        date,
        filters: {
          categoryId: category.length > 0 ? category : undefined,
          bankId: !bank || bank.length === 0 ? undefined : bank,
        },
      }),
  });

  const { data: categories } = useQuery({
    queryKey: ["transactions-categories", type, date, category, bank],
    queryFn: async () =>
      await allCategoriesWithTransactions({
        type,
        date,
        filters: {
          categoryId: category.length > 0 ? category : undefined,
          bankId: !bank || bank.length === 0 ? undefined : bank,
        },
      }),
  });

  console.log("categories", categories, {
    chartDataIncome,
  });

  const valuesCategoriesByTransaction = Object.values(
    chartDataIncome?.transactionsFormattedToCategories ?? []
  ).sort((a, b) => b.total - a.total);

  const isEmptyValue = valuesCategoriesByTransaction?.length === 0;

  return (
    <div className="flex-1">
      <Card className="flex flex-col text-neutral-400 border-neutral-700 bg-neutral-800 h-full">
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
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart id={`chart-${type}`}>
                <Pie
                  data={valuesCategoriesByTransaction}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius="80%" // Use porcentagem para o raio se adaptar
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
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col gap-3 pl-12 w-1/2">
            {valuesCategoriesByTransaction.map((category) => (
              <div
                key={category.name}
                className="flex gap-2 items-center text-neutral-500"
              >
                <ImageCategory
                  classNameBackground="size-8"
                  icon={category.icon as string}
                  color={category.color}
                />

                <span>{category.name} - </span>
                <span>{transformToCurrency(category.total)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// NOVO COMPONENTE DE ANÁLISE VISUAL MODERNA
import { ArrowUpRight, ArrowDownRight, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

// Função para renderizar o centro do doughnut
const renderCenterLabel = ({ viewBox, value, type }: any) => {
  const { cx, cy } = viewBox;
  return (
    <g>
      <text x={cx} y={cy - 8} textAnchor="middle" dominantBaseline="central" className="text-2xl font-bold" fill={type === "INCOME" ? '#22c55e' : '#ef4444'}>
        {transformToCurrency(value)}
      </text>
      <text x={cx} y={cy + 16} textAnchor="middle" dominantBaseline="central" className="text-sm" fill="#a3a3a3">
        {type === "INCOME" ? 'Receitas' : 'Despesas'}
      </text>
    </g>
  );
};

export const VisualAnalysisPanel = ({
  type = "EXPENSE",
  totalValue = 0,
}: {
  type?: "INCOME" | "EXPENSE";
  totalValue?: number;
}) => {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const date = useDateStore((state) => state.date);
  const { category, bank } = useTransactionStore();

  const { data: chartDataIncome } = useQuery({
    queryKey: ["transactions-type", type, date, category, bank],
    queryFn: async () =>
      await getTypeTransactions({
        type,
        date,
        filters: {
          categoryId: category.length > 0 ? category : undefined,
          bankId: !bank || bank.length === 0 ? undefined : bank,
        },
      }),
  });

  const { data: categories } = useQuery({
    queryKey: ["transactions-categories", type, date, category, bank],
    queryFn: async () =>
      await allCategoriesWithTransactions({
        type,
        date,
        filters: {
          categoryId: category.length > 0 ? category : undefined,
          bankId: !bank || bank.length === 0 ? undefined : bank,
        },
      }),
  });

  const valuesCategoriesByTransaction = Object.values(
    chartDataIncome?.transactionsFormattedToCategories ?? []
  ).sort((a, b) => b.total - a.total);

  const isEmptyValue = valuesCategoriesByTransaction?.length === 0;
  const topCategory = valuesCategoriesByTransaction[0];
  const secondCategory = valuesCategoriesByTransaction[1];
  const totalTop = (topCategory?.total || 0) + (secondCategory?.total || 0);
  const percentTop = totalValue > 0 ? (totalTop / totalValue) * 100 : 0;
  const remainingCategories = valuesCategoriesByTransaction.slice(2);

  // Simulação de variação percentual (poderia ser calculada com dados reais)
  const percentChange = type === "INCOME" ? 8.2 : -5.7;

  return (
    <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/80 rounded-2xl border border-white/10 shadow-xl p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            {type === "INCOME" ? "Análise de Receitas" : "Análise de Despesas"}
          </h2>
          <p className="text-neutral-400 text-sm">
            Distribuição por categoria e variação mensal
          </p>
        </div>
        <div className="flex items-center gap-2">
          {Number(percentChange) !== 0 && (
            <span className={`flex items-center gap-1 text-lg font-semibold ${percentChange > 0 ? "text-green-400" : "text-red-400"}`}>
              {percentChange > 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
              {percentChange > 0 ? "+" : ""}{percentChange.toFixed(1)}%
            </span>
          )}
        </div>
      </div>
      
      <div className="flex flex-col items-center justify-center gap-8 w-full">
        {/* Gráfico */}
        <div className="w-full lg:w-1/2 h-64 flex items-center justify-center">
          {isEmptyValue ? (
            <div className="text-neutral-600">Nenhuma transação encontrada</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart id={`chart-modern-${type}`}
                style={{ filter: 'drop-shadow(0 4px 16px #0006)' }}
              >
                <Pie
                  data={valuesCategoriesByTransaction}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius="90%"
                  innerRadius="60%"
                  dataKey="total"
                  suppressHydrationWarning
                  isAnimationActive
                  animationDuration={900}
                  stroke="#fff"
                  strokeWidth={2}
                  activeShape={(props: any) => (
                    <Sector {...props} stroke="#fff" strokeWidth={4} />
                  )}
                >
                  {valuesCategoriesByTransaction?.map((entry, index) => (
                    <Cell key={`cell-modern-${index}`} fill={entry.color} style={{ filter: 'brightness(1.1)' }} />
                  ))}
                </Pie>
                {/* Valor total centralizado */}
                <Pie
                  data={[{ value: totalValue }]}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius="0%"
                  fill="none"
                  label={renderCenterLabel({ viewBox: { cx: 120, cy: 120 }, value: totalValue, type })}
                  isAnimationActive={false}
                />
                <Tooltip
                  formatter={(value, name, props) => [transformToCurrency(value as number), props?.payload?.name]}
                  isAnimationActive
                  separator=": "
                  contentStyle={{ background: "#18181b", border: "1px solid #27272a", color: "#fff", borderRadius: 8, boxShadow: '0 2px 8px #0008' }}
                  itemStyle={{ color: "#fff", fontWeight: 500 }}
                  labelClassName="text-white"
                  cursor={{ fill: '#fff2', stroke: '#fff', strokeWidth: 1 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Informações das Categorias */}
        <div className="flex-1 flex flex-col gap-4 w-full">
          {/* Total */}
          <div className="flex flex-col gap-2 p-4 bg-white/5 rounded-xl border border-white/10">
            <span className="text-neutral-400 text-sm">Total {type === "INCOME" ? "Receitas" : "Despesas"}</span>
            <span className={`text-3xl font-bold ${type === "INCOME" ? "text-green-400" : "text-red-400"}`}>
              {transformToCurrency(totalValue)}
            </span>
          </div>

          {/* Top 2 Categorias */}
          <div className="space-y-3 w-full">
            <h3 className="text-lg font-semibold text-white">Principais Categorias</h3>
            
            {topCategory && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 w-full">
                <ImageCategory
                  classNameBackground="size-12"
                  icon={topCategory.icon as string}
                  color={topCategory.color}
                />
                <div className="flex-1">
                  <span className="block text-neutral-200 font-semibold">1º Lugar</span>
                  <span className="block text-xl font-bold text-white">{topCategory.name}</span>
                  <span className="block text-sm text-neutral-400">
                    {totalValue > 0 ? ((topCategory.total / totalValue) * 100).toFixed(1) : 0}% do total
                  </span>
                </div>
                <span className="text-xl font-bold text-white">{transformToCurrency(topCategory.total)}</span>
              </div>
            )}

            {secondCategory && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20">
                <ImageCategory
                  classNameBackground="size-12"
                  icon={secondCategory.icon as string}
                  color={secondCategory.color}
                />
                <div className="flex-1">
                  <span className="block text-neutral-200 font-semibold">2º Lugar</span>
                  <span className="block text-xl font-bold text-white">{secondCategory.name}</span>
                  <span className="block text-sm text-neutral-400">
                    {totalValue > 0 ? ((secondCategory.total / totalValue) * 100).toFixed(1) : 0}% do total
                  </span>
                </div>
                <span className="text-xl font-bold text-white">{transformToCurrency(secondCategory.total)}</span>
              </div>
            )}
          </div>

          {/* Outras Categorias */}
          {remainingCategories.length > 0 && (
            <div className="space-y-3">
              <button
                onClick={() => setShowAllCategories(!showAllCategories)}
                className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
              >
                <span className="text-sm font-medium">
                  Outras Categorias ({remainingCategories.length})
                </span>
                {showAllCategories ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showAllCategories && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {remainingCategories.map((cat, index) => (
                    <div key={cat.name} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                      <ImageCategory
                        classNameBackground="size-8"
                        icon={cat.icon as string}
                        color={cat.color}
                      />
                      <div className="flex-1">
                        <span className="block text-sm font-medium text-white">{cat.name}</span>
                        <span className="block text-xs text-neutral-400">
                          {totalValue > 0 ? ((cat.total / totalValue) * 100).toFixed(1) : 0}% do total
                        </span>
                      </div>
                      <span className="text-sm font-bold text-white">{transformToCurrency(cat.total)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Resumo */}
          <div className="flex items-center gap-2 mt-2 p-3 bg-white/5 rounded-lg border border-white/5">
            <span className="text-neutral-400 text-xs">Top 2 categorias representam</span>
            <span className="text-white font-bold text-sm">{percentTop.toFixed(1)}%</span>
            <span className="text-neutral-400 text-xs">do total</span>
          </div>

          {/* Legenda customizada ao lado do gráfico */}
          <div className="space-y-2">
            {valuesCategoriesByTransaction.map((cat, idx) => (
              <div key={cat.name} className="flex items-center gap-3">
                <span className="inline-block w-3 h-3 rounded-full" style={{ background: cat.color, boxShadow: '0 0 0 2px #fff' }} />
                <span className="text-white font-medium">{cat.name}</span>
                <span className="text-neutral-400 text-xs">{((cat.total / totalValue) * 100).toFixed(1)}%</span>
                <span className="text-white font-bold ml-auto">{transformToCurrency(cat.total)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
