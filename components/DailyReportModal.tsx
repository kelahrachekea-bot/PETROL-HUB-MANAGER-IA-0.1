
import React, { useState } from 'react';
import { 
  X, Printer, FileText, Wallet, Droplets, Fuel, 
  Car, CreditCard, ArrowDownCircle, Info, Landmark, 
  ArrowUpRight, Calculator, Coins, PiggyBank,
  TrendingUp, RefreshCcw, ArrowDownRight, MinusCircle, PlusCircle, CheckCircle2, AlertCircle,
  MapPin, Phone, Hash, Receipt
} from 'lucide-react';
import { Invoice, Expense, Payment, StationConfig, InvoiceType } from '../types';

interface DailyReportModalProps {
  onClose: () => void;
  invoices: Invoice[];
  expenses: Expense[];
  payments: Payment[];
  config: StationConfig;
  date: string;
}

const DailyReportModal: React.FC<DailyReportModalProps> = ({ onClose, invoices, expenses, payments, config, date }) => {
  const [operatingMargin, setOperatingMargin] = useState<number>(0);
  const [cashToBank, setCashToBank] = useState<number>(0);
  const [bankFees, setBankFees] = useState<number>(0);
  const [supplierRefund, setSupplierRefund] = useState<number>(0);

  const dayInvoices = invoices.filter(inv => new Date(inv.date).toDateString() === new Date(date).toDateString());
  const dayExpenses = expenses.filter(exp => new Date(exp.date).toDateString() === new Date(date).toDateString());
  const dayPayments = payments.filter(p => new Date(p.date).toDateString() === new Date(date).toDateString());

  const sales = dayInvoices.filter(inv => inv.type === InvoiceType.SALE);
  
  const fuelSales = sales.reduce((acc, inv) => acc + inv.items.filter(i => i.category === 'FUEL').reduce((sum, i) => sum + i.total, 0), 0);
  const lubSales = sales.reduce((acc, inv) => acc + inv.items.filter(i => i.category === 'LUBRICANT').reduce((sum, i) => sum + i.total, 0), 0);
  const washSales = sales.reduce((acc, inv) => acc + inv.items.filter(i => i.category === 'WASH').reduce((sum, i) => sum + i.total, 0), 0);
  const otherSales = sales.reduce((acc, inv) => acc + inv.items.filter(i => i.category === 'OTHER').reduce((sum, i) => sum + i.total, 0), 0);
  
  const paymentBreakdown = {
    cash: sales.filter(s => s.paymentMethod === 'ESPECES').reduce((acc, s) => acc + s.totalTTC, 0) + 
          dayPayments.filter(p => p.method === 'ESPECES' && p.type === 'RECETTE').reduce((acc, p) => acc + p.amount, 0),
    card: sales.filter(s => s.paymentMethod === 'CARTE_BANCAIRE').reduce((acc, s) => acc + s.totalTTC, 0) +
          dayPayments.filter(p => p.method === 'CARTE_BANCAIRE' && p.type === 'RECETTE').reduce((acc, p) => acc + p.amount, 0),
    fleetCard: sales.filter(s => s.paymentMethod === 'CARTE_CARBURANT').reduce((acc, s) => acc + s.totalTTC, 0),
    cheque: dayPayments.filter(p => p.method === 'CHEQUE' && p.type === 'RECETTE').reduce((acc, p) => acc + p.amount, 0),
    virementRecette: dayPayments.filter(p => p.method === 'VIREMENT' && p.type === 'RECETTE').reduce((acc, p) => acc + p.amount, 0),
    virementDepense: dayPayments.filter(p => p.method === 'VIREMENT' && p.type === 'DEPENSE').reduce((acc, p) => acc + p.amount, 0),
    credit: sales.filter(s => s.paymentMethod === 'CREDIT').reduce((acc, s) => acc + s.totalTTC, 0),
  };

  const totalCaisseExpenses = dayExpenses.filter(e => e.paymentMethod === 'ESPECES').reduce((acc, e) => acc + e.amount, 0);
  const totalCA = fuelSales + lubSales + washSales + otherSales;
  const netCaisseDaily = paymentBreakdown.cash - (totalCaisseExpenses + operatingMargin + cashToBank);

  const bankInflows = cashToBank + paymentBreakdown.virementRecette + supplierRefund;
  const bankOutflows = paymentBreakdown.virementDepense + bankFees;
  const netBankDaily = bankInflows - bankOutflows;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-0 md:p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300 overflow-hidden">
      <div className="bg-slate-100 w-full max-w-[1600px] h-full md:h-[95vh] rounded-none md:rounded-[3rem] shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95">
        
        {/* --- PANNEAU DE CONTRÔLE LATÉRAL (Caché à l'impression) --- */}
        <aside className="w-full md:w-80 lg:w-96 bg-slate-900 text-white flex flex-col shrink-0 no-print">
           <div className="p-8 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-3">
                 <div className="bg-blue-600 p-2 rounded-xl"><Calculator className="w-5 h-5"/></div>
                 <h3 className="text-sm font-black uppercase tracking-widest italic">Ajustements</h3>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-rose-500 rounded-full transition-all md:hidden"><X/></button>
           </div>
           
           <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
              <div className="space-y-6">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Variables Manuelles</p>
                {[
                  { label: "Marge Exploitation", val: operatingMargin, set: setOperatingMargin, color: "blue" },
                  { label: "Versement Banque", val: cashToBank, set: setCashToBank, color: "emerald" },
                  { label: "Frais Bancaires", val: bankFees, set: setBankFees, color: "rose" },
                  { label: "Remboursement Frn.", val: supplierRefund, set: setSupplierRefund, color: "amber" }
                ].map((input, idx) => (
                  <div key={idx} className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 px-1">{input.label}</label>
                    <input 
                      type="number" 
                      value={input.val || ''} 
                      onChange={e => input.set(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 font-bold text-sm text-white focus:border-blue-500 outline-none transition-all"
                      placeholder="0.00"
                    />
                  </div>
                ))}
              </div>

              <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-2xl space-y-2">
                 <div className="flex items-center gap-2 text-blue-400 mb-2">
                    <Info className="w-4 h-4"/>
                    <span className="text-[10px] font-black uppercase">Note</span>
                 </div>
                 <p className="text-[10px] text-slate-400 leading-relaxed font-medium italic">Ces valeurs seront reportées instantanément sur le document de droite avant l'impression finale.</p>
              </div>
           </div>

           <div className="p-8 bg-slate-950/50">
              <button 
                onClick={() => window.print()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 transition-all active:scale-95"
              >
                <Printer className="w-5 h-5" /> Imprimer le Rapport
              </button>
              <button onClick={onClose} className="w-full mt-4 py-3 text-slate-500 font-bold uppercase text-[10px] tracking-widest hover:text-white transition-colors">Fermer l'aperçu</button>
           </div>
        </aside>

        {/* --- ZONE DE PRÉVISUALISATION (Format A4) --- */}
        <main className="flex-1 overflow-y-auto bg-slate-100 p-4 md:p-12 flex justify-center [scrollbar-gutter:stable]">
           <div className="print-container bg-white w-full max-w-[21cm] min-h-[29.7cm] shadow-2xl md:rounded-[0.5rem] p-8 md:p-16 flex flex-col text-slate-800">
              
              {/* Header Document */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-10 mb-10">
                 <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="bg-slate-900 text-white p-3 rounded-xl"><Fuel className="w-8 h-8"/></div>
                       <div>
                          <h1 className="text-3xl font-black italic uppercase tracking-tighter leading-none">{config.name}</h1>
                          <p className="text-[10px] font-black text-slate-500 tracking-widest mt-1 uppercase italic">Gestion Station-Service Intégrée</p>
                       </div>
                    </div>
                    <div className="space-y-1">
                       <p className="flex items-center gap-2 text-[10px] font-bold text-slate-600"><MapPin className="w-3 h-3"/> {config.address}, {config.city}</p>
                       <p className="flex items-center gap-2 text-[10px] font-bold text-slate-600"><Hash className="w-3 h-3"/> ICE: {config.ice}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <div className="bg-slate-100 px-6 py-4 rounded-2xl inline-block border border-slate-200">
                       <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Rapport d'activité du</p>
                       <p className="text-lg font-black uppercase italic tracking-tight">{new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <p className="text-[9px] font-black text-slate-300 uppercase mt-4 tracking-[0.3em]">Ref: PH-REP-{Date.now().toString().slice(-6)}</p>
                 </div>
              </div>

              {/* Contenu du Rapport */}
              <div className="flex-1 space-y-10">
                 
                 {/* Section 1: Chiffre d'Affaires Global */}
                 <section className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest border-l-4 border-blue-600 pl-4">1. Synthèse des Ventes Réalisées</h3>
                    <table className="w-full border-collapse">
                       <thead>
                          <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                             <th className="py-3 px-4 text-left border-b">Catégorie de Produit</th>
                             <th className="py-3 px-4 text-right border-b">Montant HT</th>
                             <th className="py-3 px-4 text-right border-b">TVA (20%)</th>
                             <th className="py-3 px-4 text-right border-b">Total TTC</th>
                          </tr>
                       </thead>
                       <tbody className="text-sm font-bold">
                          <tr>
                             <td className="py-4 px-4 border-b flex items-center gap-2"><Fuel className="w-4 h-4 text-blue-600"/> Carburants</td>
                             <td className="py-4 px-4 text-right border-b">{(fuelSales/1.2).toLocaleString()}</td>
                             <td className="py-4 px-4 text-right border-b">{(fuelSales - (fuelSales/1.2)).toLocaleString()}</td>
                             <td className="py-4 px-4 text-right border-b">{fuelSales.toLocaleString()}</td>
                          </tr>
                          <tr>
                             <td className="py-4 px-4 border-b flex items-center gap-2"><Droplets className="w-4 h-4 text-emerald-600"/> Lubrifiants</td>
                             <td className="py-4 px-4 text-right border-b">{(lubSales/1.2).toLocaleString()}</td>
                             <td className="py-4 px-4 text-right border-b">{(lubSales - (lubSales/1.2)).toLocaleString()}</td>
                             <td className="py-4 px-4 text-right border-b">{lubSales.toLocaleString()}</td>
                          </tr>
                          <tr>
                             <td className="py-4 px-4 border-b flex items-center gap-2"><Car className="w-4 h-4 text-indigo-600"/> Lavage & Services</td>
                             <td className="py-4 px-4 text-right border-b">{(washSales/1.2).toLocaleString()}</td>
                             <td className="py-4 px-4 text-right border-b">{(washSales - (washSales/1.2)).toLocaleString()}</td>
                             <td className="py-4 px-4 text-right border-b">{washSales.toLocaleString()}</td>
                          </tr>
                          <tr className="bg-slate-900 text-white font-black">
                             <td className="py-4 px-4 rounded-l-xl uppercase italic">Total Chiffre d'Affaires</td>
                             <td className="py-4 px-4 text-right">{(totalCA/1.2).toLocaleString()}</td>
                             <td className="py-4 px-4 text-right">{(totalCA - (totalCA/1.2)).toLocaleString()}</td>
                             <td className="py-4 px-4 text-right rounded-r-xl">{totalCA.toLocaleString()} {config.currency}</td>
                          </tr>
                       </tbody>
                    </table>
                 </section>

                 {/* Section 2: Analyse de la Caisse & Banque */}
                 <div className="grid grid-cols-2 gap-10">
                    <section className="space-y-4">
                       <h3 className="text-xs font-black uppercase tracking-widest border-l-4 border-emerald-600 pl-4">2. Ventilation Encaissements</h3>
                       <div className="space-y-2 text-xs font-bold text-slate-600">
                          <div className="flex justify-between p-3 bg-slate-50 rounded-lg"><span>Recettes Espèces (Z-Caisse)</span><span className="font-black text-slate-900">{paymentBreakdown.cash.toLocaleString()}</span></div>
                          <div className="flex justify-between p-3 bg-slate-50 rounded-lg"><span>Ventes TPE / Cartes Bancaires</span><span className="font-black text-slate-900">{paymentBreakdown.card.toLocaleString()}</span></div>
                          <div className="flex justify-between p-3 bg-slate-50 rounded-lg"><span>Bons de Crédit Clients</span><span className="font-black text-slate-900">{paymentBreakdown.credit.toLocaleString()}</span></div>
                          <div className="flex justify-between p-3 bg-slate-50 rounded-lg"><span>Ventes Cartes Flotte</span><span className="font-black text-slate-900">{paymentBreakdown.fleetCard.toLocaleString()}</span></div>
                          <div className="flex justify-between p-3 bg-slate-50 rounded-lg"><span>Virements & Chèques Reçus</span><span className="font-black text-slate-900">{(paymentBreakdown.cheque + paymentBreakdown.virementRecette).toLocaleString()}</span></div>
                       </div>
                    </section>
                    
                    <section className="space-y-4">
                       <h3 className="text-xs font-black uppercase tracking-widest border-l-4 border-rose-600 pl-4">3. Défalcations & Charges</h3>
                       <div className="space-y-2 text-xs font-bold text-slate-600">
                          <div className="flex justify-between p-3 bg-rose-50/50 rounded-lg"><span>Dépenses Directes Caisse</span><span className="font-black text-rose-600">-{totalCaisseExpenses.toLocaleString()}</span></div>
                          <div className="flex justify-between p-3 bg-blue-50/50 rounded-lg"><span>Marge Exploitation Déclarée</span><span className="font-black text-blue-600">-{operatingMargin.toLocaleString()}</span></div>
                          <div className="flex justify-between p-3 bg-emerald-50/50 rounded-lg"><span>Versement Bancaire (Espèces)</span><span className="font-black text-emerald-600">-{cashToBank.toLocaleString()}</span></div>
                          <div className="flex justify-between p-3 bg-slate-100 rounded-lg"><span>Frais & Agios Bancaires</span><span className="font-black text-slate-900">-{bankFees.toLocaleString()}</span></div>
                          <div className="flex justify-between p-3 bg-slate-100 rounded-lg"><span>Paiements Fournisseurs (Vir.)</span><span className="font-black text-slate-900">-{paymentBreakdown.virementDepense.toLocaleString()}</span></div>
                       </div>
                    </section>
                 </div>

                 {/* Section 3: Position Finale */}
                 <section className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10"><TrendingUp className="w-32 h-32"/></div>
                    <div className="grid grid-cols-2 gap-8 items-center">
                       <div>
                          <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Solde de Caisse Résiduel (Théorique)</p>
                          <h4 className={`text-4xl font-black italic tracking-tighter ${netCaisseDaily >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                             {netCaisseDaily.toLocaleString()} <span className="text-sm font-normal opacity-50">{config.currency}</span>
                          </h4>
                          <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Montant devant rester en coffre après déductions</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Variation Bancaire Nette</p>
                          <h4 className={`text-2xl font-black italic tracking-tighter ${netBankDaily >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                             {netBankDaily.toLocaleString()} <span className="text-sm font-normal opacity-50">{config.currency}</span>
                          </h4>
                       </div>
                    </div>
                 </section>
              </div>

              {/* Footer Document: Signatures & Certification */}
              <div className="mt-20 border-t border-slate-100 pt-10 flex justify-between items-end">
                 <div className="space-y-10">
                    <div className="space-y-2">
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Certification & Visa</p>
                       <div className="w-64 h-32 border-2 border-dashed border-slate-100 rounded-2xl flex items-center justify-center text-[10px] text-slate-300 italic">
                          Cachet & Signature Gérant
                       </div>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                       <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Document généré via PetrolHub Pro Cloud
                    </div>
                 </div>
                 <div className="text-center space-y-3">
                    <QrCode className="w-24 h-24 text-slate-200" />
                    <p className="text-[8px] font-black font-mono text-slate-300">CERT-ID: {Date.now().toString(36).toUpperCase()}</p>
                 </div>
              </div>
           </div>
        </main>
      </div>

      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            background: white !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .fixed {
            position: static !important;
            height: auto !important;
          }
          .print-container {
            box-shadow: none !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 2cm !important;
          }
          .bg-slate-100, .bg-slate-900, .bg-slate-900\/90 {
            background: white !important;
          }
          .md\\:rounded-\\[3rem\\], .rounded-none {
            border-radius: 0 !important;
          }
          h1, h2, h3, h4, p, span, td, th {
            color: black !important;
          }
          .bg-slate-900.text-white {
            background: #f1f5f9 !important;
            color: black !important;
            border: 1px solid #e2e8f0 !important;
          }
        }
      `}</style>
    </div>
  );
};

const QrCode = ({className}: {className: string}) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M7 7h.01M17 7h.01M7 17h.01M17 17h.01" />
    <path d="M12 7v10M7 12h10" />
  </svg>
);

export default DailyReportModal;
