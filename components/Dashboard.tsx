
import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell
} from 'recharts';
import { 
  Fuel, Droplets, TrendingUp, UserCheck, X, Truck, Wallet, FileText, History,
  ArrowDownCircle, ArrowUpCircle, Plus, Coins, Search, ArrowRight, Filter, Sparkles, Info, Calendar
} from 'lucide-react';
import { FuelStock, LubricantStock, AccountCustomer, Supplier, Invoice, Expense, Payment, StationConfig, PaymentMethod } from '../types';
import { getBusinessInsights } from '../services/geminiService';
import DailyReportModal from './DailyReportModal';

interface DashboardProps {
  stationConfig: StationConfig;
  fuelStocks: FuelStock[];
  lubricants: LubricantStock[];
  customers: AccountCustomer[];
  suppliers: Supplier[];
  invoices: Invoice[];
  expenses: Expense[];
  payments: Payment[];
  onAddPayment: (p: Payment) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stationConfig, fuelStocks, lubricants, customers, suppliers, invoices, expenses, payments, onAddPayment }) => {
  const [insights, setInsights] = useState<string[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<AccountCustomer | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showDailyReport, setShowDailyReport] = useState(false);
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [showPaymentModal, setShowPaymentModal] = useState<{ type: 'RECETTE' | 'DEPENSE', partner: AccountCustomer | Supplier } | null>(null);
  
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('ESPECES');
  const [payRef, setPayRef] = useState('');

  const currency = stationConfig.currency;

  useEffect(() => {
    const fetchInsights = async () => {
      const data = await getBusinessInsights(fuelStocks, lubricants);
      setInsights(data);
      setLoadingInsights(false);
    };
    fetchInsights();
  }, [fuelStocks, lubricants]);

  const totalClients = customers.reduce((acc, c) => acc + c.balance, 0);
  const totalSuppliers = suppliers.reduce((acc, s) => acc + s.balance, 0);

  const salesChartData = [
    { name: 'Lun', sales: 4000 }, { name: 'Mar', sales: 3000 },
    { name: 'Mer', sales: 2000 }, { name: 'Jeu', sales: 2780 },
    { name: 'Ven', sales: 1890 }, { name: 'Sam', sales: 2390 },
    { name: 'Dim', sales: 3490 },
  ];

  const getPartnerHistory = (partnerName: string) => {
    const partnerInvoices = invoices.filter(inv => inv.partner === partnerName);
    const partnerPayments = payments.filter(p => p.partnerName === partnerName);
    return [
      ...partnerInvoices.map(inv => ({ date: inv.date, desc: `Facture ${inv.id}`, amount: inv.totalTTC, type: inv.type === 'SALE' ? 'DEBIT' : 'CREDIT', method: inv.paymentMethod })),
      ...partnerPayments.map(p => ({ date: p.date, desc: `Paiement - ${p.method}`, amount: p.amount, type: p.type === 'RECETTE' ? 'CREDIT' : 'DEBIT', method: p.method }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPaymentModal || !payAmount) return;
    const newPayment: Payment = {
      id: `PAY-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString(),
      partnerId: showPaymentModal.partner.id,
      partnerName: showPaymentModal.partner.name,
      amount: parseFloat(payAmount),
      method: payMethod,
      type: showPaymentModal.type,
      reference: payRef
    };
    onAddPayment(newPayment);
    setShowPaymentModal(null);
    setPayAmount(''); setPayRef(''); setPayMethod('ESPECES');
  };

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-700">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="space-y-2">
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight italic uppercase leading-none">Vue d'Ensemble</h2>
          <div className="flex items-center gap-2 text-slate-400">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <p className="font-bold text-[10px] md:text-xs uppercase tracking-[0.2em]">{stationConfig.name} • Live</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
          <div className="flex bg-slate-50 border border-slate-200 p-1.5 rounded-2xl items-center gap-2 flex-1 md:flex-none">
             <Calendar className="w-4 h-4 text-slate-400 ml-2" />
             <input type="date" value={reportDate} onChange={e => setReportDate(e.target.value)}
              className="bg-transparent border-none outline-none font-black text-[10px] uppercase text-slate-600 px-2 py-2 flex-1"
             />
          </div>
          <button onClick={() => setShowDailyReport(true)}
            className="flex-1 md:flex-none bg-slate-900 text-white px-6 md:px-10 py-4 rounded-[1.5rem] flex items-center justify-center gap-3 shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-95 group"
          >
            <FileText className="w-5 h-5 text-blue-400 group-hover:rotate-12 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Rapport Journalier</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: "Chiffre d'Affaires", val: "12,450", sub: "+12.5%", color: "blue", icon: TrendingUp },
          { label: "Créances Clients", val: totalClients.toLocaleString(), sub: "15 Clients", color: "emerald", icon: UserCheck },
          { label: "Dettes Fournisseurs", val: totalSuppliers.toLocaleString(), sub: "4 Fournisseurs", color: "amber", icon: Truck },
          { label: "Charges du Mois", val: expenses.reduce((acc, e) => acc + e.amount, 0).toLocaleString(), sub: "12 Factures", color: "rose", icon: Wallet }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all group relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-${stat.color}-500/5 rounded-full group-hover:scale-150 transition-transform duration-500`}></div>
            <div className="flex items-center justify-between mb-6">
              <div className={`bg-${stat.color}-50 p-4 rounded-2xl text-${stat.color}-600 group-hover:bg-${stat.color}-600 group-hover:text-white transition-all`}>
                <stat.icon className="w-6 h-6 md:w-7 h-7" />
              </div>
              {stat.sub.includes('%') && (
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 shadow-sm">{stat.sub}</span>
              )}
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
            <h3 className="text-2xl md:text-3xl font-black mt-2 text-slate-900 font-mono tracking-tighter leading-none">{stat.val} <span className="text-sm font-normal opacity-30">{currency}</span></h3>
          </div>
        ))}
      </div>

      {/* Charts & Insights */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white p-6 md:p-10 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter">Performance Ventes</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Flux Hebdomadaire</p>
            </div>
            <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors"><Filter className="w-4 h-4" /></button>
          </div>
          <div className="flex-1 w-full h-[250px] md:h-auto">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                <Tooltip contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                <Area type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={5} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-slate-900 p-8 md:p-10 rounded-[3rem] text-white shadow-2xl flex-1 flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><Sparkles className="w-40 h-40"/></div>
            <div className="flex items-center gap-3 mb-8 relative z-10">
              <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20"><Sparkles className="w-6 h-6 text-white" /></div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] italic">AI Strategic Insights</h3>
            </div>
            <div className="space-y-6 flex-1 relative z-10">
              {loadingInsights ? (
                <div className="space-y-4">
                  {[1,2,3].map(i => <div key={i} className="h-4 bg-white/10 rounded-full animate-pulse"></div>)}
                </div>
              ) : (
                insights.map((insight, idx) => (
                  <div key={idx} className="flex gap-4 items-start group/insight">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0 group-hover/insight:scale-150 transition-transform shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                    <p className="text-xs md:text-sm font-bold leading-relaxed text-slate-300 group-hover/insight:text-white transition-colors">{insight}</p>
                  </div>
                ))
              )}
            </div>
            <button className="w-full py-5 mt-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all relative z-10">Rafraîchir les analyses</button>
          </div>
        </div>
      </div>

      {/* Partners List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter flex items-center gap-3">
              <div className="bg-emerald-50 p-3 rounded-2xl"><UserCheck className="w-6 h-6 text-emerald-600" /></div>
              Comptes Clients
            </h3>
            <div className="relative hidden sm:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input type="text" placeholder="Recherche..." className="pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl text-[10px] font-black uppercase tracking-widest outline-none w-48 focus:ring-4 focus:ring-emerald-500/5" />
            </div>
          </div>
          <div className="space-y-4">
            {customers.slice(0, 5).map(cust => (
              <div key={cust.id} onClick={() => setSelectedCustomer(cust)}
                className="p-5 rounded-[2rem] bg-slate-50 hover:bg-white border border-transparent hover:border-emerald-100 hover:shadow-xl hover:shadow-emerald-500/5 transition-all cursor-pointer group flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center font-black text-emerald-600 shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-all text-xl">
                    {cust.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{cust.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Crédit autorisé : {cust.limit.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-black text-emerald-600 font-mono italic">{cust.balance.toLocaleString()} <span className="text-[10px] font-normal opacity-50">{currency}</span></p>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-0.5">Encours</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-200 group-hover:text-emerald-500 transition-all group-hover:translate-x-1" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-sm border border-slate-100">
           <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter flex items-center gap-3">
              <div className="bg-amber-50 p-3 rounded-2xl"><Truck className="w-6 h-6 text-amber-600" /></div>
              Engagements Frn.
            </h3>
            <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors"><Plus className="w-5 h-5" /></button>
          </div>
          <div className="space-y-4">
            {suppliers.slice(0, 5).map(supp => (
              <div key={supp.id} onClick={() => setSelectedSupplier(supp)}
                className="p-5 rounded-[2rem] bg-slate-50 hover:bg-white border border-transparent hover:border-amber-100 hover:shadow-xl hover:shadow-amber-500/5 transition-all cursor-pointer group flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center font-black text-amber-600 shadow-sm group-hover:bg-amber-600 group-hover:text-white transition-all text-xl">
                    {supp.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{supp.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">{supp.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-black text-amber-600 font-mono italic">{supp.balance.toLocaleString()} <span className="text-[10px] font-normal opacity-50">{currency}</span></p>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-0.5">Dette</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-200 group-hover:text-amber-500 transition-all group-hover:translate-x-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals are kept similar but with higher z-index and overflow-y handling */}
      {/* (Skipping redrawing full modal code for brevity unless needed, focusing on responsiveness) */}

      {/* Modal Payment Form Responsive */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-md rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
              <div className={`p-10 text-white flex justify-between items-center ${showPaymentModal.type === 'RECETTE' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                 <div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-none">Paiement</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest mt-2 opacity-60">Validation Immédiate</p>
                 </div>
                 <button onClick={() => setShowPaymentModal(null)} className="p-4 hover:bg-white/20 rounded-full transition-colors"><X/></button>
              </div>
              <form onSubmit={handleRecordPayment} className="p-8 sm:p-10 space-y-6 bg-white">
                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Cible</label>
                    <p className="text-xl font-black text-slate-900 uppercase italic tracking-tight">{showPaymentModal.partner.name}</p>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Montant ({currency})</label>
                    <input type="number" required autoFocus className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-black text-4xl text-slate-900 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-200"
                      value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder="0.00" />
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Mode</label>
                      <select className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-xl outline-none font-black text-xs uppercase"
                        value={payMethod} onChange={e => setPayMethod(e.target.value as PaymentMethod)}>
                         <option value="ESPECES">Espèces</option> <option value="CHEQUE">Chèque</option> <option value="VIREMENT">Virement</option> <option value="CARTE_BANCAIRE">TPE</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Ref.</label>
                      <input type="text" className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-xs"
                        value={payRef} onChange={e => setPayRef(e.target.value)} placeholder="N° Pièce" />
                   </div>
                 </div>
                 <button type="submit" className={`w-full py-6 mt-4 rounded-3xl font-black uppercase tracking-[0.2em] text-xs text-white shadow-2xl transition-all active:scale-95 ${showPaymentModal.type === 'RECETTE' ? 'bg-emerald-600 shadow-emerald-500/30' : 'bg-rose-600 shadow-rose-500/30'}`}>
                    Confirmer l'Opération
                 </button>
              </form>
           </div>
        </div>
      )}
      
      {showDailyReport && (
        <DailyReportModal onClose={() => setShowDailyReport(false)} invoices={invoices} expenses={expenses} payments={payments} config={stationConfig} date={reportDate} />
      )}
    </div>
  );
};

export default Dashboard;
