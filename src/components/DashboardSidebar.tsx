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
    <ul className="space-y-0.5">
      {menuItems.map((item) => {
        const locked = item.pro && !isPro;
        const active = isActive(item.href);
        return (
          <li key={item.label}>
            <Link
              href={item.href}
              onClick={onClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative",
                locked
                  ? "text-muted-foreground/40 hover:bg-muted/30 hover:text-muted-foreground/60"
                  : active
                  ? "bg-gold/10 text-gold font-semibold"
                  : "text-charcoal/80 hover:bg-beige hover:text-navy"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gold rounded-r-full" />
              )}
              <item.icon className={cn("w-5 h-5 shrink-0", active ? "text-gold" : "")} />
              <span className="flex-1 text-sm">{item.label}</span>
              {locked && (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-gold/10 text-gold/60 border border-gold/20">
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
    <div className="space-y-0.5">
      <Link
        href="/student"
        onClick={onClick}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground/70 hover:bg-beige hover:text-navy transition-colors w-full text-sm"
      >
        <GraduationCap className="w-5 h-5 shrink-0" />
        Contul meu de cursant
      </Link>
      <button
        onClick={() => signOut()}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground/70 hover:bg-destructive/8 hover:text-destructive transition-colors w-full text-sm"
      >
        <LogOut className="w-5 h-5 shrink-0" />
        Deconectare
      </button>
    </div>
  );

  const SidebarContent = ({ onItemClick }: { onItemClick?: () => void }) => (
    <>
      <div className="px-5 py-5 border-b border-border/60">
        <Link href="/"><Logo size="md" /></Link>
      </div>
      <nav className="flex-1 p-3 overflow-y-auto">
        <NavItems onClick={onItemClick} />
      </nav>
      <div className="p-3 border-t border-border/60">
        <BottomActions onClick={onItemClick} />
      </div>
    </>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-border/60 shadow-sm shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm" onClick={onClose} />
          <aside className="absolute left-0 top-0 bottom-0 w-60 bg-white shadow-2xl animate-slide-in-left flex flex-col">
            <div className="px-5 py-5 border-b border-border/60 flex items-center justify-between">
              <Logo size="sm" />
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-beige transition-colors"
              >
                <X className="w-4 h-4 text-charcoal" />
              </button>
            </div>
            <nav className="flex-1 p-3 overflow-y-auto">
              <NavItems onClick={onClose} />
            </nav>
            <div className="p-3 border-t border-border/60">
              <BottomActions onClick={onClose} />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
