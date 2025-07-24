"use client";

import { 
  Shield, 
  Zap, 
  Smartphone, 
  Globe,
  Heart,
  Github,
  Twitter,
  Linkedin
} from "lucide-react";

export const LoginFooter = () => {
  return (
    <footer className="bg-neutral-900 border-t border-neutral-800">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="text-xl font-bold text-white">FineApp</span>
            </div>
            <p className="text-neutral-400 text-sm">
              Sua ferramenta completa para gestão financeira pessoal. 
              Controle, analise e otimize suas finanças com facilidade.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Recursos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  Dashboard Intuitivo
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  Categorização Automática
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  Relatórios Detalhados
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  Múltiplas Contas
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  Exportação de Dados
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Suporte</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  Central de Ajuda
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  Tutoriais
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  Contato
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  Status do Sistema
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Empresa</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  Sobre Nós
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  Carreiras
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  Privacidade
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  Termos de Uso
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-neutral-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-sm text-neutral-400">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>100% Seguro</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>Rápido</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                <span>Responsivo</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>Global</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-400">
              <span>Feito com</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span>para você</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}; 