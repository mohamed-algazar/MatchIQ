import React, { useState } from 'react';
import {
    LayoutDashboard,
    Upload,
    Settings,
    ChevronLeft,
    ChevronRight,
    BarChart3,
    Video,
    LogOut,
    Bell
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface SidebarItemProps {
    icon: React.ElementType;
    label: string;
    path: string;
    collapsed: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, path, collapsed }) => {
    const location = useLocation();
    const isActive = location.pathname === path;

    return (
        <Link
            to={path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
                ? 'bg-green-500/10 text-green-500'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
        >
            <Icon size={20} className={isActive ? 'text-green-500' : 'group-hover:scale-110 transition-transform duration-200'} />
            {!collapsed && <span className="font-medium whitespace-nowrap">{label}</span>}
            {collapsed && (
                <div className="absolute left-16 bg-slate-800 text-white px-2 py-1 rounded md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none text-xs border border-slate-700">
                    {label}
                </div>
            )}
        </Link>
    );
};

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Upload, label: 'Upload Match', path: '/upload' },
        { icon: Video, label: 'Match Analysis', path: '/analysis' },
        { icon: BarChart3, label: 'Analytics', path: '/analytics' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
            {/* Sidebar */}
            <aside
                className={`relative flex flex-col border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'
                    }`}
            >
                <div className="h-16 flex items-center px-6 border-b border-slate-800">
                    {!collapsed && <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">AI FOOTBALL</span>}
                    {collapsed && <span className="text-xl font-bold text-green-500 mx-auto">AF</span>}
                </div>

                <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => (
                        <SidebarItem key={item.path} {...item} collapsed={collapsed} />
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 w-full group"
                    >
                        <LogOut size={20} />
                        {!collapsed && <span className="font-medium">Logout</span>}
                    </button>
                </div>

                {/* Collapse Toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-20 bg-green-500 text-slate-950 rounded-full p-1 shadow-lg hover:scale-110 transition-transform z-50 border-2 border-slate-900"
                >
                    {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                <header className="h-16 border-b border-slate-800 bg-slate-900/30 backdrop-blur-md flex items-center justify-between px-8">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-medium text-slate-300 uppercase tracking-widest">
                            {menuItems.find(m => m.path === location.pathname)?.label || 'Overview'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-6">
                        <button title='Btn Notification' className="relative text-slate-400 hover:text-white transition-colors">
                            <Bell size={20} />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-slate-900"></span>
                        </button>
                        <div className="flex items-center gap-3 pl-6 border-l border-slate-800">
                            <div className="text-right">
                                <p className="text-sm font-medium">Mahmoud</p>
                                <p className="text-xs text-slate-500 uppercase tracking-tighter">Analyst</p>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center font-bold text-slate-950 border border-slate-700 shadow-inner">
                                M
                            </div>
                        </div>
                    </div>
                </header>

                <section className="flex-1 overflow-y-auto p-8 relative">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {children}
                    </div>

                    {/* Pitch watermark background */}
                    <div className="fixed bottom-0 right-0 opacity-5 pointer-events-none -mb-20 -mr-20">
                        <LayoutDashboard size={400} />
                    </div>
                </section>
            </main>
        </div>
    );
};

export default DashboardLayout;
