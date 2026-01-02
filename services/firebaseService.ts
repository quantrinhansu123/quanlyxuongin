// Service để tương tác với Firebase Realtime Database
import { ref, get, set, update, remove, onValue, off, DataSnapshot } from 'firebase/database';
import { db } from '../firebase-realtime.config';
import { Lead, Order, Employee, DesignOrder, SaleAllocation, DesignItem, PaymentRecord } from '../types';
import { LeadStatus, OrderStatus, EmployeeStatus, DesignOrderStatus } from '../types';
import { loadReferenceData, getCustomerGroupName, getLeadSourceName, getEmployeeName } from './referenceService';

// ========== Helper Functions ==========

// Convert Firebase data to Lead
function firebaseToLead(id: string, data: any): Lead {
  return {
    id,
    group: getCustomerGroupName(data.nhom_khach_hang_id) || data.nhom_khach_hang_id || '',
    name: data.ten || '',
    phone: data.so_dien_thoai || '',
    source: getLeadSourceName(data.nguon_id) || data.nguon_id || '',
    sourceName: data.ten_nguon || '',
    saleName: getEmployeeName(data.nhan_vien_ban_hang_id) || data.nhan_vien_ban_hang_id || '',
    callLog: {
      count: data.so_lan_goi || 0,
      content: data.noi_dung_goi || ''
    },
    note: data.ghi_chu || '',
    status: mapStatusToLeadStatus(data.trang_thai),
    isOrderCreated: data.da_tao_don || false,
    assignedAt: data.ngay_phan_cong || new Date().toISOString(),
    processedAt: data.ngay_xu_ly || undefined
  };
}

// Helper to find ID from name (reverse lookup)
async function findIdByName(collection: string, name: string): Promise<string> {
  const snapshot = await get(ref(db, collection));
  if (!snapshot.exists()) return name;
  
  const data = snapshot.val();
  const found = Object.keys(data).find(id => data[id].ten === name);
  return found || name;
}

// Convert Lead to Firebase format
async function leadToFirebase(lead: Lead): Promise<any> {
  // Convert names back to IDs
  const nhomKhachHangId = await findIdByName('nhom_khach_hang', lead.group);
  const nguonId = await findIdByName('nguon_khach_hang', lead.source);
  const nhanVienId = await findIdByName('nhan_vien', lead.saleName);
  
  return {
    nhom_khach_hang_id: nhomKhachHangId,
    ten: lead.name,
    so_dien_thoai: lead.phone,
    nguon_id: nguonId,
    ten_nguon: lead.sourceName,
    nhan_vien_ban_hang_id: nhanVienId,
    so_lan_goi: lead.callLog.count,
    noi_dung_goi: lead.callLog.content,
    ghi_chu: lead.note,
    trang_thai: mapLeadStatusToFirebase(lead.status),
    da_tao_don: lead.isOrderCreated,
    ngay_phan_cong: lead.assignedAt,
    ngay_xu_ly: lead.processedAt || null,
    updated_at: new Date().toISOString()
  };
}

// Convert Firebase data to Order
function firebaseToOrder(id: string, data: any): Order {
  return {
    id,
    customerName: data.ten_khach_hang || '',
    customerPhone: data.so_dien_thoai || '',
    customerGroup: data.nhom_khach_hang_id || '',
    source: data.nguon_id || '',
    saleName: data.nhan_vien_ban_hang_id || '',
    createdAt: data.created_at || new Date().toISOString(),
    productName: data.ten_san_pham || '',
    requirements: data.yeu_cau || '',
    status: mapStatusToOrderStatus(data.trang_thai),
    revenue: data.doanh_thu || 0,
    paymentHistory: [], // Sẽ fetch riêng từ lich_su_thanh_toan
    callCount: data.so_lan_goi || 0
  };
}

// Convert Firebase data to Employee
function firebaseToEmployee(id: string, data: any): Employee {
  return {
    id,
    name: data.ten || '',
    position: data.chuc_vu || '',
    department: data.phong_ban || '',
    phone: data.so_dien_thoai || '',
    email: data.email || '',
    joinDate: data.ngay_vao_lam || '',
    status: mapStatusToEmployeeStatus(data.trang_thai),
    avatar: data.avatar || ''
  };
}

