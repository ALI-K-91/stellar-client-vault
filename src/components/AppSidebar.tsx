
import React, { useEffect } from "react";
import {
  Home,
  LayoutDashboard,
  Settings,
  User,
  ListChecks,
  Database,
  Menu,
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
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

export function AppSidebar() {
  const { state, open, setOpen } = useSidebar();
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);

  // Force close drawer when navigating
  useEffect(() => {
    setOpenMobile(false);
  }, [window.location.pathname]);

  const renderNavLinks = (closeSidebar = false) => {
    const links = [
      { to: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" />, label: "Dashboard" },
      { to: "/clients", icon: <User className="h-4 w-4" />, label: "Clients" },
      { to: "/orders", icon: <ListChecks className="h-4 w-4" />, label: "Orders" },
      { to: "/settings", icon: <Settings className="h-4 w-4" />, label: "Settings" },
      { to: "/database", icon: <Database className="h-4 w-4" />, label: "Database" },
    ];

    return links.map((link) => (
      <NavLink
        key={link.to}
        to={link.to}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
            isActive && "bg-accent text-accent-foreground"
          )
        }
        onClick={() => closeSidebar && setOpenMobile(false)}
      >
        {link.icon}
        {link.label}
      </NavLink>
    ));
  };

  return (
    <>
      {/* Mobile sidebar */}
      {isMobile ? (
        <div className="fixed top-0 left-0 z-40 p-4">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-9 w-9"
            onClick={() => setOpenMobile(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <Drawer open={openMobile} onOpenChange={setOpenMobile}>
            <DrawerContent className="fixed left-0 right-0 h-[80%] p-0">
              <div className="flex h-full flex-col gap-4">
                <div className="flex h-14 items-center border-b px-4 font-semibold">
                  ClientVault
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-auto"
                    onClick={() => setOpenMobile(false)}
                  >
                    Close
                  </Button>
                </div>
                <nav className="flex-1 space-y-1 px-2">
                  {renderNavLinks(true)}
                </nav>
                <div className="border-t p-4">
                  <p className="text-xs text-muted-foreground">
                    ClientVault - v0.0.1
                  </p>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      ) : null}

      {/* Desktop sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-30 h-screen w-64 -translate-x-full border-r bg-background transition-transform lg:translate-x-0",
        open && "translate-x-0"
      )}>
        <div className="flex h-full flex-col gap-4">
          <div className="flex h-14 items-center border-b px-4 font-semibold">
            ClientVault
          </div>
          <nav className="flex-1 space-y-1 px-2">
            {renderNavLinks()}
          </nav>
          <div className="border-t p-4">
            <p className="text-xs text-muted-foreground">
              ClientVault - v0.0.1
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
