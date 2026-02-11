
import React, { useState, useMemo } from 'react';
import { 
  Fuel, 
  ShoppingBag, 
  Receipt, 
  Coins, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  AlertTriangle,
  CreditCard,
  Zap,
  LayoutDashboard,
  FileText,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Droplets,
  Zap as WashIcon
} from 'lucide-react';
import { Pump, FuelStock, AccountCustomer, PaymentMethod, Invoice, InvoiceType, Expense, User, Payment, LubricantStock } from '../types';
import DailyReportModal from './DailyReportModal';

interface ShiftWizardProps {
  pumps: Pump[];
  fuelStocks: FuelStock[];
  lubricants: LubricantStock[];
  customers: AccountCustomer[];
  currentUser: User;
  onComplete: (data: any) => void;
  currency: string;
  invoices: Invoice[];
  expenses: Expense[];
  payments: Payment[];
  stationConfig: any;
}

const ShiftWizard: React.FC<ShiftWizardProps> = ({ 
  pumps, fuelStocks, lubricants, customers, currentUser, onComplete, currency,
  invoices, expenses, payments, stationConfig
}) => {
  const [step, setStep] = useState(1);
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionTime, setSessionTime] = useState(new Date().toTimeString().slice(0, 5));
  const [showQuickReport, setShowQuickReport] = useState(false);
  
  const [pumpsData, setPumpsData] = useState(
    pumps.map(p => ({ ...p, newIndex: p.lastIndex, price: p.fuelType.includes('Gasoil') ? 11.95 : 14.50 })) 
  );

  const [soldLubricants, setSoldLubricants] = useState<{id: string, qty: number, price: number}[]>([]);
  
  const [washSales, setWashSales] = useState({
    basic: { qty: 0, price: 40 },
    complete: { qty: 0, price: 80 }
  });

  const [creditSales, setCreditSales] = useState<{customerId: string, amount: number}[]>([]);
  
  const [tenders, setTenders] = useState({
    cash: 0,
    tpe: 0,
    fleetCards: 0
  });

  const [dailyExpenses, setDailyExpenses] = useState<{desc: string, amount: number}[]>([]);

  const fuelTotals = useMemo(() => {
    return pumpsData.reduce((acc, p) => {
      const volume = Math.max(0, p.newIndex - p.lastIndex);
      const total = volume * p.price;
      return { volume: acc.volume + volume, total: acc.total + total };
    }, { volume: 0, total: 0 });
  }, [pumpsData]);

  const lubTotals = useMemo(() => soldLubricants.reduce((acc, curr) => acc + (curr.qty * curr.price), 0), [soldLubricants]);
  const washTotals = useMemo(() => (washSales.basic.qty * washSales.basic.price) + (washSales.complete.qty * washSales.complete.price), [washSales]);

  const totalCredits = useMemo(() => creditSales.reduce((acc, s) => acc + s.amount, 0), [creditSales]);
  const totalExp = useMemo(() => dailyExpenses.reduce((acc, s) => acc + s.amount, 0), [dailyExpenses]);

  const theoreticalTotal = fuelTotals.total + lubTotals + washTotals;
  const theoreticalCash = theoreticalTotal - totalCredits - totalExp - tenders.tpe - tenders.fleetCards;

  const handleComplete = () => {
    onComplete({
      pumps: pumpsData,
      lubricantSales: soldLubricants,
      washSales: washSales,
      credits: creditSales,
      expenses: dailyExpenses,
      tenders,
      date: sessionDate,
      time: sessionTime,
      totals: {
        fuel: fuelTotals.total,
        lubricants: lubTotals,
        wash: washTotals,
        total: theoreticalTotal
      }
    });
  };

  const nextStep = () => setStep(s => Math.min(7, s + 1));
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Stepper Header */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 no-print">
        <div className="flex justify-between items-center relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
          <div className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-500" style={{ width: `${((step - 1) / 6) * 100}%` }}></div>
          
          {[1, 2, 3, 4, 5, 6, 7].map((s) => (
            <div key={s} className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all ${step >= s ? 'bg-blue-600 text-white' : 'bg-white border-2 border-slate-200 text-slate-300'}`}>
                {step > s ? <CheckCircle2 className="w-6 h-6" /> : s}
              </div>
              <span className={`text-[8px] font-black uppercase tracking-widest text-center max-w-[60px] ${step >= s ? 'text-blue-600' : 'text-slate-400'}`}>
                {s === 1 ? 'Index' : s === 2 ? 'Shop' : s === 3 ? 'Crédits' : s === 4 ? 'Frais' : s === 5 ? 'Caisse' : s === 6 ? 'Validation' : 'Fin'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden min-h-[550px] flex flex-col no-print relative">
        
        {/* Étape 1 : Index */}
        {step === 1 && (
          <div className="p-10 space-y-8 flex-1 animate-in slide-in-from-right-4 duration-300">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
               <div className="space-y-4">
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">Index de Clôture</h3>
                  <div className="flex flex-wrap gap-4">
                    <div className="bg-slate-50 border border-slate-200 p-2 rounded-xl flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-500 ml-1" />
                      <input type="date" value={sessionDate} onChange={e => setSessionDate(e.target.value)} className="bg-transparent border-none outline-none font-black text-[10px] uppercase text-slate-700" />
                    </div>
                    <div className="bg-slate-50 border border-slate-200 p-2 rounded-xl flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500 ml-1" />
                      <input type="time" value={sessionTime} onChange={e => setSessionTime(e.target.value)} className="bg-transparent border-none outline-none font-black text-[10px] uppercase text-slate-700" />
                    </div>
                  </div>
               </div>
               <div className="bg-blue-50 px-6 py-4 rounded-[1.5rem] border border-blue-100 text-right min-w-[220px]">
                  <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest mb-1">Recette Carburant</p>
                  <p className="text-2xl font-black text-blue-600 font-mono tracking-tighter">{fuelTotals.total.toLocaleString()} <span className="text-xs">{currency}</span></p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pumpsData.map((pump, idx) => (
                <div key={pump.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                       <div className="bg-white p-2.5 rounded-xl shadow-sm text-blue-600"><Fuel className="w-5 h-5"/></div>
                       <span className="font-black uppercase italic text-slate-800 text-sm">{pump.name} - {pump.fuelType}</span>
                    </div>
                    <input type="number" value={pump.price} onChange={e => { const n = [...pumpsData]; n[idx].price = Number(e.target.value); setPumpsData(n); }} className="w-20 bg-white border border-slate-100 rounded-lg p-1 text-right text-[10px] font-black text-slate-400 outline-none" placeholder="Prix L" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[9px] font-black uppercase text-slate-400 px-1">Départ</label>
                       <div className="bg-white p-3.5 rounded-xl border border-slate-100 font-mono text-slate-300 text-sm font-bold">{pump.lastIndex.toLocaleString()}</div>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9px] font-black uppercase text-blue-600 px-1">Clôture</label>
                       <input type="number" value={pump.newIndex} onChange={e => { const n = [...pumpsData]; n[idx].newIndex = Number(e.target.value); setPumpsData(n); }} className="w-full bg-white p-3.5 rounded-xl border-2 border-blue-100 focus:border-blue-500 outline-none font-mono font-black text-blue-600 text-sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Étape 2 : Shop (Lubrifiants & Lavage) */}
        {step === 2 && (
          <div className="p-10 space-y-8 flex-1 animate-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-end">
               <div>
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">Ventes Boutique & Lavage</h3>
                  <p className="text-sm text-slate-500 font-bold">Saisie manuelle des quantités et tarifs unitaires.</p>
               </div>
               <div className="bg-emerald-50 px-6 py-4 rounded-[1.5rem] border border-emerald-100 text-right min-w-[260px]">
                  <p className="text-[10px] font-black uppercase text-emerald-400 tracking-widest mb-1">Total TTC Étape 2</p>
                  <p className="text-2xl font-black text-emerald-600 font-mono tracking-tighter">{(lubTotals + washTotals).toLocaleString()} <span className="text-xs">{currency}</span></p>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
               {/* Section Lubrifiants */}
               <div className="space-y-6">
                  <div className="flex items-center gap-3 text-blue-600">
                    <Droplets className="w-6 h-6" />
                    <h4 className="text-xs font-black uppercase tracking-widest">Lubrifiants</h4>
                  </div>
                  <div className="space-y-4">
                    {soldLubricants.map((s, i) => (
                       <div key={i} className="flex flex-col bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm relative group">
                          <div className="flex-1 w-full mb-4">
                            <label className="text-[8px] font-black uppercase text-slate-400 px-1 mb-1 block">Produit</label>
                            <select className="w-full bg-slate-50 p-3 rounded-xl text-[10px] font-black uppercase border-none outline-none appearance-none" value={s.id} onChange={e => {
                               const l = lubricants.find(lx => lx.id === e.target.value);
                               const n = [...soldLubricants]; n[i] = { id: e.target.value, qty: s.qty, price: l?.pricePerUnit || 0 }; setSoldLubricants(n);
                            }}>
                               <option value="">-- Sélectionner un produit --</option>
                               {lubricants.map(lx => <option key={lx.id} value={lx.id}>{lx.code} - {lx.name}</option>)}
                            </select>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-3 items-end">
                            <div className="space-y-1">
                               <label className="text-[8px] font-black uppercase text-slate-400 px-1 mb-1 block">Qté</label>
                               <input type="number" placeholder="0" className="w-full bg-slate-50 p-3 rounded-xl text-xs font-black text-center outline-none border border-transparent focus:border-blue-200 transition-all" value={s.qty || ''} onChange={e => { const n = [...soldLubricants]; n[i].qty = Number(e.target.value); setSoldLubricants(n); }} />
                            </div>
                            <div className="space-y-1">
                               <label className="text-[8px] font-black uppercase text-slate-400 px-1 mb-1 block">P.U TTC</label>
                               <input type="number" placeholder="0.00" className="w-full bg-slate-50 p-3 rounded-xl text-xs font-black text-center outline-none border border-transparent focus:border-blue-200 transition-all text-blue-600" value={s.price || ''} onChange={e => { const n = [...soldLubricants]; n[i].price = Number(e.target.value); setSoldLubricants(n); }} />
                            </div>
                            <div className="bg-blue-600 p-3 rounded-xl text-right">
                               <label className="text-[8px] font-black uppercase text-blue-200 px-1 mb-1 block">Total</label>
                               <p className="text-xs font-black text-white font-mono">{(s.qty * s.price).toLocaleString()}</p>
                            </div>
                          </div>
                          <button onClick={() => setSoldLubricants(soldLubricants.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 p-2 bg-white text-rose-500 rounded-full shadow-lg border border-slate-100 hover:scale-110 transition-all">
                               <Trash2 className="w-4 h-4"/>
                          </button>
                       </div>
                    ))}
                    <button onClick={() => setSoldLubricants([...soldLubricants, { id: '', qty: 1, price: 0 }])} className="w-full py-5 border-2 border-dashed border-slate-200 rounded-[2rem] text-[10px] font-black uppercase text-slate-400 hover:bg-slate-50 hover:border-blue-300 hover:text-blue-500 flex items-center justify-center gap-3 transition-all">
                       <Plus className="w-4 h-4"/> Ajouter un lubrifiant
                    </button>
                  </div>
               </div>

               {/* Section Lavage */}
               <div className="space-y-6">
                  <div className="flex items-center gap-3 text-indigo-600">
                    <WashIcon className="w-6 h-6" />
                    <h4 className="text-xs font-black uppercase tracking-widest">Lavage</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                     {/* Lavage Standard */}
                     <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center gap-6 group hover:border-indigo-200 transition-all relative">
                        <div className="flex-1">
                           <p className="font-black uppercase italic text-slate-800 text-lg">Lavage Standard</p>
                           <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Service Extérieur</p>
                        </div>
                        <div className="grid grid-cols-3 gap-4 items-end">
                           <div className="space-y-1">
                              <label className="text-[8px] font-black uppercase text-slate-400 px-1">Qté</label>
                              <input type="number" className="w-full bg-slate-50 p-3 rounded-xl border-2 border-transparent focus:border-indigo-500 text-center font-black text-slate-900 outline-none" value={washSales.basic.qty || ''} onChange={e => setWashSales({...washSales, basic: {...washSales.basic, qty: Number(e.target.value)}})} placeholder="0" />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[8px] font-black uppercase text-slate-400 px-1">P.U TTC</label>
                              <input type="number" className="w-full bg-slate-50 p-3 rounded-xl border-2 border-transparent focus:border-indigo-500 text-center font-black text-indigo-600 outline-none" value={washSales.basic.price || ''} onChange={e => setWashSales({...washSales, basic: {...washSales.basic, price: Number(e.target.value)}})} placeholder="0.00" />
                           </div>
                           <div className="bg-indigo-600 p-3 rounded-xl text-right min-w-[100px]">
                              <label className="text-[8px] font-black uppercase text-indigo-200 px-1">Total</label>
                              <p className="text-sm font-black text-white font-mono">{(washSales.basic.qty * washSales.basic.price).toLocaleString()}</p>
                           </div>
                        </div>
                     </div>

                     {/* Lavage Complet */}
                     <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center gap-6 group hover:border-indigo-200 transition-all relative">
                        <div className="flex-1">
                           <p className="font-black uppercase italic text-slate-800 text-lg">Lavage Complet</p>
                           <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Intérieur & Extérieur</p>
                        </div>
                        <div className="grid grid-cols-3 gap-4 items-end">
                           <div className="space-y-1">
                              <label className="text-[8px] font-black uppercase text-slate-400 px-1">Qté</label>
                              <input type="number" className="w-full bg-slate-50 p-3 rounded-xl border-2 border-transparent focus:border-indigo-500 text-center font-black text-slate-900 outline-none" value={washSales.complete.qty || ''} onChange={e => setWashSales({...washSales, complete: {...washSales.complete, qty: Number(e.target.value)}})} placeholder="0" />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[8px] font-black uppercase text-slate-400 px-1">P.U TTC</label>
                              <input type="number" className="w-full bg-slate-50 p-3 rounded-xl border-2 border-transparent focus:border-indigo-500 text-center font-black text-indigo-600 outline-none" value={washSales.complete.price || ''} onChange={e => setWashSales({...washSales, complete: {...washSales.complete, price: Number(e.target.value)}})} placeholder="0.00" />
                           </div>
                           <div className="bg-indigo-600 p-3 rounded-xl text-right min-w-[100px]">
                              <label className="text-[8px] font-black uppercase text-indigo-200 px-1">Total</label>
                              <p className="text-sm font-black text-white font-mono">{(washSales.complete.qty * washSales.complete.price).toLocaleString()}</p>
                           </div>
                        </div>
                     </div>
                     
                     <div className="p-5 bg-indigo-50 rounded-[1.5rem] border border-indigo-100 flex justify-between items-center mt-2">
                        <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Sous-total Lavage</span>
                        <span className="text-lg font-black text-indigo-600 font-mono italic">{washTotals.toLocaleString()} {currency.split(' ')[0]}</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* Étape 3 : Crédits */}
        {step === 3 && (
          <div className="p-10 space-y-8 flex-1 animate-in slide-in-from-right-4 duration-300">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">Bons de Crédit Clients</h3>
            <div className="space-y-4">
              {creditSales.map((sale, idx) => (
                <div key={idx} className="flex gap-4 items-center bg-slate-50 p-4 rounded-2xl">
                   <select className="flex-1 bg-white p-3 rounded-xl font-bold text-sm border-none outline-none" value={sale.customerId} onChange={e => { const n = [...creditSales]; n[idx].customerId = e.target.value; setCreditSales(n); }}>
                     <option value="">-- Client --</option>
                     {customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                   </select>
                   <input type="number" placeholder="Montant" className="w-40 bg-white p-3 rounded-xl font-black outline-none border-none" value={sale.amount || ''} onChange={e => { const n = [...creditSales]; n[idx].amount = Number(e.target.value); setCreditSales(n); }} />
                   <button onClick={() => setCreditSales(creditSales.filter((_, i) => i !== idx))} className="p-3 text-slate-300 hover:text-rose-500"><Trash2 className="w-5 h-5"/></button>
                </div>
              ))}
              <button onClick={() => setCreditSales([...creditSales, { customerId: '', amount: 0 }])} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-[1.5rem] text-slate-400 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 flex items-center justify-center gap-2 transition-all">
                <Plus className="w-4 h-4" /> Ajouter Bon de Crédit
              </button>
            </div>
          </div>
        )}

        {/* Étape 4 : Frais */}
        {step === 4 && (
          <div className="p-10 space-y-8 flex-1 animate-in slide-in-from-right-4 duration-300">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">Dépenses de Caisse</h3>
            <div className="space-y-4">
               {dailyExpenses.map((exp, idx) => (
                  <div key={idx} className="flex gap-4 items-center bg-slate-50 p-4 rounded-2xl">
                     <input type="text" placeholder="Motif de la dépense" className="flex-1 bg-white p-3 rounded-xl font-bold border-none outline-none" value={exp.desc} onChange={e => { const n = [...dailyExpenses]; n[idx].desc = e.target.value; setDailyExpenses(n); }} />
                     <input type="number" placeholder="Montant" className="w-40 bg-white p-3 rounded-xl font-black outline-none border-none text-rose-500" value={exp.amount || ''} onChange={e => { const n = [...dailyExpenses]; n[idx].amount = Number(e.target.value); setDailyExpenses(n); }} />
                     <button onClick={() => setDailyExpenses(dailyExpenses.filter((_, i) => i !== idx))} className="p-3 text-slate-300 hover:text-rose-500"><Trash2 className="w-5 h-5"/></button>
                  </div>
               ))}
               <button onClick={() => setDailyExpenses([...dailyExpenses, { desc: '', amount: 0 }])} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-[1.5rem] text-slate-400 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 flex items-center justify-center gap-2 transition-all">
                <Receipt className="w-4 h-4" /> Nouvelle Dépense
              </button>
            </div>
          </div>
        )}

        {/* Étape 5 : Caisse */}
        {step === 5 && (
          <div className="p-10 space-y-8 flex-1 animate-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-start">
               <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">Recettes Réelles</h3>
               <div className="text-right bg-slate-900 text-white px-6 py-4 rounded-[1.5rem] shadow-xl">
                  <p className="text-[10px] font-black uppercase text-slate-500">Recette Totale Shift</p>
                  <p className="text-2xl font-black font-mono tracking-tighter">{theoreticalTotal.toLocaleString()} {currency}</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 space-y-4">
                  <div className="flex items-center gap-3 text-emerald-600"><Coins className="w-6 h-6" /><span className="font-black uppercase text-xs tracking-widest">Espèces Comptées</span></div>
                  <input type="number" className="w-full bg-white p-5 rounded-2xl border-none outline-none font-black text-3xl text-emerald-700 shadow-sm" value={tenders.cash || ''} onChange={e => setTenders({...tenders, cash: Number(e.target.value)})} placeholder="0.00" />
               </div>
               <div className="p-8 bg-blue-50 rounded-[2.5rem] border border-blue-100 space-y-4">
                  <div className="flex items-center gap-3 text-blue-600"><CreditCard className="w-6 h-6" /><span className="font-black uppercase text-xs tracking-widest">TPE / CB</span></div>
                  <input type="number" className="w-full bg-white p-5 rounded-2xl border-none outline-none font-black text-3xl text-blue-700 shadow-sm" value={tenders.tpe || ''} onChange={e => setTenders({...tenders, tpe: Number(e.target.value)})} placeholder="0.00" />
               </div>
               <div className="p-8 bg-indigo-50 rounded-[2.5rem] border border-indigo-100 space-y-4">
                  <div className="flex items-center gap-3 text-indigo-600"><Zap className="w-6 h-6" /><span className="font-black uppercase text-xs tracking-widest">Bons Flotte</span></div>
                  <input type="number" className="w-full bg-white p-5 rounded-2xl border-none outline-none font-black text-3xl text-indigo-700 shadow-sm" value={tenders.fleetCards || ''} onChange={e => setTenders({...tenders, fleetCards: Number(e.target.value)})} placeholder="0.00" />
               </div>
            </div>
          </div>
        )}

        {/* Étape 6 : Validation */}
        {step === 6 && (
          <div className="p-10 space-y-8 flex-1 animate-in slide-in-from-right-4 duration-500">
            <h3 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 text-center">Réconciliation Finale</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="bg-slate-900 rounded-[3rem] p-10 text-white space-y-6">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 border-b border-white/10 pb-4">Analyse de l'Écart Cash</h4>
                  <div className="space-y-3">
                     <div className="flex justify-between text-xs font-bold text-slate-400"><span>Théorique Cash</span><span>{theoreticalCash.toLocaleString()} {currency}</span></div>
                     <div className="flex justify-between text-lg font-black italic"><span>Espèces</span><span className="text-blue-400">{tenders.cash.toLocaleString()}</span></div>
                     <div className={`p-6 rounded-2xl mt-6 flex justify-between items-center ${tenders.cash - theoreticalCash >= 0 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-rose-500/10 border border-rose-500/20'}`}>
                        <div>
                           <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Écart</p>
                           <p className={`text-4xl font-black italic tracking-tighter ${tenders.cash - theoreticalCash >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                             {(tenders.cash - theoreticalCash).toLocaleString()}
                           </p>
                        </div>
                        {Math.abs(tenders.cash - theoreticalCash) < 0.1 ? <CheckCircle2 className="w-12 h-12 text-emerald-500" /> : <AlertTriangle className="w-12 h-12 text-amber-500" />}
                     </div>
                  </div>
               </div>
               <div className="space-y-6">
                  <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100 space-y-4">
                     <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Répartition</h4>
                     <div className="space-y-2">
                        <div className="flex justify-between text-sm font-bold"><span>Carburants</span><span>{fuelTotals.total.toLocaleString()}</span></div>
                        <div className="flex justify-between text-sm font-bold"><span>Lubrifiants</span><span>{lubTotals.toLocaleString()}</span></div>
                        <div className="flex justify-between text-sm font-bold"><span>Lavage</span><span>{washTotals.toLocaleString()}</span></div>
                        <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-slate-900 italic"><span>TOTAL</span><span>{theoreticalTotal.toLocaleString()} {currency}</span></div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* Étape 7 : Fin */}
        {step === 7 && (
           <div className="p-20 flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in-95 duration-500">
              <div className="bg-emerald-100 p-8 rounded-full text-emerald-600"><CheckCircle2 className="w-24 h-24" /></div>
              <h3 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900">Session Clôturée</h3>
              <button onClick={() => setShowQuickReport(true)} className="bg-slate-900 text-white px-10 py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl flex items-center gap-4 hover:scale-105 transition-all active:scale-95">
                 <FileText className="w-6 h-6 text-blue-400" /> Voir le Rapport Journalier
              </button>
           </div>
        )}

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0 no-print">
          <button onClick={prevStep} disabled={step === 1 || step === 7} className="flex items-center gap-2 px-6 py-3 bg-white text-slate-600 rounded-xl font-black uppercase text-[10px] tracking-widest border border-slate-200 disabled:opacity-30 transition-all active:scale-95">
            <ChevronLeft className="w-4 h-4" /> Retour
          </button>
          
          <div className="flex gap-4">
            {step < 6 ? (
              <button onClick={nextStep} className="flex items-center gap-2 px-10 py-4 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-500/20 hover:scale-105 transition-all active:scale-95">
                Suivant <ChevronRight className="w-4 h-4" />
              </button>
            ) : step === 6 ? (
              <button onClick={nextStep} className="flex items-center gap-3 px-10 py-4 bg-emerald-600 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all active:scale-95">
                Confirmer la Clôture <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleComplete} className="flex items-center gap-3 px-10 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-xl shadow-slate-900/20 hover:scale-105 transition-all active:scale-95">
                <LayoutDashboard className="w-5 h-5" /> Terminer
              </button>
            )}
          </div>
        </div>
      </div>

      {showQuickReport && (
        <DailyReportModal onClose={() => setShowQuickReport(false)} invoices={invoices} expenses={expenses} payments={payments} config={stationConfig} date={sessionDate} />
      )}
    </div>
  );
};

export default ShiftWizard;
