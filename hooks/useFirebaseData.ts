// Custom hooks to switch between Real Firebase and Mock Data
import { useState, useEffect } from 'react';
import {
  MOCK_LEADS,
  MOCK_ORDERS,
  MOCK_EMPLOYEES,
  MOCK_DESIGN_ORDERS,
  MOCK_ALLOCATIONS,
  MOCK_DESIGNS,
  CUSTOMER_GROUPS as MOCK_GROUPS,
  LEAD_SOURCES as MOCK_SOURCES,
  SALE_AGENTS as MOCK_AGENTS
} from '../constants';
import { Lead, Order, Employee, DesignOrder, SaleAllocation, DesignItem } from '../types';

// TOGGLE THIS TO SWITCH SERVER
const USE_MOCK_DATA = true; // Set to false to use Real Firebase

import {
  getLeads,
  getOrders,
  getEmployees,
  getDesignOrders,
  getSaleAllocations,
  getDesignItems,
  getCustomerGroups,
  getLeadSources,
  getSaleAgents,
  subscribeToLeads
} from '../services/firebaseService';

// Hook for Leads
export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLeads = () => {
    setLoading(true);
    if (USE_MOCK_DATA) {
      setTimeout(() => {
        let localLeads = JSON.parse(localStorage.getItem('mock_leads') || 'null');
        if (!localLeads) {
          localLeads = MOCK_LEADS;
          localStorage.setItem('mock_leads', JSON.stringify(localLeads));
        }
        setLeads(localLeads);
        setLoading(false);
      }, 500);
      return;
    }

    const unsubscribe = subscribeToLeads((updatedLeads) => {
      setLeads(updatedLeads);
      setLoading(false);
    });
    return () => unsubscribe();
  };

  useEffect(() => {
    const unsub = fetchLeads();
    if (typeof unsub === 'function') return unsub;
  }, []);

  // CRUD Actions
  const addLead = async (lead: Lead) => {
    if (USE_MOCK_DATA) {
      const current = JSON.parse(localStorage.getItem('mock_leads') || '[]');
      localStorage.setItem('mock_leads', JSON.stringify([lead, ...current]));
      setLeads(prev => [lead, ...prev]);
      return Promise.resolve();
    }
    return Promise.reject("Real mode addLead not connected via hook");
  };

  const updateLeadHook = async (updatedLead: Lead) => {
    if (USE_MOCK_DATA) {
      const current = JSON.parse(localStorage.getItem('mock_leads') || '[]');
      const index = current.findIndex((l: Lead) => l.id === updatedLead.id);
      let newLeads;
      if (index !== -1) {
        newLeads = [...current];
        newLeads[index] = updatedLead;
      } else {
        // If modifying a static mock, 'save' it to local storage
        newLeads = [updatedLead, ...current.filter((l: Lead) => l.id !== updatedLead.id)];
      }
      localStorage.setItem('mock_leads', JSON.stringify(newLeads));
      setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
      return Promise.resolve();
    }
    return Promise.reject("Real mode updateLead not connected via hook");
  };

  const deleteLeadHook = async (id: string) => {
    if (USE_MOCK_DATA) {
      const current = JSON.parse(localStorage.getItem('mock_leads') || '[]');
      localStorage.setItem('mock_leads', JSON.stringify(current.filter((l: Lead) => l.id !== id)));
      setLeads(prev => prev.filter(l => l.id !== id));
      return Promise.resolve();
    }
    return Promise.reject("Real mode deleteLead not connected via hook");
  };

  return { leads, loading, error, refetch: fetchLeads, addLead, updateLead: updateLeadHook, deleteLead: deleteLeadHook };
}

