"use client";

import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import type { AnchorHTMLAttributes } from "react";

type NavLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    activeClassName?: string;
    children?: React.ReactNode;
  };

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ href, className, activeClassName, children, ...props }, ref) => {
    const pathname = usePathname();
    const hrefStr = typeof href === "string" ? href : String(href);
    const isActive = pathname === hrefStr || (pathname?.startsWith(hrefStr + "/") ?? false);

    return (
      <Link
        ref={ref}
        href={href}
        className={cn(className, isActive && activeClassName)}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

NavLink.displayName = "NavLink";

export { NavLink };
