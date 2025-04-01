import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Package, Upload, Users, Settings, Home, Code, Tags, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";

export function Sidebar() {
  const pathname = usePathname();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const { t } = useLanguage();

  const toggleSubmenu = (href: string) => {
    setExpandedMenu(expandedMenu === href ? null : href);
  };

  const menuItems = [
    {
      title: t('navigation.dashboard'),
      icon: Home,
      href: "/admin",
    },
    {
      title: t('navigation.software'),
      icon: Package,
      href: "/admin/software",
    },
    {
      title: t('navigation.categories'),
      icon: Tags,
      href: "/admin/categories",
    },
    {
      title: t('navigation.importExport'),
      icon: Upload,
      href: "/admin/import-export",
    },
    {
      title: t('navigation.settings'),
      icon: Settings,
      href: "#",
      submenu: [
        {
          title: t('navigation.users'),
          icon: Users,
          href: "/admin/users",
        },
        {
          title: t('navigation.embed'),
          icon: Code,
          href: "/admin/embed",
        },
        {
          title: t('navigation.badgeSettings'),
          icon: Tags,
          href: "/admin/settings/badge",
        },
        {
          title: t('navigation.linkSettings'),
          icon: Settings,
          href: "/admin/settings/links",
        },
        {
          title: t('navigation.misc'),
          icon: Settings,
          href: "/admin/settings/misc",
        }
      ]
    },
  ];

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
              <div key={item.href}>
                {item.submenu ? (
                  <Button
                    variant={pathname?.startsWith(item.href) ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-between gap-2",
                      pathname?.startsWith(item.href) && "bg-primary/5 text-primary"
                    )}
                    onClick={() => toggleSubmenu(item.href)}
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </div>
                    {expandedMenu === item.href ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                ) : (
                  <Link href={item.href}>
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
                )}
                
                {/* Untermenü anzeigen, wenn vorhanden und expandiert */}
                {item.submenu && expandedMenu === item.href && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.submenu.map((subItem) => (
                      <Link key={subItem.href} href={subItem.href}>
                        <Button
                          variant={pathname === subItem.href ? "secondary" : "ghost"}
                          className={cn(
                            "w-full justify-start gap-2",
                            pathname === subItem.href && "bg-primary/5 text-primary"
                          )}
                        >
                          <subItem.icon className="h-4 w-4" />
                          {subItem.title}
                        </Button>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