// Convert Firebase data to DesignOrder
function firebaseToDesignOrder(id: string, data: any): DesignOrder {
  return {
    id,
    customerName: data.ten_khach_hang || '',
    phone: data.so_dien_thoai || '',
    productType: data.loai_san_pham || '',
    requirements: data.yeu_cau || '',
    designer: data.nhan_vien_thiet_ke_id || 'Chưa phân bổ',
    status: mapStatusToDesignOrderStatus(data.trang_thai),
    revenue: data.doanh_thu || 0,
    deadline: data.han_hoan_thanh || new Date().toISOString(),
    createdAt: data.created_at || new Date().toISOString()
  };
}

// Convert Firebase data to SaleAllocation
function firebaseToSaleAllocation(id: string, data: any): SaleAllocation {
  return {
    id,
    customerGroup: data.nhom_khach_hang_id || '',
    productGroups: data.nhom_san_pham_ids || [],
    products: data.san_pham_ids || [],
    assignedSales: data.nhan_vien_ids || []
  };
}

// Convert Firebase data to DesignItem
function firebaseToDesignItem(id: string, data: any): DesignItem {
  return {
    id,
    title: data.tieu_de || '',
    imageUrl: data.url_hinh_anh || '',
    category: data.danh_muc || '',
    description: data.mo_ta || ''
  };
}

// Status mapping functions
function mapStatusToLeadStatus(status: string): LeadStatus {
  const statusMap: Record<string, LeadStatus> = {
    'Moi': LeadStatus.NEW,
    'Da goi': LeadStatus.CALLED,
    'Quan tam': LeadStatus.INTERESTED,
    'Khong quan tam': LeadStatus.NOT_INTERESTED,
    'Suy nghi': LeadStatus.THINKING,
    'Da chot': LeadStatus.CLOSED
  };
  return statusMap[status] || LeadStatus.NEW;
}

function mapLeadStatusToFirebase(status: LeadStatus): string {
  const statusMap: Record<LeadStatus, string> = {
    [LeadStatus.NEW]: 'Moi',
    [LeadStatus.CALLED]: 'Da goi',
    [LeadStatus.INTERESTED]: 'Quan tam',
    [LeadStatus.NOT_INTERESTED]: 'Khong quan tam',
    [LeadStatus.THINKING]: 'Suy nghi',
    [LeadStatus.CLOSED]: 'Da chot'
  };
  return statusMap[status] || 'Moi';
}

function mapStatusToOrderStatus(status: string): OrderStatus {
  const statusMap: Record<string, OrderStatus> = {
    'Cho xac nhan': OrderStatus.PENDING,
    'Dang thuc hien': OrderStatus.PROCESSING,
    'Dang giao': OrderStatus.DELIVERING,
    'Hoan thanh': OrderStatus.COMPLETED,
    'Da huy': OrderStatus.CANCELLED
  };
  return statusMap[status] || OrderStatus.PENDING;
}

function mapStatusToEmployeeStatus(status: string): EmployeeStatus {
  const statusMap: Record<string, EmployeeStatus> = {
    'Dang lam viec': EmployeeStatus.ACTIVE,
    'Nghi phep': EmployeeStatus.LEAVE,
    'Da nghi viec': EmployeeStatus.RESIGNED
  };
  return statusMap[status] || EmployeeStatus.ACTIVE;
}

function mapStatusToDesignOrderStatus(status: string): DesignOrderStatus {
  const statusMap: Record<string, DesignOrderStatus> = {
    'Cho xu ly': DesignOrderStatus.PENDING,
    'Dang thiet ke': DesignOrderStatus.IN_PROGRESS,
    'Cho duyet': DesignOrderStatus.REVIEW,
    'Hoan thanh': DesignOrderStatus.COMPLETED,
    'Huy': DesignOrderStatus.CANCELLED
  };
  return statusMap[status] || DesignOrderStatus.PENDING;
}

// ========== API Functions ==========

// Leads
export async function getLeads(): Promise<Lead[]> {
  try {
    // Load reference data first
    await loadReferenceData();
    
    const snapshot = await get(ref(db, 'khach_hang'));
    if (!snapshot.exists()) return [];
    
    const data = snapshot.val();
    return Object.keys(data).map(id => firebaseToLead(id, data[id]));
  } catch (error) {
    console.error('Error fetching leads:', error);
    return [];
  }
}

export async function getLead(id: string): Promise<Lead | null> {
  try {
    const snapshot = await get(ref(db, `khach_hang/${id}`));
    if (!snapshot.exists()) return null;
    return firebaseToLead(id, snapshot.val());
  } catch (error) {
    console.error('Error fetching lead:', error);
    return null;
  }
}

export async function createLead(lead: Lead): Promise<void> {
  try {
    const firebaseData = await leadToFirebase(lead);
    await set(ref(db, `khach_hang/${lead.id}`), firebaseData);
  } catch (error) {
    console.error('Error creating lead:', error);
    throw error;
  }
}

export async function updateLead(lead: Lead): Promise<void> {
  try {
    const firebaseData = await leadToFirebase(lead);
    await update(ref(db, `khach_hang/${lead.id}`), firebaseData);
  } catch (error) {
    console.error('Error updating lead:', error);
    throw error;
  }
}

export async function deleteLead(id: string): Promise<void> {
  try {
    await remove(ref(db, `khach_hang/${id}`));
  } catch (error) {
    console.error('Error deleting lead:', error);
    throw error;
  }
}

// Real-time listener for leads
export function subscribeToLeads(callback: (leads: Lead[]) => void): () => void {
  const leadsRef = ref(db, 'khach_hang');
  
  // Load reference data once
  loadReferenceData();
  
  const unsubscribe = onValue(leadsRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    
    const data = snapshot.val();
    const leads = Object.keys(data).map(id => firebaseToLead(id, data[id]));
    callback(leads);
  });
  
  return () => off(leadsRef);
}

