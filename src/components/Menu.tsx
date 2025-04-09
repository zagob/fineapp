import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Categories } from "./Categories";
import { NavigationItem } from "./NavigationItem";

export const Menu = () => {
  return (
    <NavigationMenu className="mb-4">
      <NavigationMenuList>
        <NavigationItem href="/" title="Resumo Geral" />
        <NavigationItem href="/accounts" title="Bancos" />
        <NavigationItem href="/transactions" title="Transações" />
        <NavigationItem href="/transfers" title="Transferências" />

        <NavigationMenuItem>
          <Categories />
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};
