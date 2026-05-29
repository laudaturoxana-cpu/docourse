"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, PlusCircle, Users, Zap, Settings, LogOut, X, GraduationCap, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function DashboardSidebar({ isOpen, onClose }: Props) {
  const pathname = usePathname();
  const { profile, signOut, isAdmin } = useAuth();

  const hasActive = profile?.subscription_active || profile?.lifetime_access || profile?.beta_tester;
  const isPro = (!!hasActive && profile?.plan_type === "pro") || !!profile?.lifetime_access || !!isAdmin;

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", pro: false },
    { icon: BookOpen, label: "Cursurile mele", href: "/dashboard/courses", pro: false },
    { icon: PlusCircle, label: "Creează curs", href: "/dashboard/courses/new", pro: false },
    { icon: Users, label: "Comunitate", href: "/dashboard/community", pro: false },
    { icon: Zap, label: "Email Marketing", href: "/dashboard/email", pro: true },
    { icon: Settings, label: "Setări profil", href: "/dashboard/settings", pro: false },
  ];

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  const NavItems = ({ onClick }: { onClick?: () => void }) => (
    <ul className="space-y-1">
      {menuItems.map((item) => {
        const locked = item.pro && !isPro;
        return (
          <li key={item.label}>
            <Link
              href={item.href}
              onClick={onClick}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                locked
                  ? "text-muted-foreground/50 hover:bg-beige/50 hover:text-muted-foreground"
                  : isActive(item.href)
                  ? "bg-gold/10 text-gold font-medium"
                  : "text-charcoal hover:bg-beige hover:text-navy"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1">{item.label}</span>
              {locked && (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-gold/10 text-gold/70 border border-gold/20">
                  <Lock className="w-2.5 h-2.5" />
                  Pro
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  const BottomActions = ({ onClick }: { onClick?: () => void }) => (
    <div className="space-y-1">
      <Link
        href="/student"
        onClick={onClick}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-beige hover:text-navy transition-colors w-full text-sm"
      >
        <GraduationCap className="w-5 h-5" />
        Contul meu de cursant
      </Link>
      <button
        onClick={() => signOut()}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
      >
        <LogOut className="w-5 h-5" />
        Deconectare
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-background border-r border-border shrink-0">
        <div className="p-6 border-b border-border">
          <Link href="/"><Logo size="md" /></Link>
        </div>
        <nav className="flex-1 p-4 overflow-y-auto">
          <NavItems />
        </nav>
        <div className="p-4 border-t border-border">
          <BottomActions />
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-navy/50" onClick={onClose} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-background animate-slide-in-left flex flex-col">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <Logo size="sm" />
              <button onClick={onClose}><X className="w-6 h-6 text-charcoal" /></button>
            </div>
            <nav className="flex-1 p-4 overflow-y-auto">
              <NavItems onClick={onClose} />
            </nav>
            <div className="p-4 border-t border-border">
              <BottomActions onClick={onClose} />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
