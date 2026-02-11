
import React, { useState } from 'react';
import { ClipboardCheck, ArrowRight, Save, History } from 'lucide-react';
import { Pump } from '../types';

interface PumpsManagerProps {
  pumps: Pump[];
  setPumps: React.Dispatch<React.SetStateAction<Pump[]>>;
}

const PumpsManager: React.FC<PumpsManagerProps> = ({ pumps, setPumps }) => {
  const [activePump, setActivePump] = useState<string | null>(null);
  const [newIndex, setNewIndex] = useState<string>('');

  const currentPump = pumps.find(p => p.id === activePump);

  const handleSave = () => {
    if (!activePump || !newIndex) return;
    const indexVal = parseFloat(newIndex);
    if (isNaN(indexVal)) return;

    setPumps(prev => prev.map(p => 
      p.id === activePump ? { ...p, lastIndex: indexVal } : p
    ));
    setActivePump(null);
    setNewIndex('');
    alert("Index enregistré avec succès !");
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold">Relèves de Fin de Service</h2>
            <p className="text-slate-500 text-sm">Enregistrez les index des pompes pour clore la session.</p>
          </div>
          <button className="flex items-center gap-2 text-blue-600 font-semibold hover:bg-blue-50 px-4 py-2 rounded-lg transition-all">
            <History className="w-5 h-5" />
            <span>Historique</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {pumps.map((pump) => (
            <div 
              key={pump.id} 
              onClick={() => setActivePump(pump.id)}
              className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                activePump === pump.id 
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20' 
                : 'border-slate-100 hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${activePump === pump.id ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <ClipboardCheck className="w-6 h-6" />
                </div>
                <span className="font-black text-slate-300 text-xl">{pump.id}</span>
              </div>
              <h4 className="font-bold text-lg">{pump.name}</h4>
              <p className="text-xs text-slate-500 mb-2 uppercase tracking-tight">{pump.fuelType}</p>
              <p className="text-xs text-slate-400 uppercase tracking-widest">Dernier Index</p>
              <p className="text-xl font-mono mt-1 text-slate-700">{pump.lastIndex.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      {activePump && currentPump && (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-blue-600 text-white w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl">
              {activePump}
            </div>
            <div>
              <h3 className="text-xl font-bold">Nouvelle Relève - {currentPump.fuelType}</h3>
              <p className="text-slate-500 text-sm">Saisissez l'index de clôture pour {currentPump.name}.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-500 block uppercase tracking-wider">Index Précédent</label>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xl font-mono text-slate-400">
                {currentPump.lastIndex.toFixed(2)}
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="w-8 h-8 text-blue-300" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 block uppercase tracking-wider">Nouvel Index</label>
              <input 
                type="number" 
                step="0.01"
                placeholder="0.00"
                value={newIndex}
                onChange={(e) => setNewIndex(e.target.value)}
                className="w-full bg-white p-4 rounded-xl border-2 border-blue-100 text-xl font-mono focus:border-blue-500 focus:outline-none transition-all shadow-sm"
                autoFocus
              />
            </div>
          </div>

          <div className="mt-10 flex justify-end gap-4">
            <button 
              onClick={() => { setActivePump(null); setNewIndex(''); }}
              className="px-6 py-3 rounded-xl text-slate-500 font-semibold hover:bg-slate-100 transition-all"
            >
              Annuler
            </button>
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all"
            >
              <Save className="w-5 h-5" />
              <span>Valider la relève</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PumpsManager;
