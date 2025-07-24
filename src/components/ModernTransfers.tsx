"use client";

import { memo, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { LoadingCard } from "./ui/loading-spinner";
import { useQuery } from "@tanstack/react-query";
import { useDateStore } from "@/store";
import { getTransfers } from "@/actions/transfers.actions";
import { transformToCurrency } from "@/lib/utils";
import { 
  ArrowUpDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus,
  Eye,
  Calendar,
  Clock,
  Building2,
  CreditCard,
  Filter,
  Search
} from "lucide-react";

// Componente de item de transferência moderna
const ModernTransferItem = memo(({ transfer }: { transfer: any }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-neutral-800/30 rounded-lg hover:bg-neutral-800/50 transition-all duration-200 border border-neutral-700/30 hover:border-neutral-600/50">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-500/20">
          <ArrowUpDown className="w-4 h-4 text-blue-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center gap-1">
              <Building2 className="w-3 h-3 text-neutral-400" />
              <span className="text-xs text-neutral-400">{transfer.bankInitial?.description || 'Origem'}</span>
            </div>
            <ArrowUpRight className="w-3 h-3 text-neutral-500" />
            <div className="flex items-center gap-1">
              <Building2 className="w-3 h-3 text-neutral-400" />
              <span className="text-xs text-neutral-400">{transfer.bankDestine?.description || 'Destino'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Calendar className="w-3 h-3" />
            <span>{new Date(transfer.date).toLocaleDateString('pt-BR')}</span>
            <Clock className="w-3 h-3 ml-2" />
            <span>{new Date(transfer.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="text-right">
          <p className="text-sm font-semibold text-blue-400">
            {transformToCurrency(transfer.value)}
          </p>
          <p className="text-xs text-neutral-500">Transferência</p>
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-white/10">
          <Eye className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
});

ModernTransferItem.displayName = "ModernTransferItem";

// Componente principal de Transferências Modernas
export const ModernTransfers = () => {
  const date = useDateStore((state) => state.date);

  const { data: transfers, isPending } = useQuery({
    queryKey: ["transfers", date],
    queryFn: async () => await getTransfers(date),
  });

  const recentTransfers = transfers?.transfers?.slice(0, 5) || [];

  if (isPending) {
    return (
      <Card className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 border-neutral-700/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <ArrowUpDown className="w-5 h-5" />
            Últimas Transferências
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
            <ArrowUpDown className="w-5 h-5" />
            Últimas Transferências
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-neutral-700 hover:bg-neutral-800">
              <Filter className="w-4 h-4 mr-1" />
              Filtrar
            </Button>
            <Button variant="outline" size="sm" className="border-neutral-700 hover:bg-neutral-800">
              <Search className="w-4 h-4 mr-1" />
              Buscar
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {recentTransfers.length === 0 ? (
          <div className="text-center py-8">
            <ArrowUpDown className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
            <p className="text-neutral-400 mb-2">Nenhuma transferência encontrada</p>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-1" />
              Nova Transferência
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {recentTransfers.map((transfer: any) => (
                <ModernTransferItem key={transfer.id} transfer={transfer} />
              ))}
            </div>
            
            {transfers?.transfers && transfers.transfers.length > 5 && (
              <div className="pt-3 border-t border-neutral-700/50">
                <Button variant="ghost" size="sm" className="w-full text-neutral-400 hover:text-white">
                  Ver todas as transferências ({transfers.transfers.length})
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}; 