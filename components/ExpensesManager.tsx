
import React, { useState } from 'react';
import { Expense } from '../types';
import { Plus, Search, Wallet, X, Calendar, ArrowDownRight, Tag, Trash2, Calculator } from 'lucide-react';

interface ExpensesManagerProps {
  expenses: Expense[];
  onAddExpense: (expense: Expense) => void;
  currency: string;
}

const ExpensesManager: React.FC<ExpensesManagerProps> = ({ expenses, onAddExpense, currency }) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    category: 'SALARES',
    amount: '',
    description: '',
    paymentMethod: 'ESPECES' as any
  });

  const categories = [
    'SALARES', 'ELECTRICITE', 'EAU', 'MAINTENANCE', 'LOYER', 'FOURNITURES', 'TAXES', 'AUTRE'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) return;

    const newExp: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      category: formData.category,
      amount: parseFloat(formData.amount),
      description: formData.description,
      paymentMethod: formData.paymentMethod,
      recordedBy: 'Admin'
    };

    onAddExpense(newExp);
    setShowModal(false);
    setFormData({ category: 'SALARES', amount: '', description: '', paymentMethod: 'ESPECES' });
  };

  const filtered = expenses.filter(ex => 
    ex.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
    ex.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalThisMonth = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-6 shadow-sm w-full md:w-auto">
           <div className="bg-rose-100 p-4 rounded-2xl text-rose-600"><Wallet className="w-8 h-8"/></div>
           <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Charges du mois</p>
              <p className="text-3xl font-black text-slate-900 italic tracking-tighter">{totalThisMonth.toLocaleString()} {currency}</p>
           </div>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:scale-105 transition-all active:scale-95"
        >
          <Plus className="w-6 h-6" />
          <span>Saisir une Dépense</span>
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center gap-4">
          <Search className="w-5 h-5 text-slate-300" />
          <input 
            type="text" 
            placeholder="Filtrer les dépenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none font-bold text-slate-800"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 font-black uppercase text-[10px] tracking-widest">
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Catégorie</th>
                <th className="px-8 py-5">Description</th>
                <th className="px-8 py-5">Paiement</th>
                <th className="px-8 py-5 text-right">Montant</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(ex => (
                <tr key={ex.id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 p-2 rounded-lg text-slate-400"><Calendar className="w-4 h-4"/></div>
                      <span className="font-bold text-sm text-slate-600">{new Date(ex.date).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">{ex.category}</span>
                  </td>
                  <td className="px-8 py-5 font-bold text-slate-800">{ex.description}</td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-bold text-slate-400 uppercase">{ex.paymentMethod}</span>
                  </td>
                  <td className="px-8 py-5 text-right font-black text-rose-500 font-mono">-{ex.amount.toLocaleString()} {currency}</td>
                  <td className="px-8 py-5 text-right">
                    <button className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4"/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-rose-500 p-3 rounded-2xl"><ArrowDownRight className="w-6 h-6 text-white"/></div>
                <h3 className="text-xl font-black uppercase italic tracking-tighter">Saisie de Charge</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"><X/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Catégorie</label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map(cat => (
                    <button 
                      key={cat}
                      type="button"
                      onClick={() => setFormData({...formData, category: cat})}
                      className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${formData.category === cat ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Montant ({currency})</label>
                <div className="relative">
                   <Calculator className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                   <input 
                    type="number" 
                    step="0.01"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-rose-500/10 outline-none font-black text-xl text-rose-500"
                    placeholder="0.00"
                    required
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                   />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Description / Motif</label>
                <textarea 
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-slate-500/10 outline-none font-bold text-sm h-24"
                  placeholder="Détails de la dépense..."
                  required
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mode de Règlement</label>
                <select 
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-slate-500/10 outline-none font-bold text-sm"
                  value={formData.paymentMethod}
                  onChange={e => setFormData({...formData, paymentMethod: e.target.value as any})}
                >
                  <option value="ESPECES">Espèces (Caisse Station)</option>
                  <option value="CHEQUE">Chèque Bancaire</option>
                  <option value="VIREMENT">Virement / Prélèvement</option>
                  <option value="CARTE">Carte Bancaire</option>
                </select>
              </div>

              <button type="submit" className="w-full py-5 bg-rose-500 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-rose-500/30 hover:-translate-y-1 transition-all active:scale-95 mt-4">
                Enregistrer la sortie
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesManager;