// Orders
export async function getOrders(): Promise<Order[]> {
  try {
    const snapshot = await get(ref(db, 'don_hang'));
    if (!snapshot.exists()) return [];
    
    const data = snapshot.val();
    const orders = Object.keys(data).map(id => firebaseToOrder(id, data[id]));
    
    // Fetch payment history for each order
    const paymentSnapshot = await get(ref(db, 'lich_su_thanh_toan'));
    if (paymentSnapshot.exists()) {
      const payments = paymentSnapshot.val();
      orders.forEach(order => {
        order.paymentHistory = Object.keys(payments)
          .filter(payId => payments[payId].don_hang_id === order.id)
          .map(payId => ({
            id: payId,
            date: payments[payId].ngay_thanh_toan,
            amount: payments[payId].so_tien,
            content: payments[payId].noi_dung,
            imageProof: payments[payId].hinh_anh_chung_tu
          }));
      });
    }
    
    return orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

// Employees
export async function getEmployees(): Promise<Employee[]> {
  try {
    const snapshot = await get(ref(db, 'nhan_vien'));
    if (!snapshot.exists()) return [];
    
    const data = snapshot.val();
    return Object.keys(data).map(id => firebaseToEmployee(id, data[id]));
  } catch (error) {
    console.error('Error fetching employees:', error);
    return [];
  }
}

export async function createEmployee(employee: Employee): Promise<void> {
  try {
    const firebaseData = {
      ten: employee.name,
      chuc_vu: employee.position,
      phong_ban: employee.department,
      so_dien_thoai: employee.phone,
      email: employee.email,
      ngay_vao_lam: employee.joinDate,
      trang_thai: mapEmployeeStatusToFirebase(employee.status),
      avatar: employee.avatar,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    await set(ref(db, `nhan_vien/${employee.id}`), firebaseData);
  } catch (error) {
    console.error('Error creating employee:', error);
    throw error;
  }
}

function mapEmployeeStatusToFirebase(status: EmployeeStatus): string {
  const statusMap: Record<EmployeeStatus, string> = {
    [EmployeeStatus.ACTIVE]: 'Dang lam viec',
    [EmployeeStatus.LEAVE]: 'Nghi phep',
    [EmployeeStatus.RESIGNED]: 'Da nghi viec'
  };
  return statusMap[status] || 'Dang lam viec';
}

// Design Orders
export async function getDesignOrders(): Promise<DesignOrder[]> {
  try {
    const snapshot = await get(ref(db, 'don_thiet_ke'));
    if (!snapshot.exists()) return [];
    
    const data = snapshot.val();
    return Object.keys(data).map(id => firebaseToDesignOrder(id, data[id]));
  } catch (error) {
    console.error('Error fetching design orders:', error);
    return [];
  }
}

export async function createDesignOrder(order: DesignOrder): Promise<void> {
  try {
    const firebaseData = {
      ten_khach_hang: order.customerName,
      so_dien_thoai: order.phone,
      loai_san_pham: order.productType,
      yeu_cau: order.requirements,
      nhan_vien_thiet_ke_id: order.designer === 'Chưa phân bổ' ? null : order.designer,
      trang_thai: mapDesignOrderStatusToFirebase(order.status),
      doanh_thu: order.revenue,
      han_hoan_thanh: order.deadline,
      created_at: order.createdAt,
      updated_at: new Date().toISOString()
    };
    await set(ref(db, `don_thiet_ke/${order.id}`), firebaseData);
  } catch (error) {
    console.error('Error creating design order:', error);
    throw error;
  }
}

function mapDesignOrderStatusToFirebase(status: DesignOrderStatus): string {
  const statusMap: Record<DesignOrderStatus, string> = {
    [DesignOrderStatus.PENDING]: 'Cho xu ly',
    [DesignOrderStatus.IN_PROGRESS]: 'Dang thiet ke',
    [DesignOrderStatus.REVIEW]: 'Cho duyet',
    [DesignOrderStatus.COMPLETED]: 'Hoan thanh',
    [DesignOrderStatus.CANCELLED]: 'Huy'
  };
  return statusMap[status] || 'Cho xu ly';
}

// Sale Allocations
export async function getSaleAllocations(): Promise<SaleAllocation[]> {
  try {
    const snapshot = await get(ref(db, 'phan_bo_ban_hang'));
    if (!snapshot.exists()) return [];
    
    const data = snapshot.val();
    return Object.keys(data).map(id => firebaseToSaleAllocation(id, data[id]));
  } catch (error) {
    console.error('Error fetching sale allocations:', error);
    return [];
  }
}

// Design Items
export async function getDesignItems(): Promise<DesignItem[]> {
  try {
    const snapshot = await get(ref(db, 'mau_thiet_ke'));
    if (!snapshot.exists()) return [];
    
    const data = snapshot.val();
    return Object.keys(data).map(id => firebaseToDesignItem(id, data[id]));
  } catch (error) {
    console.error('Error fetching design items:', error);
    return [];
  }
}

// Reference data
export async function getCustomerGroups(): Promise<string[]> {
  try {
    const snapshot = await get(ref(db, 'nhom_khach_hang'));
    if (!snapshot.exists()) return [];
    
    const data = snapshot.val();
    return Object.values(data).map((item: any) => item.ten);
  } catch (error) {
    console.error('Error fetching customer groups:', error);
    return [];
  }
}

export async function getLeadSources(): Promise<string[]> {
  try {
    const snapshot = await get(ref(db, 'nguon_khach_hang'));
    if (!snapshot.exists()) return [];
    
    const data = snapshot.val();
    return Object.values(data).map((item: any) => item.ten);
  } catch (error) {
    console.error('Error fetching lead sources:', error);
    return [];
  }
}

export async function getSaleAgents(): Promise<string[]> {
  try {
    const snapshot = await get(ref(db, 'nhan_vien'));
    if (!snapshot.exists()) return [];
    
    const data = snapshot.val();
    return Object.values(data)
      .filter((emp: any) => emp.phong_ban === 'Kinh Doanh')
      .map((emp: any) => emp.ten);
  } catch (error) {
    console.error('Error fetching sale agents:', error);
    return [];
  }
}

