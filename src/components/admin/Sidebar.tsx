"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/urls", label: "Manage URLs" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-zinc-900 border-r border-zinc-800 flex flex-col">
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-lg font-bold text-white">Social Shares</h2>
        <p className="text-xs text-zinc-500">Admin Panel</p>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-2 border-t border-zinc-800">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="w-full px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors text-left"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
