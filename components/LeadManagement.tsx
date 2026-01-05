import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Download,
  Upload,
  RotateCcw,
  PhoneCall,
  Edit,
  Trash2,
  Eye,
  PlusCircle,
  CheckCircle,
  Filter,
  ChevronDown,
  Check,
  StickyNote,
  Clock,
  PenLine
} from 'lucide-react';
import { Lead, LeadStatus, Order, OrderStatus } from '../types';
import { useLeads, useReferenceData, useOrders, useLeadSourceConfigs } from '../hooks/useFirebaseData';
import { PRODUCT_TYPES } from '../constants';
// import { updateLead, deleteLead, createLead } from '../services/firebaseService';

// --- Helper Component: MultiSelect Dropdown ---
interface MultiSelectProps {
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ label, options, selectedValues, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
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
          {selectedValues.length > 0
            ? `${label}: ${selectedValues.length}`
            : label}
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
            {options.length === 0 && (
              <div className="p-3 text-center text-xs text-slate-400">Không có dữ liệu</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const LeadManagement: React.FC = () => {
  const { leads, loading: leadsLoading, updateLead, deleteLead, addLead: createLead } = useLeads();
  const { customerGroups, leadSources, saleAgents, loading: refLoading } = useReferenceData();
  const { sourceConfigs, loading: sourceLoading } = useLeadSourceConfigs();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  const loading = leadsLoading || refLoading || sourceLoading;

  // Filter States (Arrays for MultiSelect)
  const [filterGroups, setFilterGroups] = useState<string[]>([]);
  const [filterSources, setFilterSources] = useState<string[]>([]);
  const [filterSales, setFilterSales] = useState<string[]>([]);
  const [filterStatuses, setFilterStatuses] = useState<string[]>([]);
  const [filterCallCounts, setFilterCallCounts] = useState<string[]>([]);

  // Call Modal State
  const [selectedLeadForCall, setSelectedLeadForCall] = useState<Lead | null>(null);
  const [newCallNote, setNewCallNote] = useState('');
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);

  // Add New Lead Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLead, setNewLead] = useState({
    name: '',
    phone: '',
    group: customerGroups[0] || '',
    source: leadSources[0] || '',
    sourceName: '',
    productType: PRODUCT_TYPES[0] || '',
    saleName: saleAgents[0] || '',
    note: ''
  });

