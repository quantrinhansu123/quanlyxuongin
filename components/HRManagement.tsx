import React, { useState, useEffect } from 'react';
import {
  Search,
  UserPlus,
  MoreVertical,
  Mail,
  Phone,
  Briefcase,
  Users,
  Filter,
  ArrowLeft,
  Edit,
  Trash2,
  X,
  Target,
  BarChart2,
  Calendar,
  Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EmployeeStatus, Employee, KPIRecord } from '../types';
import { useEmployees, useKPIs } from '../hooks/useFirebaseData';

const HRManagement: React.FC = () => {
  const navigate = useNavigate();
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useEmployees();
  const { kpis, assignKPI } = useKPIs();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('All');

  // View Mode
  const [viewMode, setViewMode] = useState<'employees' | 'kpis'>('employees');

  // Employee Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    position: '',
    department: '',
    phone: '',
    email: '',
    joinDate: new Date().toISOString().split('T')[0],
    status: EmployeeStatus.ACTIVE
  });

  // KPI Modal State
  const [isKPIModalOpen, setIsKPIModalOpen] = useState(false);
  const [selectedKPIEmployee, setSelectedKPIEmployee] = useState<Employee | null>(null);
  const [kpiData, setKpiData] = useState({
    month: new Date().toISOString().slice(0, 7),
    revenue: 0,
    calls: 0,
    leads: 0,
    weekly: [
      { week: 1, revenue: 0, calls: 0, leads: 0 },
      { week: 2, revenue: 0, calls: 0, leads: 0 },
      { week: 3, revenue: 0, calls: 0, leads: 0 },
      { week: 4, revenue: 0, calls: 0, leads: 0 },
    ]
  });

  // Dropdown Access
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Close dropdown logic
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const departments = ['All', ...Array.from(new Set(employees.map(e => e.department)))];

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = filterDepartment === 'All' || emp.department === filterDepartment;
    return matchesSearch && matchesDept;
  });

  const filteredKPIs = kpis.filter(k => {
    // Simple filter by month or employee name matching search
    return k.month.includes(searchQuery) || k.employeeName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Employee Handlers
  const handleOpenAdd = () => {
    setEditingEmployee(null);
    setFormData({ name: '', position: '', department: '', phone: '', email: '', joinDate: new Date().toISOString().split('T')[0], status: EmployeeStatus.ACTIVE });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({ ...emp });
    setIsModalOpen(true);
    setActiveDropdown(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn chắc chắn muốn xóa nhân viên này?")) await deleteEmployee(id);
    setActiveDropdown(null);
  };

  const handleSaveEmployee = async () => {
    if (!formData.name) return;
    if (editingEmployee) {
      await updateEmployee({ ...editingEmployee, ...formData, avatar: formData.name.slice(0, 2).toUpperCase() });
    } else {
      await addEmployee({ id: `NV${Date.now()}`, ...formData, avatar: formData.name.slice(0, 2).toUpperCase() });
    }
    setIsModalOpen(false);
  };

  // KPI Handlers
  const handleOpenKPI = (emp: Employee) => {
    setSelectedKPIEmployee(emp);
    // Check if existing KPI for this month? Assuming new for now or creating simplified flow
    setKpiData({
      month: new Date().toISOString().slice(0, 7),
      revenue: 100000000, // Default 100m
      calls: 500,
      leads: 50,
      weekly: [
        { week: 1, revenue: 25000000, calls: 125, leads: 12 },
        { week: 2, revenue: 25000000, calls: 125, leads: 12 },
        { week: 3, revenue: 25000000, calls: 125, leads: 13 },
        { week: 4, revenue: 25000000, calls: 125, leads: 13 },
      ]
    });
    setIsKPIModalOpen(true);
    setActiveDropdown(null);
  };

  const handleAutoDistribute = () => {
    const q = 4;
    const wRev = Math.floor(kpiData.revenue / q);
    const wCalls = Math.floor(kpiData.calls / q);
    const wLeads = Math.floor(kpiData.leads / q);

    setKpiData(prev => ({
      ...prev,
      weekly: prev.weekly.map(w => ({
        ...w,
        revenue: wRev,
        calls: wCalls,
        leads: wLeads
      }))
    }));
  };

  const handleSaveKPI = async () => {
    if (!selectedKPIEmployee) return;

    const record: KPIRecord = {
      id: `KPI_${selectedKPIEmployee.id}_${kpiData.month}`,
      employeeId: selectedKPIEmployee.id,
      employeeName: selectedKPIEmployee.name,
      month: kpiData.month,
      monthlyTarget: {
        revenue: kpiData.revenue,
        calls: kpiData.calls,
        leads: kpiData.leads
      },
      weeklyTargets: kpiData.weekly.map(w => ({
        week: w.week,
        target: { revenue: w.revenue, calls: w.calls, leads: w.leads }
      }))
    };

    await assignKPI(record);
    alert("Đã giao KPIs thành công!");
    setIsKPIModalOpen(false);
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <div className="p-6 h-screen overflow-y-auto flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-lime-100 text-lime-700 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Quản lý Nhân sự & KPIs</h2>
            <p className="text-slate-500 text-sm">Danh sách nhân viên, theo dõi và giao chỉ tiêu</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-600 shadow-sm transition-colors"
          >
            <UserPlus size={18} /> Thêm nhân viên
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 mb-6">
        <button
          onClick={() => setViewMode('employees')}
          className={`pb-2 px-4 font-medium text-sm transition-colors ${viewMode === 'employees' ? 'text-accent border-b-2 border-accent' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Danh sách nhân viên
        </button>
        <button
          onClick={() => setViewMode('kpis')}
          className={`pb-2 px-4 font-medium text-sm transition-colors ${viewMode === 'kpis' ? 'text-accent border-b-2 border-accent' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Bảng theo dõi KPIs
        </button>
      </div>

      {/* Control Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder={viewMode === 'employees' ? "Tìm nhân viên..." : "Tìm KPIs theo tháng, tên..."}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-accent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* View Content */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-visible pb-20">
        {viewMode === 'employees' ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-semibold">
                <th className="p-4 w-16">ID</th>
                <th className="p-4">Nhân viên</th>
                <th className="p-4">Chức vụ & Phòng ban</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50 text-sm group">
                  <td className="p-4 font-mono text-slate-500">{emp.id}</td>
                  <td className="p-4 font-medium">{emp.name}</td>
                  <td className="p-4">
                    <div className="font-medium">{emp.position}</div>
                    <div className="text-xs text-slate-500">{emp.department}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs border ${emp.status === EmployeeStatus.ACTIVE ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{emp.status}</span>
                  </td>
                  <td className="p-4 text-right relative dropdown-container">
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === emp.id ? null : emp.id); }}
                      className="p-2 text-slate-400 hover:text-slate-600 rounded-full"
                    >
                      <MoreVertical size={18} />
                    </button>
                    {activeDropdown === emp.id && (
                      <div className="absolute right-8 top-0 z-50 w-48 bg-white rounded-lg shadow-xl border border-slate-100 py-1 origin-top-right animate-in fade-in zoom-in-95">
                        <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase border-b border-slate-50">Thao tác</div>
                        <button onClick={() => handleOpenEdit(emp)} className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex gap-2 items-center"><Edit size={14} /> Sửa thông tin</button>
                        <button onClick={() => handleOpenKPI(emp)} className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 text-accent flex gap-2 items-center"><Target size={14} /> Giao KPIs</button>
                        <button onClick={() => handleDelete(emp.id)} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex gap-2 items-center"><Trash2 size={14} /> Xóa nhân sự</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          // KPI TABLE VIEW
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-semibold">
                <th className="p-4">Tháng</th>
                <th className="p-4">Nhân viên</th>
                <th className="p-4 text-right bg-blue-50/50">Mục tiêu Doanh số</th>
                <th className="p-4 text-right">Tuần 1</th>
                <th className="p-4 text-right">Tuần 2</th>
                <th className="p-4 text-right">Tuần 3</th>
                <th className="p-4 text-right">Tuần 4</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredKPIs.map(k => (
                <tr key={k.id} className="hover:bg-slate-50">
                  <td className="p-4 font-mono text-slate-500">{k.month}</td>
                  <td className="p-4 font-medium text-slate-800">{k.employeeName}</td>
                  <td className="p-4 text-right font-bold text-accent bg-blue-50/30">{formatCurrency(k.monthlyTarget.revenue)}</td>
                  {k.weeklyTargets.map(w => (
                    <td key={w.week} className="p-4 text-right text-slate-600">
                      <div className="text-xs pb-1 border-b border-slate-100 mb-1">{formatCurrency(w.target.revenue)}</div>
                      <div className="text-[10px] text-slate-400">Call: {w.target.calls}</div>
                    </td>
                  ))}
                </tr>
              ))}
              {filteredKPIs.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-slate-400">Chưa có dữ liệu KPIs</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Employee Modal (Simplified reusing logic) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-[600px] shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4"><X size={20} /></button>
            <h3 className="text-xl font-bold mb-4">{editingEmployee ? 'Sửa thông tin' : 'Thêm nhân viên'}</h3>
            <div className="space-y-3">
              <input className="w-full p-2 border rounded" placeholder="Họ tên" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              <input className="w-full p-2 border rounded" placeholder="Chức vụ" value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })} />
              <input className="w-full p-2 border rounded" placeholder="Phòng ban" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} />
              <select className="w-full p-2 border rounded" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as EmployeeStatus })}>
                {Object.values(EmployeeStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={handleSaveEmployee} className="px-4 py-2 bg-accent text-white rounded">Lưu</button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Assignment Modal */}
      {isKPIModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-[900px] max-w-[95vw] p-6 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto relative">
            <button onClick={() => setIsKPIModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20} /></button>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Target className="text-accent" /> Giao KPIs: {selectedKPIEmployee?.name}
            </h3>

            <div className="grid grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Tháng áp dụng</label>
                <input type="month" className="w-full border p-2 rounded" value={kpiData.month} onChange={e => setKpiData({ ...kpiData, month: e.target.value })} />
              </div>
            </div>

            {/* Monthly Targets */}
            <div className="bg-slate-50 p-4 rounded-lg mb-6 border border-slate-200">
              <h4 className="font-bold text-slate-700 mb-3 flex justify-between items-center">
                Mục tiêu Tổng (Tháng)
                <button onClick={handleAutoDistribute} className="text-xs bg-white border border-slate-300 px-2 py-1 rounded hover:bg-slate-100 shadow-sm flex items-center gap-1">
                  <Layers size={12} /> Tự động chia tuần
                </button>
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Doanh số (VNĐ)</label>
                  <input type="number" className="w-full border p-2 rounded font-bold text-accent" value={kpiData.revenue} onChange={e => setKpiData({ ...kpiData, revenue: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Cuộc gọi (Call)</label>
                  <input type="number" className="w-full border p-2 rounded" value={kpiData.calls} onChange={e => setKpiData({ ...kpiData, calls: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Data mới (Lead)</label>
                  <input type="number" className="w-full border p-2 rounded" value={kpiData.leads} onChange={e => setKpiData({ ...kpiData, leads: Number(e.target.value) })} />
                </div>
              </div>
            </div>

            {/* Weekly Breakdown */}
            <h4 className="font-bold text-slate-700 mb-3">Chi tiết theo tuần</h4>
            <div className="space-y-3">
              {kpiData.weekly.map((w, idx) => (
                <div key={w.week} className="flex gap-4 items-center bg-white p-3 border rounded-lg shadow-sm">
                  <div className="w-20 font-bold text-slate-600">Tuần {w.week}</div>
                  <div className="flex-1">
                    <label className="text-[10px] uppercase text-slate-400">Doanh số</label>
                    <input
                      type="number"
                      className="w-full border p-1 rounded text-sm"
                      value={w.revenue}
                      onChange={e => {
                        const newW = [...kpiData.weekly];
                        newW[idx].revenue = Number(e.target.value);
                        setKpiData({ ...kpiData, weekly: newW });
                      }}
                    />
                  </div>
                  <div className="w-32">
                    <label className="text-[10px] uppercase text-slate-400">Calls</label>
                    <input
                      type="number"
                      className="w-full border p-1 rounded text-sm"
                      value={w.calls}
                      onChange={e => {
                        const newW = [...kpiData.weekly];
                        newW[idx].calls = Number(e.target.value);
                        setKpiData({ ...kpiData, weekly: newW });
                      }}
                    />
                  </div>
                  <div className="w-32">
                    <label className="text-[10px] uppercase text-slate-400">Leads</label>
                    <input
                      type="number"
                      className="w-full border p-1 rounded text-sm"
                      value={w.leads}
                      onChange={e => {
                        const newW = [...kpiData.weekly];
                        newW[idx].leads = Number(e.target.value);
                        setKpiData({ ...kpiData, weekly: newW });
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button onClick={() => setIsKPIModalOpen(false)} className="px-4 py-2 hover:bg-slate-100 rounded">Hủy bỏ</button>
              <button onClick={handleSaveKPI} className="px-4 py-2 bg-accent text-white rounded hover:bg-blue-600 font-bold">Lưu KPIs</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRManagement;