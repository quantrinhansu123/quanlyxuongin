import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, 
  Download, 
  Upload, 
  ArrowLeft,
  Filter,
  Eye, 
  Edit, 
  Trash2, 
  MoreVertical,
  Check,
  ChevronDown,
  ShoppingCart,
  Palette,
  CreditCard,
  QrCode,
  Image as ImageIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MOCK_ORDERS, LEAD_SOURCES, SALE_AGENTS, CUSTOMER_GROUPS } from '../constants';
import { Order, OrderStatus } from '../types';

// --- MultiSelect Component (Reusable) ---
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
        className={`flex items-center justify-between w-full px-3 py-2 text-sm border rounded-lg outline-none transition-all shadow-sm ${
          selectedValues.length > 0 
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
          <div className="p-1">
            {options.map((option) => (
              <div
                key={option}
                className="flex items-center px-3 py-2 rounded-md hover:bg-slate-100 cursor-pointer transition-colors"
                onClick={() => toggleOption(option)}
              >
                <div className={`w-4 h-4 mr-3 rounded border flex items-center justify-center transition-colors ${
                  selectedValues.includes(option) ? 'bg-accent border-accent' : 'border-slate-300 bg-white'
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

const OrderManagement: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter States
  const [filterGroups, setFilterGroups] = useState<string[]>([]);
  const [filterSources, setFilterSources] = useState<string[]>([]);
  const [filterSales, setFilterSales] = useState<string[]>([]);
  const [filterStatuses, setFilterStatuses] = useState<string[]>([]);
  const [filterCallCounts, setFilterCallCounts] = useState<string[]>([]);
  
  // Action Dropdown State
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Modal States
  const [isDesignModalOpen, setIsDesignModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Design Form State
  const [designReq, setDesignReq] = useState('');

  // Payment Form State
  const [paymentForm, setPaymentForm] = useState({ content: '', amount: 0, image: '' });

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest('.action-menu')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Filter Logic
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = Object.values(order).some(val => 
        String(val).toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      const matchesGroup = filterGroups.length > 0 ? filterGroups.includes(order.customerGroup) : true;
      const matchesSource = filterSources.length > 0 ? filterSources.includes(order.source) : true;
      const matchesSale = filterSales.length > 0 ? filterSales.includes(order.saleName) : true;
      const matchesStatus = filterStatuses.length > 0 ? filterStatuses.includes(order.status) : true;
      const matchesCallCount = filterCallCounts.length > 0 ? filterCallCounts.includes(String(order.callCount)) : true;

      return matchesSearch && matchesGroup && matchesSource && matchesSale && matchesStatus && matchesCallCount;
    });
  }, [orders, searchQuery, filterGroups, filterSources, filterSales, filterStatuses, filterCallCounts]);

  // Metrics
  const metrics = useMemo(() => ({
    customers: new Set(filteredOrders.map(o => o.customerPhone)).size,
    orders: filteredOrders.length,
    revenue: filteredOrders.reduce((acc, o) => acc + o.revenue, 0)
  }), [filteredOrders]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', { 
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
    });
  };

  // Actions
  const handleOpenDesign = (order: Order) => {
    setSelectedOrder(order);
    setDesignReq(order.requirements);
    setIsDesignModalOpen(true);
    setActiveDropdown(null);
  };

  const handleSubmitDesign = () => {
    // In a real app, this would create a DesignOrder in the database
    alert(`Đã gửi yêu cầu thiết kế cho đơn ${selectedOrder?.id} sang bộ phận thiết kế!\nNội dung: ${designReq}`);
    setIsDesignModalOpen(false);
  };

  const handleOpenPayment = (order: Order) => {
    setSelectedOrder(order);
    setPaymentForm({ content: '', amount: order.revenue, image: '' });
    setIsPaymentModalOpen(true);
    setActiveDropdown(null);
  };

  const handleSubmitPayment = () => {
     if(!selectedOrder) return;
     const newPayment = {
        id: `PAY${Date.now()}`,
        date: new Date().toISOString(),
        amount: paymentForm.amount,
        content: paymentForm.content,
        imageProof: paymentForm.image
     };
     
     const updatedOrder = {
        ...selectedOrder,
        paymentHistory: [newPayment, ...selectedOrder.paymentHistory]
     };

     setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
     setIsPaymentModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if(window.confirm('Bạn có chắc muốn xóa đơn hàng này?')) {
        setOrders(prev => prev.filter(o => o.id !== id));
    }
  };

  return (
    <div className="p-6 h-screen overflow-y-auto flex flex-col">
       <div className="mb-6 flex items-center gap-3">
        <div className="p-2 bg-red-100 text-red-600 rounded-lg">
           <ShoppingCart size={24} />
        </div>
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Quản lý Đơn hàng</h2>
           <p className="text-slate-500 text-sm">Theo dõi tiến độ, thanh toán và yêu cầu thiết kế</p>
        </div>
      </div>

      {/* 1. Filter Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 space-y-4">
         {/* Row 1 */}
         <div className="flex flex-wrap gap-3 justify-between items-center">
            <div className="relative flex-1 min-w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Tìm kiếm tổng (Tên, Mã đơn, SĐT...)" 
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent outline-none text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                    <Download size={16} /> Xuất Excel
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

         {/* Row 2: Filters */}
         <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <MultiSelect label="Nhóm KH" options={CUSTOMER_GROUPS} selectedValues={filterGroups} onChange={setFilterGroups} />
            <MultiSelect label="Nguồn tới" options={LEAD_SOURCES} selectedValues={filterSources} onChange={setFilterSources} />
            <MultiSelect label="NV Sale" options={SALE_AGENTS} selectedValues={filterSales} onChange={setFilterSales} />
            <MultiSelect label="Lần gọi" options={['1', '2', '3', '4', '5']} selectedValues={filterCallCounts} onChange={setFilterCallCounts} />
            <MultiSelect label="Trạng thái" options={Object.values(OrderStatus)} selectedValues={filterStatuses} onChange={setFilterStatuses} />
         </div>

         {/* Row 3: Metrics */}
         <div className="flex gap-6 border-t border-slate-100 pt-4">
            <div className="flex flex-col">
                <span className="text-xs text-slate-500 uppercase font-semibold">Số khách</span>
                <span className="text-xl font-bold text-slate-800">{metrics.customers}</span>
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

      {/* 2. Table */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-visible flex flex-col pb-20">
         <div className="overflow-x-auto overflow-y-visible min-h-[300px]">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-semibold whitespace-nowrap">
                        <th className="p-4">Mã đơn hàng</th>
                        <th className="p-4 text-center">QR đơn</th>
                        <th className="p-4">Khách hàng</th>
                        <th className="p-4">Sale</th>
                        <th className="p-4">Ngày giờ</th>
                        <th className="p-4">Sản phẩm</th>
                        <th className="p-4 min-w-[200px]">Yêu cầu</th>
                        <th className="p-4">Trạng thái</th>
                        <th className="p-4 text-right">Hành động</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredOrders.length > 0 ? filteredOrders.map(order => (
                        <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="p-4 font-bold text-slate-700">{order.id}</td>
                            <td className="p-4 text-center">
                                <div className="inline-flex items-center justify-center p-1 bg-white border border-slate-200 rounded">
                                     <img 
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${order.id}`} 
                                        alt="QR" 
                                        className="w-8 h-8 opacity-80"
                                     />
                                </div>
                            </td>
                            <td className="p-4">
                                <div className="font-medium text-slate-900">{order.customerName}</div>
                                <div className="text-xs text-slate-500">{order.customerPhone}</div>
                            </td>
                            <td className="p-4 text-slate-600">{order.saleName}</td>
                            <td className="p-4 text-slate-500">{formatDate(order.createdAt)}</td>
                            <td className="p-4 font-medium">{order.productName}</td>
                            <td className="p-4 text-slate-600 truncate max-w-[200px]" title={order.requirements}>
                                {order.requirements}
                            </td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold border whitespace-nowrap
                                    ${order.status === OrderStatus.COMPLETED ? 'bg-green-50 text-green-700 border-green-200' : 
                                      order.status === OrderStatus.CANCELLED ? 'bg-red-50 text-red-700 border-red-200' :
                                      order.status === OrderStatus.PROCESSING ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                      'bg-amber-50 text-amber-700 border-amber-200'
                                    }`}>
                                    {order.status}
                                </span>
                            </td>
                            <td className="p-4 text-right relative action-menu">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveDropdown(activeDropdown === order.id ? null : order.id);
                                    }}
                                    className={`p-2 rounded-full transition-colors ${
                                        activeDropdown === order.id 
                                            ? 'bg-slate-200 text-slate-800' 
                                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    <MoreVertical size={18} />
                                </button>
                                
                                {activeDropdown === order.id && (
                                    <div className="absolute right-8 top-8 z-50 w-48 bg-white rounded-lg shadow-xl border border-slate-100 py-1 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                                        <button className="w-full text-left px-4 py-2.5 text-xs text-slate-600 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 font-medium transition-colors">
                                            <Eye size={14} /> Xem chi tiết
                                        </button>
                                        <button className="w-full text-left px-4 py-2.5 text-xs text-slate-600 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 font-medium transition-colors">
                                            <Edit size={14} /> Sửa đơn hàng
                                        </button>
                                        <button 
                                            onClick={() => handleOpenDesign(order)}
                                            className="w-full text-left px-4 py-2.5 text-xs text-slate-600 hover:bg-slate-50 hover:text-purple-600 flex items-center gap-2 font-medium transition-colors"
                                        >
                                            <Palette size={14} /> Yêu cầu thiết kế
                                        </button>
                                        <button 
                                            onClick={() => handleOpenPayment(order)}
                                            className="w-full text-left px-4 py-2.5 text-xs text-slate-600 hover:bg-slate-50 hover:text-green-600 flex items-center gap-2 font-medium transition-colors"
                                        >
                                            <CreditCard size={14} /> Thanh toán
                                        </button>
                                        <div className="h-px bg-slate-100 my-1 mx-2"></div>
                                        <button 
                                            onClick={() => handleDelete(order.id)}
                                            className="w-full text-left px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 hover:text-red-600 flex items-center gap-2 font-medium transition-colors"
                                        >
                                            <Trash2 size={14} /> Xóa đơn
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={9} className="p-8 text-center text-slate-500">
                                Không tìm thấy đơn hàng nào.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
         </div>
      </div>

      {/* Design Modal */}
      {isDesignModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-[500px] max-w-[90vw] p-6 animate-in fade-in zoom-in duration-200">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Palette className="text-purple-600" />
                    Yêu cầu Thiết Kế
                </h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Mã đơn hàng</label>
                            <input disabled value={selectedOrder.id} className="w-full p-2 bg-slate-100 rounded border border-slate-200 text-sm" />
                        </div>
                         <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Khách hàng</label>
                            <input disabled value={selectedOrder.customerName} className="w-full p-2 bg-slate-100 rounded border border-slate-200 text-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Yêu cầu thiết kế chi tiết</label>
                        <textarea 
                            value={designReq}
                            onChange={(e) => setDesignReq(e.target.value)}
                            className="w-full h-32 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                            placeholder="Mô tả màu sắc, phong cách, nội dung..."
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={() => setIsDesignModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Hủy</button>
                    <button onClick={handleSubmitDesign} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Gửi yêu cầu</button>
                </div>
            </div>
        </div>
      )}

      {/* Payment Modal */}
      {isPaymentModalOpen && selectedOrder && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-[500px] max-w-[90vw] p-6 animate-in fade-in zoom-in duration-200">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <CreditCard className="text-green-600" />
                    Xác nhận Thanh toán
                </h3>
                <div className="space-y-4">
                    <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung thanh toán</label>
                         <input 
                            value={paymentForm.content}
                            onChange={(e) => setPaymentForm({...paymentForm, content: e.target.value})}
                            className="w-full p-2 border border-slate-300 rounded focus:border-accent outline-none"
                            placeholder="Ví dụ: Đặt cọc lần 1, Thanh toán đủ..."
                        />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">Số tiền (VND)</label>
                         <input 
                            type="number"
                            value={paymentForm.amount}
                            onChange={(e) => setPaymentForm({...paymentForm, amount: Number(e.target.value)})}
                            className="w-full p-2 border border-slate-300 rounded focus:border-accent outline-none font-mono"
                        />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">Ảnh minh chứng</label>
                         <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50 transition-colors">
                            <ImageIcon size={32} />
                            <span className="text-xs mt-2">Kéo thả hoặc click để tải ảnh</span>
                         </div>
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={() => setIsPaymentModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Hủy</button>
                    <button onClick={handleSubmitPayment} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Xác nhận thanh toán</button>
                </div>
                
                {/* Payment History Preview */}
                {selectedOrder.paymentHistory.length > 0 && (
                    <div className="mt-6 border-t pt-4">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Lịch sử thanh toán</h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                            {selectedOrder.paymentHistory.map(pay => (
                                <div key={pay.id} className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded">
                                    <div>
                                        <div className="font-medium">{pay.content}</div>
                                        <div className="text-slate-500">{new Date(pay.date).toLocaleDateString('vi-VN')}</div>
                                    </div>
                                    <div className="font-bold text-green-600">+{formatCurrency(pay.amount)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}

    </div>
  );
};

export default OrderManagement;