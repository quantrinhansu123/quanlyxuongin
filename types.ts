
export enum LeadStatus {
  NEW = 'Mới',
  CALLED = 'Đã gọi',
  INTERESTED = 'Quan tâm',
  NOT_INTERESTED = 'Không quan tâm',
  THINKING = 'Suy nghĩ',
  CLOSED = 'Đã chốt',
}

export interface CallLog {
  count: number;
  content: string; // The formatted string: "1. Content\n2. Content"
}

export interface Lead {
  id: string;
  group: string;
  name: string;
  phone: string;
  source: string; // Facebook Ads, Group, etc.
  sourceName: string; // Specific page name
  productType: string; // Product type that customer is interested in
  saleName: string;
  callLog: CallLog;
  note: string;
  status: LeadStatus;
  isOrderCreated: boolean;
  assignedAt: string; // ISO Date string: Time when lead was assigned to sale
  processedAt?: string; // ISO Date string: Time when lead was processed (called or ordered)
}

export interface SaleAllocation {
  id: string;
  customerGroup: string;
  productGroups: string[];
  products: string[];
  assignedSales: string[];
}

export interface DesignUsage {
  orderId: string;
  customerName: string;
  usedAt: string;
}

export interface DesignItem {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  description: string;
  gallery?: string[]; // Additional images
  attachments?: { name: string; url: string; fileType?: string }[];
  originalFile?: { name: string; url: string; fileType?: string };
  usageHistory?: DesignUsage[];
}

export interface DashboardMetrics {
  totalLeads: number;
  totalOrders: number;
  revenue: number;
}

// --- HR Types ---
export enum EmployeeStatus {
  ACTIVE = 'Đang làm việc',
  LEAVE = 'Nghỉ phép',
  RESIGNED = 'Đã nghỉ việc',
}

export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  phone: string;
  email: string;
  joinDate: string;
  status: EmployeeStatus;
  avatar: string; // Initials or image URL
}

export interface KPITarget {
  revenue: number;
  calls: number;
  leads: number;
}

export interface KPIRecord {
  id: string;
  employeeId: string;
  employeeName: string; // For display convenience
  month: string; // "YYYY-MM"
  monthlyTarget: KPITarget;
  weeklyTargets: {
    week: number;
    target: KPITarget;
  }[];
}

// --- Design Order Types ---
export enum DesignOrderStatus {
  PENDING = 'Chờ xử lý',
  IN_PROGRESS = 'Đang thiết kế',
  REVIEW = 'Chờ duyệt',
  COMPLETED = 'Hoàn thành',
  CANCELLED = 'Hủy'
}

export interface DesignOrder {
  id: string;
  customerName: string;
  phone: string;
  productType: string; // Logo, Banner, Menu...
  requirements: string; // Customer notes
  designer: string;
  status: DesignOrderStatus;
  revenue: number;
  deadline: string;
  createdAt: string;
}

// --- Order Management Types ---
export enum OrderStatus {
  PENDING = 'Chờ xác nhận',
  PROCESSING = 'Đang thực hiện',
  DELIVERING = 'Đang giao',
  COMPLETED = 'Hoàn thành',
  CANCELLED = 'Đã hủy'
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  content: string;
  imageProof: string; // URL or Base64
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerGroup: string; // For filtering
  source: string; // For filtering
  saleName: string;
  createdAt: string;
  productName: string;
  requirements: string;
  status: OrderStatus;
  revenue: number;
  paymentHistory: PaymentRecord[];
  callCount: number; // For filtering
}
// --- AI Bag Generator Types ---
export type BagType = 'paper' | 'cloth' | 'box' | 'plastic';

export interface BagTemplate {
  id: string;
  name: string;
  type: BagType;
  previewImage: string;
  description?: string;
}

export interface GeneratedBagImage {
  id: string;
  prompt: string;
  imageUrl: string;
  timestamp: string;
  bagType: string;
  bagSize: string;
  bagColor: string;
  templateId: string;
}

export interface AIGeneratorSettings {
  apiKey?: string;
  apiProvider: 'openai' | 'stability' | 'midjourney' | 'mock';
  model?: string;
  quality?: 'standard' | 'hd';
}
