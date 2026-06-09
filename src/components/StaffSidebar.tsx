"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { HiHome, HiOutlinePlus } from "react-icons/hi";
import { BsBookHalf } from "react-icons/bs";
import { MdHistory, MdOutlineQuiz } from "react-icons/md";
import { FaRegUser } from "react-icons/fa";
import { IoExitOutline } from "react-icons/io5";

const navItems = [
  { href: "/staffDashboard",              icon: HiHome,        label: "Home",         match: (p: string) => p === "/staffDashboard" },
  { href: "/staffDashboard/notes",        icon: BsBookHalf,    label: "My Notes",     match: (p: string) => p.startsWith("/staffDashboard/notes") },
  { href: "/staffDashboard/new-notes",    icon: HiOutlinePlus, label: "Upload Notes", match: (p: string) => p.startsWith("/staffDashboard/new-notes") },
  { href: "/staffDashboard/new-test",     icon: MdOutlineQuiz, label: "Create Test",  match: (p: string) => p.startsWith("/staffDashboard/new-test") },
  { href: "/staffDashboard/test-history", icon: MdHistory,     label: "Test History", match: (p: string) => p.startsWith("/staffDashboard/test-history") },
];

const pageTitles: Record<string, string> = {
  "/staffDashboard": "Home",
  "/staffDashboard/notes": "Notes",
  "/staffDashboard/new-notes": "Upload Notes",
  "/staffDashboard/new-test": "Create Test",
  "/staffDashboard/test-history": "Test History",
  "/staffDashboard/profile": "My Profile",
};

function getPageTitle(pathname: string) {
  return (
    Object.entries(pageTitles).find(([key]) => pathname.startsWith(key))?.[1] ?? "Dashboard"
  );
}

interface StaffSidebarProps {
  readonly children: React.ReactNode;
}

export default function StaffSidebar({ children }: StaffSidebarProps) {
  const pathname = usePathname();
  const session = useSession();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-cream">
      {/* ── Sidebar ── */}
      <aside className="w-[70px] bg-forest flex flex-col items-center py-5 flex-shrink-0">
        <Link href="/staffDashboard" title="StudyHub Home" className="mb-6">
          <div className="bg-emerald/20 rounded-xl p-2 flex items-center justify-center">
            <Image src="/logo.png" alt="StudyHub logo" width={28} height={28} priority />
          </div>
        </Link>

        <nav className="flex flex-col items-center gap-2 flex-1">
          {navItems.map(({ href, icon: Icon, label, match }) => {
            const active = match(pathname);
            return (
              <Link key={href} href={href} title={label}>
                <button
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                    active
                      ? "bg-emerald text-white"
                      : "text-white/50 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="text-xl" />
                </button>
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col items-center gap-2">
          <Link href="/staffDashboard/profile" title="Profile">
            <button className="w-11 h-11 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors">
              <FaRegUser className="text-xl" />
            </button>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/signin" })}
            title="Sign out"
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <IoExitOutline className="text-xl" />
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b border-forest/8 flex items-center justify-between px-6 flex-shrink-0">
          <h1 className="font-display font-semibold text-ink">{getPageTitle(pathname)}</h1>
          <span className="text-sm text-muted">{session.data?.user?.name}</span>
        </header>

        <main className="flex-1 overflow-y-auto bg-cream">
          {children}
        </main>
      </div>
    </div>
  );
}
