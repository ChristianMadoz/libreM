import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Building2, BriefcaseMenu, LogOut, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";
import { insforge } from "../lib/insforge";
import { useState, useEffect } from "react";

const navItems = [
    { icon: LayoutDashboard, label: "Deals", path: "/" },
    { icon: Users, label: "Contacts", path: "/contacts" },
    { icon: Building2, label: "Companies", path: "/companies" },
];

export function Layout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const { data } = await insforge.auth.getCurrentSession();
            if (!data?.session) {
                navigate("/auth");
            } else {
                setUser(data.session.user);
            }
            setLoading(false);
        };
        checkAuth();
    }, [navigate]);

    const handleLogout = async () => {
        await insforge.auth.signOut();
        navigate("/auth");
    };

    if (loading) {
        return (
            <div className="h-screen bg-neutral-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    const initials = user.profile?.name
        ?.split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase() || user.email[0].toUpperCase();

    return (
        <div className="flex h-screen bg-neutral-950 text-neutral-100 font-sans">
            <aside className="w-64 border-r border-neutral-800 bg-neutral-900/50 flex flex-col backdrop-blur-xl">
                <div className="p-6 flex items-center gap-3">
                    <div className="bg-indigo-500/20 p-2 rounded-xl text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                        <BriefcaseMenu className="w-6 h-6" />
                    </div>
                    <h1 className="text-xl font-bold bg-gradient-to-br from-white to-neutral-400 bg-clip-text text-transparent">Nexus CRM</h1>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== "/");
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                                    isActive
                                        ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                                        : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/80"
                                )}
                            >
                                <item.icon className={cn("w-5 h-5", isActive ? "text-indigo-400" : "text-neutral-500 group-hover:text-neutral-300")} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-neutral-800 space-y-4">
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold shadow-lg">
                            {initials}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium truncate">{user.profile?.name || "User"}</span>
                            <span className="text-xs text-neutral-500 truncate">{user.email}</span>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-neutral-950">
                <div className="h-full p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
