
import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { 
  LayoutDashboard, 
  Fuel, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  FileText,
  Receipt,
  Landmark,
  PieChart,
  ClipboardCheck
} from 'lucide-react';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children, activeTab, setActiveTab }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.GERANT, UserRole.COMPTABLE, UserRole.AGENT_SAISIE], showInBottom: true },
    { id: 'shift', label: 'Clôture', icon: ClipboardCheck, roles: [UserRole.ADMIN, UserRole.GERANT, UserRole.AGENT_SAISIE], showInBottom: true },
    { id: 'invoices', label: 'Factures', icon: FileText, roles: [UserRole.ADMIN, UserRole.GERANT, UserRole.COMPTABLE, UserRole.AGENT_SAISIE], showInBottom: true },
    { id: 'bank', label: 'Banque', icon: Landmark, roles: [UserRole.ADMIN, UserRole.GERANT, UserRole.COMPTABLE], showInBottom: false },
    { id: 'expenses', label: 'Dépenses', icon: Receipt, roles: [UserRole.ADMIN, UserRole.GERANT, UserRole.COMPTABLE], showInBottom: false },
    { id: 'reports', label: 'Rapports', icon: PieChart, roles: [UserRole.ADMIN, UserRole.GERANT, UserRole.COMPTABLE], showInBottom: false },
    { id: 'settings', label: 'Config', icon: Settings, roles: [UserRole.ADMIN], showInBottom: true },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user.role));
  const bottomNavItems = filteredMenu.filter(item => item.showInBottom).slice(0, 5);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-inter">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-slate-900 text-white p-6 shrink-0 z-30">
        <div className="flex items-center gap-4 px-2 mb-12">
          <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-xl rotate-3">
            <Fuel className="w-8 h-8" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tighter uppercase italic block leading-none">PetrolHub</span>
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1">S.G.I Pro Cloud</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {filteredMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.25rem] transition-all duration-300 ${
                activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30 translate-x-1' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className={`w-6 h-6 shrink-0 ${activeTab === item.id ? 'text-white' : 'text-slate-500'}`} />
              <span className="font-black text-xs uppercase tracking-[0.15em]">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800 space-y-4">
          <div className="flex items-center gap-4 px-4 py-4 bg-slate-800/40 rounded-[2rem] border border-white/5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-white text-xl">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-black truncate text-white uppercase italic tracking-tight">{user.name}</p>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-6 py-4 text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all font-black text-[10px] uppercase tracking-[0.2em]"
          >
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      <div className="flex flex-col flex-1 overflow-hidden relative">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 md:h-20 flex items-center justify-between px-6 lg:px-12 shrink-0 z-20 sticky top-0">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 text-slate-600 bg-slate-100 rounded-xl" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg md:text-xl font-black uppercase text-slate-900 tracking-tighter italic flex items-center gap-2">
              {menuItems.find(i => i.id === activeTab)?.label}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="relative p-3 text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all">
                <Bell className="w-5 h-5 md:w-6 h-6" />
                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
             </button>
          </div>
        </header>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col p-8 lg:hidden animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4 text-white">
                <div className="bg-blue-600 p-2 rounded-xl"><Fuel className="w-8 h-8" /></div>
                <span className="text-3xl font-black italic uppercase tracking-tighter">PetrolHub</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-white bg-white/10 p-3 rounded-full"><X className="w-8 h-8" /></button>
            </div>
            <nav className="flex-1 space-y-3">
              {filteredMenu.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-5 p-5 rounded-[2rem] text-lg font-black uppercase tracking-widest transition-all ${
                    activeTab === item.id ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/40' : 'text-slate-500'
                  }`}
                >
                  <item.icon className="w-7 h-7" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
            <button onClick={onLogout} className="w-full flex items-center gap-4 p-5 text-rose-400 font-black uppercase text-sm tracking-widest bg-rose-500/10 rounded-[2rem] mt-8">
               <LogOut className="w-6 h-6" />
               <span>Déconnexion</span>
            </button>
          </div>
        )}

        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 h-20 px-6 flex items-center justify-around z-40">
           {bottomNavItems.map((item) => (
             <button
               key={item.id}
               onClick={() => setActiveTab(item.id)}
               className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === item.id ? 'text-blue-600 scale-110' : 'text-slate-400'}`}
             >
               <div className={`p-2.5 rounded-2xl transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg' : ''}`}>
                  <item.icon className="w-6 h-6" />
               </div>
               <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
             </button>
           ))}
        </nav>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 bg-slate-50/50 pb-32 lg:pb-12">
          <div className="max-w-[1600px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
