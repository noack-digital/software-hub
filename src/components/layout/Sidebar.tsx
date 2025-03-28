import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Package, Upload, Users, Settings, Home, Code, Tags } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    href: "/admin",
  },
  {
    title: "Software",
    icon: Package,
    href: "/admin/software",
  },
  {
    title: "Kategorien",
    icon: Tags,
    href: "/admin/categories",
  },
  {
    title: "Import/Export",
    icon: Upload,
    href: "/admin/import-export",
  },
  {
    title: "Einbetten",
    icon: Code,
    href: "/admin/embed",
  },
  {
    title: "Benutzer",
    icon: Users,
    href: "/admin/users",
  },
  {
    title: "Einstellungen",
    icon: Settings,
    href: "/admin/settings",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-white/50 backdrop-blur-xl">
      <div className="flex h-14 items-center border-b px-6">
        <Link 
          href="/" 
          className="flex items-center gap-2 font-semibold"
        >
          <Package className="h-6 w-6" />
          <span>Software Hub</span>
        </Link>
      </div>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-2",
                    pathname === item.href && "bg-primary/5 text-primary"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
