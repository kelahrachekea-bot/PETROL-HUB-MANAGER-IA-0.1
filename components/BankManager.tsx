
import React, { useState } from 'react';
import { Landmark, ArrowUpRight, ArrowDownRight, Search, Plus, CreditCard, Coins, RefreshCcw, Landmark as LandmarkIcon, Info, Filter, History, Trash2, X } from 'lucide-react';
import { BankAccount, Payment, AccountCustomer, Supplier, PaymentMethod } from '../types';

interface BankManagerProps {
  banks: BankAccount[];
  payments: Payment[];
  customers: AccountCustomer[];
  suppliers: Supplier[];
  onAddPayment: (p: Payment) => void;
  currency: string;
}

const BankManager: React.FC<BankManagerProps> = ({ banks, payments, customers, suppliers, onAddPayment, currency }) => {
  const [showModal, setShowModal] = useState<{ type: 'RECETTE' | 'DEPENSE' } | null>(null);
  const [formData, setFormData] = useState({
    partnerName: '',
    amount: '',
    method: 'VIREMENT' as PaymentMethod,
    reference: '',
    bankAccountId: banks[0]?.id || ''
  });

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !showModal || !formData.bankAccountId) return;

    const newPayment: Payment = {
      id: `BANK-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString(),
      partnerId: 'N/A',
      partnerName: formData.partnerName,
      amount: parseFloat(formData.amount),
      method: formData.method,
      type: showModal.type,
      reference: formData.reference,
      bankAccountId: formData.bankAccountId
    };

    onAddPayment(newPayment);
    setShowModal(null);
    setFormData({ partnerName: '', amount: '', method: 'VIREMENT', reference: '', bankAccountId: banks[0]?.id || '' });
  };

  const bankPayments = payments.filter(p => p.bankAccountId);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Résumé des Banques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banks.map((bank) => (
          <div key={bank.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-xl transition-all">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-10 -mt-10 group-hover:scale-125 transition-transform duration-700"></div>
             <div className="flex justify-between items-start mb-6">
                <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-600/20">
                   <Landmark className="w-6 h-6" />
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">RIB Terminal</p>
                   <p className="text-[10px] font-mono text-slate-500">...{bank.rib.slice(-4)}</p>
                </div>
             </div>
             <h3 className="text-lg font-black text-slate-800 uppercase italic tracking-tighter">{bank.name}</h3>
             <p className="text-4xl font-black text-blue-600 font-mono italic tracking-tighter mt-2">{bank.balance.toLocaleString()} <span className="text-xs font-normal opacity-40">{currency}</span></p>
          </div>
        ))}
        
        {/* Actions Rapides Banque */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col justify-center items-center gap-4 text-center">
           <p className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Mouvements Bancaires</p>
           <div className="flex gap-4 w-full">
              <button 
                onClick={() => setShowModal({ type: 'RECETTE' })}
                className="flex-1 bg-emerald-600 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-emerald-700 transition-all active:scale-95"
              >
                 <ArrowUpRight className="w-5 h-5" />
                 <span className="text-[9px] font-black uppercase tracking-widest">Recette Virement</span>
              </button>
              <button 
                onClick={() => setShowModal({ type: 'DEPENSE' })}
                className="flex-1 bg-rose-600 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-rose-700 transition-all active:scale-95"
              >
                 <ArrowDownRight className="w-5 h-5" />
                 <span className="text-[9px] font-black uppercase tracking-widest">Paiement Virement</span>
              </button>
           </div>
        </div>
      </div>

      {/* Journal Bancaire */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-20">
           <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-3">
              <History className="w-5 h-5 text-blue-500" /> Journal des Opérations Bancaires
           </h3>
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input type="text" placeholder="Chercher transaction..." className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none w-64 focus:ring-2 focus:ring-blue-500/10" />
           </div>
        </div>
        <div className="max-h-[60vh] overflow-y-auto overflow-x-auto [scrollbar-gutter:stable]">
          <table className="w-full text-left relative border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50/90 text-[10px] font-black text-slate-400 uppercase tracking-widest backdrop-blur-sm sticky top-0 z-10 shadow-sm">
                <th className="px-8 py-5 border-b border-slate-100">Date</th>
                <th className="px-8 py-5 border-b border-slate-100">Banque</th>
                <th className="px-8 py-5 border-b border-slate-100">Libellé / Partenaire</th>
                <th className="px-8 py-5 border-b border-slate-100">Référence</th>
                <th className="px-8 py-5 border-b border-slate-100 text-right">Mouvement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {bankPayments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-slate-300 uppercase font-black text-xs tracking-widest">
                    Aucune transaction bancaire enregistrée
                  </td>
                </tr>
              ) : (
                bankPayments.map(p => {
                  const bank = banks.find(b => b.id === p.bankAccountId);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-all">
                      <td className="px-8 py-5 text-xs font-bold text-slate-500 whitespace-nowrap">{new Date(p.date).toLocaleDateString()}</td>
                      <td className="px-8 py-5 text-xs font-black text-slate-900 whitespace-nowrap">{bank?.name || '---'}</td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{p.partnerName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{p.method}</p>
                      </td>
                      <td className="px-8 py-5 text-xs font-mono text-slate-400 whitespace-nowrap">{p.reference || 'N/A'}</td>
                      <td className={`px-8 py-5 text-right font-black font-mono text-lg whitespace-nowrap ${p.type === 'RECETTE' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {p.type === 'RECETTE' ? '+' : '-'} {p.amount.toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'opération bancaire */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
             <div className={`p-10 text-white flex justify-between items-center ${showModal.type === 'RECETTE' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Opération Bancaire</h3>
                <button onClick={() => setShowModal(null)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all"><X/></button>
             </div>
             <form onSubmit={handleRecordPayment} className="p-10 space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Banque concernée</label>
                   <select 
                     required
                     className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold"
                     value={formData.bankAccountId}
                     onChange={e => setFormData({...formData, bankAccountId: e.target.value})}
                   >
                     {banks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Partenaire / Motif</label>
                   <input 
                     type="text" 
                     required
                     list="all-partners"
                     className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold"
                     placeholder="Client, Fournisseur, Frais..."
                     value={formData.partnerName}
                     onChange={e => setFormData({...formData, partnerName: e.target.value})}
                   />
                   <datalist id="all-partners">
                      {customers.map(c => <option key={c.id} value={c.name} />)}
                      {suppliers.map(s => <option key={s.id} value={s.name} />)}
                      <option value="FRAIS BANCAIRES" />
                      <option value="AGIOS" />
                   </datalist>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Montant ({currency})</label>
                   <input 
                     type="number" 
                     required
                     className={`w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-black text-3xl italic ${showModal.type === 'RECETTE' ? 'text-emerald-600' : 'text-rose-600'}`}
                     value={formData.amount}
                     onChange={e => setFormData({...formData, amount: e.target.value})}
                     placeholder="0.00"
                   />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Méthode</label>
                    <select 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-xs"
                      value={formData.method}
                      onChange={e => setFormData({...formData, method: e.target.value as PaymentMethod})}
                    >
                       <option value="VIREMENT">Virement</option>
                       <option value="CHEQUE">Chèque</option>
                       <option value="CARTE_BANCAIRE">TPE / Carte</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Référence</label>
                    <input 
                      type="text"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-xs"
                      value={formData.reference}
                      onChange={e => setFormData({...formData, reference: e.target.value})}
                      placeholder="N° Chèque/Vir"
                    />
                  </div>
                </div>
                <button type="submit" className={`w-full py-6 mt-4 rounded-2xl text-white font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 ${showModal.type === 'RECETTE' ? 'bg-emerald-600 shadow-emerald-600/20' : 'bg-rose-600 shadow-rose-600/20'}`}>
                   Confirmer l'opération
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankManager;
