import Link from "next/link"
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: typeof LayoutDashboard;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: BookOpen, label: "Cursuri", href: "/dashboard/courses" },
  { icon: Users, label: "Comunitate", href: "/my-communities" },
];

const MobileBottomNav = () => {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname?.startsWith(href) ?? false;
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-40 safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors",
                active
                  ? "text-gold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", active && "stroke-[2.5]")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
