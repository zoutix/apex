"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Apple, Dumbbell, Utensils, BarChart3, Settings, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/food", label: "Food Diary", icon: Apple },
  { href: "/exercise", label: "Workouts", icon: Dumbbell },
  { href: "/recipes", label: "Recipes", icon: Utensils },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col h-full w-full p-4 border-r border-border/50 bg-card/40 backdrop-blur-xl">
      <div className="flex items-center gap-2 px-2 py-4 mb-4">
        <div className="w-8 h-8 rounded-lg premium-gradient flex items-center justify-center">
          <Flame className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight">ApexFuel</span>
      </div>

      <ul className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <li key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start font-medium",
                    isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                  leftIcon={<item.icon className="w-4 h-4" />}
                >
                  {item.label}
                </Button>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto">
        <Link href="/settings" passHref legacyBehavior>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start font-medium",
              pathname.startsWith("/settings") ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
            leftIcon={<Settings className="w-4 h-4" />}
          >
            Settings
          </Button>
        </Link>
      </div>
    </nav>
  );
}
