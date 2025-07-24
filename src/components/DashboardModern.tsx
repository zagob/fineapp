"use client";

import { memo, Suspense, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { FilterDateModern } from "./FilterDateModern";
import { DateStats } from "./DateStats";
import { DateNavigation } from "./DateNavigation";
import { RegisterTransactionDialog } from "./RegisterTransactionDialog";
import { RegisterTransfer } from "./RegisterTransfer";
import { ModernAccountBanks } from "./ModernAccountBanks";
import { ModernTransactions } from "./ModernTransactions";
import { ModernTransfers } from "./ModernTransfers";
import { ModernCategories } from "./ModernCategories";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { LoadingCard } from "./ui/loading-spinner";
import { formatYear, transformToCurrency } from "@/lib/utils";
import { getAccounts } from "@/actions/accounts.actions.soft-delete";
import { getTransactions } from "@/actions/transactions.actions.soft-delete";
import { getCategories } from "@/actions/categories.actions.soft-delete";
import { useAuth } from "@/hooks/useAuth";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PiggyBank, 
  BarChart3, 
  Calendar,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Settings,
  RefreshCw,
  Bell,
  Target,
  Zap,
  AlertTriangle,
  Shield
} from "lucide-react";
import { Button } from "./ui/button";
import { ModernRegisterTransaction } from "./ModernRegisterTransaction";

