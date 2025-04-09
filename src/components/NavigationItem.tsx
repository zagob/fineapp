"use client";

import Link from "next/link";
import { NavigationMenuItem, NavigationMenuLink } from "./ui/navigation-menu";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavigationItemProps {
  href: string;
  title: string;
}

export const NavigationItem = ({ href, title }: NavigationItemProps) => {
  const pathname = usePathname();

  console.log("path", pathname);

  const isActiveLinkClass = href === pathname;

  return (
    <NavigationMenuItem>
      <Link href={href} legacyBehavior passHref>
        <NavigationMenuLink className={cn("dark:hover:bg-transparent dark:hover:text-neutral-100 dark:text-neutral-400", {
            "dark:text-neutral-100": isActiveLinkClass
        })}>
          {title}
        </NavigationMenuLink>
      </Link>
    </NavigationMenuItem>
  );
};
