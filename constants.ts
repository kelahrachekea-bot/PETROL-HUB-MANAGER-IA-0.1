
import { UserRole, FuelStock, LubricantStock, User } from './types';

export const APP_NAME = "PetrolHub Pro";

export const DEFAULT_USERS: User[] = [
  { id: '1', name: 'Administrateur', role: UserRole.ADMIN, username: 'admin', password: '1234' },
  { id: '2', name: 'Marie Gérante', role: UserRole.GERANT, username: 'marie', password: 'password' },
  { id: '3', name: 'Paul Saisie', role: UserRole.AGENT_SAISIE, username: 'paul', password: 'password' },
  { id: '4', name: 'Luc Comptable', role: UserRole.COMPTABLE, username: 'luc', password: 'password' },
];

export const MOCK_FUEL_STOCKS: FuelStock[] = [
  { id: 't1', code: 'CUVE-SP-01', type: 'Sans Plomb', capacity: 20000, currentLevel: 12500, unit: 'L', vatRate: 20 },
  { id: 't2', code: 'CUVE-GO-02', type: 'Gasoil', capacity: 30000, currentLevel: 28000, unit: 'L', vatRate: 20 },
  { id: 't3', code: 'CUVE-SUP-03', type: 'Super', capacity: 15000, currentLevel: 4200, unit: 'L', vatRate: 20 },
];

export const MOCK_LUBRICANTS: LubricantStock[] = [
  { id: 'l1', code: 'TOT-9000-540', name: 'Quartz 9000 5W40', brand: 'Total', quantity: 45, minThreshold: 10, pricePerUnit: 125, vatRate: 20 },
  { id: 'l2', code: 'SHL-HLX-530', name: 'Helix Ultra 5W30', brand: 'Shell', quantity: 8, minThreshold: 15, pricePerUnit: 140, vatRate: 20 },
  { id: 'l3', code: 'CST-MAG-1040', name: 'Magnatec 10W40', brand: 'Castrol', quantity: 120, minThreshold: 20, pricePerUnit: 95, vatRate: 20 },
];
