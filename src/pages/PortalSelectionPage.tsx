import { useNavigate } from "react-router-dom";
import { Shield, BookOpen, GraduationCap, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const portals = [
  {
    role: "Admin",
    icon: Shield,
    route: "/admin/login",
    description: "Manage users, assign students to guides, monitor system activity.",
    accent: "from-red-500 to-rose-600",
    accentBg: "bg-red-500/10",
    accentText: "text-red-500",
    accentBorder: "hover:border-red-500/30",
    buttonClass: "bg-red-600 hover:bg-red-700 text-white",
    glow: "hover:shadow-red-500/20",
  },
  {
    role: "Guide",
    icon: BookOpen,
    route: "/guide/login",
    description: "Review project ideas, manage assigned students, track deadlines.",
    accent: "from-blue-500 to-indigo-600",
    accentBg: "bg-blue-500/10",
    accentText: "text-blue-500",
    accentBorder: "hover:border-blue-500/30",
    buttonClass: "bg-blue-600 hover:bg-blue-700 text-white",
    glow: "hover:shadow-blue-500/20",
  },
  {
    role: "Student",
    icon: GraduationCap,
    route: "/student/login",
    description: "Submit ideas, track progress, communicate with assigned guide.",
    accent: "from-emerald-500 to-green-600",
    accentBg: "bg-emerald-500/10",
    accentText: "text-emerald-500",
    accentBorder: "hover:border-emerald-500/30",
    buttonClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
    glow: "hover:shadow-emerald-500/20",
  },
] as const;

export default function PortalSelectionPage() {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 p-4">
      {/* Floating shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-32 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl animate-pulse [animation-delay:2s]" />
        <div className="absolute -bottom-16 left-1/3 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl animate-pulse [animation-delay:4s]" />
      </div>

      <div className="relative z-10 w-full max-w-5xl space-y-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm text-white font-bold text-2xl shadow-lg">
            SP
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            SkillProject
          </h1>
          <p className="mt-3 text-lg text-indigo-200/80">
            Academic Project Allocation &amp; Management System
          </p>
        </motion.div>

        {/* Portal cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {portals.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.role}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 * (i + 1) }}
              >
                <Card
                  className={`group cursor-pointer border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl ${p.glow} ${p.accentBorder} rounded-2xl`}
                  onClick={() => navigate(p.route)}
                >
                  <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${p.accentBg}`}>
                      <Icon className={`h-7 w-7 ${p.accentText}`} />
                    </div>
                    <h2 className="text-xl font-semibold text-white">
                      {p.role} Portal
                    </h2>
                    <p className="text-sm leading-relaxed text-indigo-200/70">
                      {p.description}
                    </p>
                    <Button
                      className={`mt-2 w-full rounded-xl ${p.buttonClass} transition-transform group-hover:translate-x-0`}
                    >
                      Login as {p.role}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-xs text-indigo-300/50"
        >
          © {new Date().getFullYear()} SkillProject. All rights reserved.
        </motion.p>
      </div>
    </div>
  );
}
