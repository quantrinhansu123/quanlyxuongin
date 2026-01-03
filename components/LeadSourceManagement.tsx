import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Download,
  Upload,
  RotateCcw,
  Edit,
  Trash2,
  Eye,
  ChevronDown,
  Check,
  MoreVertical,
  ArrowLeft,
  Database,
  Plus,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LEAD_SOURCES, SALE_AGENTS, CUSTOMER_GROUPS } from '../constants';
import { LeadStatus } from '../types';
import { useLeadSourceConfigs } from '../hooks/useFirebaseData';

// --- Helper: MultiSelect Dropdown ---
interface MultiSelectProps {
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ label, options, selectedValues, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter(v => v !== option));
    } else {
      onChange([...selectedValues, option]);
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full px-3 py-2 text-sm border rounded-lg outline-none transition-all shadow-sm ${selectedValues.length > 0
          ? 'border-accent bg-blue-50 text-accent font-medium'
          : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'
          }`}
      >
        <span className="truncate mr-2">
          {selectedValues.length > 0 ? `${label}: ${selectedValues.length}` : label}
        </span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full min-w-[200px] bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
          <div className="p-2 bg-slate-50 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Chọn {label}</span>
            {selectedValues.length > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); onChange([]); }}
                className="text-xs text-red-500 hover:text-red-600 font-medium hover:underline"
              >
                Bỏ chọn
              </button>
            )}
          </div>
          <div className="p-1">
            {options.map((option) => (
              <div
                key={option}
                className="flex items-center px-3 py-2 rounded-md hover:bg-slate-100 cursor-pointer transition-colors"
                onClick={() => toggleOption(option)}
              >
                <div className={`w-4 h-4 mr-3 rounded border flex items-center justify-center transition-colors ${selectedValues.includes(option) ? 'bg-accent border-accent' : 'border-slate-300 bg-white'
                  }`}>
                  {selectedValues.includes(option) && <Check size={10} className="text-white" />}
                </div>
                <span className={`text-sm ${selectedValues.includes(option) ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>
                  {option}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main Component ---
const LeadSourceManagement: React.FC = () => {
  const navigate = useNavigate();
  const { sourceConfigs, addSourceConfig, updateSourceConfig, deleteSourceConfig } = useLeadSourceConfigs();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [editingSource, setEditingSource] = useState<any>(null);
  const [formData, setFormData] = useState({
    sourceGroup: '',
    sourceName: '',
    inCharge: '',
  });

  // Filter States
  const [filterGroups, setFilterGroups] = useState<string[]>([]);
  const [filterSources, setFilterSources] = useState<string[]>([]);
  const [filterSales, setFilterSales] = useState<string[]>([]);
  const [filterStatuses, setFilterStatuses] = useState<string[]>([]);
  const [filterCallCounts, setFilterCallCounts] = useState<string[]>([]);

  // Derived Metrics
  const metrics = {
    guests: sourceConfigs.length * 150,
    orders: Math.floor(sourceConfigs.length * 30),
    revenue: sourceConfigs.length * 12000000
  };

  const handleActionClick = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const openAddModal = () => {
    setEditingSource(null);
    setFormData({ sourceGroup: 'Facebook ADs', sourceName: '', inCharge: SALE_AGENTS[0] });
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const openEditModal = (source: any) => {
    setEditingSource(source);
    setFormData({
      sourceGroup: source.sourceGroup,
      sourceName: source.sourceName,
      inCharge: source.inCharge
    });
    setIsViewMode(false);
    setIsModalOpen(true);
    setActiveDropdown(null);
  };

  const openViewModal = (source: any) => {
    setEditingSource(source);
    setFormData({
      sourceGroup: source.sourceGroup,
      sourceName: source.sourceName,
      inCharge: source.inCharge
    });
    setIsViewMode(true);
    setIsModalOpen(true);
    setActiveDropdown(null);
  };

  const handleSave = async () => {
    if (!formData.sourceName) return alert("Vui lòng nhập tên nguồn!");

    // Simple random color assigner if new
    const colors = [
      'bg-blue-50 text-blue-700',
      'bg-indigo-50 text-indigo-700',
      'bg-emerald-50 text-emerald-700',
      'bg-pink-50 text-pink-700',
      'bg-orange-50 text-orange-700',
      'bg-purple-50 text-purple-700'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const colorClass = editingSource?.colorClass || randomColor;

    if (editingSource) {
      await updateSourceConfig({ ...editingSource, ...formData, colorClass });
    } else {
      await addSourceConfig({
        id: `src_${Date.now()}`,
        ...formData,
        colorClass
      });
    }
    setIsModalOpen(false);
    alert(editingSource ? 'Đã cập nhật nguồn!' : 'Đã thêm nguồn mới!');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nguồn này?')) {
      await deleteSourceConfig(id);
    }
    setActiveDropdown(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.action-menu-container')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Simple Filter Logic (Search)
  const filteredData = sourceConfigs.filter(source => {
    const matchSearch = source.sourceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.sourceGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.inCharge.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="p-6 h-screen overflow-y-auto flex flex-col">
      <div className="mb-6 flex items-center gap-3">
        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
          <Database size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Nguồn Lead</h2>
          <p className="text-slate-500 text-sm">Quản lý kênh tiếp nhận và phân bổ nguồn</p>
        </div>
        <button
          onClick={openAddModal}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-sm transition-colors"
        >
          <Plus size={18} /> Thêm Nguồn
        </button>
      </div>

      {/* 1. Bộ lọc (Control Panel) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 space-y-4">
        {/* Dòng 1: Tìm kiếm & Actions chính */}
        <div className="flex flex-wrap gap-3 justify-between items-center">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm tổng (tên nguồn, người phụ trách...)..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
              <Download size={16} /> Tải xuống Excel
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
              <Upload size={16} /> Tải lên Excel
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft size={16} /> Quay lại
            </button>
          </div>
        </div>

        {/* Dòng 2: Bộ lọc Checkbox */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <MultiSelect label="Nhóm KH" options={CUSTOMER_GROUPS} selectedValues={filterGroups} onChange={setFilterGroups} />
          <MultiSelect label="Nguồn tới" options={LEAD_SOURCES} selectedValues={filterSources} onChange={setFilterSources} />
          <MultiSelect label="NV Sale" options={SALE_AGENTS} selectedValues={filterSales} onChange={setFilterSales} />
          <MultiSelect label="Lần gọi" options={['0', '1', '2', '3+']} selectedValues={filterCallCounts} onChange={setFilterCallCounts} />
          <MultiSelect label="Trạng thái" options={Object.values(LeadStatus)} selectedValues={filterStatuses} onChange={setFilterStatuses} />
        </div>

        {/* Dòng 3: Bộ đếm Metrics */}
        <div className="flex gap-6 border-t border-slate-100 pt-4">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase font-semibold">Số khách</span>
            <span className="text-xl font-bold text-slate-800">{metrics.guests}</span>
          </div>
          <div className="flex flex-col border-l pl-6 border-slate-100">
            <span className="text-xs text-slate-500 uppercase font-semibold">Số đơn</span>
            <span className="text-xl font-bold text-accent">{metrics.orders}</span>
          </div>
          <div className="flex flex-col border-l pl-6 border-slate-100">
            <span className="text-xs text-slate-500 uppercase font-semibold">Doanh số</span>
            <span className="text-xl font-bold text-green-600">{formatCurrency(metrics.revenue)}</span>
          </div>
        </div>
      </div>

      {/* 2. Bảng dữ liệu */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-visible flex flex-col pb-20">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-semibold whitespace-nowrap">
              <th className="p-4 w-32">Mã Nguồn</th>
              <th className="p-4">Nhóm nguồn</th>
              <th className="p-4">Tên nguồn</th>
              <th className="p-4">Người phụ trách</th>
              <th className="p-4 text-right w-32">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.map((source) => (
              <tr key={source.id} className="hover:bg-slate-50 transition-colors text-sm group">
                <td className="p-4">
                  <span className="font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded text-xs border border-slate-200">
                    {source.id.split('_')[1] || 'Auto'}
                  </span>
                </td>

                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${source.colorClass}`}>
                    {source.sourceGroup}
                  </span>
                </td>

                <td className="p-4 font-medium text-slate-900">{source.sourceName}</td>
                <td className="p-4 text-slate-600">{source.inCharge}</td>

                <td className="p-4 text-right relative action-menu-container">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActionClick(source.id);
                    }}
                    className={`p-2 rounded-full transition-colors ${activeDropdown === source.id
                      ? 'bg-slate-200 text-slate-800'
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                      }`}
                  >
                    <MoreVertical size={18} />
                  </button>

                  {/* Dropdown Menu */}
                  {activeDropdown === source.id && (
                    <div className="absolute right-8 top-8 z-50 w-40 bg-white rounded-lg shadow-xl border border-slate-100 py-1 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                      <button
                        onClick={() => openViewModal(source)}
                        className="w-full text-left px-4 py-2.5 text-xs text-slate-600 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 font-medium transition-colors"
                      >
                        <Eye size={14} /> Xem chi tiết
                      </button>
                      <button
                        onClick={() => openEditModal(source)}
                        className="w-full text-left px-4 py-2.5 text-xs text-slate-600 hover:bg-slate-50 hover:text-amber-600 flex items-center gap-2 font-medium transition-colors"
                      >
                        <Edit size={14} /> Sửa thông tin
                      </button>
                      <div className="h-px bg-slate-100 my-1 mx-2"></div>
                      <button
                        onClick={() => handleDelete(source.id)}
                        className="w-full text-left px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 hover:text-red-600 flex items-center gap-2 font-medium transition-colors"
                      >
                        <Trash2 size={14} /> Xóa nguồn
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-[500px] p-6 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-slate-800 mb-6">
              {editingSource
                ? (isViewMode ? 'Chi tiết nguồn Lead' : 'Sửa nguồn Lead')
                : 'Thêm nguồn Lead mới'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nhóm Nguồn</label>
                <select
                  disabled={isViewMode}
                  className="w-full border p-2 rounded-lg disabled:bg-slate-100 disabled:text-slate-500"
                  value={formData.sourceGroup}
                  onChange={e => setFormData({ ...formData, sourceGroup: e.target.value })}
                >
                  {LEAD_SOURCES.map(grp => (
                    <option key={grp} value={grp}>{grp}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tên Nguồn (Chi tiết)</label>
                <input
                  disabled={isViewMode}
                  className="w-full border p-2 rounded-lg disabled:bg-slate-100 disabled:text-slate-500"
                  placeholder="Ví dụ: Page Váy Đầm 1, Form Web tháng 10..."
                  value={formData.sourceName}
                  onChange={e => setFormData({ ...formData, sourceName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Người Phụ Trách</label>
                <select
                  disabled={isViewMode}
                  className="w-full border p-2 rounded-lg disabled:bg-slate-100 disabled:text-slate-500"
                  value={formData.inCharge}
                  onChange={e => setFormData({ ...formData, inCharge: e.target.value })}
                >
                  {SALE_AGENTS.map(agent => (
                    <option key={agent} value={agent}>{agent}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg hover:bg-slate-100 text-slate-600">
                {isViewMode ? 'Đóng' : 'Hủy bỏ'}
              </button>
              {!isViewMode && (
                <button onClick={handleSave} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">Lưu lại</button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LeadSourceManagement;