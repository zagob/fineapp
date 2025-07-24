"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart,
  CreditCard
} from "lucide-react";

export const DashboardPreview = () => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">
          Veja como é fácil controlar suas finanças
        </h2>
        <p className="text-neutral-400 text-lg">
          Dashboard intuitivo com todas as informações que você precisa
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Cards de Resumo */}
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-neutral-400">Receitas</p>
                <p className="text-2xl font-bold text-white">R$ 5.240,00</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/10 border-red-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-neutral-400">Despesas</p>
                <p className="text-2xl font-bold text-white">R$ 3.120,00</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-neutral-400">Saldo</p>
                <p className="text-2xl font-bold text-white">R$ 2.120,00</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Categorias */}
        <Card className="bg-neutral-800/50 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-400" />
              Gastos por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-neutral-300">Alimentação</span>
                </div>
                <span className="text-white font-semibold">R$ 850,00</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-neutral-300">Transporte</span>
                </div>
                <span className="text-white font-semibold">R$ 420,00</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-neutral-300">Lazer</span>
                </div>
                <span className="text-white font-semibold">R$ 380,00</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-neutral-300">Outros</span>
                </div>
                <span className="text-white font-semibold">R$ 1.470,00</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contas Bancárias */}
        <Card className="bg-neutral-800/50 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-400" />
              Suas Contas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-neutral-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">I</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Itaú</p>
                    <p className="text-neutral-400 text-sm">Conta Corrente</p>
                  </div>
                </div>
                <span className="text-white font-semibold">R$ 1.850,00</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-neutral-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">N</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Nubank</p>
                    <p className="text-neutral-400 text-sm">Conta Digital</p>
                  </div>
                </div>
                <span className="text-white font-semibold">R$ 270,00</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-neutral-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">P</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">PicPay</p>
                    <p className="text-neutral-400 text-sm">Carteira Digital</p>
                  </div>
                </div>
                <span className="text-white font-semibold">R$ 45,00</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 