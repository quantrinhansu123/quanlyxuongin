// Custom hooks để fetch data từ Firebase
import { useState, useEffect } from 'react';
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
import { Lead, Order, Employee, DesignOrder, SaleAllocation, DesignItem } from '../types';

// Hook for Leads with real-time updates
export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    
    // Initial load
    getLeads()
      .then(data => {
        setLeads(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });

    // Subscribe to real-time updates
    const unsubscribe = subscribeToLeads((updatedLeads) => {
      setLeads(updatedLeads);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { leads, loading, error };
}

// Hook for Orders
export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    getOrders()
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return { orders, loading, error, refetch: () => {
    setLoading(true);
    getOrders()
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }};
}

// Hook for Employees
export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    getEmployees()
      .then(data => {
        setEmployees(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return { employees, loading, error, refetch: () => {
    setLoading(true);
    getEmployees()
      .then(data => {
        setEmployees(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }};
}

// Hook for Design Orders
export function useDesignOrders() {
  const [designOrders, setDesignOrders] = useState<DesignOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    getDesignOrders()
      .then(data => {
        setDesignOrders(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return { designOrders, loading, error, refetch: () => {
    setLoading(true);
    getDesignOrders()
      .then(data => {
        setDesignOrders(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }};
}

// Hook for Sale Allocations
export function useSaleAllocations() {
  const [allocations, setAllocations] = useState<SaleAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    getSaleAllocations()
      .then(data => {
        setAllocations(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return { allocations, loading, error };
}

// Hook for Design Items
export function useDesignItems() {
  const [designItems, setDesignItems] = useState<DesignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    getDesignItems()
      .then(data => {
        setDesignItems(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return { designItems, loading, error };
}

// Hook for Reference Data
export function useReferenceData() {
  const [customerGroups, setCustomerGroups] = useState<string[]>([]);
  const [leadSources, setLeadSources] = useState<string[]>([]);
  const [saleAgents, setSaleAgents] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
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
  }, []);

  return { customerGroups, leadSources, saleAgents, loading };
}

