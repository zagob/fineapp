"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { 
  Calendar, 
  Activity, 
  Target, 
  DollarSign,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export const ColorPreview = () => {
  return (
    <Card className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 border-neutral-700/50">
      <CardHeader>
        <CardTitle className="text-white">Paleta de Cores Harmonizada</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* DateStats Preview */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-neutral-300">DateStats Component</h3>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2 px-3 py-2 bg-neutral-800/60 rounded-lg border border-neutral-700/50 shadow-sm">
              <Calendar className="w-4 h-4 text-neutral-300" />
              <span className="text-neutral-200 capitalize font-medium">Janeiro de 2025</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-neutral-800/60 rounded-lg border border-neutral-700/50 shadow-sm">
              <Activity className="w-4 h-4 text-blue-300" />
              <span className="text-neutral-200 font-medium">15 transações</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-neutral-800/60 rounded-lg border border-neutral-700/50 shadow-sm">
              <Target className="w-4 h-4 text-purple-300" />
              <span className="text-neutral-200 font-medium">0.5/dia</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border shadow-sm bg-emerald-500/15 border-emerald-500/40">
              <DollarSign className="w-4 h-4 text-emerald-300" />
              <span className="font-semibold text-emerald-300">R$ 2.500,00</span>
            </div>
          </div>
        </div>

        {/* DateNavigation Preview */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-neutral-300">DateNavigation Component</h3>
          <div className="flex items-center gap-2">
            <button className="h-8 w-8 p-0 border border-neutral-700 rounded-md hover:bg-neutral-700/50 hover:border-neutral-600 text-neutral-300 flex items-center justify-center">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 px-3 py-2 bg-neutral-800/60 rounded-lg border border-neutral-700/50 shadow-sm min-w-[140px] justify-center">
              <Calendar className="w-4 h-4 text-neutral-300" />
              <span className="text-neutral-200 text-sm capitalize font-medium">Janeiro de 2025</span>
            </div>
            <button className="h-8 w-8 p-0 border border-neutral-700 rounded-md hover:bg-neutral-700/50 hover:border-neutral-600 text-neutral-300 flex items-center justify-center">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button className="h-8 px-3 text-xs border border-neutral-700 rounded-md hover:bg-neutral-700/50 hover:border-neutral-600 text-neutral-300">
              Hoje
            </button>
          </div>
        </div>

        {/* FilterDateModern Preview */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-neutral-300">FilterDateModern Component</h3>
          <div className="w-[180px] h-9 bg-neutral-800/60 border border-neutral-700/50 rounded-lg flex items-center gap-2 px-3 text-neutral-200">
            <Calendar className="w-4 h-4 text-neutral-300" />
            <span className="capitalize">Janeiro 2025</span>
          </div>
        </div>

        {/* Color Palette */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-neutral-300">Nova Paleta de Cores</h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-neutral-200 rounded"></div>
                <span className="text-neutral-300">text-neutral-200 (Texto principal)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-neutral-300 rounded"></div>
                <span className="text-neutral-300">text-neutral-300 (Ícones)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-neutral-700 rounded"></div>
                <span className="text-neutral-300">border-neutral-700 (Bordas)</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-300 rounded"></div>
                <span className="text-neutral-300">text-blue-300 (Atividade)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-300 rounded"></div>
                <span className="text-neutral-300">text-purple-300 (Meta)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-emerald-300 rounded"></div>
                <span className="text-neutral-300">text-emerald-300 (Positivo)</span>
              </div>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}; 