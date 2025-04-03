import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { Categories } from "./Categories";

export const Menu = () => {
  return (
    <NavigationMenu className="mb-4">
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link href="/" legacyBehavior passHref>
            <NavigationMenuLink className="dark:hover:bg-transparent dark:hover:text-neutral-100 dark:text-neutral-100">
              General Summary
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link href="/accounts" legacyBehavior passHref>
            <NavigationMenuLink className="dark:hover:bg-transparent dark:hover:text-neutral-100 dark:text-neutral-400">
              Accounts Banks
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link href="/transactions" legacyBehavior passHref>
            <NavigationMenuLink className="dark:hover:bg-transparent dark:hover:text-neutral-100 dark:text-neutral-400">
              Transactions
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link href="/transfers" legacyBehavior passHref>
            <NavigationMenuLink className="dark:hover:bg-transparent dark:hover:text-neutral-100 dark:text-neutral-400">
              Transfers
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Categories />
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};
