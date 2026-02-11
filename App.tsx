import React, { useState, useEffect } from 'react';
import { User, UserRole, StationConfig, FuelStock, Pump, LubricantStock, AccountCustomer, Invoice, InvoiceType, Supplier, Expense, Payment, BankAccount } from './types';
import { DEFAULT_USERS, MOCK_FUEL_STOCKS, MOCK_LUBRICANTS } from './constants';

// Imports des composants sans extensions (Vite les résout automatiquement)
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import LubricantsManager from './components/LubricantsManager';
import SettingsManager from './components/SettingsManager';
import InvoicesManager from './components/InvoicesManager';
import ExpensesManager from './components/ExpensesManager';
import BankManager from './components/BankManager';
import FinancialReports from './components/FinancialReports';
import ShiftWizard from './components/ShiftWizard';

import { Fuel, LogIn, Key, User as UserIcon } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(DEFAULT_USERS);
  const [banks, setBanks] = useState<BankAccount[]>([
    { id: 'b1', name: 'ATTIJARIWAFA BANK', rib: '007 780 0012345678901234 56', balance: 450000 },
    { id: 'b2', name: 'BANQUE POPULAIRE', rib: '101 220 0098765432109876 12', balance: 125000 },
  ]);
  const [stationConfig, setStationConfig] = useState<StationConfig>({ 
    name: 'PETROLHUB MAROC SARL', 
    address: '124 Boulevard Zerktouni', 
    city: 'Casablanca',
    currency: 'DH (MAD)',
    ice: '001234567890123',
    if_number: '12345678',
    rc: '45678 CASABLANCA',
    tp: '34567890',
    cnss: '9876543',
    vatRate: 20
  });
  const [fuelStocks, setFuelStocks] = useState<FuelStock[]>(MOCK_FUEL_STOCKS);
  const [pumps, setPumps] = useState<Pump[]>([
    { id: 'P1', name: 'Pompe 1', fuelType: 'Sans Plomb', lastIndex: 12450.5, tankId: 't1' },
    { id: 'P2', name: 'Pompe 2', fuelType: 'Gasoil', lastIndex: 89000.2, tankId: 't2' },
    { id: 'P3', name: 'Pompe 3', fuelType: 'Super', lastIndex: 5420.0, tankId: 't3' },
    { id: 'P4', name: 'Pompe 4', fuelType: 'Gasoil', lastIndex: 32150.8, tankId: 't2' },
  ]);
  const [lubricants, setLubricants] = useState<LubricantStock[]>(MOCK_LUBRICANTS);
  const [customers, setCustomers] = useState<AccountCustomer[]>([
    { id: 'c1', name: 'SOTRA TRANS MAROC', contact: '+212 5 22 00 11 22', balance: 450000, limit: 1000000, ice: '001567890123456' },
    { id: 'c2', name: 'LIVRAISON EXPRESS', contact: '+212 6 61 22 33 44', balance: 125000, limit: 500000, ice: '002345678901234' },
    { id: 'c3', name: 'AGENCE TRANSPORT SUD', contact: '+212 5 28 33 44 55', balance: 920000, limit: 1000000, ice: '003456789012345' },
  ]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    { id: 's1', name: 'AFRIQUIA SMDC', contact: '0522 10 20 30', balance: 1200000, category: 'PETROLIER', ice: '000012345678901' },
    { id: 's2', name: 'SHELL LUBRICANTS', contact: '0522 40 50 60', balance: 45000, category: 'LUBRIFIANT', ice: '000098765432100' },
  ]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const sessionUser = localStorage.getItem('ph_session');
    if (sessionUser) setCurrentUser(JSON.parse(sessionUser));
    
    const savedConfig = localStorage.getItem('ph_config');
    if (savedConfig) setStationConfig(JSON.parse(savedConfig));
  }, []);

  const handleShiftComplete = (data: any) => {
    setPumps(data.pumps);
    setActiveTab('dashboard');
  };

  const handleAddInvoice = (newInvoice: Invoice) => {
    setInvoices(prev => [newInvoice, ...prev]);
  };

  const handleAddPayment = (payment: Payment) => {
    setPayments(prev => [payment, ...prev]);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setTimeout(() => {
      const user = users.find(u => u.username === loginUsername && u.password === loginPassword);
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('ph_session', JSON.stringify(user));
      } else {
        setLoginError("Identifiants incorrects.");
      }
      setIsLoggingIn(false);
    }, 600);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ph_session');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard stationConfig={stationConfig} fuelStocks={fuelStocks} lubricants={lubricants} customers={customers} suppliers={suppliers} invoices={invoices} expenses={expenses} payments={payments} onAddPayment={handleAddPayment} />;
      case 'shift':
        return <ShiftWizard pumps={pumps} fuelStocks={fuelStocks} lubricants={lubricants} customers={customers} currentUser={currentUser!} onComplete={handleShiftComplete} currency={stationConfig.currency} invoices={invoices} expenses={expenses} payments={payments} stationConfig={stationConfig} />;
      case 'invoices':
        return <InvoicesManager invoices={invoices} onAddInvoice={handleAddInvoice} fuelStocks={fuelStocks} lubricants={lubricants} customers={customers} currency={stationConfig.currency} stationConfig={stationConfig} />;
      case 'bank':
        return <BankManager banks={banks} payments={payments} customers={customers} suppliers={suppliers} onAddPayment={handleAddPayment} currency={stationConfig.currency} />;
      case 'expenses':
        return <ExpensesManager expenses={expenses} onAddExpense={(exp) => setExpenses([exp, ...expenses])} currency={stationConfig.currency} />;
      case 'reports':
        return <FinancialReports invoices={invoices} expenses={expenses} payments={payments} currency={stationConfig.currency} />;
      case 'settings':
        return <SettingsManager currentUser={currentUser!} users={users} onAddUser={u => setUsers([...users, u])} onUpdateUser={updated => setUsers(users.map(u => u.id === updated.id ? { ...u, ...updated } : u))} onRemoveUser={id => setUsers(users.filter(u => u.id !== id))} onUpdatePassword={(id, p) => setUsers(users.map(u => u.id === id ? {...u, password: p} : u))} stationConfig={stationConfig} setStationConfig={setStationConfig} fuelStocks={fuelStocks} setFuelStocks={setFuelStocks} pumps={pumps} setPumps={setPumps} customers={customers} setCustomers={setCustomers} suppliers={suppliers} setSuppliers={setSuppliers} lubricants={lubricants} setLubricants={setLubricants} banks={banks} setBanks={setBanks} />;
      default:
        return <Dashboard stationConfig={stationConfig} fuelStocks={fuelStocks} lubricants={lubricants} customers={customers} suppliers={suppliers} invoices={invoices} expenses={expenses} payments={payments} onAddPayment={handleAddPayment} />;
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-blue-600 p-4 rounded-2xl shadow-xl shadow-blue-500/20 mb-4 inline-block animate-pulse"><Fuel className="w-10 h-10 text-white" /></div>
          <h1 className="text-white text-3xl font-black tracking-tight mb-10 uppercase italic">{stationConfig.name}</h1>
          <form onSubmit={handleLogin} className="bg-white rounded-[2.5rem] p-10 shadow-2xl space-y-5 text-left">
            {loginError && <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl text-sm font-medium">{loginError}</div>}
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest px-1">Identifiant Agent</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input type="text" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} placeholder="Login" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold" required />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest px-1">Code Secret</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold" required />
                </div>
              </div>
              <button type="submit" disabled={isLoggingIn} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-blue-500/30 transition-all active:scale-95">
                {isLoggingIn ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><LogIn className="w-5 h-5" /><span className="uppercase tracking-widest text-xs">Accéder au Système</span></>}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <Layout user={currentUser} onLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;