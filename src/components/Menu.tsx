import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import Link from "next/link";

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
      </NavigationMenuList>
    </NavigationMenu>
  );
};