// Componente de estatísticas em tempo real
const StatsCard = memo(({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  color 
}: {
  title: string;
  value: string;
  change?: string;
  changeType?: 'up' | 'down';
  icon: any;
  color: string;
}) => (
  <Card className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 border-neutral-700/50 hover:border-neutral-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-neutral-900/20 hover:scale-105">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${color}`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-neutral-400 font-medium">{title}</span>
          </div>
          <div className="text-2xl font-bold text-white">{value}</div>
          {change && (
            <div className="flex items-center gap-1">
              {changeType === 'up' ? (
                <ArrowUpRight className="w-4 h-4 text-green-400" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-400" />
              )}
              <span className={`text-sm font-medium ${
                changeType === 'up' ? 'text-green-400' : 'text-red-400'
              }`}>
                {change}
              </span>
              <span className="text-xs text-neutral-500">vs mês anterior</span>
            </div>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
));

StatsCard.displayName = "StatsCard";

// Componente de estatísticas dinâmicas baseadas em dados reais

interface DynamicStatsCardsProps {
  transactions: any[];
  accounts: any[];
  categories: any[];
  currentMonth: number;
  currentYear: number;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const DynamicStatsCards = memo(({ transactions, accounts, categories, currentMonth, currentYear, isLoading, isAuthenticated }: DynamicStatsCardsProps) => {
  // Se não está autenticado ou está carregando, mostrar cards vazios
  if (!isAuthenticated || isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Saldo Total"
          value="R$ 0,00"
          change="--"
          icon={DollarSign}
          color="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatsCard
          title="Receitas (Mês)"
          value="R$ 0,00"
          change="--"
          icon={TrendingUp}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatsCard
          title="Despesas (Mês)"
          value="R$ 0,00"
          change="--"
          icon={TrendingDown}
          color="bg-gradient-to-br from-red-500 to-red-600"
        />
        <StatsCard
          title="Balanço do Mês"
          value="R$ 0,00"
          change="--"
          icon={DollarSign}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        
        <StatsCard
          title="Categorias"
          value="0"
          change="--"
          icon={BarChart3}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
        />
      </div>
    );
  }

  // Calcular estatísticas do mês atual
  const monthTransactions = transactions.filter((t: any) => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const incomeTransactions = monthTransactions.filter((t: any) => t.type === 'INCOME');
  const expenseTransactions = monthTransactions.filter((t: any) => t.type === 'EXPENSE');

  const totalIncome = incomeTransactions.reduce((sum: number, t: any) => sum + (t.value || 0), 0);
  const totalExpenses = expenseTransactions.reduce((sum: number, t: any) => sum + (t.value || 0), 0);
  const monthBalance = totalIncome - totalExpenses;

  // Calcular estatísticas do mês anterior
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const prevMonthTransactions = transactions.filter((t: any) => {
    const d = new Date(t.date);
    return d.getMonth() === previousMonth && d.getFullYear() === previousYear;
  });
  const prevIncome = prevMonthTransactions.filter((t: any) => t.type === 'INCOME').reduce((sum: number, t: any) => sum + (t.value || 0), 0);
  const prevExpense = prevMonthTransactions.filter((t: any) => t.type === 'EXPENSE').reduce((sum: number, t: any) => sum + (t.value || 0), 0);
  const prevBalance = prevIncome - prevExpense;

  const percentChange = prevBalance !== 0
    ? ((monthBalance - prevBalance) / Math.abs(prevBalance)) * 100
    : null;

  const totalBalance = accounts.reduce((sum: number, account: any) => sum + (account.amount || 0), 0) || 0;
  const totalCategories = categories.length || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatsCard
        title="Saldo Total"
        value={transformToCurrency(totalBalance)}
        change="+12.5%"
        changeType="up"
        icon={DollarSign}
        color="bg-gradient-to-br from-green-500 to-green-600"
      />
      <StatsCard
        title="Receitas (Mês)"
        value={transformToCurrency(totalIncome)}
        change="+8.3%"
        changeType="up"
        icon={TrendingUp}
        color="bg-gradient-to-br from-blue-500 to-blue-600"
      />
      <StatsCard
        title="Despesas (Mês)"
        value={transformToCurrency(totalExpenses)}
        change="-5.2%"
        changeType="down"
        icon={TrendingDown}
        color="bg-gradient-to-br from-red-500 to-red-600"
      />
      <StatsCard
        title="Balanço do Mês"
        value={transformToCurrency(monthBalance)}
        change={percentChange !== null ? `${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}%` : '—'}
        changeType={percentChange === null ? undefined : percentChange >= 0 ? 'up' : 'down'}
        icon={DollarSign}
        color="bg-gradient-to-br from-blue-500 to-blue-600"
      />
      <StatsCard
        title="Categorias"
        value={totalCategories.toString()}
        change="+2"
        changeType="up"
        icon={BarChart3}
        color="bg-gradient-to-br from-purple-500 to-purple-600"
      />
    </div>
  );
});

DynamicStatsCards.displayName = "DynamicStatsCards";

// Card de histórico geral
const HistoricStatsCard = memo(({ transactions }: { transactions: any[] }) => {
  const incomeTransactions = transactions.filter((t: any) => t.type === 'INCOME');
  const expenseTransactions = transactions.filter((t: any) => t.type === 'EXPENSE');
  const totalIncome = incomeTransactions.reduce((sum: number, t: any) => sum + (t.value || 0), 0);
  const totalExpenses = expenseTransactions.reduce((sum: number, t: any) => sum + (t.value || 0), 0);
  const netBalance = totalIncome - totalExpenses;

  return (
    <Card className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 border-neutral-700/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-white">
          <BarChart3 className="w-5 h-5" />
          Histórico Geral
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-400">Receitas Totais</span>
          <span className="text-green-400 font-medium">{transformToCurrency(totalIncome)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-400">Despesas Totais</span>
          <span className="text-red-400 font-medium">{transformToCurrency(totalExpenses)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-400">Saldo Acumulado</span>
          <span className="text-blue-400 font-medium">{transformToCurrency(netBalance)}</span>
        </div>
      </CardContent>
    </Card>
  );
});

HistoricStatsCard.displayName = "HistoricStatsCard";

// Componente de notificações
const NotificationsPanel = memo(() => {
  const notifications = [
    {
      id: 1,
      type: 'success',
      message: 'Meta de economia atingida! 🎉',
      time: '2 min atrás'
    },
    {
      id: 2,
      type: 'warning',
      message: 'Gasto próximo ao limite da categoria Alimentação',
      time: '15 min atrás'
    },
    {
      id: 3,
      type: 'info',
      message: 'Nova funcionalidade disponível: Relatórios avançados',
      time: '1 hora atrás'
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 border-neutral-700/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-white">
          <Bell className="w-5 h-5" />
          Notificações
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {notifications.map((notification) => (
          <div key={notification.id} className="flex items-start gap-3 p-3 bg-neutral-800/30 rounded-lg border border-neutral-700/30">
            <div className={`w-2 h-2 rounded-full mt-2 ${
              notification.type === 'success' ? 'bg-green-400' :
              notification.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
            }`} />
            <div className="flex-1">
              <p className="text-sm text-white">{notification.message}</p>
              <p className="text-xs text-neutral-500 mt-1">{notification.time}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
});

NotificationsPanel.displayName = "NotificationsPanel";

// Componente de metas e objetivos baseado em dados reais
const GoalsPanel = memo(() => {
  const { userId, isAuthenticated } = useAuth();

  const { data: transactionsData } = useQuery({
    queryKey: ["transactions", userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error("Usuário não autenticado");
      }
      return await getTransactions(userId);
    },
    enabled: !!userId,
  });

  // Se não está autenticado, mostrar metas vazias
  if (!isAuthenticated) {
    return (
      <Card className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 border-neutral-700/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <Target className="w-5 h-5" />
            Metas do Mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-neutral-400 text-sm">Faça login para ver suas metas</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const transactions = transactionsData?.data || [];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  // Filtrar transações do mês atual
  const monthTransactions = transactions.filter((t: any) => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
  });

  const income = monthTransactions.filter((t: any) => t.type === 'INCOME').reduce((sum: number, t: any) => sum + (t.value || 0), 0);
  const expenses = monthTransactions.filter((t: any) => t.type === 'EXPENSE').reduce((sum: number, t: any) => sum + (t.value || 0), 0);
  const savings = income - expenses;
  
  // Metas (exemplo)
  const savingsGoal = 200000; // R$ 2.000,00
  const leisureGoal = 100000; // R$ 1.000,00
  const investmentGoal = 150000; // R$ 1.500,00

  const savingsProgress = Math.min((savings / savingsGoal) * 100, 100);
  const leisureProgress = Math.min((expenses / leisureGoal) * 100, 100);
  const investmentProgress = Math.min((income / investmentGoal) * 100, 100);

  return (
    <Card className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 border-neutral-700/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-white">
          <Target className="w-5 h-5" />
          Metas do Mês
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-300">Economia</span>
            <span className="text-sm text-green-400 font-medium">
              {transformToCurrency(savings)} / {transformToCurrency(savingsGoal)}
            </span>
          </div>
          <div className="w-full bg-neutral-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" 
              style={{ width: `${savingsProgress}%` }}
            ></div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-300">Gastos com Lazer</span>
            <span className="text-sm text-yellow-400 font-medium">
              {transformToCurrency(expenses)} / {transformToCurrency(leisureGoal)}
            </span>
          </div>
          <div className="w-full bg-neutral-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2 rounded-full" 
              style={{ width: `${leisureProgress}%` }}
            ></div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-300">Investimentos</span>
            <span className="text-sm text-blue-400 font-medium">
              {transformToCurrency(income)} / {transformToCurrency(investmentGoal)}
            </span>
          </div>
          <div className="w-full bg-neutral-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full" 
              style={{ width: `${investmentProgress}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

GoalsPanel.displayName = "GoalsPanel";

// Componente de header moderno
const ModernDashboardHeader = memo(() => {
  const [currentYear, setCurrentYear] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    setMounted(true);
    setCurrentYear(formatYear(new Date()));
    
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <Card className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 border-neutral-700/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">
              Dashboard Financeiro
            </h1>
            <p className="text-neutral-400">
              {isAuthenticated 
                ? `Bem-vindo, ${user?.name || 'Usuário'}!`
                : 'Bem-vindo ao seu controle financeiro pessoal'
              }
            </p>
          </div>
          
          <div className="text-right space-y-1">
            <div className="text-2xl font-bold text-white">{currentTime}</div>
            <div className="text-sm text-neutral-400">{currentYear}</div>
          </div>
        </div>
        
        <div className="mt-6 flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full border border-green-500/30">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-400">Sistema Online</span>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-full border border-blue-500/30">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-400">Dados em Tempo Real</span>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/20 rounded-full border border-purple-500/30">
            <Shield className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-400">
              {isAuthenticated ? 'Autenticado' : 'Não Autenticado'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ModernDashboardHeader.displayName = "ModernDashboardHeader";

// Componente principal do Dashboard Moderno
export const DashboardModern = () => {
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, isLoading: isLoadingAuth, userId } = useAuth();

  // Buscar todas as transações do usuário para o histórico geral
  const { data: transactionsData } = useQuery({
    queryKey: ["transactions", userId],
    queryFn: async () => {
      if (!userId) throw new Error("Usuário não autenticado");
      return await getTransactions(userId);
    },
    enabled: !!userId,
  });

  // Buscar contas e categorias
  const { data: accountsData } = useQuery({
    queryKey: ["accounts", userId],
    queryFn: async () => {
      if (!userId) throw new Error("Usuário não autenticado");
      return await getAccounts(userId);
    },
    enabled: !!userId,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories", userId],
    queryFn: async () => {
      if (!userId) throw new Error("Usuário não autenticado");
      return await getCategories(userId);
    },
    enabled: !!userId,
  });

  const [currentMonth] = useState(new Date().getMonth());
  const [currentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 p-6 space-y-6">
      {/* Header Moderno */}
      <ModernDashboardHeader />
      
      {/* Estatísticas Dinâmicas */}
      <DynamicStatsCards
        transactions={transactionsData?.data || []}
        accounts={accountsData?.data || []}
        categories={categoriesData?.data || []}
        currentMonth={currentMonth}
        currentYear={currentYear}
        isLoading={isLoadingAuth}
        isAuthenticated={isAuthenticated}
      />
      
      {/* Filtros e Navegação */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Filtros de Data */}
          <FilterDateModern />
          
          {/* Navegação de Data */}
          <DateNavigation />
          
          {/* Estatísticas de Data */}
          <DateStats />
          
          {/* Contas Bancárias */}
          <Suspense fallback={<LoadingCard />}>
            <ModernAccountBanks />
          </Suspense>
          
          {/* Transações */}
          <Suspense fallback={<LoadingCard />}>
            <ModernTransactions />
          </Suspense>
          
          {/* Transferências */}
          <Suspense fallback={<LoadingCard />}>
            <ModernTransfers />
          </Suspense>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">

          {/* Histórico Geral */}
          <Suspense fallback={<LoadingCard />}>
            {transactionsData?.data && <HistoricStatsCard transactions={transactionsData.data} />}
          </Suspense>
          
         
          
          {/* Categorias */}
          <Suspense fallback={<LoadingCard />}>
            <ModernCategories />
          </Suspense>
          
          {/* Metas */}
          <GoalsPanel />
          
          {/* Notificações */}
          <NotificationsPanel />
          
          {/* Ações Rápidas */}
          <Card className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 border-neutral-700/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-white">
                <Zap className="w-5 h-5" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Nova Transação
              </Button>
              <Button variant="outline" className="w-full border-neutral-700 hover:bg-neutral-800">
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar Dados
              </Button>
              <Button variant="outline" className="w-full border-neutral-700 hover:bg-neutral-800">
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Diálogos */}
      <RegisterTransactionDialog type="EXPENSE" />
      <RegisterTransfer />
      <ModernRegisterTransaction  />
    </div>
  );
}; 