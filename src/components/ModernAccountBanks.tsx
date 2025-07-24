"use client";

import { memo, Suspense, useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { LoadingCard } from "./ui/loading-spinner";
import { useQuery } from "@tanstack/react-query";
import { useDateStore } from "@/store";
import { getAccounts, getDeletedAccounts } from "@/actions/accounts.actions.soft-delete";
import { transformToCurrency } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import TrashBin from "@/components/TrashBin";
import { 
  CreditCard, 
  Building2, 
  Wallet, 
  PiggyBank, 
  TrendingUp, 
  Plus,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  Shield,
  Zap,
  Trash2
} from "lucide-react";

// Componente de cartão de conta bancária moderno
const ModernAccountCard = memo(({ 
  account, 
  isVisible, 
  onToggleVisibility 
}: {
  account: any;
  isVisible: boolean;
  onToggleVisibility: () => void;
}) => {
  const getBankIcon = (bankName: string) => {
    const name = bankName.toLowerCase();
    if (name.includes('nubank')) return <CreditCard className="w-6 h-6 text-purple-500" />;
    if (name.includes('itau') || name.includes('itáu')) return <Building2 className="w-6 h-6 text-orange-500" />;
    if (name.includes('bradesco')) return <Building2 className="w-6 h-6 text-red-500" />;
    if (name.includes('santander')) return <Building2 className="w-6 h-6 text-red-600" />;
    if (name.includes('caixa')) return <Building2 className="w-6 h-6 text-blue-600" />;
    if (name.includes('banco do brasil') || name.includes('bb')) return <Building2 className="w-6 h-6 text-yellow-500" />;
    if (name.includes('inter')) return <Building2 className="w-6 h-6 text-orange-600" />;
    if (name.includes('carteira') || name.includes('wallet')) return <Wallet className="w-6 h-6 text-green-500" />;
    if (name.includes('poupanca') || name.includes('poupança')) return <PiggyBank className="w-6 h-6 text-blue-500" />;
    if (name.includes('picpay')) return <CreditCard className="w-6 h-6 text-green-500" />;
    return <Building2 className="w-6 h-6 text-neutral-400" />;
  };

  const getGradientClass = (bankName: string) => {
    const name = bankName.toLowerCase();
    if (name.includes('nubank')) return 'from-purple-500/20 to-purple-600/20 border-purple-500/30';
    if (name.includes('itau') || name.includes('itáu')) return 'from-orange-500/20 to-orange-600/20 border-orange-500/30';
    if (name.includes('bradesco')) return 'from-red-500/20 to-red-600/20 border-red-500/30';
    if (name.includes('santander')) return 'from-red-600/20 to-red-700/20 border-red-600/30';
    if (name.includes('caixa')) return 'from-blue-600/20 to-blue-700/20 border-blue-600/30';
    if (name.includes('banco do brasil') || name.includes('bb')) return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30';
    if (name.includes('inter')) return 'from-orange-600/20 to-orange-700/20 border-orange-600/30';
    if (name.includes('carteira') || name.includes('wallet')) return 'from-green-500/20 to-green-600/20 border-green-500/30';
    if (name.includes('poupanca') || name.includes('poupança')) return 'from-blue-500/20 to-blue-600/20 border-blue-500/30';
    if (name.includes('picpay')) return 'from-green-500/20 to-green-600/20 border-green-500/30';
    return 'from-neutral-500/20 to-neutral-600/20 border-neutral-500/30';
  };

  return (
    <Card className={`bg-gradient-to-br ${getGradientClass(account.bank)} hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-neutral-900/20`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {getBankIcon(account.bank)}
            <div>
              <h3 className="font-semibold text-white text-sm">{account.description}</h3>
              <p className="text-xs text-neutral-400">{account.bank}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleVisibility}
            className="h-8 w-8 p-0 hover:bg-white/10"
          >
            {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">Saldo</span>
            <span className="text-lg font-bold text-white">
              {isVisible ? transformToCurrency(account.amount) : '••••••'}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400">Tipo</span>
            <span className="text-neutral-300">
              {account.bank}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400">Descrição</span>
            <span className="text-neutral-300 truncate max-w-[120px]">
              {account.description}
            </span>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-400">+2.5%</span>
            </div>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-white/10">
              <Settings className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ModernAccountCard.displayName = "ModernAccountCard";

// Componente principal de Contas Bancárias Modernas
export const ModernAccountBanks = () => {
  const date = useDateStore((state) => state.date);
  const [visibleAccounts, setVisibleAccounts] = useState<Record<string, boolean>>({});
  
  // Usar o hook de autenticação para pegar o userId real
  const { userId, isAuthenticated, isLoading: isLoadingAuth } = useAuth();

  // Buscar contas ativas
  const { data: accountsData, isPending } = useQuery({
    queryKey: ["accounts", date, userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error("Usuário não autenticado");
      }
      return await getAccounts(userId);
    },
    enabled: !!userId, // Só executa se tiver userId
  });

  console.log({
    accountsData
  })

  // Buscar contas deletadas
  const { data: deletedAccountsData } = useQuery({
    queryKey: ["deleted-accounts", userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error("Usuário não autenticado");
      }
      return await getDeletedAccounts(userId);
    },
    enabled: !!userId, // Só executa se tiver userId
  });

  // Usar useMemo para evitar recriação desnecessária
  const accountsList = useMemo(() => {
    return accountsData?.data || [];
  }, [accountsData?.data]);

  const deletedAccounts = useMemo(() => {
    return (deletedAccountsData?.data || []).map((account: any) => ({
      ...account,
      deletedAt: account.deletedAt?.toISOString() || new Date().toISOString()
    }));
  }, [deletedAccountsData?.data]);

  // Usar useMemo para criar IDs únicos das contas
  const accountIds = useMemo(() => {
    return accountsList.map((account: any) => account.id);
  }, [accountsList]);

  useEffect(() => {
    if (accountsList.length > 0) {
      const initialVisibility = accountsList.reduce((acc: Record<string, boolean>, account: any) => {
        acc[account.id] = true;
        return acc;
      }, {});
      setVisibleAccounts(initialVisibility);
    }
  }, [accountIds]); // Usar accountIds como dependência

  const toggleAccountVisibility = (accountId: string) => {
    setVisibleAccounts(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const totalBalance = useMemo(() => {
    return accountsList.reduce((sum: number, account: any) => {
      return sum + (account.amount || 0);
    }, 0);
  }, [accountsList]);

  // Se ainda está carregando a autenticação, mostrar loading
  if (isLoadingAuth) {
    return (
      <Card className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 border-neutral-700/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <CreditCard className="w-5 h-5" />
            Contas Bancárias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingCard />
        </CardContent>
      </Card>
    );
  }

  // Se não está autenticado, mostrar mensagem
  if (!isAuthenticated) {
    return (
      <Card className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 border-neutral-700/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <CreditCard className="w-5 h-5" />
            Contas Bancárias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
            <p className="text-neutral-400 mb-2">Faça login para ver suas contas</p>
            <p className="text-xs text-neutral-500">Autenticação necessária</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isPending) {
    return (
      <Card className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 border-neutral-700/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <CreditCard className="w-5 h-5" />
            Contas Bancárias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingCard />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 border-neutral-700/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <CreditCard className="w-5 h-5" />
            Contas Bancárias
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-neutral-800 rounded-md">
              <span className="text-sm text-neutral-300">
                Total: {transformToCurrency(totalBalance)}
              </span>
            </div>
            <TrashBin
              title="Lixeira de Contas Bancárias"
              description="Gerencie contas bancárias que foram movidas para a lixeira"
              items={deletedAccounts}
              onRestore={async (id) => {
                const response = await fetch("/api/accounts/restore", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id }),
                });
                return response.json();
              }}
              onHardDelete={async (id) => {
                const response = await fetch("/api/accounts/hard-delete", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id }),
                });
                return response.json();
              }}
              renderItem={(account) => (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-600 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium">{account.description}</p>
                    <p className="text-sm text-neutral-500">{account.bank}</p>
                  </div>
                </div>
              )}
              emptyMessage="Nenhuma conta bancária foi deletada"
            />
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-1" />
              Nova Conta
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {accountsList.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
            <p className="text-neutral-400 mb-2">Nenhuma conta cadastrada</p>
            <p className="text-xs text-neutral-500">Adicione sua primeira conta bancária</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accountsList.map((account: any) => (
              <ModernAccountCard
                key={account.id}
                account={account}
                isVisible={visibleAccounts[account.id] || false}
                onToggleVisibility={() => toggleAccountVisibility(account.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 