// Hook for Orders
export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Helper to get orders (Mock + LocalStorage or Real)
  const fetchOrders = () => {
    setLoading(true);
    if (USE_MOCK_DATA) {
      setTimeout(() => {
        let localOrders = JSON.parse(localStorage.getItem('mock_orders') || 'null');
        if (!localOrders) {
          localOrders = MOCK_ORDERS;
          localStorage.setItem('mock_orders', JSON.stringify(localOrders));
        }
        setOrders(localOrders);
        setLoading(false);
      }, 500);
    } else {
      getOrders()
        .then(data => { setOrders(data); setLoading(false); })
        .catch(err => { setError(err); setLoading(false); });
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Add Order Function
  const addOrder = async (order: Order) => {
    if (USE_MOCK_DATA) {
      // Save to LocalStorage
      const currentOrders = JSON.parse(localStorage.getItem('mock_orders') || '[]');
      const newOrders = [order, ...currentOrders];
      localStorage.setItem('mock_orders', JSON.stringify(newOrders));

      // Update local state
      setOrders(prev => [order, ...prev]);
      return Promise.resolve();
    } else {
      // Real Firebase implementation (Not yet in service, but assuming it exists or throwing error)
      console.warn("Real createOrder not implemented in service yet");
      return Promise.reject("Feature not available in Real Mode yet");
    }
  };

  // Update Order Function
  const updateOrder = async (updatedOrder: Order) => {
    if (USE_MOCK_DATA) {
      const currentOrders = JSON.parse(localStorage.getItem('mock_orders') || '[]');
      // Check if it's in local storage
      const index = currentOrders.findIndex((o: Order) => o.id === updatedOrder.id);

      let newOrders;
      if (index !== -1) {
        newOrders = [...currentOrders];
        newOrders[index] = updatedOrder;
      } else {
        // If not in local storage (it's a static mock), we need to add it to local storage as an override or just keep it in memory?
        // Simplest for Mock: Add to local storage effectively "converting" it to a local order or just store modified ones.
        // Better: Store ALL current state to local storage when modified?
        // Let's just append/update in LocalStorage.
        newOrders = [updatedOrder, ...currentOrders.filter((o: Order) => o.id !== updatedOrder.id)];
      }
      localStorage.setItem('mock_orders', JSON.stringify(newOrders));

      // Update State
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      return Promise.resolve();
    } else {
      return Promise.reject("Feature not available in Real Mode yet");
    }
  };

  // Delete Order Function
  const deleteOrder = async (id: string) => {
    if (USE_MOCK_DATA) {
      const currentOrders = JSON.parse(localStorage.getItem('mock_orders') || '[]');
      const newOrders = currentOrders.filter((o: Order) => o.id !== id);
      // Note: This only deletes from LocalStorage. If it is in MOCK_ORDERS constant, it reappears on reload unless we "Hide" it.
      // For simple mock, this 'delete' might only work for newly added items or we need a 'deleted_ids' list.
      // Let's assume user accepts simple behavior.
      localStorage.setItem('mock_orders', JSON.stringify(newOrders));

      setOrders(prev => prev.filter(o => o.id !== id));
      return Promise.resolve();
    } else {
      return Promise.reject("Feature not available in Real Mode yet");
    }
  };

  return { orders, loading, error, refetch: fetchOrders, addOrder, updateOrder, deleteOrder };
}

// Hook for Employees
export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEmployees = () => {
    setLoading(true);
    if (USE_MOCK_DATA) {
      setTimeout(() => {
        let localEmployees = JSON.parse(localStorage.getItem('mock_employees') || 'null');
        if (!localEmployees) {
          localEmployees = MOCK_EMPLOYEES;
          localStorage.setItem('mock_employees', JSON.stringify(localEmployees));
        }
        setEmployees(localEmployees);
        setLoading(false);
      }, 500);
    } else {
      getEmployees()
        .then(data => { setEmployees(data); setLoading(false); })
        .catch(err => { setError(err); setLoading(false); });
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // CRUD
  const addEmployee = async (emp: Employee) => {
    if (USE_MOCK_DATA) {
      const current = JSON.parse(localStorage.getItem('mock_employees') || '[]');
      localStorage.setItem('mock_employees', JSON.stringify([emp, ...current]));
      setEmployees(prev => [emp, ...prev]);
      return Promise.resolve();
    }
    return Promise.reject("Real mode not implemented");
  };

  const updateEmployee = async (emp: Employee) => {
    if (USE_MOCK_DATA) {
      const current = JSON.parse(localStorage.getItem('mock_employees') || '[]');
      const index = current.findIndex((e: Employee) => e.id === emp.id);
      let newEmps;
      if (index !== -1) {
        newEmps = [...current];
        newEmps[index] = emp;
      } else {
        newEmps = [emp, ...current.filter((e: Employee) => e.id !== emp.id)];
      }
      localStorage.setItem('mock_employees', JSON.stringify(newEmps));
      setEmployees(prev => prev.map(e => e.id === emp.id ? emp : e));
      return Promise.resolve();
    }
    return Promise.reject("Real mode not implemented");
  };

  const deleteEmployee = async (id: string) => {
    if (USE_MOCK_DATA) {
      const current = JSON.parse(localStorage.getItem('mock_employees') || '[]');
      localStorage.setItem('mock_employees', JSON.stringify(current.filter((e: Employee) => e.id !== id)));
      setEmployees(prev => prev.filter(e => e.id !== id));
      return Promise.resolve();
    }
    return Promise.reject("Real mode not implemented");
  };

  return { employees, loading, error, refetch: fetchEmployees, addEmployee, updateEmployee, deleteEmployee };
}

// Hook for Design Orders
export function useDesignOrders() {
  const [designOrders, setDesignOrders] = useState<DesignOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Helper to get design orders (Mock + LocalStorage or Real)
  const fetchDesignOrders = () => {
    setLoading(true);
    if (USE_MOCK_DATA) {
      setTimeout(() => {
        let localDesignOrders = JSON.parse(localStorage.getItem('mock_design_orders') || 'null');
        if (!localDesignOrders) {
          localDesignOrders = MOCK_DESIGN_ORDERS;
          localStorage.setItem('mock_design_orders', JSON.stringify(localDesignOrders));
        }
        setDesignOrders(localDesignOrders);
        setLoading(false);
      }, 500);
    } else {
      getDesignOrders()
        .then(data => { setDesignOrders(data); setLoading(false); })
        .catch(err => { setError(err); setLoading(false); });
    }
  };

  useEffect(() => {
    fetchDesignOrders();
  }, []);

  // Add Design Order Function
  const addDesignOrder = async (order: DesignOrder) => {
    if (USE_MOCK_DATA) {
      const currentOrders = JSON.parse(localStorage.getItem('mock_design_orders') || '[]');
      const newOrders = [order, ...currentOrders];
      localStorage.setItem('mock_design_orders', JSON.stringify(newOrders));
      setDesignOrders(prev => [order, ...prev]);
      return Promise.resolve();
    } else {
      console.warn("Real createDesignOrder not implemented in service yet");
      return Promise.reject("Feature not available in Real Mode yet");
    }
  };
  // Update Design Order
  const updateDesignOrder = async (order: DesignOrder) => {
    if (USE_MOCK_DATA) {
      const current = JSON.parse(localStorage.getItem('mock_design_orders') || '[]');
      const index = current.findIndex((o: DesignOrder) => o.id === order.id);
      let newOrders;
      if (index !== -1) {
        newOrders = [...current];
        newOrders[index] = order;
      } else {
        newOrders = [order, ...current];
      }
      localStorage.setItem('mock_design_orders', JSON.stringify(newOrders));
      setDesignOrders(prev => prev.map(o => o.id === order.id ? order : o));
      return Promise.resolve();
    }
    return Promise.reject("Real mode updateDesignOrder not implemented");
  };

  // Delete Design Order
  const deleteDesignOrder = async (id: string) => {
    if (USE_MOCK_DATA) {
      const current = JSON.parse(localStorage.getItem('mock_design_orders') || '[]');
      localStorage.setItem('mock_design_orders', JSON.stringify(current.filter((o: DesignOrder) => o.id !== id)));
      setDesignOrders(prev => prev.filter(o => o.id !== id));
      return Promise.resolve();
    }
    return Promise.reject("Real mode deleteDesignOrder not implemented");
  };

  return { designOrders, loading, error, refetch: fetchDesignOrders, addDesignOrder, updateDesignOrder, deleteDesignOrder };
}

// Hook for Sale Allocations
export function useSaleAllocations() {
  const [allocations, setAllocations] = useState<SaleAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAllocations = () => {
    setLoading(true);
    if (USE_MOCK_DATA) {
      setTimeout(() => {
        let local = JSON.parse(localStorage.getItem('mock_allocations') || 'null');
        if (!local) {
          local = MOCK_ALLOCATIONS;
          localStorage.setItem('mock_allocations', JSON.stringify(local));
        }
        setAllocations(local);
        setLoading(false);
      }, 500);
    } else {
      getSaleAllocations()
        .then(data => { setAllocations(data); setLoading(false); })
        .catch(err => { setError(err); setLoading(false); });
    }
  };

  useEffect(() => {
    fetchAllocations();
  }, []);

  const updateAllocation = async (item: SaleAllocation) => {
    if (USE_MOCK_DATA) {
      const current = JSON.parse(localStorage.getItem('mock_allocations') || '[]');
      const index = current.findIndex((a: SaleAllocation) => a.id === item.id);
      let newItems;
      if (index !== -1) {
        newItems = [...current];
        newItems[index] = item;
      } else {
        newItems = [item, ...current.filter((a: SaleAllocation) => a.id !== item.id)];
      }
      localStorage.setItem('mock_allocations', JSON.stringify(newItems));
      setAllocations(prev => prev.map(a => a.id === item.id ? item : a));
      return Promise.resolve();
    }
    return Promise.reject("Real mode updateAllocation not implemented");
  };

  const deleteAllocation = async (id: string) => {
    if (USE_MOCK_DATA) {
      const current = JSON.parse(localStorage.getItem('mock_allocations') || '[]');
      localStorage.setItem('mock_allocations', JSON.stringify(current.filter((a: SaleAllocation) => a.id !== id)));
      setAllocations(prev => prev.filter(a => a.id !== id));
      return Promise.resolve();
    }
    return Promise.reject("Real mode deleteAllocation not implemented");
  };

  const addAllocation = async (item: SaleAllocation) => {
    if (USE_MOCK_DATA) {
      const current = JSON.parse(localStorage.getItem('mock_allocations') || '[]');
      localStorage.setItem('mock_allocations', JSON.stringify([item, ...current]));
      setAllocations(prev => [item, ...prev]);
      return Promise.resolve();
    }
    return Promise.reject("Real mode addAllocation not implemented");
  };

  return { allocations, loading, error, addAllocation, updateAllocation, deleteAllocation, refetch: fetchAllocations };
}

// Hook for Products (Config)
export function useProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const MOCK_PRODUCTS = [
    { id: 'PROD_1', name: 'Nồi cơm điện', group: 'Gia dụng' },
    { id: 'PROD_2', name: 'Lò vi sóng', group: 'Gia dụng' },
    { id: 'PROD_3', name: 'Máy in Canon', group: 'Thiết bị VP' },
    { id: 'PROD_4', name: 'Máy chiếu Sony', group: 'Thiết bị VP' },
    { id: 'PROD_5', name: 'Phần mềm CRM', group: 'Phần mềm' },
    { id: 'PROD_6', name: 'Hosting Web', group: 'Phần mềm' },
  ];

  const fetchProducts = () => {
    setLoading(true);
    if (USE_MOCK_DATA) {
      setTimeout(() => {
        let local = JSON.parse(localStorage.getItem('mock_products') || 'null');
        if (!local) {
          local = MOCK_PRODUCTS;
          localStorage.setItem('mock_products', JSON.stringify(local));
        }
        setProducts(local);
        setLoading(false);
      }, 500);
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = async (product: any) => {
    if (USE_MOCK_DATA) {
      const current = JSON.parse(localStorage.getItem('mock_products') || '[]');
      localStorage.setItem('mock_products', JSON.stringify([product, ...current]));
      setProducts(prev => [product, ...prev]);
    }
  };

  return { products, loading, addProduct };
}

// Hook for Design Items
export function useDesignItems() {
  const [designItems, setDesignItems] = useState<DesignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchItems = () => {
    setLoading(true);
    if (USE_MOCK_DATA) {
      setTimeout(() => {
        let local = JSON.parse(localStorage.getItem('mock_designs') || 'null');
        if (!local) {
          local = MOCK_DESIGNS;
          localStorage.setItem('mock_designs', JSON.stringify(local));
        }
        setDesignItems(local);
        setLoading(false);
      }, 500);
    } else {
      getDesignItems()
        .then(data => { setDesignItems(data); setLoading(false); })
        .catch(err => { setError(err); setLoading(false); });
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const addDesignItem = async (item: DesignItem) => {
    if (USE_MOCK_DATA) {
      const current = JSON.parse(localStorage.getItem('mock_designs') || '[]');
      localStorage.setItem('mock_designs', JSON.stringify([item, ...current]));
      setDesignItems(prev => [item, ...prev]);
      return Promise.resolve();
    }
    return Promise.reject("Real mode addDesignItem not implemented");
  };

  const updateDesignItem = async (item: DesignItem) => {
    if (USE_MOCK_DATA) {
      const current = JSON.parse(localStorage.getItem('mock_designs') || '[]');
      const index = current.findIndex((d: DesignItem) => d.id === item.id);
      let newItems;
      if (index !== -1) {
        newItems = [...current];
        newItems[index] = item;
      } else {
        newItems = [item, ...current];
      }
      localStorage.setItem('mock_designs', JSON.stringify(newItems));
      setDesignItems(prev => prev.map(d => d.id === item.id ? item : d));
      return Promise.resolve();
    }
    return Promise.reject("Real mode updateDesignItem not implemented");
  };

  return { designItems, loading, error, addDesignItem, updateDesignItem, refetch: fetchItems };
}

// Hook for Reference Data
export function useReferenceData() {
  const [customerGroups, setCustomerGroups] = useState<string[]>([]);
  const [leadSources, setLeadSources] = useState<string[]>([]);
  const [saleAgents, setSaleAgents] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (USE_MOCK_DATA) {
      setTimeout(() => {
        setCustomerGroups(MOCK_GROUPS);
        setLeadSources(MOCK_SOURCES);
        setSaleAgents(MOCK_AGENTS);
        setLoading(false);
      }, 500);
    } else {
      Promise.all([
        getCustomerGroups(),
        getLeadSources(),
        getSaleAgents()
      ])
        .then(([groups, sources, agents]) => {
          setCustomerGroups(groups);
          setLeadSources(sources);
          setSaleAgents(agents);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, []);

  return { customerGroups, leadSources, saleAgents, loading };
}

// Hook for Lead Source Configs (Management Table)
export function useLeadSourceConfigs() {
  const [sourceConfigs, setSourceConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const MOCK_SOURCE_CONFIGS = [
    { id: 'src_1', sourceGroup: 'Zalo', sourceName: 'Group hội gv', inCharge: 'Nguyễn Đắc Công', colorClass: 'bg-blue-50 text-blue-700' },
    { id: 'src_2', sourceGroup: 'Facebook ADs', sourceName: 'Page 1', inCharge: 'Nguyễn thị Huế', colorClass: 'bg-indigo-50 text-indigo-700' },
    { id: 'src_3', sourceGroup: 'Website', sourceName: 'Form Đăng Ký', inCharge: 'Trần Thị B', colorClass: 'bg-emerald-50 text-emerald-700' },
    { id: 'src_4', sourceGroup: 'Tiktok', sourceName: 'Kênh Tiktok Chính', inCharge: 'Lê Văn C', colorClass: 'bg-pink-50 text-pink-700' },
    { id: 'src_5', sourceGroup: 'Giới thiệu', sourceName: 'Khách cũ giới thiệu', inCharge: 'Phạm Thị D', colorClass: 'bg-orange-50 text-orange-700' }
  ];

  const fetchConfigs = () => {
    setLoading(true);
    if (USE_MOCK_DATA) {
      setTimeout(() => {
        let local = JSON.parse(localStorage.getItem('mock_source_configs') || 'null');
        if (!local) {
          local = MOCK_SOURCE_CONFIGS;
          localStorage.setItem('mock_source_configs', JSON.stringify(local));
        }
        setSourceConfigs(local);
        setLoading(false);
      }, 500);
    } else {
      // Real implementation future
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const addSourceConfig = async (config: any) => {
    if (USE_MOCK_DATA) {
      const current = JSON.parse(localStorage.getItem('mock_source_configs') || '[]');
      localStorage.setItem('mock_source_configs', JSON.stringify([config, ...current]));
      setSourceConfigs(prev => [config, ...prev]);
      return Promise.resolve();
    }
  };

  const updateSourceConfig = async (config: any) => {
    if (USE_MOCK_DATA) {
      const current = JSON.parse(localStorage.getItem('mock_source_configs') || '[]');
      const index = current.findIndex((c: any) => c.id === config.id);
      let newConfigs;
      if (index !== -1) {
        newConfigs = [...current];
        newConfigs[index] = config;
      } else {
        newConfigs = [config, ...current];
      }
      localStorage.setItem('mock_source_configs', JSON.stringify(newConfigs));
      setSourceConfigs(prev => prev.map(c => c.id === config.id ? config : c));
      return Promise.resolve();
    }
  };

  const deleteSourceConfig = async (id: string) => {
    if (USE_MOCK_DATA) {
      const current = JSON.parse(localStorage.getItem('mock_source_configs') || '[]');
      localStorage.setItem('mock_source_configs', JSON.stringify(current.filter((c: any) => c.id !== id)));
      setSourceConfigs(prev => prev.filter(c => c.id !== id));
      return Promise.resolve();
    }
  };

  return { sourceConfigs, loading, addSourceConfig, updateSourceConfig, deleteSourceConfig };
}

// Hook for KPIs
export function useKPIs() {
  const [kpis, setKpis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchKPIs = () => {
    setLoading(true);
    if (USE_MOCK_DATA) {
      setTimeout(() => {
        const local = JSON.parse(localStorage.getItem('mock_kpis') || '[]');
        setKpis(local);
        setLoading(false);
      }, 500);
    }
  };

  useEffect(() => {
    fetchKPIs();
  }, []);

  const assignKPI = async (record: any) => {
    if (USE_MOCK_DATA) {
      const current = JSON.parse(localStorage.getItem('mock_kpis') || '[]');
      const index = current.findIndex((k: any) => k.id === record.id);
      let newKPIs;
      if (index !== -1) {
        newKPIs = [...current];
        newKPIs[index] = record;
      } else {
        newKPIs = [record, ...current];
      }
      localStorage.setItem('mock_kpis', JSON.stringify(newKPIs));
      setKpis(prev => {
        const idx = prev.findIndex(k => k.id === record.id);
        if (idx !== -1) {
          const clone = [...prev];
          clone[idx] = record;
          return clone;
        }
        return [record, ...prev];
      });
      return Promise.resolve();
    }
    return Promise.reject("Real mode assignKPI not implemented");
  };

  return { kpis, loading, assignKPI, refetch: fetchKPIs };
}