  // Edit Lead Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [editLead, setEditLead] = useState({
    name: '',
    phone: '',
    group: '',
    source: '',
    sourceName: '',
    productType: '',
    saleName: '',
    note: ''
  });

  // Update timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Derived Metrics
  const metrics = useMemo(() => {
    return {
      guests: leads.length,
      orders: leads.filter(l => l.isOrderCreated).length,
      revenue: leads.filter(l => l.isOrderCreated).length * 500000
    };
  }, [leads]);

  // Generate available Call Count options dynamically + defaults
  const availableCallCounts = useMemo(() => {
    const counts = new Set(leads.map(l => String(l.callLog.count)));
    ['0', '1', '2', '3', '4', '5'].forEach(c => counts.add(c));
    return Array.from(counts).sort((a, b) => Number(a) - Number(b));
  }, [leads]);

  // Filter source names based on selected source group
  const availableSourceNames = useMemo(() => {
    if (!newLead.source) return [];
    return sourceConfigs
      .filter(config => config.sourceGroup === newLead.source)
      .map(config => config.sourceName);
  }, [sourceConfigs, newLead.source]);

  // Filtering Logic
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = Object.values(lead).some(val =>
        String(val).toLowerCase().includes(searchQuery.toLowerCase())
      );

      const matchesGroup = filterGroups.length > 0 ? filterGroups.includes(lead.group) : true;
      const matchesSource = filterSources.length > 0 ? filterSources.includes(lead.source) : true;
      const matchesSale = filterSales.length > 0 ? filterSales.includes(lead.saleName) : true;
      const matchesStatus = filterStatuses.length > 0 ? filterStatuses.includes(lead.status) : true;
      const matchesCallCount = filterCallCounts.length > 0 ? filterCallCounts.includes(String(lead.callLog.count)) : true;

      return matchesSearch && matchesGroup && matchesSource && matchesSale && matchesStatus && matchesCallCount;
    });
  }, [leads, searchQuery, filterGroups, filterSources, filterSales, filterStatuses, filterCallCounts]);

  // Helper: Format Duration
  const formatDuration = (startTimeStr: string, endTimeStr?: string) => {
    const start = new Date(startTimeStr).getTime();
    const end = endTimeStr ? new Date(endTimeStr).getTime() : currentTime.getTime();
    const diff = end - start;

    if (diff < 0) return '00:00:00';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  // Handlers
  const handleCallClick = (lead: Lead) => {
    setSelectedLeadForCall(lead);
    setNewCallNote('');
    setIsCallModalOpen(true);
  };

  const submitCallNote = async () => {
    if (!selectedLeadForCall || !newCallNote.trim()) return;

    const newCount = selectedLeadForCall.callLog.count + 1;
    const newContentLine = `${newCount}. ${newCallNote}`;

    const updatedContent = selectedLeadForCall.callLog.content
      ? `${selectedLeadForCall.callLog.content}\n${newContentLine}`
      : newContentLine;

    const updatedLead: Lead = {
      ...selectedLeadForCall,
      callLog: {
        count: newCount,
        content: updatedContent
      },
      status: LeadStatus.CALLED,
      processedAt: selectedLeadForCall.processedAt || new Date().toISOString()
    };

    try {
      await updateLead(updatedLead);
      setIsCallModalOpen(false);
    } catch (error) {
      console.error('Error updating lead:', error);
      alert('Có lỗi xảy ra khi cập nhật!');
    }
  };

  // Use Order Hook for actions
  const { addOrder } = useOrders();

  const handleCreateOrder = async (id: string) => {
    if (window.confirm('Xác nhận lên đơn cho khách hàng này?')) {
      const lead = leads.find(l => l.id === id);
      if (!lead) return;

      const updatedLead: Lead = {
        ...lead,
        isOrderCreated: true,
        status: LeadStatus.CLOSED,
        processedAt: lead.processedAt || new Date().toISOString()
      };

      const newOrder: Order = {
        id: `DH${Date.now().toString().slice(-6)}`, // Generate Simple ID
        customerName: lead.name,
        customerPhone: lead.phone,
        customerGroup: lead.group,
        source: lead.source,
        saleName: lead.saleName,
        createdAt: new Date().toISOString(),
        productName: 'Chưa cập nhật',
        requirements: lead.note || '',
        status: OrderStatus.PENDING,
        revenue: 0,
        paymentHistory: [],
        callCount: lead.callLog.count
      };

      try {
        await updateLead(updatedLead);
        await addOrder(newOrder);
        alert('Đã tạo đơn hàng thành công!');
      } catch (error) {
        console.error('Error updating lead:', error);
        alert('Có lỗi xảy ra khi cập nhật!');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa khách hàng này?')) {
      try {
        await deleteLead(id);
      } catch (error) {
        console.error('Error deleting lead:', error);
        alert('Có lỗi xảy ra khi xóa!');
      }
    }
  };

  // Direct Note Edit Handler
  const handleNoteChange = async (id: string, newNote: string) => {
    const lead = leads.find(l => l.id === id);
    if (!lead) return;

    const updatedLead: Lead = { ...lead, note: newNote };
    try {
      await updateLead(updatedLead);
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  // Edit Lead Handler
  const handleEditClick = (lead: Lead) => {
    setEditingLead(lead);
    setEditLead({
      name: lead.name,
      phone: lead.phone,
      group: lead.group,
      source: lead.source,
      sourceName: lead.sourceName,
      productType: lead.productType || '',
      saleName: lead.saleName,
      note: lead.note
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateLead = async () => {
    if (!editingLead || !editLead.name || !editLead.phone) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    const updatedLead: Lead = {
      ...editingLead,
      name: editLead.name,
      phone: editLead.phone,
      group: editLead.group,
      source: editLead.source,
      sourceName: editLead.sourceName,
      productType: editLead.productType,
      saleName: editLead.saleName,
      note: editLead.note
    };

    try {
      await updateLead(updatedLead);
      setIsEditModalOpen(false);
      setEditingLead(null);
    } catch (error) {
      console.error('Error updating lead:', error);
      alert('Có lỗi xảy ra khi cập nhật!');
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterGroups([]);
    setFilterSources([]);
    setFilterSales([]);
    setFilterStatuses([]);
    setFilterCallCounts([]);
  };

  // Generate new Lead ID
  const generateLeadId = () => {
    if (leads.length === 0) return 'KH001';
    const ids = leads.map(l => {
      const num = parseInt(l.id.replace('KH', ''));
      return isNaN(num) ? 0 : num;
    });
    const maxId = Math.max(...ids);
    return `KH${String(maxId + 1).padStart(3, '0')}`;
  };

  // Handle Add New Lead
  const handleAddLead = async () => {
    if (!newLead.name || !newLead.phone) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    const lead: Lead = {
      id: generateLeadId(),
      name: newLead.name,
      phone: newLead.phone,
      group: newLead.group,
      source: newLead.source,
      sourceName: newLead.sourceName,
      productType: newLead.productType,
      saleName: newLead.saleName,
      callLog: { count: 0, content: '' },
      note: newLead.note,
      status: LeadStatus.NEW,
      isOrderCreated: false,
      assignedAt: new Date().toISOString(),
      processedAt: undefined
    };

    try {
      await createLead(lead);
      setIsAddModalOpen(false);
      setNewLead({
        name: '',
        phone: '',
        group: customerGroups[0] || '',
        source: leadSources[0] || '',
        sourceName: '',
        productType: PRODUCT_TYPES[0] || '',
        saleName: saleAgents[0] || '',
        note: ''
      });
    } catch (error) {
      console.error('Error creating lead:', error);
      alert('Có lỗi xảy ra khi tạo khách hàng mới!');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="p-6 h-screen overflow-y-auto flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Hộp chờ tư vấn</h2>
          <p className="text-slate-500 text-sm">Quản lý và chuyển đổi khách hàng tiềm năng</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-lg hover:bg-blue-600 shadow-md hover:shadow-lg transition-all font-medium"
        >
          <PlusCircle size={20} /> Thêm khách hàng mới
        </button>
      </div>

      {/* Control Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 space-y-4">
        {/* Row 1: Search & Actions */}
        <div className="flex flex-wrap gap-3 justify-between items-center">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm tất cả (Tên, SĐT, Mã KH...)"
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-blue-600 shadow-sm transition-colors"
            >
              <PlusCircle size={16} /> Thêm mới
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
              <Download size={16} /> Xuất Excel
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
              <Upload size={16} /> Nhập Excel
            </button>
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <RotateCcw size={16} /> Reset
            </button>
          </div>
        </div>

        {/* Row 2: Filters (MultiSelect Checkboxes) */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <MultiSelect
            label="Nhóm KH"
            options={customerGroups}
            selectedValues={filterGroups}
            onChange={setFilterGroups}
          />
          <MultiSelect
            label="Nguồn tới"
            options={leadSources}
            selectedValues={filterSources}
            onChange={setFilterSources}
          />
          <MultiSelect
            label="NV Sale"
            options={saleAgents}
            selectedValues={filterSales}
            onChange={setFilterSales}
          />
          <MultiSelect
            label="Lần gọi"
            options={availableCallCounts}
            selectedValues={filterCallCounts}
            onChange={setFilterCallCounts}
          />
          <MultiSelect
            label="Trạng thái"
            options={Object.values(LeadStatus)}
            selectedValues={filterStatuses}
            onChange={setFilterStatuses}
          />
        </div>

        {/* Row 3: Counters */}
        <div className="flex gap-6 border-t border-slate-100 pt-4">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase font-semibold">Khách hàng</span>
            <span className="text-xl font-bold text-slate-800">{metrics.guests}</span>
          </div>
          <div className="flex flex-col border-l pl-6 border-slate-100">
            <span className="text-xs text-slate-500 uppercase font-semibold">Đơn hàng</span>
            <span className="text-xl font-bold text-accent">{metrics.orders}</span>
          </div>
          <div className="flex flex-col border-l pl-6 border-slate-100">
            <span className="text-xs text-slate-500 uppercase font-semibold">Doanh số (tạm tính)</span>
            <span className="text-xl font-bold text-green-600">{formatCurrency(metrics.revenue)}</span>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-slate-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      )}

      {/* Data Table */}
      {!loading && (
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-semibold whitespace-nowrap">
                  <th className="p-4 w-24">Mã KH</th>
                  <th className="p-4">Nhóm KH</th>
                  <th className="p-4">Họ và tên</th>
                  <th className="p-4">SĐT</th>
                  <th className="p-4">Loại SP</th>
                  <th className="p-4">Nguồn tới</th>
                  <th className="p-4">NV Sale</th>
                  <th className="p-4 text-center">Lần gọi</th>
                  <th className="p-4 text-center">Thời gian xử lý</th>
                  <th className="p-4 w-[200px]">Ghi chú (Sửa trực tiếp)</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.length > 0 ? filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50 transition-colors text-sm">
                    <td className="p-4 font-medium text-slate-700">{lead.id}</td>
                    <td className="p-4">
                      <span className="inline-block px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-xs">
                        {lead.group}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-slate-900">{lead.name}</td>
                    <td className="p-4 text-slate-600">{lead.phone}</td>
                    <td className="p-4">
                      <span className="inline-block px-2 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-medium">
                        {lead.productType || 'Chưa xác định'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-900 font-medium text-xs">{lead.source}</div>
                      {lead.sourceName && (
                        <div className="text-slate-500 text-xs mt-0.5">{lead.sourceName}</div>
                      )}
                    </td>
                    <td className="p-4 text-slate-600">{lead.saleName}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleCallClick(lead)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors font-bold border border-blue-100"
                          title="Thêm ghi chú cuộc gọi"
                        >
                          {lead.callLog.count}
                        </button>
                        {lead.callLog.content && (
                          <div className="group relative">
                            <StickyNote size={16} className="text-yellow-500 cursor-help" />
                            <div className="hidden group-hover:block absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-800 text-white text-xs rounded shadow-lg whitespace-pre-wrap text-left">
                              {lead.callLog.content}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    {/* Cột Thời gian xử lý */}
                    <td className="p-4 text-center">
                      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border font-mono text-xs
                        ${lead.processedAt
                          ? 'bg-slate-100 text-slate-500 border-slate-200' // Đã xong
                          : 'bg-red-50 text-red-600 border-red-200 animate-pulse' // Đang chạy
                        }
                    `}>
                        <Clock size={12} />
                        {formatDuration(lead.assignedAt, lead.processedAt)}
                      </div>
                    </td>
                    {/* Cột Ghi chú có thể sửa trực tiếp */}
                    <td className="p-4 min-w-[200px]">
                      <div className="relative group">
                        <input
                          type="text"
                          value={lead.note}
                          onChange={(e) => handleNoteChange(lead.id, e.target.value)}
                          className="w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-accent focus:bg-white rounded px-2 py-1.5 outline-none transition-all text-slate-700 placeholder-slate-400"
                          placeholder="Nhập ghi chú..."
                        />
                        <PenLine size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 opacity-0 group-hover:opacity-100 pointer-events-none" />
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap
                      ${lead.status === LeadStatus.NEW ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          lead.status === LeadStatus.CLOSED ? 'bg-green-50 text-green-700 border-green-200' :
                            lead.status === LeadStatus.NOT_INTERESTED ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => alert('Xem chi tiết ' + lead.name)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Xem chi tiết">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => handleCallClick(lead)} className="p-1.5 text-slate-400 hover:text-accent hover:bg-blue-50 rounded" title="Ghi chú nhanh (Dừng thời gian)">
                          <PhoneCall size={16} />
                        </button>
                        {!lead.isOrderCreated && (
                          <button
                            onClick={() => handleCreateOrder(lead.id)}
                            className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded"
                            title="Lên đơn hàng (Dừng thời gian)"
                          >
                            <PlusCircle size={16} />
                          </button>
                        )}
                        {lead.isOrderCreated && (
                          <span className="p-1.5 text-green-600" title="Đã lên đơn"><CheckCircle size={16} /></span>
                        )}
                        <button onClick={() => handleEditClick(lead)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Sửa"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(lead.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" title="Xóa"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={11} className="p-8 text-center text-slate-500">
                      Không tìm thấy dữ liệu phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Call Modal */}
      {isCallModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-[500px] max-w-[90vw] p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <PhoneCall className="text-accent" />
              Ghi chú cuộc gọi lần {selectedLeadForCall ? selectedLeadForCall.callLog.count + 1 : 1}
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung trao đổi (Enter để lưu)</label>
              <textarea
                className="w-full h-32 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent outline-none resize-none"
                placeholder="Khách hàng phản hồi như thế nào..."
                value={newCallNote}
                onChange={(e) => setNewCallNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault(); // Prevent newline
                    submitCallNote();
                  }
                }}
                autoFocus
              />
              <p className="text-xs text-slate-400 mt-1 italic">* Nhấn Enter để lưu & Dừng thời gian xử lý</p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsCallModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={submitCallNote}
                disabled={!newCallNote.trim()}
                className="px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Lưu & Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Lead Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-[600px] max-w-[90vw] p-6 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <PlusCircle className="text-accent" />
              Thêm khách hàng mới
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  placeholder="Nhập họ và tên"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                  value={newLead.phone}
                  onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nhóm khách hàng</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                    value={newLead.group}
                    onChange={(e) => setNewLead({ ...newLead, group: e.target.value })}
                  >
                    {customerGroups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Loại sản phẩm</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                    value={newLead.productType}
                    onChange={(e) => setNewLead({ ...newLead, productType: e.target.value })}
                  >
                    {PRODUCT_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nguồn</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                    value={newLead.source}
                    onChange={(e) => setNewLead({ ...newLead, source: e.target.value, sourceName: '' })}
                  >
                    {leadSources.map(source => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tên nguồn cụ thể</label>
                  {availableSourceNames.length > 0 ? (
                    <select
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                      value={newLead.sourceName}
                      onChange={(e) => setNewLead({ ...newLead, sourceName: e.target.value })}
                    >
                      <option value="">-- Chọn nguồn --</option>
                      {availableSourceNames.map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                      value={newLead.sourceName}
                      onChange={(e) => setNewLead({ ...newLead, sourceName: e.target.value })}
                      placeholder="Nhập tên nguồn cụ thể..."
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nhân viên Sale</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                  value={newLead.saleName}
                  onChange={(e) => setNewLead({ ...newLead, saleName: e.target.value })}
                >
                  {saleAgents.map(agent => (
                    <option key={agent} value={agent}>{agent}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú</label>
                <textarea
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent outline-none resize-none"
                  rows={3}
                  value={newLead.note}
                  onChange={(e) => setNewLead({ ...newLead, note: e.target.value })}
                  placeholder="Nhập ghi chú (nếu có)"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setNewLead({
                    name: '',
                    phone: '',
                    group: customerGroups[0] || '',
                    source: leadSources[0] || '',
                    sourceName: '',
                    productType: PRODUCT_TYPES[0] || '',
                    saleName: saleAgents[0] || '',
                    note: ''
                  });
                }}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleAddLead}
                disabled={!newLead.name || !newLead.phone}
                className="px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Thêm mới
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Lead Modal */}
      {isEditModalOpen && editingLead && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-[600px] max-w-[90vw] p-6 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Edit className="text-accent" />
              Chỉnh sửa khách hàng
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                  value={editLead.name}
                  onChange={(e) => setEditLead({ ...editLead, name: e.target.value })}
                  placeholder="Nhập họ và tên"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                  value={editLead.phone}
                  onChange={(e) => setEditLead({ ...editLead, phone: e.target.value })}
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nhóm khách hàng</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                    value={editLead.group}
                    onChange={(e) => setEditLead({ ...editLead, group: e.target.value })}
                  >
                    {customerGroups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Loại sản phẩm</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                    value={editLead.productType}
                    onChange={(e) => setEditLead({ ...editLead, productType: e.target.value })}
                  >
                    {PRODUCT_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nguồn</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                    value={editLead.source}
                    onChange={(e) => setEditLead({ ...editLead, source: e.target.value, sourceName: '' })}
                  >
                    {leadSources.map(source => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tên nguồn cụ thể</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                    value={editLead.sourceName}
                    onChange={(e) => setEditLead({ ...editLead, sourceName: e.target.value })}
                    placeholder="Nhập tên nguồn cụ thể..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú</label>
                <textarea
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent outline-none resize-none"
                  rows={3}
                  value={editLead.note}
                  onChange={(e) => setEditLead({ ...editLead, note: e.target.value })}
                  placeholder="Nhập ghi chú (nếu có)"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingLead(null);
                }}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleUpdateLead}
                disabled={!editLead.name || !editLead.phone}
                className="px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadManagement;