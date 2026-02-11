
import React, { useState, useRef } from 'react';
import { User, StationConfig, FuelStock, Pump, AccountCustomer, LubricantStock, BankAccount, Supplier } from '../types';
import UsersManager from './UsersManager';
import { 
  Settings, Users, Fuel, ClipboardList, CreditCard, Droplets, Plus, Trash2, Save, Home, 
  PlusCircle, Package, Layers, Hash, Activity, UserCheck, Landmark, CheckCircle2, 
  RefreshCcw, Edit3, Search, Phone, Truck, Building2, MapPin, BadgeCheck, AlertCircle,
  Upload, Download, FileText, Filter, MoreHorizontal, Coins, Percent, Zap, Wallet, 
  UserPlus, UserCog, UserCheck as CustomerIcon, Fingerprint, FileBadge
} from 'lucide-react';

interface SettingsManagerProps {
  currentUser: User;
  users: User[];
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onRemoveUser: (userId: string) => void;
  onUpdatePassword: (userId: string, newPass: string) => void;
  stationConfig: StationConfig;
  setStationConfig: React.Dispatch<React.SetStateAction<StationConfig>>;
  fuelStocks: FuelStock[];
  setFuelStocks: React.Dispatch<React.SetStateAction<FuelStock[]>>;
  pumps: Pump[];
  setPumps: React.Dispatch<React.SetStateAction<Pump[]>>;
  customers: AccountCustomer[];
  setCustomers: React.Dispatch<React.SetStateAction<AccountCustomer[]>>;
  lubricants: LubricantStock[];
  setLubricants: React.Dispatch<React.SetStateAction<LubricantStock[]>>;
  banks: BankAccount[];
  setBanks: React.Dispatch<React.SetStateAction<BankAccount[]>>;
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
}

const SettingsManager: React.FC<SettingsManagerProps> = ({ 
  currentUser, users, onAddUser, onUpdateUser, onRemoveUser, onUpdatePassword, 
  stationConfig, setStationConfig, fuelStocks, setFuelStocks, 
  pumps, setPumps, customers, setCustomers,
  lubricants, setLubricants, banks, setBanks,
  suppliers, setSuppliers
}) => {
  const [activeSubTab, setActiveSubTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lubricantSearch, setLubricantSearch] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs = [
    { id: 'general', label: 'Général', icon: Home },
    { id: 'banks', label: 'Banques', icon: Landmark },
    { id: 'tanks', label: 'Cuves', icon: Fuel },
    { id: 'pumps', label: 'Pompes', icon: ClipboardList },
    { id: 'customers', label: 'Clients', icon: UserCheck },
    { id: 'suppliers', label: 'Fournisseurs', icon: Truck },
    { id: 'lubricants', label: 'Lubrifiants', icon: Droplets },
    { id: 'users', label: 'Utilisateurs', icon: Users },
  ];

  const markChanged = () => { setHasChanges(true); setSaveSuccess(false); };

  const handleManualSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false); setSaveSuccess(true); setHasChanges(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 800);
  };

  const handleUpdateConfig = (field: string, value: any) => {
    setStationConfig(prev => ({ ...prev, [field]: value }));
    markChanged();
  };

  const handleUpdateLubricant = (id: string, updates: Partial<LubricantStock>) => {
    setLubricants(lubricants.map(l => l.id === id ? { ...l, ...updates } : l));
    markChanged();
  };

  const handleAddLubricant = () => {
    const newLub: LubricantStock = {
      id: 'L' + Date.now(),
      code: 'REF-' + (lubricants.length + 1).toString().padStart(3, '0'),
      name: 'Nouveau Produit',
      brand: 'Marque',
      quantity: 0,
      minThreshold: 5,
      pricePerUnit: 0,
      vatRate: stationConfig.vatRate
    };
    setLubricants([newLub, ...lubricants]);
    markChanged();
  };

  const handleImportLubricants = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const newLubs: LubricantStock[] = [];
      lines.slice(1).forEach(line => {
        if (!line.trim()) return;
        const parts = line.split(/[;,]/);
        if (parts.length >= 2) {
          newLubs.push({
            id: 'L' + Date.now() + Math.random().toString(36).substr(2, 5),
            code: parts[0]?.trim() || 'REF-IMP',
            name: parts[1]?.trim() || 'Produit Importé',
            brand: parts[2]?.trim() || 'Marque',
            quantity: 0,
            pricePerUnit: Number(parts[3]) || 0,
            minThreshold: Number(parts[4]) || 5,
            vatRate: Number(parts[5]) || stationConfig.vatRate
          });
        }
      });
      if (newLubs.length > 0) { setLubricants([...newLubs, ...lubricants]); markChanged(); }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 relative pb-20">
      
      {/* Sidebar Navigation */}
      <div className="lg:w-72 flex flex-col gap-4 shrink-0 overflow-hidden no-print">
        <div className="bg-white p-3 md:p-5 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 flex lg:flex-col overflow-x-auto lg:overflow-visible no-scrollbar sticky top-20 z-10">
           <p className="hidden lg:block text-[10px] font-black uppercase text-slate-400 tracking-widest px-4 mb-5">Configuration</p>
           {tabs.map(tab => (
             <button key={tab.id} onClick={() => setActiveSubTab(tab.id)}
               className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest text-left whitespace-nowrap min-w-max lg:min-w-0 ${
                 activeSubTab === tab.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-slate-500 hover:bg-slate-50'
               }`}
             >
               <tab.icon className={`w-5 h-5 shrink-0 ${activeSubTab === tab.id ? 'text-white' : 'text-slate-300'}`} />
               <span className="truncate">{tab.label}</span>
             </button>
           ))}
        </div>

        {(hasChanges || saveSuccess) && (
          <div className={`p-6 rounded-[2rem] border transition-all duration-500 ${hasChanges ? 'bg-amber-50 border-amber-200 shadow-xl shadow-amber-500/10' : 'bg-emerald-50 border-emerald-200'} shadow-lg`}>
             <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${hasChanges ? 'bg-amber-500' : 'bg-emerald-500'} text-white`}>
                   {isSaving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : saveSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                </div>
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Base de données</p>
                   <p className={`text-[10px] font-black uppercase ${hasChanges ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {isSaving ? 'Synchro...' : saveSuccess ? 'À jour' : 'À sauvegarder'}
                   </p>
                </div>
             </div>
             {hasChanges && (
               <button onClick={handleManualSave} className="w-full mt-4 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95">
                 Valider les changements
               </button>
             )}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-10 lg:p-12 shadow-sm border border-slate-100 min-h-[700px]">
        
        {/* --- GENERAL (Complet) --- */}
        {activeSubTab === 'general' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Identité Section */}
            <div className="space-y-8">
               <h3 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3 text-slate-900">
                 <div className="bg-blue-50 p-3 rounded-2xl text-blue-600"><Building2 className="w-7 h-7" /></div>
                 Identité Station
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400 px-2 tracking-widest">Nom de l'Etablissement (S.A.R.L)</label>
                   <input type="text" value={stationConfig.name} onChange={(e) => handleUpdateConfig('name', e.target.value)} className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-black text-slate-900 uppercase italic text-lg focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400 px-2 tracking-widest">Identifiant Commun (ICE)</label>
                   <input type="text" value={stationConfig.ice} onChange={(e) => handleUpdateConfig('ice', e.target.value)} className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-mono font-black text-blue-600 focus:bg-white transition-all" placeholder="000000000000000" />
                 </div>
                 <div className="md:col-span-2 space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400 px-2 tracking-widest">Siège Social / Adresse</label>
                   <div className="relative">
                     <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                     <input type="text" value={stationConfig.address} onChange={(e) => handleUpdateConfig('address', e.target.value)} className="w-full pl-12 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:bg-white transition-all" />
                   </div>
                 </div>
               </div>
            </div>

            {/* Administratif Section */}
            <div className="pt-10 border-t border-slate-50 space-y-8">
               <h3 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3 text-slate-900">
                 <div className="bg-amber-50 p-3 rounded-2xl text-amber-600"><FileBadge className="w-7 h-7" /></div>
                 Données Fiscales
               </h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 <div className="space-y-2">
                   <label className="text-[9px] font-black uppercase text-slate-400 px-1 tracking-widest">I.F (Identifiant Fiscal)</label>
                   <input type="text" value={stationConfig.if_number} onChange={(e) => handleUpdateConfig('if_number', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-black text-xs text-slate-700" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[9px] font-black uppercase text-slate-400 px-1 tracking-widest">R.C (Registre Commerce)</label>
                   <input type="text" value={stationConfig.rc} onChange={(e) => handleUpdateConfig('rc', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-black text-xs text-slate-700" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[9px] font-black uppercase text-slate-400 px-1 tracking-widest">T.P (Taxe Prof.)</label>
                   <input type="text" value={stationConfig.tp} onChange={(e) => handleUpdateConfig('tp', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-black text-xs text-slate-700" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[9px] font-black uppercase text-slate-400 px-1 tracking-widest">C.N.S.S</label>
                   <input type="text" value={stationConfig.cnss} onChange={(e) => handleUpdateConfig('cnss', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-black text-xs text-slate-700" />
                 </div>
               </div>
            </div>

            {/* Finance Section */}
            <div className="pt-10 border-t border-slate-50 space-y-8">
               <h3 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3 text-slate-900">
                 <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600"><Coins className="w-7 h-7" /></div>
                 Finance
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-400 px-2 tracking-widest">Devise Système</label>
                    <input type="text" value={stationConfig.currency} onChange={(e) => handleUpdateConfig('currency', e.target.value)} className="w-full px-6 py-5 bg-white border border-slate-100 rounded-2xl font-black text-blue-600 text-xl outline-none" />
                 </div>
                 <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-400 px-2 tracking-widest">Taux TVA Standard (%)</label>
                    <input type="number" value={stationConfig.vatRate} onChange={(e) => handleUpdateConfig('vatRate', Number(e.target.value))} className="w-full px-6 py-5 bg-white border border-slate-100 rounded-2xl font-black text-emerald-600 text-xl outline-none" />
                 </div>
               </div>
            </div>
          </div>
        )}

        {/* --- LUBRICANTS (Avec Identifiant Métier) --- */}
        {activeSubTab === 'lubricants' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div>
                 <h3 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3 text-slate-900">
                   <div className="bg-blue-50 p-3 rounded-2xl text-blue-600"><Droplets className="w-7 h-7" /></div>
                   Catalogue Lubrifiants
                 </h3>
                 <p className="text-sm text-slate-400 font-bold mt-2 uppercase tracking-widest">Pilotage des références SKU et tarifs</p>
              </div>

              <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                 <div className="relative flex-1 lg:w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input type="text" placeholder="Nom ou Identifiant..." value={lubricantSearch} onChange={e => setLubricantSearch(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:bg-white transition-all" />
                 </div>
                 <div className="flex gap-2">
                    <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleImportLubricants} />
                    <button onClick={() => fileInputRef.current?.click()} className="p-4 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all" title="Importer CSV"><Upload className="w-5 h-5"/></button>
                    <button onClick={handleAddLubricant} className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
                      <PlusCircle className="w-5 h-5" /> Nouveau Produit
                    </button>
                 </div>
              </div>
            </div>

            <div className="grid gap-6">
               {lubricants.filter(l => 
                  l.name.toLowerCase().includes(lubricantSearch.toLowerCase()) || 
                  l.code.toLowerCase().includes(lubricantSearch.toLowerCase()) ||
                  l.brand.toLowerCase().includes(lubricantSearch.toLowerCase())
               ).map(lub => (
                 <div key={lub.id} className="p-8 bg-white rounded-[2.5rem] border border-slate-100 hover:border-blue-200 hover:shadow-xl transition-all group grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative overflow-hidden">
                    <div className="lg:col-span-5 flex items-center gap-5">
                       <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                          <Package className="w-7 h-7" />
                       </div>
                       <div className="flex-1 space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                             <div className="relative group/code">
                                <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-blue-300" />
                                <input 
                                  type="text" 
                                  value={lub.code} 
                                  onChange={e => handleUpdateLubricant(lub.id, { code: e.target.value.toUpperCase() })} 
                                  className="pl-8 pr-3 py-1 bg-slate-100 rounded-lg text-[9px] font-black font-mono text-blue-600 border-none outline-none focus:ring-2 focus:ring-blue-500/10 min-w-[120px]"
                                  placeholder="IDENTIFIANT SKU"
                                />
                             </div>
                             <input type="text" value={lub.brand} onChange={e => handleUpdateLubricant(lub.id, { brand: e.target.value })} className="text-[10px] font-black uppercase text-slate-400 bg-transparent border-none outline-none p-0 w-24" />
                          </div>
                          <input type="text" value={lub.name} onChange={e => handleUpdateLubricant(lub.id, { name: e.target.value })} className="text-xl font-black text-slate-900 uppercase italic bg-transparent border-none outline-none w-full p-0" />
                       </div>
                    </div>
                    <div className="lg:col-span-2">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Stock Alerte</p>
                       <div className="relative">
                          <input type="number" value={lub.minThreshold} onChange={e => handleUpdateLubricant(lub.id, { minThreshold: Number(e.target.value) })} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold outline-none" />
                          <AlertCircle className={`absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 ${lub.quantity <= lub.minThreshold ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`} />
                       </div>
                    </div>
                    <div className="lg:col-span-3">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tarif Unitaire ({stationConfig.currency})</p>
                       <div className="relative">
                          <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-200" />
                          <input type="number" step="0.01" value={lub.pricePerUnit} onChange={e => handleUpdateLubricant(lub.id, { pricePerUnit: Number(e.target.value) })} className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-3 text-sm font-black text-blue-600 outline-none focus:border-blue-500" />
                       </div>
                    </div>
                    <div className="lg:col-span-2 flex justify-end">
                       <button onClick={() => { setLubricants(lubricants.filter(l => l.id !== lub.id)); markChanged(); }} className="p-4 bg-white text-slate-200 hover:text-rose-500 rounded-2xl shadow-sm transition-all border border-slate-100 hover:border-rose-200"><Trash2 className="w-5 h-5" /></button>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* --- POMPES (PUMPS) - Audit & Liaison Cuves --- */}
        {activeSubTab === 'pumps' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3 text-slate-900">
                  <div className="bg-blue-50 p-3 rounded-2xl text-blue-600"><ClipboardList className="w-7 h-7" /></div>
                  Parc des Pompes
                </h3>
                <p className="text-sm text-slate-400 font-bold mt-2 uppercase tracking-widest">Liaison cuves et initialisation des compteurs</p>
              </div>
              <button onClick={() => { setPumps([...pumps, { id: 'P' + (pumps.length + 1), name: 'Pompe ' + (pumps.length + 1), fuelType: 'Gasoil', lastIndex: 0, tankId: fuelStocks[0]?.id || '' }]); markChanged(); }} className="bg-blue-600 text-white px-8 py-4 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
                <PlusCircle className="w-5 h-5" /> Nouvelle Pompe
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {pumps.map((pump) => (
                <div key={pump.id} className="p-8 bg-slate-50 rounded-[3rem] border border-slate-100 flex flex-col gap-6 group hover:border-blue-300 transition-all relative">
                   <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white shadow-lg transition-all ${pump.fuelType.includes('Gasoil') ? 'bg-slate-900' : 'bg-emerald-500'}`}>
                            <Zap className="w-6 h-6" />
                         </div>
                         <div className="space-y-1">
                            <input type="text" value={pump.name} onChange={e => { setPumps(pumps.map(p => p.id === pump.id ? {...p, name: e.target.value} : p)); markChanged(); }}
                               className="bg-transparent border-none text-xl font-black text-slate-900 uppercase italic outline-none w-full p-0"
                            />
                            <p className="text-[10px] font-black uppercase text-blue-500 tracking-widest flex items-center gap-2">
                               {pump.fuelType}
                            </p>
                         </div>
                      </div>
                      <button onClick={() => { setPumps(pumps.filter(p => p.id !== pump.id)); markChanged(); }} className="p-3 text-slate-300 hover:text-rose-500 bg-white rounded-xl shadow-sm transition-all"><Trash2 className="w-4 h-4"/></button>
                   </div>

                   <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase text-slate-400 px-1 tracking-widest">Cuve d'Alimentation (Filtre par type)</label>
                         <select value={pump.tankId} onChange={e => {
                            const tankId = e.target.value;
                            const tank = fuelStocks.find(t => t.id === tankId);
                            setPumps(pumps.map(p => p.id === pump.id ? {...p, tankId, fuelType: tank?.type || p.fuelType} : p));
                            markChanged();
                         }}
                            className="w-full bg-white border border-slate-100 rounded-2xl px-5 py-4 text-sm font-black text-slate-800 outline-none"
                         >
                            <option value="">-- Choisir une Cuve --</option>
                            {fuelStocks.map(tank => (
                              <option key={tank.id} value={tank.id}>{tank.code} - {tank.type}</option>
                            ))}
                         </select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase text-slate-400 px-1 tracking-widest">Index de Compteur (Litres)</label>
                         <div className="relative">
                            <input type="number" value={pump.lastIndex} onChange={e => { setPumps(pumps.map(p => p.id === pump.id ? {...p, lastIndex: Number(e.target.value)} : p)); markChanged(); }}
                               className="w-full bg-white border border-slate-100 rounded-2xl px-5 py-4 font-mono font-black text-blue-600 text-lg outline-none"
                            />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">Litres</span>
                         </div>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- USERS --- */}
        {activeSubTab === 'users' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <UsersManager currentUser={currentUser} users={users} onAddUser={onAddUser} onUpdateUser={onUpdateUser} onUpdatePassword={onUpdatePassword} onRemoveUser={onRemoveUser} />
          </div>
        )}

        {/* --- AUTRES ONGLETS (Audités) --- */}
        {activeSubTab === 'banks' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
             <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">Banques & Trésorerie</h3>
                <button onClick={() => { setBanks([...banks, { id: 'B' + Date.now(), name: 'Nouvelle Banque', rib: '', balance: 0 }]); markChanged(); }} className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Ajouter RIB</button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {banks.map(bank => (
                  <div key={bank.id} className="p-8 bg-slate-50 rounded-[3rem] border border-slate-100 relative group">
                     <div className="flex justify-between items-start mb-6">
                        <div className="bg-white p-4 rounded-2xl shadow-sm text-blue-600"><Landmark className="w-6 h-6" /></div>
                        <button onClick={() => setBanks(banks.filter(b => b.id !== bank.id))} className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 className="w-5 h-5"/></button>
                     </div>
                     <input type="text" value={bank.name} onChange={e => { setBanks(banks.map(b => b.id === bank.id ? {...b, name: e.target.value} : b)); markChanged(); }} className="text-xl font-black text-slate-900 uppercase italic outline-none bg-transparent w-full mb-4" />
                     <input type="text" value={bank.rib} onChange={e => { setBanks(banks.map(b => b.id === bank.id ? {...b, rib: e.target.value} : b)); markChanged(); }} className="w-full bg-white border border-slate-100 rounded-xl px-5 py-4 text-xs font-mono font-black text-blue-600 outline-none" placeholder="RIB (24 Chiffres)" />
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeSubTab === 'customers' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex justify-between items-center">
               <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">Clients en Compte</h3>
               <button onClick={() => { setCustomers([...customers, { id: 'C'+Date.now(), name: 'Nouveau Client', contact: '', balance: 0, limit: 50000 }]); markChanged(); }} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"><UserPlus className="w-5 h-5" /> Nouveau Client</button>
            </div>
            <div className="grid gap-4">
              {customers.map(cust => (
                <div key={cust.id} className="p-6 bg-white rounded-[2.5rem] border border-slate-100 hover:border-emerald-300 hover:shadow-xl transition-all group grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-4 flex items-center gap-5">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all shrink-0">{cust.name.charAt(0)}</div>
                    <div className="flex-1 space-y-1">
                      <input type="text" value={cust.name} onChange={e => { setCustomers(customers.map(c => c.id === cust.id ? {...c, name: e.target.value} : c)); markChanged(); }} className="text-lg font-black text-slate-900 uppercase italic bg-transparent border-none outline-none w-full p-0" />
                      <input type="text" value={cust.contact} onChange={e => { setCustomers(customers.map(c => c.id === cust.id ? {...c, contact: e.target.value} : c)); markChanged(); }} placeholder="Coordonnées" className="text-[10px] font-black uppercase text-slate-400 bg-transparent border-none outline-none p-0" />
                    </div>
                  </div>
                  <div className="md:col-span-3">
                     <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1 block">Plafond Crédit</label>
                     <input type="number" value={cust.limit} onChange={e => { setCustomers(customers.map(c => c.id === cust.id ? {...c, limit: Number(e.target.value)} : c)); markChanged(); }} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-mono font-black text-slate-900 outline-none" />
                  </div>
                  <div className="md:col-span-3">
                     <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1 block">ICE / Identifiant</label>
                     <input type="text" value={cust.ice || ''} onChange={e => { setCustomers(customers.map(c => c.id === cust.id ? {...c, ice: e.target.value} : c)); markChanged(); }} className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-xs font-mono font-black text-slate-400 outline-none" placeholder="00000000..." />
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <button onClick={() => { setCustomers(customers.filter(c => c.id !== cust.id)); markChanged(); }} className="p-4 bg-white text-slate-200 hover:text-rose-500 rounded-2xl shadow-sm transition-all"><Trash2 className="w-5 h-5"/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsManager;
