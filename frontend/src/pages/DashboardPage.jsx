import { useState, useEffect, useRef } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { getDashboardData } from "../api/report";

const STATS = [
  { label: "Total Assets", value: 0, sub: "across all locations", color: "#2DD4BF", icon: "🗂" },
  { label: "Available", value: 0, sub: "ready for deployment", color: "#2DD4BF", icon: "✅" },
  { label: "Checked Out", value: 0, sub: "currently with staff", color: "#F59E0B", icon: "📤" },
  { label: "In Maintenance", value: 0, sub: "under service", color: "#3B82F6", icon: "🔧" },
];

const MONTHLY_CHECKOUTS = [];
const ASSET_CATEGORIES = [];
const MAINTENANCE_COST = [];
const RECENT_ACTIVITY = [];
const ALERTS = [];

const ACTIVITY_CONFIG = {
  checkout: { dot: "bg-amber-400", label: "Checkout" },
  return: { dot: "bg-teal-400", label: "Return" },
  maintenance: { dot: "bg-blue-400", label: "Maintenance" },
  new: { dot: "bg-purple-400", label: "New" },
  disposal: { dot: "bg-red-400", label: "Disposal" },
};

function AnimatedNumber({ target, duration = 1200 }) {
  const [val, setVal] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * target));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    }
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return <>{val}</>;
}

function ChartTooltip({ active, payload, label, prefix = "", suffix = "" }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => {
        const value = typeof p.value === "number" ? p.value.toLocaleString() : p.value ?? 0;
        return (
          <p key={i} style={{ color: p.color }} className="font-mono font-semibold">
            {p.name}: {prefix}{value}{suffix}
          </p>
        );
      })}
    </div>
  );
}

function StatCard({ stat, index }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 120);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-5 flex flex-col gap-3 transition-all duration-500"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
      }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-slate-500">{stat.label}</p>
        <span className="text-lg">{stat.icon}</span>
      </div>
      <p className="text-4xl font-bold text-white font-mono">
        <AnimatedNumber target={stat.value} />
      </p>
      <p className="text-xs text-slate-500">{stat.sub}</p>
      <div className="h-0.5 rounded-full w-full bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: visible ? `${Math.max((stat.value / 150) * 100, 8)}%` : "0%",
            backgroundColor: stat.color,
          }}
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [loaded, setLoaded] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        const response = await getDashboardData();
        if (isMounted) {
          setDashboardData(response.data);
          setError("");
        }
      } catch (err) {
        if (isMounted) {
          setError("Unable to load dashboard data from the database.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    const intervalId = window.setInterval(() => {
      loadDashboard();
    }, 15000);

    const handleFocus = () => {
      loadDashboard();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const stats = dashboardData?.stats ?? STATS;
  const monthlyCheckoutData = dashboardData?.monthly_activity ?? MONTHLY_CHECKOUTS;
  const assetCategories = dashboardData?.asset_categories ?? ASSET_CATEGORIES;
  const maintenanceCost = dashboardData?.maintenance_cost ?? MAINTENANCE_COST;
  const recentActivity = dashboardData?.recent_activity ?? RECENT_ACTIVITY;
  const alerts = dashboardData?.alerts ?? ALERTS;

  const totalCost = maintenanceCost.reduce((sum, row) => sum + (Number(row.cost) || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 p-6 flex items-center justify-center">
        <p className="text-slate-400">Loading dashboard data…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 space-y-6 font-sans">
      <div
        className="transition-all duration-500"
        style={{ opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(-8px)" }}
      >
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Fixed Asset Management · Harare HQ · {new Date().toLocaleDateString("en-GB", { dateStyle: "long" })}
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          {error}
        </div>
      )}

      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <div
              key={`${alert.asset}-${i}`}
              className={`rounded-xl border px-4 py-2.5 flex items-center gap-3 text-sm transition-all duration-500 ${
                alert.type === "critical"
                  ? "border-red-500/30 bg-red-500/10 text-red-300"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-300"
              }`}
              style={{ opacity: loaded ? 1 : 0, transitionDelay: `${i * 80}ms` }}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 animate-pulse ${alert.type === "critical" ? "bg-red-400" : "bg-amber-400"}`} />
              <span className="flex-1">{alert.msg}</span>
              <span className="font-mono text-xs opacity-60">{alert.asset}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <StatCard key={stat.label} stat={stat} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-slate-700/60 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-white">Checkout Activity</p>
              <p className="text-xs text-slate-500">Monthly checkouts vs returns</p>
            </div>
            <span className="text-xs text-slate-600 font-mono">Live</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyCheckoutData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gCheckout" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2DD4BF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2DD4BF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gReturn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="checkouts" name="Checkouts" stroke="#2DD4BF" strokeWidth={2} fill="url(#gCheckout)" dot={false} activeDot={{ r: 4, fill: "#2DD4BF" }} />
              <Area type="monotone" dataKey="returns" name="Returns" stroke="#F59E0B" strokeWidth={2} fill="url(#gReturn)" dot={false} activeDot={{ r: 4, fill: "#F59E0B" }} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-3">
            {[["#2DD4BF", "Checkouts"], ["#F59E0B", "Returns"]].map(([color, label]) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-5">
          <p className="text-sm font-semibold text-white mb-0.5">Asset Status</p>
          <p className="text-xs text-slate-500 mb-4">Live counts from the database</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={assetCategories}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={72}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {assetCategories.map((entry, index) => (
                  <Cell key={`${entry.name}-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} assets`]} contentStyle={{ background: "#0F172A", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {assetCategories.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cat.color }} />
                  <span className="text-slate-400">{cat.name}</span>
                </div>
                <span className="font-mono text-slate-300">{cat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-white">Maintenance Spend</p>
            <span className="text-xs font-mono text-teal-400">${totalCost.toLocaleString()}</span>
          </div>
          <p className="text-xs text-slate-500 mb-4">USD · current window</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={maintenanceCost} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip prefix="$" />} />
              <Bar dataKey="cost" name="Cost" fill="#2DD4BF" radius={[4, 4, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-slate-700/60 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-white">Recent Activity</p>
              <p className="text-xs text-slate-500">Latest asset events</p>
            </div>
          </div>
          <div className="space-y-0">
            {recentActivity.map((item, i) => {
              const cfg = ACTIVITY_CONFIG[item.type] ?? ACTIVITY_CONFIG.checkout;
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-4 py-3 border-b border-slate-800/60 last:border-0 transition-all duration-300"
                  style={{ opacity: loaded ? 1 : 0, transitionDelay: `${400 + i * 80}ms` }}
                >
                  <div className="flex flex-col items-center pt-1 shrink-0">
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    {i < recentActivity.length - 1 && (
                      <span className="w-px flex-1 min-h-5 bg-slate-800 mt-1" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-slate-300">{item.action}</span>
                      <span className="font-mono text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700/50 tracking-widest">
                        {item.tag}
                      </span>
                    </div>
                    <p className="text-sm text-slate-200 truncate mt-0.5">{item.asset}</p>
                    <p className="text-xs text-slate-500 mt-0.5">by {item.by}</p>
                  </div>

                  <span className="text-xs text-slate-600 shrink-0 pt-0.5">{item.time}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
