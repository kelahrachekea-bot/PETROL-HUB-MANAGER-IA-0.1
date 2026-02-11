
import React, { useState } from 'react';
import { Invoice, InvoiceType, InvoiceItem, FuelStock, LubricantStock, AccountCustomer, StationConfig, PaymentMethod } from '../types';
import { 
  Plus, Search, FileText, ShoppingBag, Truck, Trash2, X, Printer, 
  CheckCircle2, Clock, MoreVertical, MapPin, Phone, User as UserIcon, 
  QrCode, ShieldCheck, Calculator, Percent, CreditCard, Zap, Fuel, Droplets
} from 'lucide-react';

interface InvoicesManagerProps {
  invoices: Invoice[];
  onAddInvoice: (invoice: Invoice) => void;
  fuelStocks: FuelStock[];
  lubricants: LubricantStock[];
  customers: AccountCustomer[];
  currency: string;
  stationConfig: StationConfig;
}

const InvoicesManager: React.FC<InvoicesManagerProps> = ({ 
  invoices, onAddInvoice, fuelStocks, lubricants, customers, currency, stationConfig
}) => {
  const [activeType, setActiveType] = useState<InvoiceType>(InvoiceType.SALE);
  const [showModal, setShowModal] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [partner, setPartner] = useState('');
  const [partnerIce, setPartnerIce] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ESPECES');

  const filteredInvoices = invoices.filter(inv => 
    inv.type === activeType && 
    (inv.partner.toLowerCase().includes(searchTerm.toLowerCase()) || inv.id.includes(searchTerm))
  );

  const handleAddItem = (category: 'FUEL' | 'LUBRICANT' | 'WASH' | 'OTHER' = 'FUEL') => {
    setItems([...items, { id: Math.random().toString(36).substr(2, 9), productId: '', productName: '', category, quantity: 1, unitPrice: 0, vatRate: stationConfig.vatRate || 20, total: 0 }]);
  };

  const updateItem = (itemId: string, field: keyof InvoiceItem, value: any) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        let updatedItem = { ...item, [field]: value };
        if (field === 'productId') {
          if (updatedItem.category === 'FUEL') {
            const fuel = fuelStocks.find(f => f.id === value);
            if (fuel) { updatedItem.productName = `${fuel.code} (${fuel.type})`; updatedItem.vatRate = fuel.vatRate; }
          } else if (updatedItem.category === 'LUBRICANT') {
            const lub = lubricants.find(l => l.id === value);
            if (lub) { updatedItem.productName = lub.name; updatedItem.unitPrice = lub.pricePerUnit; updatedItem.vatRate = lub.vatRate; }
          } else if (updatedItem.category === 'WASH') {
            updatedItem.productName = value === 'WASH_BASIC' ? 'Lavage Basique' : 'Lavage Complet';
            updatedItem.unitPrice = value === 'WASH_BASIC' ? 40 : 80;
          }
        }
        updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        return updatedItem;
      }
      return item;
    }));
  };

  const calculateTotals = (currentItems: InvoiceItem[]) => {
    let ttc = 0, ht = 0, vat = 0;
    currentItems.forEach(item => {
      const lineTTC = item.total, lineHT = lineTTC / (1 + (item.vatRate / 100)), lineVAT = lineTTC - lineHT;
      ttc += lineTTC; ht += lineHT; vat += lineVAT;
    });
    return { ttc, ht, vat };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || !partner) return;
    const { ttc, ht, vat } = calculateTotals(items);
    onAddInvoice({ id: `${activeType === InvoiceType.SALE ? 'V' : 'A'}${Date.now().toString().slice(-8)}`, type: activeType, date: new Date().toISOString(), partner, partnerIce, items, totalTTC: ttc, totalHT: ht, totalVAT: vat, paymentMethod, status: paymentMethod === 'CREDIT' ? 'PENDING' : 'PAID' });
    setShowModal(false); setItems([]); setPartner(''); setPartnerIce(''); setPaymentMethod('ESPECES');
  };

  const totals = calculateTotals(items);

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500">
      
      {/* Search & Actions Bar */}
      <div className="flex flex-col xl:flex-row gap-6 items-center justify-between no-print">
        <div className="flex bg-white p-2 rounded-[2rem] border border-slate-200 shadow-sm w-full xl:w-auto overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveType(InvoiceType.SALE)} className={`flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-3.5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest transition-all ${activeType === InvoiceType.SALE ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-slate-500 hover:bg-slate-50'}`}>
            <ShoppingBag className="w-5 h-5" /> Ventes
          </button>
          <button onClick={() => setActiveType(InvoiceType.PURCHASE)} className={`flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-3.5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest transition-all ${activeType === InvoiceType.PURCHASE ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/20' : 'text-slate-500 hover:bg-slate-50'}`}>
            <Truck className="w-5 h-5" /> Achats
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
            <input type="text" placeholder="Client, N° de facture..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-blue-500/5 font-bold" />
          </div>
          <button onClick={() => setShowModal(true)} className="flex items-center justify-center gap-3 bg-slate-900 text-white px-10 py-4 rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.2em] hover:bg-slate-800 shadow-2xl shadow-slate-900/10 transition-all active:scale-95">
            <Plus className="w-6 h-6" /> Nouveau
          </button>
        </div>
      </div>

      {/* Invoices List Responsive */}
      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden no-print">
        <div className="overflow-x-auto [scrollbar-gutter:stable]">
          <table className="w-full text-left border-separate border-spacing-0 min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-8 py-6 border-b border-slate-100 sticky left-0 bg-slate-50 z-10">Référence</th>
                <th className="px-8 py-6 border-b border-slate-100">Date / Heure</th>
                <th className="px-8 py-6 border-b border-slate-100">Client / Tiers</th>
                <th className="px-8 py-6 border-b border-slate-100">Règlement</th>
                <th className="px-8 py-6 border-b border-slate-100 text-right">Total TTC</th>
                <th className="px-8 py-6 border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6 font-mono font-black text-slate-900 sticky left-0 bg-white group-hover:bg-slate-50 z-10">{inv.id}</td>
                  <td className="px-8 py-6 text-xs font-bold text-slate-400">{new Date(inv.date).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-8 py-6">
                    <div className="font-black text-slate-800 uppercase italic tracking-tight">{inv.partner}</div>
                    {inv.partnerIce && <p className="text-[9px] text-slate-300 font-bold uppercase mt-1">ICE: {inv.partnerIce}</p>}
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border ${inv.paymentMethod === 'CREDIT' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                      {inv.paymentMethod.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right font-black text-slate-900 italic text-lg">{inv.totalTTC.toLocaleString()} <span className="text-xs font-normal opacity-30">{currency}</span></td>
                  <td className="px-8 py-6 text-right">
                    <button onClick={() => { setSelectedInvoice(inv); setShowPrintPreview(true); }} className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Printer className="w-5 h-5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal - Full screen mobile */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200 no-print">
          <div className="bg-white w-full max-w-6xl h-full sm:h-auto sm:max-h-[90vh] rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col">
            <div className={`p-8 md:p-12 flex justify-between items-center text-white shrink-0 ${activeType === InvoiceType.SALE ? 'bg-blue-600' : 'bg-amber-500'}`}>
              <div className="flex items-center gap-6">
                 <div className="bg-white/20 p-4 rounded-3xl"><FileText className="w-8 h-8" /></div>
                 <div>
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter leading-none">{activeType === InvoiceType.SALE ? 'Éditer Vente' : 'Entrée Achat'}</h3>
                    <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Station PetrolHub Cloud</p>
                 </div>
              </div>
              <button onClick={() => setShowModal(false)} className="bg-white/10 hover:bg-white/20 p-4 rounded-full transition-all"><X className="w-8 h-8" /></button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-12 space-y-10 [scrollbar-gutter:stable] bg-white">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Partenaire / Tiers</label>
                  <input type="text" list="partners-list" value={partner} onChange={e => setPartner(e.target.value)} className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-black text-lg text-slate-900" placeholder="Nom ou Raison Sociale..." required />
                  <datalist id="partners-list">{customers.map(c => <option key={c.id} value={c.name} />)}</datalist>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Mode de Règlement</label>
                  <select className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-black text-xs uppercase" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}>
                    <option value="ESPECES">Cash / Espèces</option> <option value="CARTE_BANCAIRE">TPE Bancaire</option> <option value="CARTE_CARBURANT">Bons / Cartes Flotte</option> <option value="CREDIT">À Crédit (Client en compte)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={() => handleAddItem('FUEL')} className="bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-blue-500/10 hover:scale-105 transition-all"><Fuel className="w-4 h-4" /> + Carburant</button>
                  <button type="button" onClick={() => handleAddItem('LUBRICANT')} className="bg-emerald-600 text-white px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-emerald-500/10 hover:scale-105 transition-all"><Droplets className="w-4 h-4" /> + Lubrifiant</button>
                  <button type="button" onClick={() => handleAddItem('WASH')} className="bg-indigo-600 text-white px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-indigo-500/10 hover:scale-105 transition-all"><Zap className="w-4 h-4" /> + Services</button>
                </div>

                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-slate-50 p-6 md:p-8 rounded-[2.5rem] border border-slate-100 group animate-in slide-in-from-left-4 transition-all">
                      <div className="md:col-span-6 space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase px-2 tracking-widest">Article ({item.category})</label>
                        <select className="w-full bg-white border border-slate-100 rounded-2xl px-5 py-4 text-sm font-black text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all" value={item.productId} onChange={(e) => updateItem(item.id, 'productId', e.target.value)} required>
                          <option value="">-- Sélectionner Produit --</option>
                          {item.category === 'FUEL' && fuelStocks.map(f => <option key={f.id} value={f.id}>{f.code} ({f.type})</option>)}
                          {item.category === 'LUBRICANT' && lubricants.map(l => <option key={l.id} value={l.id}>{l.brand} - {l.name}</option>)}
                          {item.category === 'WASH' && (<><option value="WASH_BASIC">Lavage Standard</option><option value="WASH_COMPLETE">Lavage VIP / Complet</option></>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-3 md:col-span-5 gap-3">
                         <div className="space-y-2 col-span-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase text-center block tracking-tighter">Qté / Litres</label>
                            <input type="number" step="0.01" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))} className="w-full bg-white border border-slate-100 rounded-2xl px-3 py-4 text-sm text-center font-black outline-none" required />
                         </div>
                         <div className="space-y-2 col-span-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase text-right block tracking-tighter">Prix Unitaire TTC</label>
                            <input type="number" step="0.01" value={item.unitPrice} onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))} className="w-full bg-white border border-slate-100 rounded-2xl px-5 py-4 text-sm text-right font-mono font-black text-blue-600 outline-none" required />
                         </div>
                      </div>
                      <div className="md:col-span-1 flex justify-center pb-2">
                        <button type="button" onClick={() => setItems(items.filter(i => i.id !== item.id))} className="p-4 bg-white text-slate-200 hover:text-rose-500 rounded-2xl shadow-sm transition-all hover:shadow-lg"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row justify-between items-center gap-6 sticky bottom-0">
                 <div className="flex gap-10">
                    <div><p className="text-[10px] font-black uppercase text-slate-500 mb-1 tracking-widest">Total HT</p><p className="text-xl font-bold font-mono">{totals.ht.toLocaleString()} {currency}</p></div>
                    <div><p className="text-[10px] font-black uppercase text-slate-500 mb-1 tracking-widest">Total TVA</p><p className="text-xl font-bold font-mono text-blue-400">{totals.vat.toLocaleString()} {currency}</p></div>
                 </div>
                 <div className="text-center md:text-right">
                    <p className="text-[10px] font-black uppercase text-blue-500 tracking-[0.3em] mb-2">Net à Payer TTC</p>
                    <p className="text-5xl md:text-7xl font-black italic tracking-tighter text-blue-400 leading-none">{totals.ttc.toLocaleString()} <span className="text-xl font-normal opacity-40">{currency}</span></p>
                 </div>
              </div>

              <div className="flex gap-4 pt-10">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-6 bg-slate-100 text-slate-500 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all">Abandonner</button>
                <button type="submit" className={`flex-1 py-6 text-white rounded-3xl font-black uppercase tracking-[0.3em] text-xs shadow-2xl transition-all active:scale-95 ${activeType === InvoiceType.SALE ? 'bg-blue-600 shadow-blue-500/30' : 'bg-amber-500 shadow-amber-500/30'}`}>Valider & Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesManager;
