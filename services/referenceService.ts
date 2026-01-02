// Service để lấy reference data (ID -> Name mapping)
import { ref, get } from 'firebase/database';
import { db } from '../firebase-realtime.config';

let customerGroupsMap: Record<string, string> = {};
let leadSourcesMap: Record<string, string> = {};
let employeesMap: Record<string, string> = {};

// Load reference data
export async function loadReferenceData() {
  try {
    // Load customer groups
    const groupsSnapshot = await get(ref(db, 'nhom_khach_hang'));
    if (groupsSnapshot.exists()) {
      const data = groupsSnapshot.val();
      customerGroupsMap = {};
      Object.keys(data).forEach(id => {
        customerGroupsMap[id] = data[id].ten;
      });
    }

    // Load lead sources
    const sourcesSnapshot = await get(ref(db, 'nguon_khach_hang'));
    if (sourcesSnapshot.exists()) {
      const data = sourcesSnapshot.val();
      leadSourcesMap = {};
      Object.keys(data).forEach(id => {
        leadSourcesMap[id] = data[id].ten;
      });
    }

    // Load employees
    const employeesSnapshot = await get(ref(db, 'nhan_vien'));
    if (employeesSnapshot.exists()) {
      const data = employeesSnapshot.val();
      employeesMap = {};
      Object.keys(data).forEach(id => {
        employeesMap[id] = data[id].ten;
      });
    }
  } catch (error) {
    console.error('Error loading reference data:', error);
  }
}

// Get name from ID
export function getCustomerGroupName(id: string): string {
  return customerGroupsMap[id] || id;
}

export function getLeadSourceName(id: string): string {
  return leadSourcesMap[id] || id;
}

export function getEmployeeName(id: string): string {
  return employeesMap[id] || id;
}

// Initialize on load
loadReferenceData();

