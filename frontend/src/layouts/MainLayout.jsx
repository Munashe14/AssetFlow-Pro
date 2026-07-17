import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import NotificationBell from "../components/NotificationBell";
import {
    HiOutlineHome,
    HiOutlineArchiveBox,
    HiOutlineArrowUpTray,
    HiOutlineWrenchScrewdriver,
    HiOutlineCog6Tooth,
    HiOutlineTrash,
    HiOutlineChartBar,
    HiOutlineBell,
    HiOutlineUsers,
    HiOutlineBuildingOffice,
    HiOutlineCalculator,
    HiBars3
} from "react-icons/hi2";


const NAV = [
    {to: "/dashboard", label: "Dashboard", icon: HiOutlineHome},
    {to: "/assets", label: "Assets", icon: HiOutlineArchiveBox},
    {to: "/checkouts", label: "Checkouts", icon: HiOutlineArrowUpTray},
    {to: "/maintenance", label: "Maintenance", icon:HiOutlineWrenchScrewdriver},
    {to: "/repairs", label: "Repairs", icon: HiOutlineCog6Tooth},
    {to: "/disposal", label: "Disposal", icon: HiOutlineTrash},
    {to: "/reports", label: "Reports", icon: HiOutlineChartBar},
    {to: "/depreciation", label: "Depreciation", icon: HiOutlineCalculator},
    {to: "/notifications", label: "Notifications", icon: HiOutlineBell},
    {to: "/users", label: "Users", icon: HiOutlineUsers},
    {to: "/departments", label: "Departments", icon: HiOutlineBuildingOffice},
];

export default function MainLayout() {
    const [open, setOpen] = useState(true);
    const {logout, role} = useAuth();
    const navigate = useNavigate();
  


    function handleLogOut() {
        logout();
        navigate("/login");
    }
  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden">
        {/* Sidebar */}
        <aside className={`shrink-0 flex flex-col bg-slate-900 border-r border-slate-800 transition duration-200 ${open ? "w-56": "w-14"}`}>
             <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800">
            <div className="w-7 h-7 rounded-md bg-teal-500 flex items-center justify-center shrink-0">
                <span className="text-slate-900 font-bold text-sm">F</span>
            </div>
            {open && <span className="font-bold text-sm tracking-tight">FAMS</span>}
        </div>

        <nav className="flex-1  py-3 space-y-0.5 px-2 overflow-y-auto">
            {NAV.map(({to, label, icon: Icon}) =>(
                <NavLink key={to}
                to ={to}
                className={({ isActive }) =>
                `flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm transition-color ${
                    isActive
                    ? "bg-teal-500/15 text-teal-400"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
           >
           <Icon className="w-5 h-5 shrink-0"/>
            {open && <span className="font-medium truncate">{label}</span>}
           </NavLink> ))}
        </nav>

        <div className={`px-3 py-4 border-t border-slate-800 flex items-center gap-3 ${!open ?
            "justify-center": ""
        }`}>
            <div className="w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center
            shrink-0 text-xs font-bold text-white">
                {role === "admin" ? "A" : "S"}
            </div>
            {open && (
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-200 capitalize truncate">{role}</p>
                    <button onClick={handleLogOut} className="text-[10px] text-slate-500 hover:text-red-400
                    transition-colors">
                        Sign out
                    </button>
                </div>
            )}
        </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden">
            <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800
            bg-slate-950/80 backdrop  shrink-0">
                <button onClick={(() => setOpen(v => !v))} className="text-slate-500 hover:text-slate-300
                text-lg">
                    <HiBars3/>
                </button>
                <NotificationBell/>
            </header>
            <main className="flex-1 overflow-y-auto px-6 py-8">
                <Outlet/>
            </main>
        </div>
    </div>
  );
}

