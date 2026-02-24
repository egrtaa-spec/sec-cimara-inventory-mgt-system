/* CIMARA Inventory Management System - MongoDB Schemas */

export interface Engineer {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  siteName: string;
  employeeId: string;
  department: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Equipment {
  _id?: string;
  name: string;
  category: string;
  serialNumber: string;
  quantity: number;
  unit: string;
  location: string;
  condition: 'new' | 'good' | 'fair' | 'needs_repair';
  lastMaintenanceDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Withdrawal {
  _id?: string;
  withdrawalDate: Date;
  engineerId: string;
  engineerName: string;
  siteName: string;
  receiverName: string;
  senderName: string;
  items: WithdrawalItem[];
  notes?: string;
  status: 'pending' | 'approved' | 'completed';
  receiptNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WithdrawalItem {
  equipmentId: string;
  equipmentName: string;
  quantityWithdrawn: number;
  unit: string;
  reason?: string;
}

export interface InventoryLog {
  _id?: string;
  equipmentId: string;
  equipmentName: string;
  previousQuantity: number;
  newQuantity: number;
  change: number;
  type: 'withdrawal' | 'restock' | 'adjustment';
  withdrawalId?: string;
  performedBy: string;
  timestamp: Date;
}

export interface DailyReport {
  _id?: string;
  reportDate: Date;
  siteName: string;
  totalWithdrawals: number;
  equipmentUsed: Array<{
    equipmentName: string;
    quantityWithdrawn: number;
    unit: string;
    engineers: string[];
  }>;
  createdAt: Date;
}

export interface WeeklyReport {
  _id?: string;
  weekStartDate: Date;
  weekEndDate: Date;
  siteName: string;
  totalWithdrawals: number;
  dailyBreakdown: Array<{
    date: Date;
    withdrawals: number;
    equipmentUsed: Array<{
      equipmentName: string;
      quantityWithdrawn: number;
      unit: string;
    }>;
  }>;
  createdAt: Date;
}
