import {
  Home,
  LayoutDashboard,
  Settings,
  User,
  ListChecks,
  Database
} from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";

export function AppSidebar() {
  const { isOpen, onOpen, onClose } = useSidebar();

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-30 h-screen w-64 -translate-x-full border-r bg-background transition-transform lg:translate-x-0",
      isOpen && "translate-x-0"
    )}>
      <div className="flex h-full flex-col gap-4">
        <div className="flex h-14 items-center border-b px-4 font-semibold">
          ClientVault
        </div>
        <nav className="flex-1 space-y-1 px-2">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive && "bg-accent text-accent-foreground"
              )
            }
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </NavLink>
          <NavLink
            to="/clients"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive && "bg-accent text-accent-foreground"
              )
            }
          >
            <User className="h-4 w-4" />
            Clients
          </NavLink>
          <NavLink
            to="/orders"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive && "bg-accent text-accent-foreground"
              )
            }
          >
            <ListChecks className="h-4 w-4" />
            Orders
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive && "bg-accent text-accent-foreground"
              )
            }
          >
            <Settings className="h-4 w-4" />
            Settings
          </NavLink>
          <NavLink
            to="/database"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive && "bg-accent text-accent-foreground"
              )
            }
          >
            <Database className="h-4 w-4" />
            Database
          </NavLink>
        </nav>
        <div className="border-t p-4">
          <p className="text-xs text-muted-foreground">
            ClientVault - v0.0.1
          </p>
        </div>
      </div>
    </aside>
  );
}
