"use client";

import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { 
  TrendingUp, 
  PieChart, 
  Shield, 
  Zap, 
  BarChart3, 
  CreditCard,
  ArrowRight,
  CheckCircle,
  DollarSign,
  PiggyBank
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { DashboardPreview } from "./DashboardPreview";
import { LoginFooter } from "./LoginFooter";

const features = [
  {
    icon: TrendingUp,
    title: "Controle Total",
    description: "Acompanhe suas receitas e despesas em tempo real"
  },
  {
    icon: PieChart,
    title: "Categorização Inteligente",
    description: "Organize seus gastos por categorias personalizadas"
  },
  {
    icon: BarChart3,
    title: "Relatórios Detalhados",
    description: "Visualize seus dados financeiros com gráficos interativos"
  },
  {
    icon: CreditCard,
    title: "Múltiplas Contas",
    description: "Gerencie diferentes contas bancárias em um só lugar"
  },
  {
    icon: Shield,
    title: "Segurança Total",
    description: "Seus dados protegidos com criptografia de ponta"
  },
  {
    icon: Zap,
    title: "Sincronização Automática",
    description: "Acesse seus dados de qualquer dispositivo"
  }
];

const stats = [
  { icon: DollarSign, value: "R$ 0", label: "Economia Mensal" },
  { icon: PiggyBank, value: "100%", label: "Controle Financeiro" },
  { icon: CheckCircle, value: "24/7", label: "Disponibilidade" }
];

export const LoginPage = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGoogleSignIn = () => {
    if (mounted) {
      signIn("google", { callbackUrl: "/" });
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">FineApp</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
          {/* Left Side - Hero */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                Controle suas{" "}
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  finanças
                </span>{" "}
                de forma inteligente
              </h1>
              <p className="text-xl text-neutral-300 leading-relaxed">
                O FineApp é sua ferramenta completa para gestão financeira pessoal. 
                Organize, analise e otimize seus gastos com facilidade e segurança.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg mx-auto mb-3">
                    <stat.icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-neutral-400">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="space-y-4">
              <Button
                onClick={handleGoogleSignIn}
                size="lg"
                className="w-full lg:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Entrar com Google
                  <ArrowRight className="w-5 h-5" />
                </div>
              </Button>
              <p className="text-sm text-neutral-400 text-center lg:text-left">
                ✨ Gratuito • Sem cartão de crédito • Comece agora
              </p>
            </div>
          </div>

          {/* Right Side - Features */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="bg-neutral-800/50 border-neutral-700 hover:bg-neutral-800/70 transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                          <feature.icon className="w-6 h-6 text-blue-400" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-neutral-400 text-sm leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Preview Section */}
      <div className="py-20 bg-neutral-800/30">
        <div className="container mx-auto px-6">
          <DashboardPreview />
        </div>
      </div>

      {/* Footer */}
      <LoginFooter />

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}; 