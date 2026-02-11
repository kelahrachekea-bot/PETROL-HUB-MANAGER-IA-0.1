
import React, { useState } from 'react';
import { Search, Plus, Filter, Package, AlertCircle, Fingerprint } from 'lucide-react';
import { LubricantStock } from '../types';

interface LubricantsManagerProps {
  lubricants: LubricantStock[];
  setLubricants: React.Dispatch<React.SetStateAction<LubricantStock[]>>;
  currency: string;
}

const LubricantsManager: React.FC<LubricantsManagerProps> = ({ lubricants, setLubricants, currency }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = lubricants.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between no-print">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Nom, Marque ou Code SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 font-bold transition-all"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-100 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-500 hover:bg-slate-200 transition-all">
            <Filter className="w-4 h-4" />
            <span>Filtrer</span>
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest text-white hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-95">
            <Plus className="w-5 h-5" />
            <span>Nouvelle Vente</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identifiant SKU</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Désignation Produit</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Stock</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Prix Unit. TTC</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Statut</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((item) => {
                const isLow = item.quantity <= item.minThreshold;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl w-fit border border-blue-100">
                          <Fingerprint className="w-3 h-3" />
                          <span className="font-mono font-black text-xs">{item.code}</span>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="bg-slate-100 p-2.5 rounded-xl text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="font-black text-slate-800 uppercase italic tracking-tight leading-none mb-1">{item.name}</p>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                       <div className="inline-flex items-center bg-slate-50 rounded-xl px-4 py-2 border border-slate-100">
                          <span className={`text-lg font-black font-mono ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>{item.quantity}</span>
                          <span className="text-[10px] font-black text-slate-400 ml-2 uppercase">u</span>
                       </div>
                    </td>
                    <td className="px-8 py-5 font-black text-slate-900 italic text-right">{item.pricePerUnit.toLocaleString()} <span className="text-xs font-normal opacity-30">{currency}</span></td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center">
                         {isLow ? (
                           <div className="flex items-center gap-2 text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100 animate-pulse">
                             <AlertCircle className="w-4 h-4" />
                             <span className="text-[10px] font-black uppercase tracking-widest">Alerte Stock</span>
                           </div>
                         ) : (
                           <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                             <span className="text-[10px] font-black uppercase tracking-widest">Stock OK</span>
                           </div>
                         )}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="text-blue-600 font-black uppercase text-[10px] tracking-widest hover:underline px-4 py-2 bg-blue-50 rounded-xl">Mouvement</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
             <div className="p-20 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                   <Search className="w-8 h-8" />
                </div>
                <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Aucun produit ne correspond à votre recherche</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LubricantsManager;
