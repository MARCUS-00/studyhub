import { getServerSession } from "next-auth/next";
import { NextAuthOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

interface props {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: props) {
  const session = await getServerSession(NextAuthOptions);

  if (session?.user?.role === "STAFF") redirect("/staffDashboard");
  if (session?.user?.role === "STUDENT") redirect("/dashboard");

  return (
    <main className="min-h-screen w-full flex">
      {/* Left panel — hidden on mobile */}
      <section className="hidden lg:flex flex-col justify-between bg-forest w-[420px] flex-shrink-0 p-12">
        <div>
          <span className="font-display font-bold text-2xl text-white">
            Study<span className="text-emerald-lt">Hub</span>
          </span>
        </div>

        <div className="flex flex-col gap-6">
          <blockquote className="text-white/80 text-lg leading-relaxed font-light italic">
            &ldquo;Education is the most powerful weapon which you can use to change the world.&rdquo;
          </blockquote>
          <span className="text-white/40 text-sm">— Nelson Mandela</span>

          <div className="grid grid-cols-2 gap-4 mt-4">
            {[
              { value: "500+", label: "Notes" },
              { value: "120+", label: "Tests" },
              { value: "6", label: "Semesters" },
              { value: "24/7", label: "Access" },
            ].map((s) => (
              <div key={s.label} className="bg-white/8 rounded-xl p-4">
                <div className="text-2xl font-display font-bold text-white">{s.value}</div>
                <div className="text-white/50 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/30 text-xs">
          Dayananda Sagar Institute of Technology
        </p>
      </section>

      {/* Right panel */}
      <section className="flex flex-1 bg-cream items-center justify-center py-12 px-6 overflow-y-auto">
        <div className="w-full max-w-md">
          {children}
        </div>
      </section>
    </main>
  );
}
