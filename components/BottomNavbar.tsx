"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, FileTextIcon, PillIcon, MessageSquareIcon, ClockIcon } from "lucide-react";

export function BottomNavbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", icon: HomeIcon, label: "Dashboard" },
    { href: "/documents", icon: FileTextIcon, label: "Documents" },
    { href: "/medications", icon: PillIcon, label: "Medications" },
    { href: "/chat", icon: MessageSquareIcon, label: "Chat" },
    { href: "/timeline", icon: ClockIcon, label: "Timeline" },
  ];

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 bg-white shadow-lg md:hidden dark:bg-gray-950">
      <nav className="flex h-16 items-center justify-around px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              className={`flex flex-col items-center gap-1 text-xs font-medium ${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`}
              href={item.href}
            >
              <Icon className="h-6 w-6" />
              <span className="sr-only sm:not-sr-only">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
