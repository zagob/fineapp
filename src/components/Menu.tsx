import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { NavigationItem } from "./NavigationItem";
import { Trash2 } from "lucide-react";
import Link from "next/link";

export const Menu = () => {
  return (
    <NavigationMenu className="mb-4">
      <NavigationMenuList>
        <NavigationItem href="/" title="Resumo Geral" />
        <NavigationItem href="/accounts" title="Bancos" />
        <NavigationItem href="/transactions" title="Transações" />
        <NavigationItem href="/transfers" title="Transferências" />

        <NavigationMenuItem>
          <Link
            href="/admin/trash"
            className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Lixeira
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};
