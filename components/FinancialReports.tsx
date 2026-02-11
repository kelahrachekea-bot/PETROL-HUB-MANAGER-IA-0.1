
import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { PieChart as PieIcon, TrendingUp, Wallet, Download, Calendar, Filter, ArrowUpRight, ArrowDownRight, FileText, ChevronRight } from 'lucide-react';
import { Invoice, Expense, Payment, InvoiceType } from '../types';

interface FinancialReportsProps {
  invoices: Invoice[];
  expenses: Expense[];
  payments: Payment[];
  currency: string;
}

const FinancialReports: React.FC<FinancialReportsProps> = ({ invoices, expenses, payments, currency }) => {
  const [period, setPeriod] = useState('month');
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredData = useMemo(() => {
    let start = new Date(startDate);
    let end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    if (period !== 'custom') {
      const now = new Date();
      end = new Date(now);
      if (period === 'semaine') {
        start = new Date(now.setDate(now.getDate() - 7));
      } else if (period === 'month') {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (period === 'annee') {
        start = new Date(now.getFullYear(), 0, 1);
      }
    }

    const filteredInvoices = invoices.filter(inv => {
      const d = new Date(inv.date);
      return d >= start && d <= end;
    });

    const filteredExpenses = expenses.filter(exp => {
      const d = new Date(exp.date);
      return d >= start && d <= end;
    });

    const filteredPayments = payments.filter(pay => {
      const d = new Date(pay.date);
      return d >= start && d <= end;
    });

    return {
      invoices: filteredInvoices,
      expenses: filteredExpenses,
      payments: filteredPayments,
      start,
      end
    };
  }, [invoices, expenses, payments, period, startDate, endDate]);

  const stats = useMemo(() => {
    const totalSales = filteredData.invoices.filter(i => i.type === InvoiceType.SALE).reduce((acc, i) => acc + i.totalTTC, 0);
    const totalPurchases = filteredData.invoices.filter(i => i.type === InvoiceType.PURCHASE).reduce((acc, i) => acc + i.totalTTC, 0);
    const totalExp = filteredData.expenses.reduce((acc, i) => acc + i.amount, 0);

    // Dynamic pie chart data based on categories found in items
    const salesInvoices = filteredData.invoices.filter(i => i.type === InvoiceType.SALE);
    let fuelVal = 0, lubVal = 0, washVal = 0, otherVal = 0;
    
    salesInvoices.forEach(inv => {
      inv.items.forEach(item => {
        if (item.category === 'FUEL') fuelVal += item.total;
        else if (item.category === 'LUBRICANT') lubVal += item.total;
        else if (item.category === 'WASH') washVal += item.total;
        else otherVal += item.total;
      });
    });

    const pieData = [
      { name: 'Carburants', value: fuelVal, color: '#2563eb' },
      { name: 'Lubrifiants', value: lubVal, color: '#10b981' },
      { name: 'Lavage', value: washVal, color: '#6366f1' },
      { name: 'Autres', value: otherVal, color: '#f59e0b' },
    ].filter(d => d.value > 0);

    const barData = [
      { name: 'Ventes', amount: totalSales },
      { name: 'Achats', amount: totalPurchases },
      { name: 'Charges', amount: totalExp },
      { name: 'Net', amount: totalSales - totalPurchases - totalExp },
    ];

    return { totalSales, totalPurchases, totalExp, pieData, barData };
  }, [filteredData]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Filtres PC Améliorés */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
         <div className="shrink-0">
            <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Analytique Financière</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
              Période : {filteredData.start.toLocaleDateString()} au {filteredData.end.toLocaleDateString()}
            </p>
         </div>
         
         <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
            <div className="flex bg-slate-50 p-1.5 rounded-[1.5rem] border border-slate-200 w-full sm:w-auto">
               {[
                 { id: 'semaine', label: 'Semaine' },
                 { id: 'month', label: 'Mois' },
                 { id: 'annee', label: 'Année' },
                 { id: 'custom', label: 'Personnalisé' }
               ].map(p => (
                 <button 
                  key={p.id} 
                  onClick={() => setPeriod(p.id)}
                  className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${period === p.id ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                   {p.label}
                 </button>
               ))}
            </div>

            {period === 'custom' && (
              <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-[1.5rem] border border-slate-200 animate-in slide-in-from-left-4 duration-300">
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent border-none text-[10px] font-black uppercase outline-none px-2 py-1 text-slate-600"
                />
                <ChevronRight className="w-3 h-3 text-slate-300" />
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent border-none text-[10px] font-black uppercase outline-none px-2 py-1 text-slate-600"
                />
              </div>
            )}

            <button className="hidden sm:flex p-3.5 bg-slate-900 text-white rounded-[1.25rem] hover:scale-105 transition-all shadow-lg shadow-slate-900/10 active:scale-95">
              <Download className="w-5 h-5"/>
            </button>
         </div>
      </div>

      {/* Cartes KPI Dynamiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-blue-50 p-3 rounded-2xl text-blue-600"><TrendingUp className="w-6 h-6"/></div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Chiffre d'Affaires</p>
            <p className="text-3xl font-black text-blue-600 font-mono tracking-tighter italic">{stats.totalSales.toLocaleString()} <span className="text-xs font-normal opacity-50">{currency}</span></p>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-amber-50 p-3 rounded-2xl text-amber-600"><Wallet className="w-6 h-6"/></div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Achats Carburant</p>
            <p className="text-3xl font-black text-amber-600 font-mono tracking-tighter italic">{stats.totalPurchases.toLocaleString()} <span className="text-xs font-normal opacity-50">{currency}</span></p>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-rose-50 p-3 rounded-2xl text-rose-600"><ArrowDownRight className="w-6 h-6"/></div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Charges Totales</p>
            <p className="text-3xl font-black text-rose-500 font-mono tracking-tighter italic">{stats.totalExp.toLocaleString()} <span className="text-xs font-normal opacity-50">{currency}</span></p>
         </div>
         <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white hover:scale-[1.02] transition-transform">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-white/10 p-3 rounded-2xl text-emerald-400"><TrendingUp className="w-6 h-6"/></div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Résultat Opérationnel</p>
            <p className="text-3xl font-black text-emerald-400 font-mono tracking-tighter italic">{(stats.totalSales - stats.totalPurchases - stats.totalExp).toLocaleString()} <span className="text-xs font-normal opacity-50">{currency}</span></p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Graphique de structure */}
         <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-10">
               <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-3">
                  <PieIcon className="w-5 h-5 text-indigo-500" /> Structure des Revenus
               </h3>
               <span className="text-[10px] font-black text-slate-300 uppercase italic">Période Active</span>
            </div>
            <div className="h-80 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie 
                       data={stats.pieData} 
                       cx="50%" 
                       cy="50%" 
                       innerRadius={60} 
                       outerRadius={100} 
                       paddingAngle={10} 
                       dataKey="value"
                       animationDuration={1500}
                     >
                        {stats.pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                     </Pie>
                     <Tooltip 
                       contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 700 }}
                     />
                     <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Graphique de rentabilité */}
         <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-10">
               <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-emerald-500" /> Comparatif Flux Financiers
               </h3>
               <div className="flex items-center gap-1">
                 <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                 <span className="text-[9px] font-black text-slate-300 uppercase">Données Réelles</span>
               </div>
            </div>
            <div className="h-80 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.barData}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} />
                     <Tooltip 
                       cursor={{fill: '#f8fafc'}} 
                       contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 900}} 
                     />
                     <Bar dataKey="amount" radius={[10, 10, 0, 0]} animationDuration={1000}>
                        {stats.barData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.amount < 0 ? '#f43f5e' : (index === 0 ? '#2563eb' : (index === 3 ? '#10b981' : '#f59e0b'))} />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );
};

export default FinancialReports;
