
export enum UserRole {
  ADMIN = 'ADMIN',
  GERANT = 'GERANT',
  AGENT_SAISIE = 'AGENT_SAISIE',
  COMPTABLE = 'COMPTABLE'
}

export enum InvoiceType {
  SALE = 'SALE',
  PURCHASE = 'PURCHASE'
}

export type PaymentMethod = 'ESPECES' | 'CARTE_BANCAIRE' | 'CARTE_CARBURANT' | 'CHEQUE' | 'VIREMENT' | 'CREDIT';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  username: string;
  password?: string;
}

export interface BankAccount {
  id: string;
  name: string;
  rib: string;
  balance: number;
}

export interface StationConfig {
  name: string;
  address: string;
  city: string;
  currency: string;
  ice: string;
  if_number: string;
  rc: string;
  tp: string;
  cnss: string;
  vatRate: number;
}

export interface FuelStock {
  id: string;
  code: string;
  type: string;
  capacity: number;
  currentLevel: number;
  unit: string;
  vatRate: number;
}

export interface Pump {
  id: string;
  name: string;
  fuelType: string;
  lastIndex: number;
  tankId?: string;
}

export interface LubricantStock {
  id: string;
  code: string; // Nouvel identifiant métier
  name: string;
  brand: string;
  quantity: number;
  minThreshold: number;
  pricePerUnit: number;
  vatRate: number;
}

export interface AccountCustomer {
  id: string;
  name: string;
  contact: string;
  balance: number;
  limit: number;
  ice?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  balance: number; 
  ice?: string;
  category: 'PETROLIER' | 'LUBRIFIANT' | 'SERVICES' | 'AUTRE';
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  amount: number;
  description: string;
  paymentMethod: 'ESPECES' | 'CHEQUE' | 'VIREMENT' | 'CARTE';
  recordedBy: string;
}

export interface Payment {
  id: string;
  date: string;
  partnerId: string;
  partnerName: string;
  amount: number;
  method: PaymentMethod;
  type: 'RECETTE' | 'DEPENSE';
  reference?: string;
  bankAccountId?: string; 
}

export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  category: 'FUEL' | 'LUBRICANT' | 'WASH' | 'OTHER';
  quantity: number;
  unitPrice: number;
  vatRate: number;
  total: number;
}

export interface Invoice {
  id: string;
  type: InvoiceType;
  date: string;
  partner: string; 
  partnerIce?: string;
  items: InvoiceItem[];
  totalTTC: number;
  totalHT: number;
  totalVAT: number;
  paymentMethod: PaymentMethod;
  status: 'PAID' | 'PENDING';
}

export interface DailyReport {
  date: string;
  fuelSales: number;
  lubricantSales: number;
  washSales: number;
  expenses: number;
  operatingMargin: number;
  cashToBank: number;
  bankFees: number;
  supplierRefund: number;
  paymentsReceived: {
    cash: number;
    card: number;
    fleetCard: number;
    credit: number;
  };
}
