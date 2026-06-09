"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useAppSelector } from "@/store/index";
import { useAppDispatch } from "@/utils/hooks";
import { getNotes } from "@/store/notes.slice";
import { TestsSelector, getTestsWithQuestions } from "@/store/tests.slice";
import { HiHome } from "react-icons/hi";
import { BsBookHalf, BsBookmarkHeart } from "react-icons/bs";
import { GiNotebook } from "react-icons/gi";
import { MdHistory } from "react-icons/md";
import { FaRegUser } from "react-icons/fa";
import { IoExitOutline } from "react-icons/io5";

interface DashboardLayoutUIProps {
  readonly children: React.ReactNode;
}

const navItems = [
  { href: "/dashboard", icon: HiHome, label: "Home", match: (p: string) => p === "/dashboard" },
  { href: "/dashboard/notes", icon: BsBookHalf, label: "Notes", match: (p: string) => p.startsWith("/dashboard/notes") },
  { href: "/dashboard/attendTest", icon: GiNotebook, label: "Tests", match: (p: string) => p.startsWith("/dashboard/attendTest") },
  { href: "/dashboard/testHistory", icon: MdHistory, label: "History", match: (p: string) => p.startsWith("/dashboard/testHistory") },
  { href: "/dashboard/saved", icon: BsBookmarkHeart, label: "Saved", match: (p: string) => p.startsWith("/dashboard/saved") },
];

const pageTitles: Record<string, string> = {
  "/dashboard": "Home",
  "/dashboard/notes": "Notes",
  "/dashboard/attendTest": "Tests",
  "/dashboard/testHistory": "Test History",
  "/dashboard/saved": "Saved Notes",
  "/dashboard/profile": "My Profile",
};

function getPageTitle(pathname: string) {
  return (
    Object.entries(pageTitles).find(([key]) => pathname.startsWith(key))?.[1] ?? "Dashboard"
  );
}

export default function DashboardLayoutUI({ children }: DashboardLayoutUIProps) {
  const pathname = usePathname();
  const session = useSession();
  const dispatch = useAppDispatch();
  const notesIds = useAppSelector((state) => state.notes.ids);
  const testIds = useAppSelector(TestsSelector.selectIds);

  useEffect(() => {
    if (notesIds.length === 0) dispatch(getNotes());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (testIds.length === 0) dispatch(getTestsWithQuestions());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-cream">
      {/* ── Sidebar ── */}
      <aside className="w-[70px] bg-forest flex flex-col items-center py-5 flex-shrink-0">
        {/* Logo */}
        <Link href="/dashboard" title="StudyHub Home" className="mb-6">
          <div className="bg-emerald/20 rounded-xl p-2 flex items-center justify-center">
            <Image src="/logo.png" alt="StudyHub logo" width={28} height={28} priority />
          </div>
        </Link>

        {/* Nav */}
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

        {/* Bottom */}
        <div className="flex flex-col items-center gap-2">
          <Link href="/dashboard/profile" title="Profile">
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
        {/* Header */}
        <header className="h-14 bg-white border-b border-forest/8 flex items-center justify-between px-6 flex-shrink-0">
          <h1 className="font-display font-semibold text-ink">{getPageTitle(pathname)}</h1>
          <span className="text-sm text-muted">{session.data?.user?.name}</span>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-cream">
          {children}
        </main>
      </div>
    </div>
  );
}
